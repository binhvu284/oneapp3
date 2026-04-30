/**
 * OneApp Data Layer - Core Types
 * 
 * Unified type definitions for the data abstraction layer.
 * These types enable building features once and running on any datasource.
 */

// ============================================================================
// Datasource Types
// ============================================================================

export type DataSourceType = 
  | 'lovable'           // Lovable Cloud (default Supabase)
  | 'supabase'          // External Supabase
  | 'postgresql'        // Direct PostgreSQL
  | 'mysql'             // MySQL/MariaDB
  | 'firebase'          // Firebase/Firestore
  | 'rest'              // REST API
  | 'custom';           // Custom implementations

export type ConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'schema_mismatch';

export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  isActive: boolean;
  isDefault: boolean;
  credentials: DataSourceCredentials;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DataSourceCredentials {
  // Supabase / Lovable Cloud
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  
  // PostgreSQL / MySQL
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  
  // Firebase
  projectId?: string;
  apiKey?: string;
  authDomain?: string;
  
  // REST API
  baseUrl?: string;
  authToken?: string;
  authType?: 'bearer' | 'basic' | 'api-key';
  
  // Generic
  [key: string]: unknown;
}

export interface DataSourceState {
  config: DataSourceConfig;
  status: ConnectionStatus;
  error?: string;
  lastTestedAt?: string;
  schemaStatus?: SchemaValidationResult;
}

// ============================================================================
// Query Types
// ============================================================================

export type FilterOperator = 
  | 'eq'      // equals
  | 'neq'     // not equals
  | 'gt'      // greater than
  | 'gte'     // greater than or equal
  | 'lt'      // less than
  | 'lte'     // less than or equal
  | 'like'    // LIKE pattern
  | 'ilike'   // case-insensitive LIKE
  | 'in'      // IN array
  | 'is'      // IS NULL / IS NOT NULL
  | 'contains'    // array contains
  | 'containedBy' // array contained by
  | 'overlaps';   // array overlaps

export interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

export interface QueryOrder {
  column: string;
  ascending: boolean;
  nullsFirst?: boolean;
}

export interface QueryOptions {
  select?: string[];
  filters?: QueryFilter[];
  order?: QueryOrder[];
  limit?: number;
  offset?: number;
  single?: boolean;
  count?: 'exact' | 'planned' | 'estimated';
}

export interface QueryResult<T = unknown> {
  data: T | T[] | null;
  error: DataLayerError | null;
  count?: number;
}

export interface MutationResult<T = unknown> {
  data: T | null;
  error: DataLayerError | null;
}

// ============================================================================
// Schema Types
// ============================================================================

export type ColumnType = 
  | 'uuid'
  | 'text'
  | 'varchar'
  | 'integer'
  | 'bigint'
  | 'numeric'
  | 'boolean'
  | 'timestamp'
  | 'timestamptz'
  | 'json'
  | 'jsonb'
  | 'array'
  | 'enum';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  nullable: boolean;
  defaultValue?: unknown;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  references?: {
    table: string;
    column: string;
  };
  enumValues?: string[];
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  primaryKey: string[];
  indexes?: string[];
}

export interface SchemaDefinition {
  version: string;
  tables: TableDefinition[];
}

export interface SchemaValidationResult {
  isValid: boolean;
  missingTables: string[];
  missingColumns: { table: string; columns: string[] }[];
  typeMismatches: { table: string; column: string; expected: ColumnType; actual: string }[];
  migrationSQL?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type DataLayerErrorCode =
  | 'CONNECTION_FAILED'
  | 'QUERY_FAILED'
  | 'SCHEMA_MISMATCH'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'MIGRATION_FAILED'
  | 'ADAPTER_NOT_FOUND'
  | 'UNKNOWN';

export interface DataLayerError {
  code: DataLayerErrorCode;
  message: string;
  details?: unknown;
  originalError?: unknown;
}

// ============================================================================
// Adapter Interface
// ============================================================================

export interface DataAdapter {
  /** Unique identifier for this adapter type */
  readonly type: DataSourceType;
  
  /** Human-readable name */
  readonly name: string;
  
  /** Current connection status */
  status: ConnectionStatus;
  
  /** Connect to the datasource */
  connect(credentials: DataSourceCredentials): Promise<{ success: boolean; error?: DataLayerError }>;
  
  /** Disconnect from the datasource */
  disconnect(): Promise<void>;
  
  /** Test the connection */
  testConnection(): Promise<{ success: boolean; error?: DataLayerError; latencyMs?: number }>;
  
  /** Validate schema compatibility with OneApp */
  validateSchema(): Promise<SchemaValidationResult>;
  
  /** Run auto-migration to fix schema issues */
  autoMigrate(validation: SchemaValidationResult): Promise<{ success: boolean; error?: DataLayerError }>;
  
  /** Query data from a table */
  query<T = unknown>(table: string, options?: QueryOptions): Promise<QueryResult<T>>;
  
  /** Insert a new record */
  insert<T = unknown>(table: string, data: Partial<T>): Promise<MutationResult<T>>;
  
  /** Update existing records */
  update<T = unknown>(table: string, data: Partial<T>, filters: QueryFilter[]): Promise<MutationResult<T>>;
  
  /** Upsert (insert or update) a record */
  upsert<T = unknown>(table: string, data: Partial<T>, conflictColumns: string[]): Promise<MutationResult<T>>;
  
  /** Delete records */
  delete(table: string, filters: QueryFilter[]): Promise<MutationResult<null>>;
}

// ============================================================================
// Registry Types
// ============================================================================

export interface AdapterFactory {
  type: DataSourceType;
  name: string;
  description: string;
  icon?: string;
  create: () => DataAdapter;
  validateCredentials: (credentials: DataSourceCredentials) => { valid: boolean; errors?: string[] };
}

export interface DataSourceRegistry {
  /** Get all registered adapter factories */
  getAdapterFactories(): AdapterFactory[];
  
  /** Get a specific adapter factory by type */
  getAdapterFactory(type: DataSourceType): AdapterFactory | undefined;
  
  /** Register a new adapter factory */
  registerAdapter(factory: AdapterFactory): void;
  
  /** Unregister an adapter factory */
  unregisterAdapter(type: DataSourceType): void;
  
  /** Check if an adapter type is registered */
  hasAdapter(type: DataSourceType): boolean;
}
