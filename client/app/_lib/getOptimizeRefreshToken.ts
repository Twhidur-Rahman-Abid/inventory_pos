import { refreshTokenRotate } from "../_actions/auth_actions";

/* eslint-disable @typescript-eslint/no-explicit-any */
let refreshPromise: Promise<any> | null = null;

export const getFreshToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshTokenRotate().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};
