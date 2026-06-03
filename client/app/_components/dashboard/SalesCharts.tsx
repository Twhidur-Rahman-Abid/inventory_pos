import React from "react";
import SalesOverviewChart, {
  SalesOverviewSkeleton,
} from "./SalesOverviewChart";
import SalesDonutChart, { SalesDonutSkeleton } from "./OnlineOflineChart";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";

const SalesCharts = () => {
  const { isLoading, data } = useFetchWAuth({
    endpoint: "/dashboard/sales-charts",
  });

  console.log("data:", data);
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col md:flex-row gap-6">
          <SalesOverviewSkeleton />
          <SalesDonutSkeleton />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <SalesOverviewChart data={data?.sales_overview} />
          <SalesDonutChart
            data={data?.donut_chart.data}
            title={data?.donut_chart?.total_sales_amount}
            donut_chart={data?.donut_chart}
          />
        </div>
      )}
    </>
  );
};

export default SalesCharts;
