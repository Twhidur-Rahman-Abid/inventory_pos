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

// admin route
const ADMIN_ROUTE = [
  {
    label: "Dashboard",
    icon: "/icon/i-dashboard.svg",
  },
  {
    label: "Products",
    icon: "/icon/i-product.svg",
  },
  { label: "Sold", icon: "/icon/i-sold.svg" },
  { label: "Online Order", icon: "/icon/i-online-order.svg" },
  { label: "Category", icon: "/icon/i-category.svg" },
  { label: "Branch", icon: "/icon/i-branch.svg" },
  { label: "Employee", icon: "/icon/i-cashire.svg" },
  { label: "Reports", icon: "/icon/i-report.svg" },
  { label: "Setting", icon: "/icon/i-setting-2.svg" },
];

const WAREHOUSE_ROUTE = [
  {
    label: "Dashboard",
    icon: "/icon/i-dashboard.svg",
  },
  { label: "Order", icon: "/icon/i-order.svg" },
  {
    label: "Products",
    icon: "/icon/i-product.svg",
  },
  { label: "Sold", icon: "/icon/i-sold.svg" },
  { label: "Online Order", icon: "/icon/i-online-order.svg" },
  { label: "Reports", icon: "/icon/i-report.svg" },
  { label: "Setting", icon: "/icon/i-setting-2.svg" },
];

const BRANCH_ROUTE = [
  {
    label: "Dashboard",
    icon: "/icon/i-dashboard.svg",
  },
  { label: "Order", icon: "/icon/i-order.svg" },
  {
    label: "Products",
    icon: "/icon/i-product.svg",
  },
  { label: "Sold", icon: "/icon/i-sold.svg" },
  { label: "Online Order", icon: "/icon/i-online-order.svg" },
  {
    label: "Stock",
    icon: "/icon/i-product.svg",
  },
  { label: "Reports", icon: "/icon/i-report.svg" },
  { label: "Setting", icon: "/icon/i-setting-2.svg" },
];
// common routes
const sideLinks = [
  {
    label: "Dashboard",
    icon: "/icon/i-dashboard.svg",
  },
  { label: "Order", icon: "/icon/i-order.svg" },
  {
    label: "Products",
    icon: "/icon/i-product.svg",
  },
  { label: "Sold", icon: "/icon/i-sold.svg" },
  { label: "Online Order", icon: "/icon/i-online-order.svg" },
  {
    label: "Stock",
    icon: "/icon/i-product.svg",
  },
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

const ADMINIS_ROLE = ["warehouse_manager", "admin"];

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
  ADMINIS_ROLE,
  BRANCH_ROUTE,
  WAREHOUSE_ROUTE,
  ADMIN_ROUTE,
};
