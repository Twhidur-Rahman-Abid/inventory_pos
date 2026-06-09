import React from "react";
import DashboardStats, { DashboardStatsSkeleton } from "./DashboardStauts";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { useSearchParams } from "next/navigation";

type Value = {
  value: number;
  percentage: number;
};

const DashboardSummery = () => {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "Today";
  const { isLoading, data } = useFetchWAuth<{
    total_sales: Value;
    total_orders: Value;
    online_sales: Value;
    offline_sales: Value;
  }>({
    endpoint: `/dashboard/summary?filter_type=${filter}`,
    isChange: [filter],
  });

  const { total_sales, total_orders, online_sales, offline_sales } = data || {};

  return (
    <>
      {isLoading ? (
        <div className="flex flex-wrap gap-6 justify-between mt-6 w-full">
          {" "}
          {[...Array(4)].map((v, i) => (
            <DashboardStatsSkeleton key={i} />
          ))}{" "}
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-between mt-6 w-full">
          <DashboardStats
            title="Total Sales"
            icon={"/vector/total-sales.svg"}
            value={total_sales}
          />
          <DashboardStats
            title="Total Orders"
            value={total_orders}
            icon="/vector/sales-shop.svg"
          />
          <DashboardStats
            title="Offline Sales"
            icon={"/vector/offline-sales.svg"}
            value={offline_sales}
          />
          <DashboardStats
            title="Online Sales"
            icon={"/vector/online-sales.svg"}
            value={online_sales}
          />
        </div>
      )}
    </>
  );
};

export default DashboardSummery;
