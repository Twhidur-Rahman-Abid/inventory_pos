import Image from "next/image";
import React from "react";
import { cn } from "../_lib/utils";

const Icon = ({ className = "", src = "", size = 20, ...props }) => {
  return (
    <Image
      src={src || "/placeholder-img.svg"}
      width={size}
      height={size}
      alt={src || "icon"}
      className={cn("cursor-pointer", className)}
      {...props}
    />
  );
};

export default Icon;
