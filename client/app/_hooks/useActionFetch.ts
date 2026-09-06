"use client";

import { useState, useEffect } from "react";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

interface UseActionFetchOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (message: string) => void;
}

interface UseActionFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  fetcher: () => Promise<void>;
}

export function useActionFetch<T>(
  action: () => Promise<ApiResponse<T>>,
  options: UseActionFetchOptions<T> = {},
): UseActionFetchReturn<T> {
  const { enabled = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const res = await action();

      if (res.success && res.data !== null) {
        setData(res.data);
        onSuccess?.(res.data);
      } else {
        const errorMsg = res.message || "Failed to fetch data";
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const fallbackMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(fallbackMsg);
      onError?.(fallbackMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [enabled, action]);

  return {
    data,
    isLoading,
    error,
    fetcher: fetchData,
  };
}
