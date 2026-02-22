
import { useState, useEffect, useCallback } from 'react';
import { apiService } from './ApiService';
import { ApiState, ApiError } from './apiTypes';

/**
 * Hook to use API state with automatic subscription
 */
export function useApiState<T>(key: string, initialValue: T) {
    const [state, setState] = useState<ApiState<T>>(() => {
        const existingState = apiService.getState<T>(key);
        return existingState || {
            data: initialValue,
            loading: false,
            error: null,
            lastUpdated: null,
        };
    });

    useEffect(() => {
        // Subscribe to state changes
        const unsubscribe = apiService.subscribe<T>(key, (newState) => {
            setState(newState);
        });

        // Get current state
        const currentState = apiService.getState<T>(key);
        if (currentState) {
            setState(currentState);
        }

        return unsubscribe;
    }, [key]);

    return state;
}

/**
 * Hook to fetch data and manage state
 */
export function useFetch<T>(
    key: string,
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    options?: {
        initialValue?: T;
        autoFetch?: boolean;
    }
) {
    const { initialValue, autoFetch = true } = options || {};
    const state = useApiState<T>(key, initialValue as T);

    const fetch = useCallback(async () => {
        try {
            await apiService.fetchAndStore<T>(key, endpoint, params, initialValue);
        } catch (error) {
            // Error is already stored in state
            console.error('Fetch error:', error);
        }
    }, [key, endpoint, params, initialValue]);

    const refetch = useCallback(() => {
        return fetch();
    }, [fetch]);

    useEffect(() => {
        if (autoFetch) {
            fetch();
        }
    }, [autoFetch, fetch]);

    return {
        ...state,
        refetch,
    };
}

/**
 * Hook to post data and manage state
 */
export function usePost<T>(key: string, endpoint: string, initialValue?: T) {
    const state = useApiState<T>(key, initialValue as T);

    const post = useCallback(
        async (data?: any, files?: File[]) => {
            try {
                const result = await apiService.postAndStore<T>(
                    key,
                    endpoint,
                    data,
                    files,
                    initialValue
                );
                return result;
            } catch (error) {
                // Error is already stored in state
                console.error('Post error:', error);
                throw error;
            }
        },
        [key, endpoint, initialValue]
    );

    return {
        ...state,
        post,
    };
}

/**
 * Hook for homework submission
 */
export function useHomeworkSubmission(key: string = 'homework-submission') {
    const state = useApiState(key, null);

    const submit = useCallback(
        async (assignment_id: number, comment?: string, files?: File[]) => {
            try {
                const result = await apiService.submitHomeworkAndStore(key, {
                    assignment_id,
                    comment,
                    files,
                });
                return result;
            } catch (error) {
                console.error('Homework submission error:', error);
                throw error;
            }
        },
        [key]
    );

    const reset = useCallback(() => {
        apiService.clearState(key);
    }, [key]);

    return {
        ...state,
        submit,
        reset,
    };
}

/**
 * Generic hook for API mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation<TData = any, TVariables = any>(
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
    const [state, setState] = useState<{
        data: TData | null;
        loading: boolean;
        error: ApiError | null;
    }>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(
        async (variables?: TVariables, files?: File[]) => {
            setState({ data: null, loading: true, error: null });

            try {
                let response;
                switch (method) {
                    case 'POST':
                        response = await apiService.post<TData>(endpoint, variables, files);
                        break;
                    case 'PUT':
                        response = await apiService.put<TData>(endpoint, variables);
                        break;
                    case 'PATCH':
                        response = await apiService.patch<TData>(endpoint, variables);
                        break;
                    case 'DELETE':
                        response = await apiService.delete<TData>(endpoint);
                        break;
                }

                setState({ data: response.data, loading: false, error: null });
                return response.data;
            } catch (error: any) {
                const apiError: ApiError = {
                    message: error.message || 'Mutation failed',
                    status: error.status,
                    statusText: error.statusText,
                    data: error.data,
                };
                setState({ data: null, loading: false, error: apiError });
                throw apiError;
            }
        },
        [endpoint, method]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        mutate,
        reset,
    };
}
