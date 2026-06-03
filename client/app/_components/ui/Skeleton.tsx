import { cn } from "@/app/_lib/utils";

export function InputSkeleton({
  className,
  label = "",
  required = true,
}: {
  className?: string;
  label?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {label && (
        <label htmlFor={label} className="text-secondary font-medium text-base">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="w-full rounded-xl bg-gray-200 h-13 input-shadow animate-pulse"></div>
    </div>
  );
}

export function CategoryCard() {
  return (
    <div
      className={`shadow-2 flex gap-3 items-center p-0.5 pr-4 rounded-[74px] cursor-pointer transition-all bg-gray-200 animate-pulse`}
    >
      <div className="size-17.5 rounded-[70px] flex justify-center items-center bg-[#FFF6F0]">
        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
      </div>

      <div
        className={`text-ms font-medium transition-colors w-20 h-2 bg-gray-200`}
      ></div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <>
      <CategoryCard />
      <CategoryCard />
      <CategoryCard />
      <CategoryCard />
      <CategoryCard />
      <CategoryCard />
    </>
  );
}
