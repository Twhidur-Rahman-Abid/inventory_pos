export type BranchType = {
  id: number;
  name: string;
  img?: string;
  location?: string;
};

export type CategoryType = {
  id: number | string;
  name: string;
  img?: string;
};
export enum RoleType {
  admin,
  "warehouse_manager",
  "shop_manager",
  "shop_staff",
}
export type EmployeeType = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: RoleType;
  is_active: boolean;
  branch: {
    name: string;
    id: number;
  };
};

export type ProductType = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  sku_code: string;
  images?: string[];
  thumbnail?: string;
  category_id?: number;
  is_buy_one_get_one?: boolean;
  discount_percentage?: number;
  details?: { description: string };
};

export type OrderStatus =
  | "processing"
  | "packing"
  | "out_for_delivery"
  | "delivered"
  | "pending"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cash" | "bkash" | "nagad" | "rocket";

export type FetchStatus = "start" | "success" | "error";
