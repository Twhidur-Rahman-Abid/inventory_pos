/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/use-memo */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useUser } from "../_context/userContext";
import { BASE_URL } from "../_constants";
import { FetchStatus } from "../_types/types";

interface FetchDataProps {
  endpoint: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  isFetch?: boolean;
  isChange?: any | any[];

  // browser cache
  cache?: RequestCache;

  // nextjs server cache
  revalidate?: number | false;
  tags?: string[];

  enableCache?: boolean;
}

interface FetchResponse<T> {
  data: T;
  isLoading: boolean;
  fetcher: () => Promise<void>;
  status: "start" | "success" | "error";
  error: string | null;
}

const useFetchWAuth = <T = any[]>({
  endpoint,
  method = "GET",
  isFetch = true,
  isChange,

  cache = "default",
  revalidate = false,
  tags = [],

  enableCache = false,
}: FetchDataProps): FetchResponse<T> => {
  const [data, setData] = useState<T>([] as unknown as T);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<FetchStatus>("start");
  const [error, setError] = useState<string | null>(null);

  const { token } = useUser();

  const fetcher = useCallback(async () => {
    setIsLoading(true);

    try {
      const fetchOptions: RequestInit & {
        next?: {
          revalidate?: number | false;
          tags?: string[];
        };
      } = {
        method,

        headers: {
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
          "Content-Type": "application/json",
        },
      };

      // optional browser cache
      if (enableCache) {
        fetchOptions.cache = cache;
      } else {
        fetchOptions.cache = "no-store";
      }

      // nextjs server cache
      if (revalidate || tags.length > 0) {
        fetchOptions.next = {
          revalidate,
          tags,
        };
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

      const resData = await response.json();

      if (response.status === 401) {
        setStatus("error");
        setError("Unauthorized! Please log in again.");
        toast.error("Unauthorized! Please log in again.");
        return;
      }

      if (response.ok) {
        setData(resData as T);
        setStatus("success");
      } else {
        setStatus("error");

        const message = resData?.message || resData?.detail || resData?.error;

        setError(message);

        toast.error(message || "An error occurred while fetching data.");

        setData([] as unknown as T);
      }
    } catch (error: any) {
      setStatus("error");
      setError("Server error!");

      console.error(`Fetch error [${endpoint}]:`, error?.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    endpoint,
    method,
    token,
    cache,
    enableCache,
    revalidate,
    JSON.stringify(tags),
  ]);

  useEffect(() => {
    if (isFetch) {
      fetcher();
    } else {
      setIsLoading(false);
      setData([] as unknown as T);
    }
  }, [isFetch, fetcher, ...(Array.isArray(isChange) ? isChange : [isChange])]);

  return {
    data,
    isLoading,
    fetcher,
    status,
    error,
  };
};

export default useFetchWAuth;
