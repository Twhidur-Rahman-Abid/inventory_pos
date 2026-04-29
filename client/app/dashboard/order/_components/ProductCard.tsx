"use client";

import { Icon } from "@/app/_components";
import Image from "next/image";
import React from "react";
import { MONEY_SYMBOL } from "@/app/_constants";

interface Product {
  name?: string;
  product_img?: string;
  selling_price?: number | string;
  discount_percentage?: number;
  is_buyOneGetOne?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    name,
    product_img,
    selling_price,
    discount_percentage,
    is_buyOneGetOne,
  } = product || {};

  // -------- Simplified Discount Logic --------
  let finalPrice = Number(selling_price);

  if (!is_buyOneGetOne && discount_percentage) {
    finalPrice =
      Number(selling_price) -
      (Number(selling_price) * discount_percentage) / 100;
  }

  // -------- Discount Tag --------
  let DiscountTag: React.ReactNode = null;

  if (is_buyOneGetOne) {
    DiscountTag = (
      <span className="bg-primary px-2 py-1.5 rounded-3xl text-white font-medium text-12">
        Buy 1 Get 1
      </span>
    );
  } else if (discount_percentage) {
    DiscountTag = (
      <span className="bg-primary px-2 py-1.5 rounded-3xl text-white font-medium text-12">
        {discount_percentage}% OFF
      </span>
    );
  }

  return (
    <div className="border border-stock/10 rounded-xl bg-[#F5F5F5] flex flex-col justify-between relative">
      <div className="absolute top-4 left-4">{DiscountTag}</div>

      <Image
        src={product_img || "/placeholder-img.svg"}
        width={100}
        height={150}
        alt={name || "product"}
        className="object-cover mx-auto"
      />

      <div className="p-2.5 rounded-b-xl bg-white">
        <p className="text-sm text-body-text font-medium">{name}</p>

        <div className="mt-2.5 flex justify-between items-center">
          {/* Price */}
          <div className="flex gap-1 items-center">
            <p className="text-sm font-medium text-textColor-2">
              {finalPrice}
              {MONEY_SYMBOL}
            </p>

            {!is_buyOneGetOne && discount_percentage && (
              <p className="text-12 text-body-text">
                (
                <span className="line-through">
                  {selling_price}
                  {MONEY_SYMBOL}
                </span>
                )
              </p>
            )}
          </div>

          {/* Button (UI only) */}
          <button className="p-1.5 flex gap-1 border border-primary rounded-full bg-transparent text-12 leading-3 text-primary">
            <Icon src="/icon/i-plus-box.svg" size={12} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
