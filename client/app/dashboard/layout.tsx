/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, Suspense } from "react";
import Navbar from "../_components/dashboard/Navbar";
import SideLink from "../_components/dashboard/SideLInk";
import { Logo, LogoIcon } from "../_components";
import Logout from "../_components/dashboard/Logout";
import { UserContextType, UserProvider } from "../_context/userContext";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { ADMIN_ROUTE, BRANCH_ROUTE, WAREHOUSE_ROUTE } from "../_constants";
import { redirect } from "next/navigation";

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

  if (!user?.role) {
    redirect("/");
  }

  const getRoute = (role: string) => {
    switch (role) {
      case "admin":
        return ADMIN_ROUTE;
      case "warehouse_manager":
        return WAREHOUSE_ROUTE;
      case "shop_manager":
      case "shop_staff":
        return BRANCH_ROUTE;
      default:
        return [];
    }
  };

  const sideLinks = getRoute(user.role) || [];

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
