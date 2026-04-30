/**
 * OneApp Data Layer - Main Entry Point
 * 
 * This module provides a unified data abstraction layer that allows
 * building features once and running them on any datasource.
 * 
 * Usage:
 * ```typescript
 * import { useDataQuery, useDataSource } from '@/lib/data-layer';
 * 
 * // Use React hooks
 * const { data, isLoading } = useDataQuery('profiles', {
 *   queryOptions: {
 *     filters: [{ column: 'user_id', operator: 'eq', value: userId }],
 *   },
 * });
 * 
 * // Or use context directly
 * const { query, insert, update } = useDataSource();
 * const result = await query('profiles', { single: true });
 * ```
 */

// Types
export * from './types';

// Schema
export * from './schema';

// Registry
export { 
  dataSourceRegistry,
  validateSupabaseCredentials,
  validatePostgreSQLCredentials,
  validateMySQLCredentials,
  validateFirebaseCredentials,
  validateRESTCredentials,
  getDataSourceTypeName,
  getDataSourceTypeIcon,
  getDataSourceTypeDescription,
} from './registry';

// Adapters
export * from './adapters';

// Context & Hooks
export { DataSourceProvider, useDataSource, useDataSourceSafe } from './DataSourceContext';
export { 
  useDataQuery,
  useDataInsert,
  useDataUpdate,
  useDataUpsert,
  useDataDelete,
  useActiveDataSource,
  useDataSources,
  useDataSourceSwitch,
} from './hooks';

// Initialize adapters on import
import { registerBuiltInAdapters } from './adapters';

// Auto-register built-in adapters
registerBuiltInAdapters();
