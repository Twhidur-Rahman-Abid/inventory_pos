/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/use-memo */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback, useRef } from "react";

import { toast } from "react-toastify";
import { useUser } from "../_context/userContext";
import { BASE_URL } from "../_constants";
import { FetchStatus } from "../_types/types";
import { logoutAction } from "../_actions/auth_actions";
import { useRouter } from "next/navigation";
import { getFreshToken } from "../_lib/getOptimizeRefreshToken";

interface FetchDataProps {
  endpoint: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  isFetch?: boolean;
  isChange?: any | any[];
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
}: FetchDataProps): FetchResponse<T> => {
  "use no memo";
  const [data, setData] = useState<T>([] as unknown as T);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<FetchStatus>("start");
  const [error, setError] = useState<string | null>(null);

  const { token, setUser } = useUser();
  const router = useRouter();

  // --------------------------------
  // Keep latest token in ref
  // --------------------------------

  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // --------------------------------
  // Fetcher
  // --------------------------------

  const fetcher = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentToken = tokenRef.current;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...(currentToken && {
            Authorization: `Bearer ${currentToken}`,
          }),
          "Content-Type": "application/json",
        },
      };

      // --------------------------------
      // Initial request
      // --------------------------------

      const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

      const resData = await response.json();

      // --------------------------------
      // Access token expired
      // --------------------------------

      if (response.status === 401) {
        console.error("401");

        const tokenRes = await getFreshToken();

        console.log("initial token:", currentToken);
        console.log("refresh response:", tokenRes);

        // --------------------------------
        // Refresh success
        // --------------------------------

        if (tokenRes?.access_token) {
          const newToken = tokenRes.access_token;

          // Update ref immediately
          tokenRef.current = newToken;

          // Update React context
          setUser((prev) => ({
            ...prev,
            token: newToken,
          }));

          // --------------------------------
          // Retry original request
          // --------------------------------

          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });

          const retryData = await retryResponse.json();

          console.log("retryData:", retryData);
          console.log("retryStatus:", retryResponse.status);

          // --------------------------------
          // Retry success
          // --------------------------------

          if (retryResponse.ok) {
            setData(retryData as T);
            setStatus("success");
            setError(null);

            return;
          }

          // --------------------------------
          // Retry also unauthorized
          // --------------------------------

          if (retryResponse.status === 401) {
            console.log("logout from retry");

            await logoutAction();

            router.push("/");

            setStatus("error");
            setError("Unauthorized! Please log in again.");

            toast.error("Unauthorized! Please log in again.");

            return;
          }

          // --------------------------------
          // Retry other error
          // --------------------------------

          setStatus("error");

          const message =
            retryData?.message ||
            retryData?.detail ||
            retryData?.error ||
            "Retry failed";

          setError(message);
          toast.error(message);

          return;
        }

        // --------------------------------
        // Refresh failed
        // --------------------------------

        console.error("Refresh token failed");

        await logoutAction();

        router.push("/");

        setStatus("error");
        setError("Unauthorized! Please log in again.");

        toast.error("Unauthorized! Please log in again.");

        return;
      }

      // --------------------------------
      // Normal success
      // --------------------------------

      if (response.ok) {
        setData(resData as T);
        setStatus("success");
        setError(null);

        return;
      }

      // --------------------------------
      // Normal API error
      // --------------------------------

      setStatus("error");

      const message =
        resData?.message ||
        resData?.detail ||
        resData?.error ||
        "An error occurred while fetching data.";
      console.error("client fetch error:", message);

      setError(message);
      toast.error(message);

      setData([] as unknown as T);
    } catch (error: any) {
      setStatus("error");
      setError("Server error!");

      console.error(`Fetch error [${endpoint}]:`, error?.message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, method]);

  // --------------------------------
  // Auto fetch
  // --------------------------------

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
