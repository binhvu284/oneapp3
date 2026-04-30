/**
 * OneApp Data Layer - External Supabase Adapter
 * 
 * Adapter for connecting to external Supabase projects.
 * Uses edge function to proxy queries for security.
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

export class ExternalSupabaseAdapter extends BaseAdapter {
  readonly type: DataSourceType = 'supabase';
  readonly name = 'External Supabase';

  async connect(credentials: DataSourceCredentials): Promise<{ success: boolean; error?: DataLayerError }> {
    if (!credentials.supabaseUrl || !credentials.supabaseServiceKey) {
      return {
        success: false,
        error: this.createError('VALIDATION_ERROR', 'Supabase URL and Service Key are required'),
      };
    }

    this.credentials = credentials;
    this.status = 'connecting';

    // Test the connection
    const testResult = await this.testConnection();
    
    if (testResult.success) {
      this.status = 'connected';
      this.log('Connected to External Supabase');
      return { success: true };
    } else {
      this.status = 'error';
      return { success: false, error: testResult.error };
    }
  }

  async disconnect(): Promise<void> {
    this.credentials = null;
    this.status = 'disconnected';
    this.log('Disconnected from External Supabase');
  }

  async testConnection(): Promise<{ success: boolean; error?: DataLayerError; latencyMs?: number }> {
    if (!this.credentials?.supabaseUrl || !this.credentials?.supabaseServiceKey) {
      return {
        success: false,
        error: this.createError('CONNECTION_FAILED', 'No credentials configured'),
      };
    }

    const start = performance.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('data-query', {
        body: {
          action: 'test-connection',
          supabase_url: this.credentials.supabaseUrl,
          supabase_service_key: this.credentials.supabaseServiceKey,
        },
      });

      const latencyMs = Math.round(performance.now() - start);

      if (error) {
        return {
          success: false,
          error: this.createError('CONNECTION_FAILED', error.message, error),
          latencyMs,
        };
      }

      if (!data?.success) {
        return {
          success: false,
          error: this.createError('CONNECTION_FAILED', data?.error || 'Connection test failed'),
          latencyMs,
        };
      }

      return { success: true, latencyMs };
    } catch (e) {
      return {
        success: false,
        error: this.wrapError(e, 'CONNECTION_FAILED'),
        latencyMs: Math.round(performance.now() - start),
      };
    }
  }

  async validateSchema(): Promise<SchemaValidationResult> {
    if (!this.credentials?.supabaseUrl || !this.credentials?.supabaseServiceKey) {
      return {
        isValid: false,
        missingTables: [],
        missingColumns: [],
        typeMismatches: [],
        migrationSQL: '-- No credentials configured',
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('data-query', {
        body: {
          action: 'validate-schema',
          supabase_url: this.credentials.supabaseUrl,
          supabase_service_key: this.credentials.supabaseServiceKey,
        },
      });

      if (error || !data?.success) {
        // Fall back to basic validation
        return super.validateSchema();
      }

      return data.validation as SchemaValidationResult;
    } catch (e) {
      this.logError('Schema validation failed', e);
      return super.validateSchema();
    }
  }

  async autoMigrate(validation: SchemaValidationResult): Promise<{ success: boolean; error?: DataLayerError }> {
    if (!this.credentials?.supabaseUrl || !this.credentials?.supabaseServiceKey) {
      return {
        success: false,
        error: this.createError('MIGRATION_FAILED', 'No credentials configured'),
      };
    }

    if (!validation.migrationSQL) {
      return { success: true }; // Nothing to migrate
    }

    try {
      const { data, error } = await supabase.functions.invoke('data-query', {
        body: {
          action: 'run-migration',
          supabase_url: this.credentials.supabaseUrl,
          supabase_service_key: this.credentials.supabaseServiceKey,
          sql: validation.migrationSQL,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.createError('MIGRATION_FAILED', error.message, error),
        };
      }

      if (!data?.success) {
        return {
          success: false,
          error: this.createError('MIGRATION_FAILED', data?.error || 'Migration failed'),
        };
      }

      this.log('Auto-migration completed successfully');
      return { success: true };
    } catch (e) {
      return { success: false, error: this.wrapError(e, 'MIGRATION_FAILED') };
    }
  }

  async query<T = unknown>(table: string, options?: QueryOptions): Promise<QueryResult<T>> {
    if (!this.credentials?.supabaseUrl || !this.credentials?.supabaseServiceKey) {
      return {
        data: null,
        error: this.createError('CONNECTION_FAILED', 'No credentials configured'),
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('data-query', {
        body: {
          action: 'query',
          supabase_url: this.credentials.supabaseUrl,
          supabase_service_key: this.credentials.supabaseServiceKey,
          table,
          options: this.serializeQueryOptions(options),
        },
      });

      if (error) {
        return { data: null, error: this.createError('QUERY_FAILED', error.message, error) };
      }

      if (!data?.success) {
        return { 
          data: null, 
          error: this.createError('QUERY_FAILED', data?.error || 'Query failed') 
        };
      }

      return { 
        data: data.result as T, 
        error: null,
        count: data.count,
      };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  async insert<T = unknown>(table: string, data: Partial<T>): Promise<MutationResult<T>> {
    return this.mutate<T>('insert', table, data);
  }

  async update<T = unknown>(
    table: string, 
    data: Partial<T>, 
    filters: QueryFilter[]
  ): Promise<MutationResult<T>> {
    return this.mutate<T>('update', table, data, filters);
  }

  async upsert<T = unknown>(
    table: string, 
    data: Partial<T>, 
    conflictColumns: string[]
  ): Promise<MutationResult<T>> {
    return this.mutate<T>('upsert', table, data, undefined, conflictColumns);
  }

  async delete(table: string, filters: QueryFilter[]): Promise<MutationResult<null>> {
    return this.mutate<null>('delete', table, undefined, filters);
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async mutate<T>(
    action: 'insert' | 'update' | 'upsert' | 'delete',
    table: string,
    data?: Partial<T>,
    filters?: QueryFilter[],
    conflictColumns?: string[]
  ): Promise<MutationResult<T>> {
    if (!this.credentials?.supabaseUrl || !this.credentials?.supabaseServiceKey) {
      return {
        data: null,
        error: this.createError('CONNECTION_FAILED', 'No credentials configured'),
      };
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('data-query', {
        body: {
          action,
          supabase_url: this.credentials.supabaseUrl,
          supabase_service_key: this.credentials.supabaseServiceKey,
          table,
          data,
          filters,
          conflict_columns: conflictColumns,
        },
      });

      if (error) {
        return { data: null, error: this.createError('QUERY_FAILED', error.message, error) };
      }

      if (!result?.success) {
        return { 
          data: null, 
          error: this.createError('QUERY_FAILED', result?.error || 'Mutation failed') 
        };
      }

      return { data: result.result as T, error: null };
    } catch (e) {
      return { data: null, error: this.wrapError(e, 'QUERY_FAILED') };
    }
  }

  private serializeQueryOptions(options?: QueryOptions): Record<string, unknown> | undefined {
    if (!options) return undefined;

    return {
      select: options.select,
      filters: options.filters,
      order: options.order,
      limit: options.limit,
      offset: options.offset,
      single: options.single,
      count: options.count,
    };
  }
}
