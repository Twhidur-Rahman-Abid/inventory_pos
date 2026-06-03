"use client";

import { Icon } from "@/app/_components";
import React, { useRef } from "react";
import CategoryCard from "./CategoryCard";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { CategoryType } from "@/app/_types/types";
import { CategoryCardSkeleton } from "@/app/_components/ui/Skeleton";

// dummy categories (static UI)
// const categories = [
//   { id: 1, name: "All", img: "/placeholder-img.svg" },
//   { id: 2, name: "Electronics", img: "/placeholder-img.svg" },
//   { id: 3, name: "Fashion", img: "/placeholder-img.svg" },
//   { id: 4, name: "Grocery", img: "/placeholder-img.svg" },
//   { id: 5, name: "Furniture", img: "/placeholder-img.svg" },
//   { id: 6, name: "Beauty", img: "/placeholder-img.svg" },
// ];

const CategorySlider: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;

      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const { data, isLoading: isCategoryLoading } = useFetchWAuth<{
    count: number;
    data: CategoryType[];
  }>({
    endpoint: "/categories",
  });

  const categories = [{ id: "all", name: "All" }, ...(data?.data || [])];

  return (
    <div>
      {/* Header */}
      <div className="flex mb-5 justify-between items-center">
        <p className="font-semibold text-secondary text-xl">Categories</p>

        <div className="flex gap-4">
          <button onClick={() => scroll("left")}>
            <Icon src="/icon/i-arrow-border.svg" />
          </button>

          <button onClick={() => scroll("right")}>
            <Icon src="/icon/i-arrow-border.svg" className="rotate-180" />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto whitespace-nowrap pb-6 no-scrollbar"
      >
        <div className="inline-flex gap-6">
          {isCategoryLoading ? (
            <CategoryCardSkeleton />
          ) : (
            categories?.map((cat: CategoryType) => (
              <CategoryCard key={cat.id} category={cat} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
