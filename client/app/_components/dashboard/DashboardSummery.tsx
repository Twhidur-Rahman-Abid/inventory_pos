import React from "react";
import DashboardStats, { DashboardStatsSkeleton } from "./DashboardStauts";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";

const DashboardSummery = () => {
  const { isLoading, data } = useFetchWAuth<{
    total_sales: number;
    total_orders: number;
    online_sales: number;
    offline_sales: number;
  }>({
    endpoint: `/dashboard/summary`,
  });
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
            title="Today Sales"
            icon={"/vector/total-sales.svg"}
            total={data.total_sales}
            percentage={0}
          />
          <DashboardStats
            title="Total Orders"
            total={data.total_orders}
            icon="/vector/sales-shop.svg"
            percentage={0}
          />
          <DashboardStats
            title="Offline Sales"
            icon={"/vector/offline-sales.svg"}
            total={data.offline_sales}
            percentage={0}
          />
          <DashboardStats
            title="Online Sales"
            icon={"/vector/online-sales.svg"}
            total={data.online_sales}
            percentage={0}
          />
        </div>
      )}
    </>
  );
};

export default DashboardSummery;
