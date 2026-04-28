/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "../_lib/utils";

type OptionType = {
  value: string | number;
  label: string | number;
};

type PaginationProps = {
  className?: string;
  totalPage: number;
  options: OptionType[];
};

const Pagination = ({ className, totalPage, options }: PaginationProps) => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const nextDisabled = page >= totalPage;
  const prevDisabled = page <= 1;

  const getPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    return `?${params.toString()}`;
  };

  return (
    <div className={cn("w-full flex justify-between", className)}>
      <div className="flex gap-2 items-center">
        <p className="text-[#6E6D7A] whitespace-nowrap text-sm font-medium">
          Select page:
        </p>
        <Select
          className="p-2"
          name="page"
          options={options}
          defaultValue={page}
        />
      </div>

      <div className="flex gap-6 items-center">
        <p className="text-[#6E6D7A] whitespace-nowrap text-sm font-medium">
          {page} of {totalPage}
        </p>

        <div className="flex gap-7">
          <Link
            href={getPageUrl(page - 1)}
            className={
              prevDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
            }
          >
            <span className="text-xl">←</span>
          </Link>

          <Link
            href={getPageUrl(page + 1)}
            className={
              nextDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
            }
          >
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

type SelectProps = {
  options: OptionType[];
  defaultValue?: string | number;
  className?: string;
  name?: string;
};

function Select({
  options,
  defaultValue,
  className,
  name = "custom-select",
}: SelectProps) {
  const [selectedValue, setSelectedValue] = useState<string | number>(
    defaultValue || options[0]?.value,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectChange = (optionValue: string | number) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left" | "top-right" | "top-left"
  >("bottom-right");

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      const vertical =
        spaceBelow < 150 && spaceAbove > spaceBelow ? "top" : "bottom";
      const horizontal =
        spaceRight < 150 && spaceLeft > spaceRight ? "left" : "right";

      setPosition(`${vertical}-${horizontal}` as any);
    }
  }, [isOpen]);

  const dropdownPositionClass = {
    "bottom-right": "top-full left-0",
    "bottom-left": "top-full right-0",
    "top-right": "bottom-full left-0",
    "top-left": "bottom-full right-0",
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className="relative w-full min-h-full">
      <div
        onClick={toggleDropdown}
        ref={triggerRef}
        className={cn(
          "relative text-body-text flex gap-3 items-center justify-between cursor-pointer bg-white border border-[#E2E2E2] rounded-lg shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 min-h-full",
          className,
        )}
      >
        <span>{selectedOption?.label}</span>
        <span>▼</span>
      </div>

      {isOpen && (
        <ul
          ref={dropdownRef}
          className={cn(
            "absolute z-10 my-2 p-2 bg-white rounded-xl max-h-[30vh] overflow-auto light-shadow-lg transition-all duration-300 ease-in-out opacity-100 transform min-w-full",
            dropdownPositionClass[position],
          )}
        >
          {options.map(({ value: optValue, label: optLabel }, i) => (
            <Link href={`?page=${optLabel}`} key={i}>
              <li
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer",
                  optValue === selectedValue && "bg-blue-100 text-blue-700",
                )}
                onClick={() => handleSelectChange(optValue)}
              >
                {optLabel}
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
