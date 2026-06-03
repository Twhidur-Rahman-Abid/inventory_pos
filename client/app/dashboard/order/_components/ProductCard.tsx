"use client";

import { Icon } from "@/app/_components";
import Image from "next/image";
import React from "react";
import { MONEY_SYMBOL } from "@/app/_constants";
import { ProductType } from "@/app/_types/types";
import { useCart } from "@/app/_context/productOrderCartContext";

interface ProductCardProps {
  product: ProductType;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { name, thumbnail, discount_percentage, is_buy_one_get_one, price } =
    product || {};

  const { addToCart } = useCart();

  // -------- Simplified Discount Logic --------
  let finalPrice = Number(price);

  if (!is_buy_one_get_one && discount_percentage) {
    finalPrice = Number(price) - (Number(price) * discount_percentage) / 100;
  }

  // -------- Discount Tag --------
  let DiscountTag: React.ReactNode = null;

  if (is_buy_one_get_one) {
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
        src={thumbnail || "/placeholder-img.svg"}
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

            {!is_buy_one_get_one && discount_percentage && (
              <p className="text-12 text-body-text">
                (
                <span className="line-through">
                  {price}
                  {MONEY_SYMBOL}
                </span>
                )
              </p>
            )}
          </div>

          {/* Button (UI only) */}
          <button
            onClick={() => {
              addToCart({ ...product, qty: 1 });
            }}
            className="p-1.5 flex gap-1 border border-primary rounded-full bg-transparent text-12 leading-3 text-primary cursor-pointer"
          >
            <Icon src="/icon/i-plus-box.svg" size={12} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
