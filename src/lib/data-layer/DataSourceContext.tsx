/**
 * OneApp Data Layer - DataSource Context
 * 
 * React Context for managing the active datasource and providing
 * a unified interface for data operations throughout the app.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import {
  DataAdapter,
  DataSourceType,
  DataSourceConfig,
  DataSourceState,
  DataSourceCredentials,
  ConnectionStatus,
  QueryOptions,
  QueryResult,
  MutationResult,
  QueryFilter,
  DataLayerError,
  SchemaValidationResult,
} from './types';
import { dataSourceRegistry } from './registry';
import { useAuthSource } from '@/hooks/useAuthSource';
import { getCachedSystemConnection } from '@/hooks/useSystemConnection';

// ============================================================================
// Context Types
// ============================================================================

interface MigrationResult {
  success: boolean;
  error?: DataLayerError;
  needsManualExecution?: boolean;
  migrationSQL?: string;
}

interface DataSourceContextType {
  // Active datasource
  activeSource: DataSourceState | null;
  activeAdapter: DataAdapter | null;

  // Available datasources
  dataSources: DataSourceState[];

  // Status
  isLoading: boolean;
  isConnected: boolean;

  // Actions
  switchSource: (sourceId: string) => Promise<{ success: boolean; error?: DataLayerError }>;
  addSource: (config: Omit<DataSourceConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; sourceId?: string; error?: DataLayerError }>;
  removeSource: (sourceId: string) => Promise<{ success: boolean; error?: DataLayerError }>;
  testSource: (sourceId: string) => Promise<{ success: boolean; latencyMs?: number; error?: DataLayerError }>;
  validateSourceSchema: (sourceId: string) => Promise<SchemaValidationResult>;
  migrateSourceSchema: (sourceId: string, validation: SchemaValidationResult) => Promise<MigrationResult>;

  // Data operations (uses active adapter)
  query: <T = unknown>(table: string, options?: QueryOptions) => Promise<QueryResult<T>>;
  insert: <T = unknown>(table: string, data: Partial<T>) => Promise<MutationResult<T>>;
  update: <T = unknown>(table: string, data: Partial<T>, filters: QueryFilter[]) => Promise<MutationResult<T>>;
  upsert: <T = unknown>(table: string, data: Partial<T>, conflictColumns: string[]) => Promise<MutationResult<T>>;
  remove: (table: string, filters: QueryFilter[]) => Promise<MutationResult<null>>;
}

const DataSourceContext = createContext<DataSourceContextType | null>(null);

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  SOURCES: 'oneapp_data_sources',
  ACTIVE_SOURCE: 'oneapp_active_source',
} as const;

// ============================================================================
// Provider Component
// ============================================================================

interface DataSourceProviderProps {
  children: React.ReactNode;
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const { hasExternalConnection } = useAuthSource();
  const [dataSources, setDataSources] = useState<DataSourceState[]>([]);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [adapters, setAdapters] = useState<Map<string, DataAdapter>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Sync with AuthSource: if external connection is enabled, ensure we use it
  useEffect(() => {
    if (!isLoading) {
      const targetId = hasExternalConnection ? 'external-supabase' : 'lovable-cloud';
      if (activeSourceId !== targetId) {
        console.log(`[DataSourceContext] Syncing active source to: ${targetId}`);
        setActiveSourceId(targetId);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SOURCE, targetId);
      }
    }
  }, [hasExternalConnection, isLoading, activeSourceId]);

  // ============================================================================
  // Initialization
  // ============================================================================

  useEffect(() => {
    initializeDataSources();
  }, []);

  const connectToSource = useCallback(async (
    sourceId: string,
    sources: DataSourceState[],
    adapterMap: Map<string, DataAdapter>
  ) => {
    const source = sources.find(s => s.config.id === sourceId);
    const adapter = adapterMap.get(sourceId);

    if (!source || !adapter) {
      console.error('[DataSourceContext] Source or adapter not found:', sourceId);
      return;
    }

    // Update status to connecting
    setDataSources(prev => prev.map(s =>
      s.config.id === sourceId
        ? { ...s, status: 'connecting' as ConnectionStatus }
        : s
    ));

    // Connect
    const result = await adapter.connect(source.config.credentials);

    // Update status
    setDataSources(prev => prev.map(s =>
      s.config.id === sourceId
        ? {
          ...s,
          status: result.success ? 'connected' : 'error',
          error: result.error?.message,
        }
        : s
    ));

    if (result.success) {
      setActiveSourceId(sourceId);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SOURCE, sourceId);
    }
  }, []);

  const initializeDataSources = useCallback(async () => {
    setIsLoading(true);

    try {
      // Load saved sources from localStorage
      const savedSources = localStorage.getItem(STORAGE_KEYS.SOURCES);
      const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SOURCE);

      let sources: DataSourceState[] = [];

      if (savedSources) {
        try {
          const parsed = JSON.parse(savedSources) as DataSourceConfig[];
          sources = parsed.map(config => ({
            config,
            status: 'disconnected' as ConnectionStatus,
          }));
        } catch (e) {
          console.error('[DataSourceContext] Failed to parse saved sources:', e);
        }
      }

      // Check for environment variables as a source
      const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
      const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY;
      const envProjectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;

      // Always ensure Lovable Cloud exists
      const hasLovable = sources.some(s => s.config.type === 'lovable');
      if (!hasLovable) {
        const lovableConfig: DataSourceConfig = {
          id: 'lovable-cloud',
          name: 'Lovable Cloud',
          type: 'lovable',
          isActive: !envUrl, // Only active if no env URL provides a better default
          isDefault: !envUrl,
          credentials: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        sources.unshift({
          config: lovableConfig,
          status: 'disconnected',
        });
      }

      // Automatically add/update the external supabase source if env vars exist
      if (envUrl && envAnonKey) {
        const existingExternalIndex = sources.findIndex(s => s.config.id === 'external-supabase');

        const supabaseConfig: DataSourceConfig = {
          id: 'external-supabase',
          name: 'Supabase Project',
          type: 'supabase',
          isActive: true,
          isDefault: true,
          credentials: {
            url: envUrl,
            anonKey: envAnonKey,
            // We use the anon key if service key is not yet provided
            supabaseUrl: envUrl,
            supabaseServiceKey: envAnonKey, // Fallback for adapter requirements
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existingExternalIndex >= 0) {
          sources[existingExternalIndex] = {
            config: supabaseConfig,
            status: 'disconnected',
          };
        } else {
          sources.push({
            config: supabaseConfig,
            status: 'disconnected',
          });
        }
      }

      // Check for cached system connection and ensure External Supabase source exists
      const cachedConnection = getCachedSystemConnection();
      const hasSupabase = sources.some(s => s.config.type === 'supabase');

      if (cachedConnection?.supabase_url && !hasSupabase) {
        console.log('[DataSourceContext] Adding External Supabase from cached connection');
        const supabaseConfig: DataSourceConfig = {
          id: 'external-supabase',
          name: 'External Supabase',
          type: 'supabase',
          isActive: false,
          isDefault: false,
          credentials: {
            url: cachedConnection.supabase_url,
            serviceKey: cachedConnection.supabase_service_key || undefined,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        sources.push({
          config: supabaseConfig,
          status: cachedConnection.is_active ? 'connected' : 'disconnected',
        });
      }

      // Create adapters for each source
      const newAdapters = new Map<string, DataAdapter>();

      for (const source of sources) {
        const factory = dataSourceRegistry.getAdapterFactory(source.config.type);
        if (factory) {
          const adapter = factory.create();
          newAdapters.set(source.config.id, adapter);
        }
      }

      setAdapters(newAdapters);
      setDataSources(sources);

      // Set active source
      const activeId = savedActiveId || sources.find(s => s.config.isDefault)?.config.id || sources[0]?.config.id;
      if (activeId) {
        await connectToSource(activeId, sources, newAdapters);
      }

    } catch (error) {
      console.error('[DataSourceContext] Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connectToSource]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const activeSource = useMemo(() =>
    dataSources.find(s => s.config.id === activeSourceId) || null,
    [dataSources, activeSourceId]
  );

  const activeAdapter = useMemo(() =>
    activeSourceId ? adapters.get(activeSourceId) || null : null,
    [adapters, activeSourceId]
  );

  const isConnected = useMemo(() =>
    activeSource?.status === 'connected',
    [activeSource]
  );

  // ============================================================================
  // Actions
  // ============================================================================

  const saveDataSources = useCallback((sources: DataSourceState[]) => {
    // SECURITY: Strip sensitive credentials before persisting to localStorage.
    // Only metadata is saved; credentials must be re-entered on next session.
    const safeConfigs = sources.map(s => ({
      ...s.config,
      credentials: {}, // credentials are intentionally never persisted
    }));
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(safeConfigs));
  }, []);

  const switchSource = useCallback(async (sourceId: string): Promise<{ success: boolean; error?: DataLayerError }> => {
    const source = dataSources.find(s => s.config.id === sourceId);
    const adapter = adapters.get(sourceId);

    if (!source) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Data source not found' } };
    }

    if (!adapter) {
      return { success: false, error: { code: 'ADAPTER_NOT_FOUND', message: 'Adapter not found for this source type' } };
    }

    // Disconnect current adapter
    if (activeAdapter && activeSourceId !== sourceId) {
      await activeAdapter.disconnect();
    }

    // Connect to new source
    await connectToSource(sourceId, dataSources, adapters);

    return { success: true };
  }, [dataSources, adapters, activeAdapter, activeSourceId]);

  const addSource = useCallback(async (
    config: Omit<DataSourceConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; sourceId?: string; error?: DataLayerError }> => {
    const factory = dataSourceRegistry.getAdapterFactory(config.type);

    if (!factory) {
      return { success: false, error: { code: 'ADAPTER_NOT_FOUND', message: `No adapter registered for type: ${config.type}` } };
    }

    // Validate credentials
    const validation = factory.validateCredentials(config.credentials);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors?.join(', ') || 'Invalid credentials'
        }
      };
    }

    const sourceId = `${config.type}-${Date.now()}`;
    const now = new Date().toISOString();

    const newConfig: DataSourceConfig = {
      ...config,
      id: sourceId,
      createdAt: now,
      updatedAt: now,
    };

    const newSource: DataSourceState = {
      config: newConfig,
      status: 'disconnected',
    };

    const adapter = factory.create();

    setAdapters(prev => new Map(prev).set(sourceId, adapter));
    setDataSources(prev => {
      const updated = [...prev, newSource];
      saveDataSources(updated);
      return updated;
    });

    return { success: true, sourceId };
  }, [saveDataSources]);

  const removeSource = useCallback(async (sourceId: string): Promise<{ success: boolean; error?: DataLayerError }> => {
    const source = dataSources.find(s => s.config.id === sourceId);

    if (!source) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Data source not found' } };
    }

    if (source.config.isDefault) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot remove default data source' } };
    }

    // Disconnect if active
    if (sourceId === activeSourceId) {
      const adapter = adapters.get(sourceId);
      if (adapter) {
        await adapter.disconnect();
      }

      // Switch to default source
      const defaultSource = dataSources.find(s => s.config.isDefault);
      if (defaultSource) {
        await switchSource(defaultSource.config.id);
      }
    }

    // Remove adapter
    setAdapters(prev => {
      const next = new Map(prev);
      next.delete(sourceId);
      return next;
    });

    // Remove from sources
    setDataSources(prev => {
      const updated = prev.filter(s => s.config.id !== sourceId);
      saveDataSources(updated);
      return updated;
    });

    return { success: true };
  }, [dataSources, adapters, activeSourceId, saveDataSources, switchSource]);

  const testSource = useCallback(async (sourceId: string): Promise<{ success: boolean; latencyMs?: number; error?: DataLayerError }> => {
    const adapter = adapters.get(sourceId);

    if (!adapter) {
      return { success: false, error: { code: 'ADAPTER_NOT_FOUND', message: 'Adapter not found' } };
    }

    return adapter.testConnection();
  }, [adapters]);

  const validateSourceSchema = useCallback(async (sourceId: string): Promise<SchemaValidationResult> => {
    const adapter = adapters.get(sourceId);

    if (!adapter) {
      return {
        isValid: false,
        missingTables: [],
        missingColumns: [],
        typeMismatches: [],
      };
    }

    const result = await adapter.validateSchema();

    // Update source state with schema status
    setDataSources(prev => prev.map(s =>
      s.config.id === sourceId
        ? { ...s, schemaStatus: result }
        : s
    ));

    return result;
  }, [adapters]);

  const migrateSourceSchema = useCallback(async (
    sourceId: string,
    validation: SchemaValidationResult
  ): Promise<MigrationResult> => {
    const adapter = adapters.get(sourceId);

    if (!adapter) {
      return {
        success: false,
        error: { code: 'ADAPTER_NOT_FOUND', message: 'Adapter not found' }
      };
    }

    const result = await adapter.autoMigrate(validation);

    // Check if the result indicates manual execution is needed
    // This is handled at the adapter level for external Supabase
    if (!result.success && result.error?.message?.includes('Manual execution')) {
      return {
        success: false,
        needsManualExecution: true,
        migrationSQL: validation.migrationSQL,
        error: result.error,
      };
    }

    return {
      success: result.success,
      error: result.error,
    };
  }, [adapters]);

  // ============================================================================
  // Data Operations
  // ============================================================================

  const createNotConnectedError = (): DataLayerError => ({
    code: 'CONNECTION_FAILED',
    message: 'No active data source connected',
  });

  const query = useCallback(async <T = unknown>(
    table: string,
    options?: QueryOptions
  ): Promise<QueryResult<T>> => {
    if (!activeAdapter) {
      return { data: null, error: createNotConnectedError() };
    }
    return activeAdapter.query<T>(table, options);
  }, [activeAdapter]);

  const insert = useCallback(async <T = unknown>(
    table: string,
    data: Partial<T>
  ): Promise<MutationResult<T>> => {
    if (!activeAdapter) {
      return { data: null, error: createNotConnectedError() };
    }
    return activeAdapter.insert<T>(table, data);
  }, [activeAdapter]);

  const update = useCallback(async <T = unknown>(
    table: string,
    data: Partial<T>,
    filters: QueryFilter[]
  ): Promise<MutationResult<T>> => {
    if (!activeAdapter) {
      return { data: null, error: createNotConnectedError() };
    }
    return activeAdapter.update<T>(table, data, filters);
  }, [activeAdapter]);

  const upsert = useCallback(async <T = unknown>(
    table: string,
    data: Partial<T>,
    conflictColumns: string[]
  ): Promise<MutationResult<T>> => {
    if (!activeAdapter) {
      return { data: null, error: createNotConnectedError() };
    }
    return activeAdapter.upsert<T>(table, data, conflictColumns);
  }, [activeAdapter]);

  const remove = useCallback(async (
    table: string,
    filters: QueryFilter[]
  ): Promise<MutationResult<null>> => {
    if (!activeAdapter) {
      return { data: null, error: createNotConnectedError() };
    }
    return activeAdapter.delete(table, filters);
  }, [activeAdapter]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: DataSourceContextType = {
    activeSource,
    activeAdapter,
    dataSources,
    isLoading,
    isConnected,
    switchSource,
    addSource,
    removeSource,
    testSource,
    validateSourceSchema,
    migrateSourceSchema,
    query,
    insert,
    update,
    upsert,
    remove,
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useDataSource(): DataSourceContextType {
  const context = useContext(DataSourceContext);

  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }

  return context;
}

/**
 * Safe version that returns null if outside provider
 */
export function useDataSourceSafe(): DataSourceContextType | null {
  return useContext(DataSourceContext);
}
