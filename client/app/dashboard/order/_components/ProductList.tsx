/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Icon, Input } from "@/app/_components";
import Dropdown, { DropdownItem } from "@/app/_components/ui/Dropdown";
import React, { useState } from "react";
import ProductCard from "./ProductCard";

// dummy products
const dummyProducts = [
  {
    id: 1,
    name: "Laptop",
    sku_code: "LAP123",
    selling_price: 500,
    discount_percentage: 10,
    is_buyOneGetOne: false,
    current_stock: 10,
    category_name: "All",
  },
  {
    id: 2,
    name: "T-Shirt",
    sku_code: "TSH456",
    selling_price: 20,
    discount_percentage: 0,
    is_buyOneGetOne: true,
    current_stock: 5,
    category_name: "All",
  },
  {
    id: 3,
    name: "Phone",
    sku_code: "PHN789",
    selling_price: 300,
    discount_percentage: 5,
    is_buyOneGetOne: false,
    current_stock: 8,
    category_name: "All",
  },
];

const getPriceAfterDiscount = (product: any) => {
  if (product.is_buyOneGetOne) return product.selling_price;

  if (product.discount_percentage) {
    return (
      product.selling_price -
      (product.selling_price * product.discount_percentage) / 100
    );
  }

  return product.selling_price;
};

const ProductList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const products = dummyProducts;

  // -------- Filter Logic --------
  const handleProductFilter = () => {
    switch (productFilter) {
      case "l-h":
        return [...products].sort(
          (a, b) => getPriceAfterDiscount(a) - getPriceAfterDiscount(b),
        );
      case "h-l":
        return [...products].sort(
          (a, b) => getPriceAfterDiscount(b) - getPriceAfterDiscount(a),
        );
      case "d":
        return products.filter((p) => p.discount_percentage);
      case "1-1":
        return products.filter((p) => p.is_buyOneGetOne);
      default:
        return products;
    }
  };

  // -------- Search Filter --------
  const filterProduct = (product: any) => {
    if (!search) return product.current_stock > 0;

    const searchLower = search.toLowerCase();

    return (
      product.current_stock > 0 &&
      (product.name.toLowerCase().includes(searchLower) ||
        product.sku_code.toLowerCase().includes(searchLower))
    );
  };

  const productToRender = handleProductFilter().filter(filterProduct);

  const resetFilter = () => {
    setProductFilter("");
    setSearch("");
  };

  return (
    <div className="bg-white rounded-xl p-3 md:p-6 shadow-1">
      {/* Search + Filter */}
      <div className="flex gap-2.5 items-center">
        <Input
          placeholder="Search Here..."
          className="border-[1.5px] w-full border-none shadow-1 rounded-full"
          getInputValue={(val: string) => setSearch(val)}
          setDirectValue={search}
          LeftIcon={
            <Icon src="/icon/i-search.svg" className="mx-2.5 md:mx-[15px]" />
          }
          RightIcon={
            <Dropdown label={<Icon src="/icon/i-sort.svg" />}>
              <DropdownItem
                className={
                  productFilter === "l-h" ? "bg-gray-100 font-medium" : ""
                }
                onClick={() => setProductFilter("l-h")}
              >
                Low to high
              </DropdownItem>

              <DropdownItem
                className={
                  productFilter === "h-l" ? "bg-gray-100 font-medium" : ""
                }
                onClick={() => setProductFilter("h-l")}
              >
                High to low
              </DropdownItem>

              <DropdownItem
                className={
                  productFilter === "d" ? "bg-gray-100 font-medium" : ""
                }
                onClick={() => setProductFilter("d")}
              >
                Discount
              </DropdownItem>

              <DropdownItem
                className={
                  productFilter === "1-1" ? "bg-gray-100 font-medium" : ""
                }
                onClick={() => setProductFilter("1-1")}
              >
                Buy one get one
              </DropdownItem>
            </Dropdown>
          }
        />

        {/* Reset */}
        <button onClick={resetFilter}>
          <Icon src="/icon/i-close.svg" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3 gap-6 mt-10">
        {productToRender.length > 0 ? (
          productToRender.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-center text-yellow-600">Product not found</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
