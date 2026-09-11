"use server";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { BASE_URL } from "../_constants";
import { BranchType, CategoryType, HeroSlider } from "../_types/types";

// Fetch Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface FetchDataParams {
  endpoint: string;
}

// Generic Fetch Function
export const fetchData = async <T>({
  endpoint,
}: FetchDataParams): Promise<ApiResponse<T>> => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("error:", data);
      return {
        success: false,
        message: data?.message || data?.details || "Something went wrong",
        data: null,
      };
    } else {
      return {
        success: true,
        message: "Fetched data success!",
        data: data as T,
      };
    }
  } catch (e) {
    console.error(endpoint, ":", e);
    return {
      success: false,
      message: "Client server error!",
      data: null,
    };
  }
};

export const fetchCategory = async () => {
  "use cache";
  cacheLife("weeks");
  cacheTag("category");
  const res = await fetchData<{
    count: number;
    has_next: boolean;
    data: CategoryType[];
  }>({ endpoint: "/categories" });
  if (!res) {
    updateTag("category");
  }
  return res;
};

export const fetchBranch = async () => {
  "use cache";
  cacheLife("weeks");
  cacheTag("branch");
  const res = await fetchData<BranchType[]>({
    endpoint: "/branches",
  });
  if (!res) {
    updateTag("branch");
  }
  return res;
};

export const fetchBrand = async () => {
  "use cache";
  cacheLife("weeks");
  cacheTag("branch");
  const res = await fetchData<{ count: number; data: CategoryType[] }>({
    endpoint: "/brands",
  });
  if (!res) {
    updateTag("brands");
  }
  return res;
};

export const fetchHeroSlider = async () => {
  "use cache";
  cacheLife("weeks");
  cacheTag("heroSliders");
  const res = await fetchData<HeroSlider[]>({
    endpoint: "/webs/hero-sliders",
  });
  if (!res) {
    updateTag("heroSliders");
  }
  return res;
};
