/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export default async function setAccessAndRefreshToken(
  accessToken: string,
  refreshToken: string,
) {
  const decodedToken: any = jwtDecode(accessToken);
  const decodedRefreshToken: any = jwtDecode(refreshToken);
  const accessTokenExpiry = new Date(decodedToken.exp * 1000);
  const refreshTokenExpiry = new Date(decodedRefreshToken.exp * 1000); // 7 days

  const cookieStore = await cookies();

  cookieStore.set({
    name: "accessToken",
    value: accessToken,
    expires: accessTokenExpiry,
    httpOnly: true,
  });
  cookieStore.set({
    name: "refreshToken",
    value: refreshToken,
    expires: refreshTokenExpiry,
    httpOnly: true,
  });
}
