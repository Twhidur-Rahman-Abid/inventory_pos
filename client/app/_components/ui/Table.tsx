import React, { ReactNode } from "react";
import { cn } from "../../_lib/utils";

import { HeaderType } from "@/app/_lib/CommonTypes";

type TableProps = {
  headers?: HeaderType[];
  className?: string;
  headerClassName?: string;
  children: ReactNode;
};

const Table = ({
  headers = [],
  className,
  headerClassName,
  children,
}: TableProps) => {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full table-auto">
        <thead className={cn(headerClassName)}>
          <tr className="bg-primary w-full justify-between rounded-t-xl">
            {headers.map((header, i) => {
              const isCenter = header.align === "center";
              const isRight = header.align === "right";
              const isLeft = !isCenter && !isRight;

              return (
                <th
                  key={i}
                  className={cn(
                    "p-4 text-sm text-soft-white whitespace-nowrap min-w-max select-none",
                    {
                      "text-center": isCenter,
                      "text-right": isRight,
                      "text-left": isLeft,
                    },
                    className,
                  )}
                >
                  {header.label}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;

type TdProps = {
  className?: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
};

export function Td({ className, children, align = "left" }: TdProps) {
  return (
    <td
      className={cn(
        "p-4 min-w-fit text-body-text text-sm bg-white whitespace-nowrap",
        {
          "text-center": align === "center",
          "text-right": align === "right",
          "text-left": align === "left",
        },
        className,
      )}
    >
      {children}
    </td>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header Skeleton */}
          <thead className="bg-[#1B5E20]">
            {" "}
            <tr>
              {[...Array(8)].map((item, idx) => (
                <th key={idx} className="p-4">
                  <div className="h-4 w-12 bg-white/20 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body Skeleton (10 Rows) */}
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-none">
                <td className="p-4">
                  <div className="h-4 w-4 bg-gray-100 rounded"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </td>
                <td className="p-4">
                  {/* Type Badge Skeleton */}
                  <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 w-20 bg-gray-100 rounded"></div>
                </td>
                <td className="p-4">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </td>
                <td className="p-4">
                  {/* Status Badge Skeleton */}
                  <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                </td>
                <td className="p-4">
                  {/* Action Icon Skeleton */}
                  <div className="h-6 w-6 bg-gray-100 rounded-md"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
