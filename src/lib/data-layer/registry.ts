/**
 * OneApp Data Layer - Adapter Registry
 * 
 * Manages registration and retrieval of datasource adapters.
 * Allows runtime registration of new adapter types.
 */

import { 
  DataSourceType, 
  AdapterFactory, 
  DataSourceRegistry,
  DataSourceCredentials 
} from './types';

// ============================================================================
// Registry Implementation
// ============================================================================

class DataSourceRegistryImpl implements DataSourceRegistry {
  private factories: Map<DataSourceType, AdapterFactory> = new Map();

  getAdapterFactories(): AdapterFactory[] {
    return Array.from(this.factories.values());
  }

  getAdapterFactory(type: DataSourceType): AdapterFactory | undefined {
    return this.factories.get(type);
  }

  registerAdapter(factory: AdapterFactory): void {
    if (this.factories.has(factory.type)) {
      console.warn(`[DataSourceRegistry] Overwriting existing adapter: ${factory.type}`);
    }
    this.factories.set(factory.type, factory);
    console.log(`[DataSourceRegistry] Registered adapter: ${factory.type} (${factory.name})`);
  }

  unregisterAdapter(type: DataSourceType): void {
    if (this.factories.delete(type)) {
      console.log(`[DataSourceRegistry] Unregistered adapter: ${type}`);
    }
  }

  hasAdapter(type: DataSourceType): boolean {
    return this.factories.has(type);
  }
}

// Singleton instance
export const dataSourceRegistry = new DataSourceRegistryImpl();

// ============================================================================
// Credential Validators
// ============================================================================

export function validateSupabaseCredentials(credentials: DataSourceCredentials): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!credentials.supabaseUrl) {
    errors.push('Supabase URL is required');
  } else if (!credentials.supabaseUrl.startsWith('https://')) {
    errors.push('Supabase URL must start with https://');
  }
  
  if (!credentials.supabaseAnonKey && !credentials.supabaseServiceKey) {
    errors.push('Either Anon Key or Service Key is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validatePostgreSQLCredentials(credentials: DataSourceCredentials): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!credentials.host) {
    errors.push('Host is required');
  }
  
  if (!credentials.database) {
    errors.push('Database name is required');
  }
  
  if (!credentials.username) {
    errors.push('Username is required');
  }
  
  if (!credentials.password) {
    errors.push('Password is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateMySQLCredentials(credentials: DataSourceCredentials): { valid: boolean; errors?: string[] } {
  // Same validation as PostgreSQL
  return validatePostgreSQLCredentials(credentials);
}

export function validateFirebaseCredentials(credentials: DataSourceCredentials): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!credentials.projectId) {
    errors.push('Project ID is required');
  }
  
  if (!credentials.apiKey) {
    errors.push('API Key is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateRESTCredentials(credentials: DataSourceCredentials): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!credentials.baseUrl) {
    errors.push('Base URL is required');
  } else if (!credentials.baseUrl.startsWith('http')) {
    errors.push('Base URL must be a valid HTTP(S) URL');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get user-friendly name for a datasource type
 */
export function getDataSourceTypeName(type: DataSourceType): string {
  const names: Record<DataSourceType, string> = {
    lovable: 'Lovable Cloud',
    supabase: 'External Supabase',
    postgresql: 'PostgreSQL',
    mysql: 'MySQL / MariaDB',
    firebase: 'Firebase / Firestore',
    rest: 'REST API',
    custom: 'Custom',
  };
  return names[type] || type;
}

/**
 * Get icon name for a datasource type
 */
export function getDataSourceTypeIcon(type: DataSourceType): string {
  const icons: Record<DataSourceType, string> = {
    lovable: 'Heart',
    supabase: 'Database',
    postgresql: 'Database',
    mysql: 'Database',
    firebase: 'Flame',
    rest: 'Globe',
    custom: 'Settings',
  };
  return icons[type] || 'Database';
}

/**
 * Get description for a datasource type
 */
export function getDataSourceTypeDescription(type: DataSourceType): string {
  const descriptions: Record<DataSourceType, string> = {
    lovable: 'Default cloud database powered by Lovable',
    supabase: 'Connect to your own Supabase project',
    postgresql: 'Direct connection to PostgreSQL database',
    mysql: 'Direct connection to MySQL or MariaDB database',
    firebase: 'Connect to Firebase Firestore',
    rest: 'Connect via REST API endpoints',
    custom: 'Custom datasource implementation',
  };
  return descriptions[type] || '';
}
