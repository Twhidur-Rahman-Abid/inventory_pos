"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "10 May", online: 18000, offline: 9000 },
  { name: "11 May", online: 23000, offline: 11000 },
  { name: "12 May", online: 24000, offline: 14000 },
  { name: "13 May", online: 27000, offline: 11000 },
  { name: "14 May", online: 31000, offline: 15000 },
  { name: "15 May", online: 20000, offline: 10000 },
  { name: "16 May", online: 25000, offline: 13000 },
];

export default function SalesOverviewChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-full">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Sales Overview</h2>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            ● Online Sales
          </span>
          <span className="flex items-center gap-1 text-orange-500">
            ● Offline Sales
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="online"
            stroke="#16a34a"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="offline"
            stroke="#f97316"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SalesOverviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between mb-8">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
          <div className="h-3 w-24 bg-gray-100 rounded-md"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-100 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-100 rounded-full"></div>
        </div>
      </div>

      {/* Chart Area Skeleton */}
      <div className="relative h-[300px] w-full flex items-end gap-4 px-2">
        {/* Y-Axis Lines simulation */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-gray-50 w-full"></div>
          ))}
        </div>

        {/* Bars simulation to mimic chart activity */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2 items-center">
            <div className="w-full bg-gray-100 rounded-t-lg"></div>
            <div className="h-3 w-10 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
