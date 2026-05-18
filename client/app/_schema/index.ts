import {
  branchSchema,
  categorySchema,
  EmployeeSchema,
  ProductSchema,
} from "./schema";

const schemaMap = {
  branch: branchSchema,
  category: categorySchema,
  employee: EmployeeSchema,
  product: ProductSchema,
} as const;

export default schemaMap;
