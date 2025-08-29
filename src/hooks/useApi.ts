import { useState, useCallback } from 'react';
import { ApiError } from '../services/httpClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Сталася невідома помилка';
        
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// Specialized hooks for common API operations
export function useGet<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
) {
  return useApi(apiFunction, initialData);
}

export function useCreate<T = any>(
  apiFunction: (...args: any[]) => Promise<T>
) {
  return useApi(apiFunction);
}

export function useUpdate<T = any>(
  apiFunction: (...args: any[]) => Promise<T>
) {
  return useApi(apiFunction);
}

export function useDelete(
  apiFunction: (...args: any[]) => Promise<void>
) {
  return useApi(apiFunction);
}

// Hook for managing multiple API calls
export function useMultipleApis<T extends Record<string, any>>(
  apiFunctions: T
) {
  const results: Record<string, UseApiReturn<any>> = {} as Record<string, UseApiReturn<any>>;

  Object.entries(apiFunctions).forEach(([key, apiFunction]) => {
    results[key] = useApi(apiFunction);
  });

  return results;
}

// Hook for paginated data
export function usePaginatedApi<T = any>(
  apiFunction: (params: any) => Promise<{ data: T[]; pagination: any }>,
  initialParams: any = {}
) {
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const { execute, loading, error, reset } = useApi(apiFunction);

  const fetchData = useCallback(async (newParams?: any) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    
    const result = await execute(updatedParams);
    if (result) {
      setData(result.data);
      setPagination(result.pagination);
    }
  }, [execute, params]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (pagination && pagination.page < pagination.totalPages) {
      await fetchData({ page: pagination.page + 1 });
    }
  }, [fetchData, pagination]);

  return {
    data,
    pagination,
    loading,
    error,
    params,
    setParams,
    fetchData,
    refresh,
    loadMore,
    reset,
  };
}
