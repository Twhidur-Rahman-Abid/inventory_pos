"use client";

import React, { ReactNode, ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "../../_lib/utils";
import Loading from "./Loading";

type ButtonProps = {
  className?: string;
  type?: "button" | "submit" | "reset";
  isCancel?: boolean;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  className = "",
  type = "button",
  isCancel = false,
  children,
  ...props
}: ButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        `flex items-center whitespace-nowrap justify-center gap-2 md:gap-3.5 px-6  py-3  rounded-xl w-full text-white font-semibold cursor-pointer bg-primary disabled:cursor-not-allowed`,
        className,
        {
          "bg-[#f3f3f3] text-body-text": isCancel,
        },
      )}
      disabled={type === "submit" && pending}
      type={type}
      {...props}
    >
      {type === "submit" && pending ? <Loading /> : children}
    </button>
  );
};

export default Button;

export const StatusButton = ({
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "px-2.5 py-1 rounded-3xl font-medium text-sm shadow-7 bg-[#FF6B00]  text-white   cursor-pointer capitalize",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
