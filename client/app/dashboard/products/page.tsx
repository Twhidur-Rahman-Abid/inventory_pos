"use client";

import { HeaderType } from "@/app/_lib/CommonTypes";
import {
  Button,
  ExportTable,
  Icon,
  ImportTable,
  PageTopBar,
  Pagination,
  Search,
} from "@/app/_components";
import Table, { Td } from "@/app/_components/ui/Table";
import { useState } from "react";
import ProductModal from "@/app/_components/products/ProductModal";

// 🔹 dummy product data
const products = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  sku: `SKU-${1000 + i}`,
  price: (Math.random() * 100).toFixed(2),
  stock: Math.floor(Math.random() * 100),
}));

const headers: HeaderType[] = [
  { label: "ID" },
  { label: "Product Name" },
  { label: "SKU" },
  { label: "Price" },
  { label: "Stock" },
  { label: "Actions", align: "center" },
];

const PAGE_SIZE = 10;

export default function ProductPage() {
  // 🔹 get page from URL
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const page = Number(searchParams.get("page") || 1);

  const totalPage = Math.ceil(products.length / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const paginatedProducts = products.slice(start, start + PAGE_SIZE);

  const options = Array.from({ length: totalPage }, (_, i) => ({
    value: i + 1,
    label: i + 1,
  }));

  const [isProductOpen, setIsProductOpen] = useState(false);

  return (
    <>
      <div className="space-y-7">
        <PageTopBar title="Products" quantity={products.length}>
          <Button
            className="bg-white border border-primary text-primary px-3.5"
            //   onClick={() => setIsCategoryOpen(true)}
          >
            ADD Category
            <svg
              className="hidden md:block"
              width={20}
              height={20}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 15H11V11H15V9H11V5H9V9H5V11H9V15ZM10 20C8.61667 20 7.31667 19.7417 6.1 19.225C4.88333 18.6917 3.825 17.975 2.925 17.075C2.025 16.175 1.30833 15.1167 0.775 13.9C0.258333 12.6833 0 11.3833 0 10C0 8.61667 0.258333 7.31667 0.775 6.1C1.30833 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.31667 6.1 0.799999C7.31667 0.266666 8.61667 0 10 0C11.3833 0 12.6833 0.266666 13.9 0.799999C15.1167 1.31667 16.175 2.025 17.075 2.925C17.975 3.825 18.6833 4.88333 19.2 6.1C19.7333 7.31667 20 8.61667 20 10C20 11.3833 19.7333 12.6833 19.2 13.9C18.6833 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6917 13.9 19.225C12.6833 19.7417 11.3833 20 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z"
                fill="var(--color-primary)"
              />
            </svg>
          </Button>
          <Button
            className=" border-none px-3.5"
            onClick={() => setIsProductOpen(true)}
          >
            ADD Product
            <Icon src="/icon/i-plus.svg" className="hidden md:inline-block" />
          </Button>
        </PageTopBar>

        <div className="card-wrapper space-y-6">
          <div className="flex gap-6 items-center justify-between flex-wrap">
            <Search />
            <div className="flex gap-6 items-center">
              <ImportTable />
              <ExportTable headers={headers} tableData={paginatedProducts} />
            </div>
          </div>
          {/* 🔹 Table */}
          <Table headers={headers}>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <Td>{product.id}</Td>
                <Td>{product.name}</Td>
                <Td>{product.sku}</Td>
                <Td>${product.price}</Td>
                <Td>{product.stock}</Td>
                <Td className={"text-center"}>
                  <div className="inline-flex gap-5 min-w-max">
                    <Icon src="/icon/i-edit-pen.svg" size={24} />
                    <Icon src="/icon/i-eye-view.svg" size={24} />
                    <Icon src="/icon/i-delete.svg" size={24} />
                  </div>
                </Td>
              </tr>
            ))}
          </Table>

          {/* 🔹 Pagination */}
          <Pagination totalPage={totalPage} options={options} />
        </div>
      </div>
      {/* Product Modal */}
      {isProductOpen && (
        <ProductModal onClose={() => setIsProductOpen(false)} />
      )}
    </>
  );
}
