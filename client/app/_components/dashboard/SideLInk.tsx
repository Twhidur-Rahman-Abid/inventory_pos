"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "../../_lib/utils";

export default function SideLink({ href = "", label = "", iconSrc = "" }) {
  const pathname = usePathname();
  const hrefUrl =
    href || `/dashboard/${label.split(" ").join("-").toLowerCase()}`;
  const isActive = pathname.startsWith(hrefUrl) && pathname.endsWith(hrefUrl);

  return (
    <div className="relative group">
      <Link
        href={hrefUrl}
        title={label}
        className={cn(
          "group lg:w-60 p-2 md:p-4.5 flex gap-3 rounded-xl text-white place-content-center",
          isActive ? "bg-primary " : "hover:bg-primary hover:text-white",
        )}
      >
        <Image
          src={iconSrc}
          alt={label}
          width={20}
          height={20}
          className={cn("min-w-5 filter invert brightness-0")}
        />
        <div className="hidden lg:flex w-full justify-between">
          <p className="font-medium">{label}</p>
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

      {/* ✅ Tooltip on small screens */}
      <div className="lg:hidden absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-900 text-white text-sm px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
