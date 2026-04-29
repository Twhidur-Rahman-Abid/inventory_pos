"use client";

import Image from "next/image";
import React from "react";

interface CategoryCardProps {
  src?: string;
  category: string;
  isActive?: boolean;
  onClick?: (category: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  src,
  category,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick?.(category)}
      className={`shadow-2 flex gap-3 items-center p-0.5 pr-4 rounded-[74px] cursor-pointer transition-all ${
        isActive ? "bg-primary" : "bg-white"
      }`}
    >
      <div className="size-17.5 rounded-[70px] flex justify-center items-center bg-[#FFF6F0]">
        <Image
          className="w-10 h-10 object-contain"
          src={src || "/placeholder-img.svg"}
          width={40}
          height={40}
          alt={category}
        />
      </div>

      <p
        className={`text-ms font-medium transition-colors ${
          isActive ? "text-white" : "text-primary"
        }`}
      >
        {category}
      </p>
    </div>
  );
};

export default CategoryCard;
