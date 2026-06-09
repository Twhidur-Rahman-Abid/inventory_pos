import { z } from "zod";

export const branchSchema = z.object({
  name: z
    .string()
    .min(2, "Branch name must be at least 2 characters")
    .max(100, "Branch name cannot exceed 100 characters"),

  location: z.string().optional(),

  image: z.instanceof(File, { message: "Invalid image file" }).optional(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  image: z.instanceof(File, { message: "Invalid image file" }).optional(),
});

export const EmployeeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .email("Please enter a valid email address")
    .min(5, "Email is too short")
    .max(180, "Email is too long"),

  mobile: z
    .string()
    .min(11, "Mobile number must be at least 11 digits")
    .max(15, "Mobile number cannot exceed 15 digits"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),

  role: z.string({
    error: "Role is required",
  }),

  branch_id: z.coerce.number({
    error: "Branch is required",
  }),
});

export const ChangePassSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(5, "Email is too short")
    .max(180, "Email is too long"),

  old_password: z
    .string({ error: "Old password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),

  new_password: z
    .string({ error: "New password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),
});

const fileOrUrlSchema = z
  .union([
    z.instanceof(File, { message: "Invalid file upload" }),
    z.string(),
    z.null(),
    z.undefined(),
  ])
  .optional();

export const ProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  sku_code: z
    .string()
    .min(5, "SKU must be at least 5 characters")
    .max(180, "SKU cannot exceed 180 characters"),

  category_id: z.coerce.number({
    error: "Category is required",
  }),

  discount_percentage: z.coerce
    .number({
      error: "Discount must be a number",
    })
    .optional(),

  is_buy_one_get_one: z.boolean().optional(),

  thumbnail: fileOrUrlSchema,

  description: z.string().optional(),

  images: z.array(fileOrUrlSchema).optional(),

  quantity: z.coerce
    .number({
      error: "Quantity must be a number",
    })
    .optional(),

  price: z.coerce
    .number({
      error: "Price is required",
    })
    .min(0, "Price cannot be negative"),

  deleted_image_ids: z.array(z.coerce.number()).optional(),
});
