/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { BASE_URL } from "@/app/_constants";
import setAccessAndRefreshToken from "../_lib/auth";
import { cookies } from "next/headers";

export async function authAction(_: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let errors = {};
  if (!email) {
    errors = { ...errors, email: "Email field required" };
  }

  if (!password) {
    errors = { ...errors, password: "Password field required" };
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation error!",
      errors,
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      await setAccessAndRefreshToken(data.access_token, data.refresh_token);

      return {
        success: true,
        data,
      };
    } else {
      return {
        success: false,
        message: data?.message || data?.detail || data?.error || "Login failed",
        ...data,
        formData: Object.fromEntries(formData.entries()),
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Server error",
      formData: Object.fromEntries(formData.entries()),
    };
  }
}

export async function refreshTokenRotate() {
  console.log("refesh token call:");
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refreshToken")?.value;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refresh }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (res.ok) {
    await setAccessAndRefreshToken(data.access_token, data.refresh_token);
    return { success: true, ...data };
  } else {
    return { success: false };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
