import React from "react";
import SalesOverviewChart, {
  SalesOverviewSkeleton,
} from "./SalesOverviewChart";
import SalesDonutChart, { SalesDonutSkeleton } from "./OnlineOflineChart";
import useFetchWAuth from "@/app/_hooks/useAuthFetch";
import { useSearchParams } from "next/navigation";

export type donut_chart = {
  data: {
    name: string;
    value: number;
    amount: number;
  }[];
  total_sales_amount: number;
};
type ChartType = {
  sales_overview: {
    name: string;
    online: number;
    offline: number;
  }[];
  donut_chart: donut_chart;
};

const SalesCharts = () => {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "Today";
  const { isLoading, data } = useFetchWAuth<ChartType>({
    endpoint: `/dashboard/sales-charts?filter_type=${filter}`,
    isChange: [filter],
  });

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
            total_sales_amount={data?.donut_chart?.total_sales_amount}
            data={data?.donut_chart?.data}
          />
        </div>
      )}
    </>
  );
};

export default SalesCharts;
