/* eslint-disable react-hooks/use-memo */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useUser } from "../_context/userContext";
import { BASE_URL } from "../_constants";

interface FetchDataProps {
  endpoint: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  isFetch?: boolean;
  isChange?: any | any[];
  cacheStrategy?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
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
  cacheStrategy = "force-cache",
  revalidate = false,
  tags = [],
}: FetchDataProps): FetchResponse<T> => {
  const [data, setData] = useState<T>([] as unknown as T);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<"start" | "success" | "error">("start");
  const [error, setError] = useState<string | null>(null);

  const { token } = useUser();

  const fetcher = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchOptions: RequestInit & {
        next?: { revalidate?: number | false; tags?: string[] };
      } = {
        method,
        headers: {
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
          "Content-Type": "application/json",
        },
        // cache: cacheStrategy,
        // next: {
        //   ...(revalidate !== false && { revalidate }),
        //   ...(tags.length > 0 && { tags }),
        // },
      };

      const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
      const resData = await response.json();

      if (response.status === 401) {
        // signOut({ callbackUrl: window.location.origin });
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
        setError(resData?.message || resData?.detail || resData?.error);
        // Error message handling logic
        const message = resData?.message || resData?.detail || resData?.error;
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
    cacheStrategy,
    revalidate,
    JSON.stringify(tags),
  ]);

  useEffect(() => {
    let ignore = false;
    if (isFetch && !ignore) {
      fetcher();
    } else if (!isFetch) {
      setData([] as unknown as T);
    }
    return () => {
      ignore = true;
    };
  }, [isFetch, fetcher, ...(Array.isArray(isChange) ? isChange : [isChange])]);

  return { data, isLoading, fetcher, status, error };
};

export default useFetchWAuth;
