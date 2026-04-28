// import Logout from "@/components/dashboard/Logout";
import React, { ReactNode } from "react";
import Navbar from "../_components/dashboard/Navbar";
import SideLink from "../_components/dashboard/SideLInk";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // ✅ static role (only for menu control)
  const role = "admin";

  const isAdmin = role === "admin";
  const isWarehouseStaff = false;
  const isWarehouse = isAdmin || isWarehouseStaff;
  const isBranch = ["storeManager", "cashier", "warehouseStaff"].includes(role);
  const isStoreManager = false;

  // ✅ static navbar data
  const myData = {
    username: "DemoUser",
    branch_name: "Main Branch",
    first_name: "Towhid",
    email: "demo@email.com",
    role,
  };

  const sideLinks = [
    {
      label: "Dashboard",
      icon: "/icon/i-dashboard.svg",
    },
    { label: "Order", icon: "/icon/i-order.svg" },
    {
      label: "Products",
      icon: "/icon/i-product.svg",
    },
    { label: "Online Order", icon: "/icon/i-order.svg" },
    { label: "Sold", icon: "/icon/i-sold.svg" },

    { label: "Employee", icon: "/icon/i-cashire.svg" },
    { label: "Reports", icon: "/icon/i-report.svg" },
  ];

  return (
    <div>
      <Navbar myData={myData} />

      <main className="flex items-start">
        <aside className="max-h-[calc(100vh-72px)] min-h-[calc(100vh-72px)] min-w-fit sticky z-50 overflow-x-visible overflow-y-auto left-0 top-[73px] bg-white flex flex-col justify-between content-between px-3 md:px-7 py-[18px] border-r border-stock/10 aside-shadow">
          <div>
            {sideLinks.map((link, i) => (
              <SideLink
                href={i === 0 ? "/dashboard" : undefined}
                key={link.label}
                label={link.label}
                iconSrc={link.icon}
              />
            ))}
          </div>

          <div className="border-t border-[#E2E2E2]">
            {/* <Logout /> */}
            Logout
          </div>
        </aside>

        <section className="min-h-[calc(100vh-72px)] bg-soft-white w-full overflow-x-hidden relative px-3 md:px-7 py-4 md:py-8 bg-[#FCFFFF]">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
