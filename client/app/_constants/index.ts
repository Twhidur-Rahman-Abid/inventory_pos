const BASE_URL = "http://127.0.0.1:8000/api/v1";

// MONEY SYMBOL BDT
const MONEY_SYMBOL = "৳";
const MONEY_TITLE = "BDT";

const PAYMENT_METHOD = [
  { value: "cash", label: "Cash", img: "/cash.svg" },
  { value: "bkash", label: "Bkash", img: "/BKash.svg" },
  { value: "nagad", label: "Nagad", img: "/Nagad.svg" },
  { value: "rocket", label: "Rocket", img: "/rocket.png" },
];

const USER_ROLE = [
  {
    label: "Warehouse manager",
    value: "warehouse_manager",
  },
  {
    label: "Shop Manager",
    value: "shop_manager",
  },
  {
    label: "Shop Staff",
    value: "shop_staff",
  },
];

const ORDER_TRACKING_OPTIONS = [
  { value: "processing", label: "Processing" },
  { value: "packing", label: "Packing" },
  { value: "out_for_delivery", label: "Out For Delivery" },
  { value: "delivered", label: "Delivered" },
];

export {
  MONEY_SYMBOL,
  MONEY_TITLE,
  PAYMENT_METHOD,
  BASE_URL,
  USER_ROLE,
  ORDER_TRACKING_OPTIONS,
};
