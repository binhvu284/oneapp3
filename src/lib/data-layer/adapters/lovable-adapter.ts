/**
 * OneApp Data Layer - Lovable Cloud Adapter
 * 
 * Adapter for the default Lovable Cloud (Supabase) connection.
 * This is the reference implementation for other adapters.
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseAdapter } from './base-adapter';
import {
  DataSourceType,
  DataSourceCredentials,
  QueryOptions,
  QueryResult,
  MutationResult,
  QueryFilter,
  SchemaValidationResult,
  DataLayerError,
} from '../types';

export class LovableAdapter extends BaseAdapter {
  readonly type: DataSourceType = 'lovable';
  readonly name = 'Lovable Cloud';

  async connect(_credentials: DataSourceCredentials): Promise<{ success: boolean; error?: DataLayerError }> {
    // Lovable Cloud is always connected via the preconfigured client
    this.status = 'connected';
    this.log('Connected to Lovable Cloud');
    return { success: true };
  }

  async disconnect(): Promise<void> {
    // Cannot truly disconnect from Lovable Cloud
    this.status = 'disconnected';
    this.log('Disconnected from Lovable Cloud');
  }

  async testConnection(): Promise<{ success: boolean; error?: DataLayerError; latencyMs?: number }> {
    const start = performance.now();
    
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const latencyMs = Math.round(performance.now() - start);
      
      if (error) {
        this.status = 'error';
        return {
          success: false,
          error: this.createError('CONNECTION_FAILED', error.message, error),
          latencyMs,
        };
      }
      
      this.status = 'connected';
      return { success: true, latencyMs };
    } catch (e) {
      this.status = 'error';
      return {
        success: false,
        error: this.wrapError(e, 'CONNECTION_FAILED'),
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  async validateSchema(): Promise<SchemaValidationResult> {
    // Lovable Cloud schema is managed by migrations, assume valid
    return {
      isValid: true,
      missingTables: [],
      missingColumns: [],
      typeMismatches: [],
    };
  }

  async query<T = unknown>(table: string, options?: QueryOptions): Promise<QueryResult<T>> {
    try {
      // Use type assertion for dynamic table access
      const tableQuery = (supabase as any).from(table);
      
      // Build the query
      let query = tableQuery.select(
        options?.select?.join(', ') || '*',
        options?.count ? { count: options.count } : undefined
      );

      // Apply filters
      if (options?.filters) {
        query = this.applyFilters(query, options.filters);
      }

      // Apply ordering
      if (options?.order) {
        for (const ord of options.order) {
          query = query.order(ord.column, {
            ascending: ord.ascending,
            nullsFirst: ord.nullsFirst,
          });
        }
      }

      // Apply pagination
      if (options?.limit !== undefined) {
        query = query.limit(options.limit);
      }

      if (options?.offset !== undefined) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Execute query
      if (options?.single) {
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          return { data: null, error: this.mapSupabaseError(error) };
        }
        
        return { data: data as T, error: null };
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: this.mapSupabaseError(error) };
      }

      return { 
        data: data as T[], 
        error: null,
        count: count ?? undefined,
      };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  async insert<T = unknown>(table: string, data: Partial<T>): Promise<MutationResult<T>> {
    try {
      const tableQuery = (supabase as any).from(table);
      const { data: result, error } = await tableQuery
        .insert(data as Record<string, unknown>)
        .select()
        .single();

      if (error) {
        return { data: null, error: this.mapSupabaseError(error) };
      }

      return { data: result as T, error: null };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  async update<T = unknown>(
    table: string, 
    data: Partial<T>, 
    filters: QueryFilter[]
  ): Promise<MutationResult<T>> {
    try {
      const tableQuery = (supabase as any).from(table);
      let query = tableQuery.update(data as Record<string, unknown>);
      query = this.applyFilters(query, filters);
      
      const { data: result, error } = await query.select().single();

      if (error) {
        return { data: null, error: this.mapSupabaseError(error) };
      }

      return { data: result as T, error: null };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  async upsert<T = unknown>(
    table: string, 
    data: Partial<T>, 
    conflictColumns: string[]
  ): Promise<MutationResult<T>> {
    try {
      const tableQuery = (supabase as any).from(table);
      const { data: result, error } = await tableQuery
        .upsert(data as Record<string, unknown>, { 
          onConflict: conflictColumns.join(',') 
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: this.mapSupabaseError(error) };
      }

      return { data: result as T, error: null };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  async delete(table: string, filters: QueryFilter[]): Promise<MutationResult<null>> {
    try {
      const tableQuery = (supabase as any).from(table);
      let query = tableQuery.delete();
      query = this.applyFilters(query, filters);
      
      const { error } = await query;

      if (error) {
        return { data: null, error: this.mapSupabaseError(error) };
      }

      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private applyFilters<Q>(query: Q, filters: QueryFilter[]): Q {
    let result = query as any;
    
    for (const filter of filters) {
      result = this.applyFilter(result, filter);
    }
    
    return result as Q;
  }

  private applyFilter(query: any, filter: QueryFilter): any {
    const { column, operator, value } = filter;
    
    switch (operator) {
      case 'eq':
        return query.eq(column, value);
      case 'neq':
        return query.neq(column, value);
      case 'gt':
        return query.gt(column, value);
      case 'gte':
        return query.gte(column, value);
      case 'lt':
        return query.lt(column, value);
      case 'lte':
        return query.lte(column, value);
      case 'like':
        return query.like(column, value);
      case 'ilike':
        return query.ilike(column, value);
      case 'in':
        return query.in(column, value as unknown[]);
      case 'is':
        return query.is(column, value);
      case 'contains':
        return query.contains(column, value);
      case 'containedBy':
        return query.containedBy(column, value);
      case 'overlaps':
        return query.overlaps(column, value);
      default:
        this.logError(`Unknown filter operator: ${operator}`);
        return query;
    }
  }

  private mapSupabaseError(error: { code?: string; message: string; details?: string }): DataLayerError {
    // Map Supabase error codes to our error codes
    if (error.code === 'PGRST116') {
      return this.createError('NOT_FOUND', 'Resource not found', error);
    }
    
    if (error.code === 'PGRST301' || error.code === '42501') {
      return this.createError('UNAUTHORIZED', 'Permission denied', error);
    }
    
    if (error.code === '23505') {
      return this.createError('VALIDATION_ERROR', 'Duplicate key violation', error);
    }
    
    if (error.code === '23503') {
      return this.createError('VALIDATION_ERROR', 'Foreign key violation', error);
    }
    
    return this.createError('QUERY_FAILED', error.message, error);
  }
}
