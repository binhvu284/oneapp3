/**
 * OneApp Data Layer - Base Adapter
 * 
 * Abstract base class for all datasource adapters.
 * Provides common functionality and error handling.
 */

import {
  DataAdapter,
  DataSourceType,
  DataSourceCredentials,
  ConnectionStatus,
  QueryOptions,
  QueryResult,
  MutationResult,
  QueryFilter,
  SchemaValidationResult,
  DataLayerError,
  DataLayerErrorCode,
} from '../types';
import { CORE_TABLES, getExternalSchema } from '../schema';

export abstract class BaseAdapter implements DataAdapter {
  abstract readonly type: DataSourceType;
  abstract readonly name: string;
  
  protected credentials: DataSourceCredentials | null = null;
  protected _status: ConnectionStatus = 'disconnected';

  get status(): ConnectionStatus {
    return this._status;
  }

  set status(value: ConnectionStatus) {
    this._status = value;
  }

  // ============================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ============================================================================

  abstract connect(credentials: DataSourceCredentials): Promise<{ success: boolean; error?: DataLayerError }>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<{ success: boolean; error?: DataLayerError; latencyMs?: number }>;
  abstract query<T = unknown>(table: string, options?: QueryOptions): Promise<QueryResult<T>>;
  abstract insert<T = unknown>(table: string, data: Partial<T>): Promise<MutationResult<T>>;
  abstract update<T = unknown>(table: string, data: Partial<T>, filters: QueryFilter[]): Promise<MutationResult<T>>;
  abstract upsert<T = unknown>(table: string, data: Partial<T>, conflictColumns: string[]): Promise<MutationResult<T>>;
  abstract delete(table: string, filters: QueryFilter[]): Promise<MutationResult<null>>;

  // ============================================================================
  // Common Implementation
  // ============================================================================

  /**
   * Validate schema against OneApp standard
   * Default implementation checks if required tables exist
   */
  async validateSchema(): Promise<SchemaValidationResult> {
    const result: SchemaValidationResult = {
      isValid: true,
      missingTables: [],
      missingColumns: [],
      typeMismatches: [],
    };

    const schema = getExternalSchema();
    
    for (const table of schema.tables) {
      try {
        // Try to query the table with limit 0 to check existence
        const { error } = await this.query(table.name, { limit: 0 });
        
        if (error) {
          if (error.code === 'NOT_FOUND') {
            result.missingTables.push(table.name);
            result.isValid = false;
          }
        }
      } catch (e) {
        result.missingTables.push(table.name);
        result.isValid = false;
      }
    }

    // Generate migration SQL if there are issues
    if (!result.isValid) {
      result.migrationSQL = this.generateMigrationSQL(result);
    }

    return result;
  }

  /**
   * Auto-migrate schema to fix issues
   * Default implementation is not supported
   */
  async autoMigrate(validation: SchemaValidationResult): Promise<{ success: boolean; error?: DataLayerError }> {
    return {
      success: false,
      error: this.createError(
        'MIGRATION_FAILED',
        'Auto-migration is not supported for this adapter type'
      ),
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  protected createError(code: DataLayerErrorCode, message: string, details?: unknown): DataLayerError {
    return { code, message, details };
  }

  protected wrapError(error: unknown, defaultCode: DataLayerErrorCode = 'UNKNOWN'): DataLayerError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as DataLayerError;
    }

    const message = error instanceof Error ? error.message : String(error);
    return this.createError(defaultCode, message, error);
  }

  protected generateMigrationSQL(validation: SchemaValidationResult): string {
    const statements: string[] = [];
    const schema = getExternalSchema();

    // Generate CREATE TABLE statements for missing tables
    for (const tableName of validation.missingTables) {
      const table = schema.tables.find(t => t.name === tableName);
      if (!table) continue;

      const columns = table.columns.map(col => {
        let def = `  ${col.name} ${this.mapColumnType(col.type)}`;
        
        if (!col.nullable) {
          def += ' NOT NULL';
        }
        
        if (col.defaultValue) {
          def += ` DEFAULT ${col.defaultValue}`;
        }
        
        return def;
      });

      const pk = `  PRIMARY KEY (${table.primaryKey.join(', ')})`;
      
      statements.push(`-- Create ${tableName} table
CREATE TABLE IF NOT EXISTS public.${tableName} (
${columns.join(',\n')},
${pk}
);

-- Enable RLS
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
`);
    }

    // Generate ALTER TABLE statements for missing columns
    for (const missing of validation.missingColumns) {
      const table = schema.tables.find(t => t.name === missing.table);
      if (!table) continue;

      for (const colName of missing.columns) {
        const col = table.columns.find(c => c.name === colName);
        if (!col) continue;

        let def = `ALTER TABLE public.${missing.table} ADD COLUMN ${col.name} ${this.mapColumnType(col.type)}`;
        
        if (!col.nullable) {
          def += ' NOT NULL';
        }
        
        if (col.defaultValue) {
          def += ` DEFAULT ${col.defaultValue}`;
        }

        statements.push(def + ';');
      }
    }

    return statements.join('\n\n');
  }

  protected mapColumnType(type: string): string {
    // Default mapping for PostgreSQL-like databases
    const typeMap: Record<string, string> = {
      uuid: 'UUID',
      text: 'TEXT',
      varchar: 'VARCHAR(255)',
      integer: 'INTEGER',
      bigint: 'BIGINT',
      boolean: 'BOOLEAN',
      timestamp: 'TIMESTAMP',
      timestamptz: 'TIMESTAMP WITH TIME ZONE',
      json: 'JSON',
      jsonb: 'JSONB',
      array: 'TEXT[]',
      enum: 'TEXT',
    };
    return typeMap[type] || 'TEXT';
  }

  protected log(message: string, data?: unknown): void {
    console.log(`[${this.name}] ${message}`, data ?? '');
  }

  protected logError(message: string, error?: unknown): void {
    console.error(`[${this.name}] ${message}`, error ?? '');
  }
}
