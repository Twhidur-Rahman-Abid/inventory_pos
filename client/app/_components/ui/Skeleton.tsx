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
