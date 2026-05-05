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

export default function SalesOverviewChart() {
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
