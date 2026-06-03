"use client";
import SalesOverviewChart from "@/app/_components/dashboard/SalesOverviewChart";
import SalesDonutChart from "@/app/_components/dashboard/OnlineOflineChart";
import Dropdown, { DropdownItem } from "@/app/_components/ui/Dropdown";
import { Arrow } from "../_components";
import Link from "next/link";
import DashboardProductCard from "@/app/_components/dashboard/DashboardProductCard";
import DashboardStats from "../_components/dashboard/DashboardStauts";
import RecentOrder from "../_components/dashboard/RecentOrder";
import TopSelling from "../_components/dashboard/TopSelling";
import LowStock from "../_components/dashboard/LowStock";
import SalesCharts from "../_components/dashboard/SalesCharts";
import DashboardSummery from "../_components/dashboard/DashboardSummery";

const Dashboard = () => {
  const salesSummaryTitle: string = "Today";
  return (
    <div className=" flex flex-col xl:flex-row gap-6 lg:gap-8 w-full ">
      <div className="flex-1 space-y-6 md:space-y-8">
        <div className="card-wrapper w-full space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-medium">Today’s Sales</h3>
              <p className="text-md text-darkGray">Sales Summery</p>
            </div>
            <div>
              <Dropdown
                label={
                  <button className="py-2.5 px-3 md:px-6 input-shadow border border-c-gray min-w-3xs rounded-xl flex justify-between items-center ">
                    <span>{salesSummaryTitle}</span>
                    <Arrow move="down" />
                  </button>
                }
              >
                <Link href={`?sales_summary=Today`}>
                  <DropdownItem
                    className={
                      salesSummaryTitle === "Today"
                        ? "bg-gray-100 font-medium"
                        : ""
                    }
                  >
                    Today
                  </DropdownItem>
                </Link>
                <Link href={`?sales_summary=This_Week`}>
                  <DropdownItem
                    className={
                      salesSummaryTitle === "This Week"
                        ? "bg-gray-100 font-medium"
                        : ""
                    }
                  >
                    This Week
                  </DropdownItem>
                </Link>
                <Link href={`?sales_summary=This_Month`}>
                  <DropdownItem
                    className={
                      salesSummaryTitle === "This Month font-medium"
                        ? "bg-gray-100"
                        : ""
                    }
                  >
                    This Month
                  </DropdownItem>
                </Link>
              </Dropdown>
            </div>
          </div>
        </div>
        <DashboardSummery />

        <SalesCharts />

        <RecentOrder />
      </div>
      <div className="w-full flex flex-col md:flex-row xl:flex-col xl:w-fit gap-6 md:gap-8">
        <TopSelling />
        <LowStock />
      </div>
    </div>
  );
};

export default Dashboard;
