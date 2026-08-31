import { cn } from "@/app/_lib/utils";
import { ReactNode } from "react";

const InfoRow = ({
  Left,
  Right,
  className,
}: {
  Left: ReactNode | string;
  Right: ReactNode | string;
  className?: string;
}) => {
  return (
    <div className={cn("grid grid-cols-2 place-items-center", className)}>
      <div className="w-full">{Left}</div>
      <div className="flex items-center w-full">
        <p className="max-w-fit mr-10">:</p>
        <div className="w-full">{Right}</div>
      </div>
    </div>
  );
};

export default InfoRow;
