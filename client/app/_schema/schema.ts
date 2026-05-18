import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().optional(),
  image: z.instanceof(File).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  image: z.instanceof(File).optional(),
});

export const EmployeeSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().min(5).max(180),
  mobile: z.string().min(11).max(15),
  password: z.string().min(6).max(20),
  role: z.string(),
  branch_id: z.int(),
});
const fileOrUrlSchema = z
  .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
  .optional();

export const ProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  sku_code: z.string().min(5, "SKU must be at least 5 characters").max(180),
  category_id: z.coerce.number("Category is required"),
  discount_percentage: z.coerce.number().optional(),
  is_buy_one_get_one: z.boolean().optional(),
  thumbnail: fileOrUrlSchema,
  description: z.string().optional(),
  images: z.array(fileOrUrlSchema).optional(),
  quantity: z.coerce.number().optional(),
  price: z.coerce.number("Price is required").min(0),
});
