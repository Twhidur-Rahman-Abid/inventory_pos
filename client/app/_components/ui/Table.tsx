import React, { ReactNode } from "react";
import { cn } from "../../_lib/utils";
import { HeaderType } from "../../_lib/CommonTypes";

type TableProps = {
  headers?: HeaderType[];
  className?: string;
  children: ReactNode;
};

const Table = ({ headers = [], className, children }: TableProps) => {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-[#E6F2F4] w-full justify-between rounded-t-xl">
            {headers.map((header, i) => {
              const isCenter = header.align === "center";
              const isRight = header.align === "right";
              const isLeft = !isCenter && !isRight;

              return (
                <th
                  key={i}
                  className={cn(
                    "p-4 text-sm text-secondary whitespace-nowrap min-w-max select-none",
                    {
                      "text-center": isCenter,
                      "text-right": isRight,
                      "text-left": isLeft,
                    },
                    className,
                  )}
                >
                  {header.label}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;

type TdProps = {
  className?: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
};

export function Td({ className, children, align = "left" }: TdProps) {
  return (
    <td
      className={cn(
        "p-4 min-w-fit text-body-text text-sm bg-white whitespace-nowrap",
        {
          "text-center": align === "center",
          "text-right": align === "right",
          "text-left": align === "left",
        },
        className,
      )}
    >
      {children}
    </td>
  );
}
