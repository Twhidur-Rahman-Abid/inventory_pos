import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrderStatus } from "../_types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (isoStr: string | Date): string => {
  const date = new Date(isoStr);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/ /g, "-")
    .toUpperCase();

  return formattedDate;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export const getOrderStatusColor = (status: OrderStatus) => {
  let color;
  switch (status) {
    case "pending":
    case "processing":
      color = "bg-[#127DF7]";
      break;
    case "packing":
      color = "bg-[#FF6B00]";
      break;
    case "out_for_delivery":
      color = "bg-[#9124F0]";
      break;
    case "completed":
    case "delivered":
      color = "bg-[#03BA74]";
      break;
    case "cancelled":
      color = "bg-red-500";
      break;
    default:
      color = "bg-[#127DF7]";
  }
  return color;
};
