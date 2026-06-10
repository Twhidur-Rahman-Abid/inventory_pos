"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import MoneySymbol from "../ui/MoneySymbol";
import { donut_chart } from "./SalesCharts";

const COLORS = ["#16a34a", "#f97316"];

export default function SalesDonutChart({
  data,
  total_sales_amount,
}: donut_chart) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-full md:w-fit flex flex-col justify-center items-center">
      <h2 className="text-lg font-semibold mb-4">Online vs Offline Sales</h2>

      <div className="relative w-55 h-55">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold">
            <MoneySymbol /> {total_sales_amount}
          </h3>
          <p className="text-sm text-gray-500">Total Sales</p>
        </div>
      </div>

      <div className="flex gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2 text-green-600">
          ● Online ({data?.[0]?.value}%)
        </span>
        <span className="flex items-center gap-2 text-orange-500">
          ● Offline ({data[1]?.value}%)
        </span>
      </div>
    </div>
  );
}

export function SalesDonutSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-full md:w-[300px] flex flex-col justify-center items-center animate-pulse">
      {/* Title */}
      <div className="h-5 w-40 bg-gray-200 rounded-md mb-8"></div>

      {/* Circle Skeleton */}
      <div className="relative w-[220px] h-[220px] rounded-full border-[25px] border-gray-100 flex items-center justify-center">
        {/* Center Text Skeleton */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="flex gap-6 mt-8">
        <div className="h-4 w-24 bg-gray-100 rounded-full"></div>
        <div className="h-4 w-24 bg-gray-100 rounded-full"></div>
      </div>
    </div>
  );
}
