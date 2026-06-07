/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, Suspense } from "react";
import Navbar from "../_components/dashboard/Navbar";
import SideLink from "../_components/dashboard/SideLInk";
import { Logo, LogoIcon } from "../_components";
import Logout from "../_components/dashboard/Logout";
import { UserContextType, UserProvider } from "../_context/userContext";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Suspense>
      <LayoutComponent>{children}</LayoutComponent>
    </Suspense>
  );
};

export default DashboardLayout;

async function LayoutComponent({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const decoded = (jwtDecode(token || "") as any) || {};
  const user = decoded?.user;
  const value: UserContextType = {
    token: token || "",
    user,
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
    { label: "Sold", icon: "/icon/i-sold.svg" },
    { label: "Online Order", icon: "/icon/i-online-order.svg" },
    {
      label: "Stock",
      icon: "/icon/i-product.svg",
    },
    { label: "Category", icon: "/icon/i-category.svg" },
    { label: "Branch", icon: "/icon/i-branch.svg" },

    { label: "Employee", icon: "/icon/i-cashire.svg" },
    { label: "Reports", icon: "/icon/i-report.svg" },
    { label: "Setting", icon: "/icon/i-setting-2.svg" },
  ];

  return (
    <UserProvider value={value}>
      <div>
        <main className="flex items-start w-full ">
          <aside className="min-h-screen lg:max-h-screen min-w-fit sticky z-50 overflow-x-visible lg:overflow-y-auto left-0 top-0 bg-primary-dark flex flex-col justify-between content-between px-3 md:px-7 py-4.5 gap-6 border-r border-stock/10 aside-shadow">
            <div className="w-full bg-white p-1.5 pr-1 md:pr-2.5 md:p-2.5 md:pt-2 rounded-xl">
              <Logo className="hidden lg:block " />

              <LogoIcon className="lg:hidden" />
            </div>
            <div className="flex-1">
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
              <Logout />
            </div>
          </aside>

          <div className="flex-1 w-full overflow-x-hidden  ">
            <Navbar myData={user} />

            <section className="min-h-[calc(100vh-72px)] bg-soft-white w-full overflow-x-hidden relative px-3 md:px-7 py-4 md:py-8 mt-15">
              {children}
            </section>
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
