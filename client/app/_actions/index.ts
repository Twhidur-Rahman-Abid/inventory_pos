/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import schemaMap from "../_schema";
import { cookies } from "next/headers";
import { BASE_URL } from "../_constants";
import { revalidateTag } from "next/cache";
import { updateTag } from "next/cache";

// get auth token func
async function getAuthTokens() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  return {
    accessToken,
    refreshToken,
  };
}

// get data from server
export async function getData(endpoint: string) {
  try {
    const { accessToken, refreshToken } = await getAuthTokens();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        data: null,
        status: "error",
        message:
          data?.message ||
          data?.detail ||
          data.error ||
          "There was an error occur!",
      };
    }
    return { data, status: "success", message: "" };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { data: null, status: "error", message: "Server Error!" };
  }
}

// post data to server
export async function postData({
  endpoint = "",
  formData,
  schemaName,
  revalidate,
}: {
  endpoint: string;
  formData: FormData;
  schemaName?: keyof typeof schemaMap;
  revalidate?: string;
}) {
  let schema = null;
  let submission: any = null;
  try {
    const { accessToken, refreshToken } = await getAuthTokens();
    console.log("=== Endpoint ===", endpoint);

    // Check schema
    if (schemaName) {
      schema = schemaMap[schemaName];
      submission = parseWithZod(formData, {
        schema,
      });

      if (submission.status !== "success") {
        return submission.reply();
      }
    }

    // remove empty file
    const keysToRemove: string[] = [];
    formData.forEach((value, key) => {
      if (value instanceof File && value.size === 0) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => {
      formData.delete(key);
    });

    console.log("== from data ==", formData);
    // post data
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("===res===", res);
    const data = await res.json();
    console.log("===data===", data);

    // return error status
    if (!res.ok) {
      const message =
        data?.message ||
        data?.detail ||
        data.error ||
        "There was an error occur!";
      if (submission) {
        return {
          status: "error",
          message,
          errors: data?.errors,
          lastResult: submission.reply({
            formErrors: message,
            status: "error",
          }),
        };
      } else {
        return { status: "error", message, errors: data?.errors };
      }
    }
    if (revalidate?.length) {
      revalidateTag(revalidate, "");
    }
    return { status: "success" };
  } catch (error) {
    console.log(error);
    if (submission) {
      return {
        status: "error",
        message: "Server error!",

        lastResult: submission.reply({
          formErrors: "server error!",
          status: "error",
        }),
      };
    }
    return { status: "error", message: "Server error!" };
  }
}

// post json data to server
export async function postJSONData({
  endpoint = "",
  formData,
  schemaName,
}: {
  endpoint: string;
  formData: FormData | any;
  schemaName?: keyof typeof schemaMap;
}) {
  let schema = null;
  let submission: any = null;
  try {
    const { accessToken, refreshToken } = await getAuthTokens();
    console.log("===start===", endpoint);

    // check schema validation
    if (schemaName) {
      schema = schemaMap[schemaName];
      submission = parseWithZod(formData, {
        schema,
      });

      if (submission.status !== "success") {
        return submission.reply();
      }
    }

    console.log("== from data ==", formData);
    // post data
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(
        formData instanceof FormData ? Object.fromEntries(formData) : formData,
      ),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("===res===", res);
    const data = await res.json();
    console.log("===data===", data);

    // return error response
    if (!res.ok) {
      const message =
        data?.message ||
        data?.detail ||
        data.error ||
        "There was an error occur!";
      if (submission) {
        return {
          status: "error",
          message,
          errors: data?.errors,
          lastResult: submission.reply({
            formErrors: message,
            status: "error",
          }),
        };
      } else {
        return { status: "error", message, errors: data?.errors };
      }
    }
    return { status: "success" };
  } catch (error) {
    console.log(error);
    if (submission) {
      return {
        status: "error",
        message: "Server error!",

        lastResult: submission.reply({
          formErrors: "server error!",
          status: "error",
        }),
      };
    }
    return { status: "error", message: "Server error!" };
  }
}
export async function putJSONData({
  endpoint = "",
  formData,
  schemaName,
}: {
  endpoint: string;
  formData: FormData | any;
  schemaName?: keyof typeof schemaMap;
}) {
  let schema = null;
  let submission: any = null;
  try {
    const { accessToken, refreshToken } = await getAuthTokens();
    console.log("===start===", endpoint);

    // Check schema validation
    if (schemaName) {
      schema = schemaMap[schemaName].partial();
      submission = parseWithZod(formData, {
        schema,
      });

      if (submission.status !== "success") {
        return submission.reply();
      }
    }

    const body =
      formData instanceof FormData
        ? JSON.stringify(Object.fromEntries(formData))
        : JSON.stringify(formData);

    console.log("== from data ==", body);

    // put data
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("===res===", res);
    const data = await res.json();
    console.log("===data===", data);

    // return error status
    if (!res.ok) {
      const message =
        data?.message ||
        data?.detail ||
        data.error ||
        "There was an error occur!";
      if (submission) {
        return {
          status: "error",
          message,
          errors: data?.errors,
          lastResult: submission.reply({
            formErrors: message,
            status: "error",
          }),
        };
      } else {
        return { status: "error", message, errors: data?.errors };
      }
    }
    return { status: "success" };
  } catch (error) {
    console.log(error);
    if (submission) {
      return {
        status: "error",
        message: "Server error!",

        lastResult: submission.reply({
          formErrors: "server error!",
          status: "error",
        }),
      };
    }
    return { status: "error", message: "Server error!" };
  }
}

// Put data to server
export async function putData({
  endpoint = "",
  formData,
  schemaName,
}: {
  endpoint: string;
  formData: FormData;
  schemaName?: keyof typeof schemaMap;
}) {
  let schema = null;
  let submission: any = null;
  try {
    const { accessToken, refreshToken } = await getAuthTokens();
    console.log("===start===", endpoint);

    // Check schema
    if (schemaName) {
      schema = schemaMap[schemaName];
      submission = parseWithZod(formData, {
        schema,
      });

      if (submission.status !== "success") {
        return submission.reply();
      }
    }

    // remove empty file
    const keysToRemove: string[] = [];
    formData.forEach((value, key) => {
      if (value instanceof File && value.size === 0) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => {
      formData.delete(key);
    });

    console.log("== from data ==", formData);

    // put data
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("===res===", res);
    const data = await res.json();
    console.log("===data===", data);

    // return error status
    if (!res.ok) {
      const message =
        data?.message ||
        data?.detail ||
        data.error ||
        "There was an error occur!";
      if (submission) {
        return {
          status: "error",
          message,
          errors: data?.errors,
          lastResult: submission.reply({
            formErrors: message,
            status: "error",
          }),
        };
      } else {
        return { status: "error", message, errors: data?.errors };
      }
    }
    return { status: "success" };
  } catch (error) {
    console.log(error);
    if (submission) {
      return {
        status: "error",
        message: "Server error!",

        lastResult: submission.reply({
          formErrors: "server error!",
          status: "error",
        }),
      };
    }
    return { status: "error", message: "Server error!" };
  }
}

// delete data
export async function deleteData(endpoint: string) {
  try {
    const { accessToken, refreshToken } = await getAuthTokens();

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      return {
        success: true,
      };
    } else {
      const data = await res.json();
      return {
        success: false,
        message:
          data?.message ||
          data?.detail ||
          data.error ||
          "There was an error occur!",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Server error!",
    };
  }
}
