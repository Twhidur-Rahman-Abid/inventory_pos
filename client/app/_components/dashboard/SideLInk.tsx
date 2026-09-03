/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "../../_lib/utils";
import { useUser } from "@/app/_context/userContext";
import { BASE_URL } from "@/app/_constants";

export default function SideLink({ href = "", label = "", iconSrc = "" }) {
  const pathname = usePathname();
  const hrefUrl =
    href || `/dashboard/${label.split(" ").join("-").toLowerCase()}`;
  const isActive = pathname.startsWith(hrefUrl) && pathname.endsWith(hrefUrl);

  const isStockRoute = hrefUrl.includes("/dashboard/stock");

  const [hasNotification, setHasNotification] = useState(false);

  // 1. Initial LocalStorage sync & route clear logic
  useEffect(() => {
    if (isStockRoute) {
      const savedStatus = localStorage.getItem("has_stock_notification");
      if (savedStatus === "true") {
        setHasNotification(true);
      }
    }
  }, [isStockRoute]);

  // Route-e visit korle notification and LocalStorage clear
  useEffect(() => {
    if (isActive && isStockRoute) {
      setHasNotification(false);
      localStorage.removeItem("has_stock_notification");
    }
  }, [isActive, isStockRoute]);

  // 🔊 Helper function to play sound from public/notification.mp3
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((err) => {
        // Handle browser autoplay policy restrictions silently
        console.warn("Autoplay prevented or failed:", err);
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  const { user } = useUser();
  const branchId = user?.branch?.id;
  // 2. SSE Listener (Only active for stock link when branchId is present)
  useEffect(() => {
    if (!isStockRoute || !branchId) return;

    const eventSource = new EventSource(
      `${BASE_URL}/notifications/stream/${branchId}`,
    );

    eventSource.addEventListener("stock_transfer", () => {
      // Current route-e na thakle ping state and LocalStorage mark kora
      if (!pathname.includes("/dashboard/stock")) {
        setHasNotification(true);
        playNotificationSound();
        localStorage.setItem("has_stock_notification", "true");
      }
    });

    return () => {
      eventSource.close();
    };
  }, [branchId, isStockRoute, pathname]);

  return (
    <div className="relative group">
      <Link
        href={hrefUrl}
        title={label}
        className={cn(
          "group lg:w-60 p-2 md:p-4.5 flex gap-3 rounded-xl text-white place-content-center relative",
          isActive ? "bg-primary " : "hover:bg-primary hover:text-white",
        )}
      >
        <div className="relative">
          <Image
            src={iconSrc}
            alt={label}
            width={20}
            height={20}
            className={cn("min-w-5 xl:min-w-6 filter invert brightness-0")}
          />

          {/* 🔴 Small screen ping badge (Mobile view icon ping) */}
          {isStockRoute && hasNotification && (
            <span className="lg:hidden absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316]"></span>
            </span>
          )}
        </div>

        <div className="hidden lg:flex w-full justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="font-medium">{label}</p>

            {/* 🔴 Large screen ping dot badge */}
            {isStockRoute && hasNotification && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F97316]"></span>
              </span>
            )}
          </div>

          {isActive && (
            <Image
              src="/icon/i-left-arrow.svg"
              width={8}
              height={4}
              alt="left arrow"
            />
          )}
        </div>
      </Link>

      {/* Tooltip on small screens */}
      <div className="lg:hidden absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-900 text-white text-sm px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
