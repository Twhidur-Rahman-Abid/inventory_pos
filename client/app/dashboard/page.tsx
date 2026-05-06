import React from "react";
import SalesOverviewChart from "@/app/_components/dashboard/SalesOverviewChart";
import SalesDonutChart from "@/app/_components/dashboard/OnlineOflineChart";
import Dropdown, { DropdownItem } from "@/app/_components/ui/Dropdown";
import { Arrow } from "../_components";
import Link from "next/link";
import DashboardProductCard from "@/app/_components/dashboard/DashboardProductCard";
import DashboardStats from "../_components/dashboard/DashboardStauts";
import RecentOrder from "../_components/dashboard/RecentOrder";

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
        <div className="flex flex-wrap gap-6 justify-between mt-6 w-full">
          <DashboardStats
            title="Today Sales"
            icon={"/vector/total-sales.svg"}
            total={0}
            percentage={0}
          />
          <DashboardStats
            title="Total Orders"
            total={0}
            icon="/vector/sales-shop.svg"
            percentage={0}
          />
          <DashboardStats
            title="Offline Sales"
            icon={"/vector/offline-sales.svg"}
            total={0}
            percentage={0}
          />
          <DashboardStats
            title="Online Sales"
            icon={"/vector/online-sales.svg"}
            total={0}
            percentage={0}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <SalesOverviewChart />
          <SalesDonutChart />
        </div>

        <RecentOrder />
      </div>
      <div className="w-full flex flex-col md:flex-row xl:flex-col xl:w-fit gap-6 md:gap-8">
        <div className="mt-5 bg-white shadow-2 rounded-[18px] p-4 md:p-4 w-full">
          <h3 className="text-c-green text-lg font-bold pb-3 border-b border-colorBorder mb-6">
            Top Selling
          </h3>
          <DashboardProductCard />
          <DashboardProductCard />
          <DashboardProductCard />
          <DashboardProductCard />
          <DashboardProductCard />
        </div>
        <div className="mt-5 bg-white shadow-2 rounded-[18px] p-4 md:p-4 w-full">
          <h3 className="text-lg text-denger font-medium pb-3 border-b border-colorBorder mb-6">
            Low Stock
          </h3>
          <DashboardProductCard totalTitle="Stock" />
          <DashboardProductCard totalTitle="Stock" />
          <DashboardProductCard totalTitle="Stock" />
          <DashboardProductCard totalTitle="Stock" />
          <DashboardProductCard totalTitle="Stock" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
