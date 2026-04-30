/**
 * OneApp Data Layer - React Hooks
 * 
 * Convenient React hooks for data operations using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useDataSource } from './DataSourceContext';
import { QueryOptions, QueryFilter, QueryResult, MutationResult, DataLayerError } from './types';

// ============================================================================
// Query Hook
// ============================================================================

interface UseDataQueryOptions<T> extends Omit<UseQueryOptions<QueryResult<T>, DataLayerError>, 'queryKey' | 'queryFn'> {
  queryOptions?: QueryOptions;
}

/**
 * Hook for querying data from the active datasource
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDataQuery<Profile>('profiles', {
 *   queryOptions: {
 *     filters: [{ column: 'id', operator: 'eq', value: userId }],
 *     single: true,
 *   },
 * });
 * ```
 */
export function useDataQuery<T = unknown>(
  table: string,
  options?: UseDataQueryOptions<T>
) {
  const { query, isConnected, activeSource } = useDataSource();
  const { queryOptions, ...tanstackOptions } = options || {};

  return useQuery({
    queryKey: ['dataLayer', table, queryOptions, activeSource?.config.id],
    queryFn: () => query<T>(table, queryOptions),
    enabled: isConnected && (tanstackOptions.enabled !== false),
    ...tanstackOptions,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

interface UseDataMutationContext<T> {
  previousData?: QueryResult<T>;
}

type MutationType = 'insert' | 'update' | 'upsert' | 'delete';

interface MutationVariables<T> {
  data?: Partial<T>;
  filters?: QueryFilter[];
  conflictColumns?: string[];
}

interface UseDataMutationOptions<T> extends Omit<UseMutationOptions<MutationResult<T>, DataLayerError, MutationVariables<T>, UseDataMutationContext<T>>, 'mutationFn'> {
  invalidateQueries?: string[];
}

/**
 * Hook for inserting data into the active datasource
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useDataInsert<Profile>('profiles', {
 *   onSuccess: () => toast.success('Profile created!'),
 * });
 * 
 * mutate({ data: { display_name: 'John' } });
 * ```
 */
export function useDataInsert<T = unknown>(
  table: string,
  options?: UseDataMutationOptions<T>
) {
  const { insert } = useDataSource();
  const queryClient = useQueryClient();
  const { invalidateQueries, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn: async (variables: MutationVariables<T>) => {
      if (!variables.data) {
        return { data: null, error: { code: 'VALIDATION_ERROR' as const, message: 'Data is required for insert' } };
      }
      return insert<T>(table, variables.data);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dataLayer', table] });
      invalidateQueries?.forEach(t => {
        queryClient.invalidateQueries({ queryKey: ['dataLayer', t] });
      });
    },
    ...mutationOptions,
  });
}

/**
 * Hook for updating data in the active datasource
 * 
 * @example
 * ```tsx
 * const { mutate } = useDataUpdate<Profile>('profiles');
 * 
 * mutate({
 *   data: { display_name: 'Jane' },
 *   filters: [{ column: 'id', operator: 'eq', value: profileId }],
 * });
 * ```
 */
export function useDataUpdate<T = unknown>(
  table: string,
  options?: UseDataMutationOptions<T>
) {
  const { update } = useDataSource();
  const queryClient = useQueryClient();
  const { invalidateQueries, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn: async (variables: MutationVariables<T>) => {
      if (!variables.data || !variables.filters) {
        return { data: null, error: { code: 'VALIDATION_ERROR' as const, message: 'Data and filters are required for update' } };
      }
      return update<T>(table, variables.data, variables.filters);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataLayer', table] });
      invalidateQueries?.forEach(t => {
        queryClient.invalidateQueries({ queryKey: ['dataLayer', t] });
      });
    },
    ...mutationOptions,
  });
}

/**
 * Hook for upserting data in the active datasource
 * 
 * @example
 * ```tsx
 * const { mutate } = useDataUpsert<Profile>('profiles');
 * 
 * mutate({
 *   data: { id: userId, display_name: 'Updated Name' },
 *   conflictColumns: ['id'],
 * });
 * ```
 */
export function useDataUpsert<T = unknown>(
  table: string,
  options?: UseDataMutationOptions<T>
) {
  const { upsert } = useDataSource();
  const queryClient = useQueryClient();
  const { invalidateQueries, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn: async (variables: MutationVariables<T>) => {
      if (!variables.data || !variables.conflictColumns) {
        return { data: null, error: { code: 'VALIDATION_ERROR' as const, message: 'Data and conflictColumns are required for upsert' } };
      }
      return upsert<T>(table, variables.data, variables.conflictColumns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataLayer', table] });
      invalidateQueries?.forEach(t => {
        queryClient.invalidateQueries({ queryKey: ['dataLayer', t] });
      });
    },
    ...mutationOptions,
  });
}

/**
 * Hook for deleting data from the active datasource
 * 
 * @example
 * ```tsx
 * const { mutate } = useDataDelete('profiles');
 * 
 * mutate({
 *   filters: [{ column: 'id', operator: 'eq', value: profileId }],
 * });
 * ```
 */
export function useDataDelete(
  table: string,
  options?: UseDataMutationOptions<null>
) {
  const { remove } = useDataSource();
  const queryClient = useQueryClient();
  const { invalidateQueries, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn: async (variables: MutationVariables<null>) => {
      if (!variables.filters) {
        return { data: null, error: { code: 'VALIDATION_ERROR' as const, message: 'Filters are required for delete' } };
      }
      return remove(table, variables.filters);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataLayer', table] });
      invalidateQueries?.forEach(t => {
        queryClient.invalidateQueries({ queryKey: ['dataLayer', t] });
      });
    },
    ...mutationOptions,
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get the current active datasource info
 */
export function useActiveDataSource() {
  const { activeSource, activeAdapter, isConnected, isLoading } = useDataSource();
  
  return {
    source: activeSource,
    adapter: activeAdapter,
    isConnected,
    isLoading,
    sourceName: activeSource?.config.name || 'Not connected',
    sourceType: activeSource?.config.type,
  };
}

/**
 * Get all available datasources
 */
export function useDataSources() {
  const { dataSources, addSource, removeSource, testSource, validateSourceSchema, migrateSourceSchema } = useDataSource();
  
  return {
    sources: dataSources,
    addSource,
    removeSource,
    testSource,
    validateSourceSchema,
    migrateSourceSchema,
  };
}

/**
 * Switch between datasources
 */
export function useDataSourceSwitch() {
  const { dataSources, activeSource, switchSource, isLoading } = useDataSource();
  
  return {
    sources: dataSources,
    activeSource,
    switchSource,
    isLoading,
  };
}
