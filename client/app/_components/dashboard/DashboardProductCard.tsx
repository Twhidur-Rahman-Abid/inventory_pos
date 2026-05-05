import { cn } from "@/app/_lib/utils";
import Image from "next/image";

export default function DashboardProductCard({
  name = "Product",
  src = "/placeholder-img.svg",
  price = 20,

  total = 100,
  totalTitle = "Sold",
}) {
  return (
    <div className="w-full flex gap-6 2xl:gap-8 2xl:min-w-75 py-1.5 border-b border-colorBorder justify-between rounded-xl rounded-b-none">
      <div className="flex items-center gap-6">
        <div className="p-0.5 border border-[#E9F5FF] rounded-sm">
          <Image
            src={src}
            alt={src}
            width={40}
            height={50}
            className="object-cover "
          />
        </div>
        <div>
          <p className="text-sm font-medium text-secondary">{name}</p>
          <p className="text-xs text-[#929299] ">{price}$</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-md font-medium">{total}</p>
        <p
          className={cn(
            `py-1 px-2 text-12 rounded-sm bg-[#F1FFF9] leading-3 text-[#0F5A46]`,
            {
              "bg-[#F341501A] text-[#EB5757]": totalTitle === "Stock",
            },
          )}
        >
          {totalTitle}
        </p>
      </div>
    </div>
  );
}
