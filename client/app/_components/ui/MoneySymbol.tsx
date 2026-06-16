import { MONEY_SYMBOL } from "@/app/_constants";
import { cn } from "@/app/_lib/utils";
import React from "react";

const MoneySymbol = ({ className = "" }) => {
  return (
    <span className={`${cn("w-3 inline font-bangla", className)}`}>
      {MONEY_SYMBOL}
    </span>
  );
};

export default MoneySymbol;
