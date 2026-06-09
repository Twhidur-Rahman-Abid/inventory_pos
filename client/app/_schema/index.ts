import {
  branchSchema,
  categorySchema,
  ChangePassSchema,
  EmployeeSchema,
  ProductSchema,
} from "./schema";

const schemaMap = {
  branch: branchSchema,
  category: categorySchema,
  employee: EmployeeSchema,
  product: ProductSchema,
  ChangePassSchema,
} as const;

export default schemaMap;
