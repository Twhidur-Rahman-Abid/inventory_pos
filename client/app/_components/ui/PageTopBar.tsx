import Image from "next/image";
import React, { ReactNode } from "react";

type PageTopBarProps = {
  title: string;
  quantity?: string | number;
  children?: ReactNode;
};

const PageTopBar = ({ title, quantity, children }: PageTopBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between">
      <div className="flex gap-2 items-center">
        <Image src="/icon/i-list.svg" width={20} height={20} alt="list" />
        <p className="text-xl font-medium">{title}</p>

        {quantity !== undefined && (
          <p className="px-3 py-2 bg-[#F3FAF7] text-secondary text-xl font-semibold leading-5 rounded-md">
            {quantity}
          </p>
        )}
      </div>

      <div className="flex gap-2 relative">{children}</div>
    </div>
  );
};

export default PageTopBar;
