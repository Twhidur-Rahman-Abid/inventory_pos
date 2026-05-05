"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Online", value: 62 },
  { name: "Offline", value: 38 },
];

const COLORS = ["#16a34a", "#f97316"];

export default function SalesDonutChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-full md:w-fit flex flex-col justify-center items-center">
      <h2 className="text-lg font-semibold mb-4">Online vs Offline Sales</h2>

      <div className="relative w-[220px] h-[220px]">
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
          <h3 className="text-xl font-bold">৳ 24,850</h3>
          <p className="text-sm text-gray-500">Total Sales</p>
        </div>
      </div>

      <div className="flex gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2 text-green-600">
          ● Online (62%)
        </span>
        <span className="flex items-center gap-2 text-orange-500">
          ● Offline (38%)
        </span>
      </div>
    </div>
  );
}
