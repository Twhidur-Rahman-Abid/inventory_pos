"use client";

import { useCart } from "@/app/_context/productOrderCartContext";
import { CategoryType } from "@/app/_types/types";
import Image from "next/image";
import React from "react";

interface CategoryCardProps {
  category: CategoryType;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { selectedCategory, setSelectedCategory } = useCart() || {};
  const isActive = selectedCategory?.id === category.id;
  return (
    <div
      onClick={() => setSelectedCategory(category)}
      className={`shadow-2 flex gap-3 items-center p-0.5 pr-4 rounded-[74px] cursor-pointer transition-all ${
        isActive ? "bg-primary" : "bg-white"
      }`}
    >
      <div className="size-17.5 rounded-[70px] flex justify-center items-center bg-[#FFF6F0]">
        <Image
          className="w-10 h-10 object-contain"
          src={category.img || "/placeholder-img.svg"}
          width={40}
          height={40}
          alt={category.name}
        />
      </div>

      <p
        className={`text-ms font-medium transition-colors ${
          isActive ? "text-white" : "text-primary"
        }`}
      >
        {category.name}
      </p>
    </div>
  );
};

export default CategoryCard;
