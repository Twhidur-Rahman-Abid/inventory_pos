// import { refreshTokenRotate } from "../_actions/auth_actions";

// /* eslint-disable @typescript-eslint/no-explicit-any */
// let refreshPromise: Promise<any> | null = null;

// export const getFreshToken = async () => {
//   if (!refreshPromise) {
//     refreshPromise = refreshTokenRotate().finally(() => {
//       refreshPromise = null;
//     });
//   }

//   return refreshPromise;
// };

import { refreshTokenRotate } from "../_actions/auth_actions";

type RefreshTokenResult = Awaited<ReturnType<typeof refreshTokenRotate>>;

let refreshPromise: Promise<RefreshTokenResult> | null = null;
let cachedResult: RefreshTokenResult | null = null;
let cacheExpiresAt = 0;

const CACHE_TIME = 60 * 1000; // 1 minute

export const getFreshToken = async (): Promise<RefreshTokenResult> => {
  const now = Date.now();

  // 1️⃣ Return cached result if it is still valid
  if (cachedResult && now < cacheExpiresAt) {
    return cachedResult;
  }

  // 2️⃣ If refresh is already running, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // 3️⃣ Start a new refresh
  refreshPromise = refreshTokenRotate();

  try {
    const result = await refreshPromise;

    // 4️⃣ Cache successful refresh result for 1 minute
    if (result?.access_token) {
      cachedResult = result;
      cacheExpiresAt = Date.now() + CACHE_TIME;
    }

    return result;
  } finally {
    // Only clear the promise, NOT the cached result
    refreshPromise = null;
  }
};
