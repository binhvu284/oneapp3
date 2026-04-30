/**
 * OneApp Data Layer - Adapters Index
 * 
 * Exports all available adapters and registers them with the registry.
 */

export { BaseAdapter } from './base-adapter';
export { LovableAdapter } from './lovable-adapter';
export { ExternalSupabaseAdapter } from './supabase-adapter';

import { dataSourceRegistry, validateSupabaseCredentials } from '../registry';
import { LovableAdapter } from './lovable-adapter';
import { ExternalSupabaseAdapter } from './supabase-adapter';

/**
 * Initialize and register all built-in adapters
 */
export function registerBuiltInAdapters(): void {
  // Lovable Cloud Adapter
  dataSourceRegistry.registerAdapter({
    type: 'lovable',
    name: 'Lovable Cloud',
    description: 'Default cloud database powered by Lovable',
    icon: 'Heart',
    create: () => new LovableAdapter(),
    validateCredentials: () => ({ valid: true }), // Always valid for Lovable
  });

  // External Supabase Adapter
  dataSourceRegistry.registerAdapter({
    type: 'supabase',
    name: 'External Supabase',
    description: 'Connect to your own Supabase project',
    icon: 'Database',
    create: () => new ExternalSupabaseAdapter(),
    validateCredentials: validateSupabaseCredentials,
  });

  console.log('[DataLayer] Built-in adapters registered');
}
