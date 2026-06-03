/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Icon, Input } from "@/app/_components";
import Dropdown, { DropdownItem } from "@/app/_components/ui/Dropdown";
import React, { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { ProductType } from "@/app/_types/types";
import Loading from "@/app/_components/ui/Loading";
import { useCart } from "@/app/_context/productOrderCartContext";
import { ErrorMessage } from "@/app/_components/ui/Alert";

const getPriceAfterDiscount = (product: ProductType) => {
  if (product.is_buy_one_get_one) return product.price;

  if (product.discount_percentage) {
    return product.price - (product.price * product.discount_percentage) / 100;
  }

  return product.price;
};

const ProductList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const { selectedCategory, setSelectedCategory, addToCart, productState } =
    useCart();

  const {
    products,
    productsLoading,
    productsStatus,
    productsError,
    productCount,
  } = productState;

  // -------- Filter  Logic --------
  const filteredProducts = useMemo(() => {
    switch (productFilter) {
      case "l-h":
        return products.toSorted(
          (a, b) => getPriceAfterDiscount(a) - getPriceAfterDiscount(b),
        );

      case "h-l":
        return products.toSorted(
          (a, b) => getPriceAfterDiscount(b) - getPriceAfterDiscount(a),
        );

      case "d":
        return products.filter((p) => p.discount_percentage);

      case "1-1":
        return products.filter((p) => p.is_buy_one_get_one);

      default:
        return products;
    }
  }, [products, productFilter]);

  // product to render after search, quantity and category filter
  const productToRender = useMemo(() => {
    const searchLower = search.toLowerCase();

    return filteredProducts.filter((product) => {
      const searchFilter = search
        ? product.name.toLowerCase().includes(searchLower) ||
          product.sku_code.toLowerCase().includes(searchLower)
        : true;

      const categoryFilter =
        selectedCategory.id === "all"
          ? true
          : selectedCategory.id === product.category_id;

      return product.quantity > 0 && searchFilter && categoryFilter;
    });
  }, [filteredProducts, search, selectedCategory.id]);

  // reset all filters
  const resetFilter = () => {
    setProductFilter("");
    setSearch("");
    setSelectedCategory({
      id: "all",
      name: "All",
    });
  };

  // Handle search by SKU or name
  // if SKU matches, add to cart immediately, otherwise just filter the products
  const handleSearch = (val: string) => {
    const matchSku = productToRender?.find((v) => v.sku_code === val);
    if (matchSku) addToCart({ ...matchSku, qty: 1 });
    setSearch(val);
  };

  // decide what to render
  let ProductRender = null;
  if (productsLoading) ProductRender = <Loading />;
  else if (!productsLoading && productsStatus === "error")
    ProductRender = (
      <ErrorMessage message={productsError || "Error occurred"} />
    );
  else if (
    productsStatus === "success" &&
    (productToRender?.length === 0 || !productCount)
  )
    ProductRender = (
      <p className="text-center text-yellow-600">Product not found</p>
    );
  else
    ProductRender = productToRender?.map((product) => (
      <ProductCard key={product.id} product={product} />
    ));

  return (
    <div className="bg-white rounded-xl p-3 md:p-6 shadow-1">
      {/* Search + Filter */}
      <div className="flex gap-2.5 items-center w-full">
        <Input
          placeholder="Search Here..."
          className="border-[1.5px] min-w-full border-none shadow-1 rounded-full flex-1"
          getInputValue={handleSearch}
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
      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-2 3xl:grid-cols-3 gap-6 mt-10">
        {ProductRender}
      </div>
    </div>
  );
};

export default ProductList;
