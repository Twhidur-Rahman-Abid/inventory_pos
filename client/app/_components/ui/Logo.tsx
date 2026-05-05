import { cn } from "@/app/_lib/utils";
import logo from "@/public/logo.svg";
import logoI from "@/public/logo-icon.png";
import Image from "next/image";

export const Logo = ({ className = "" }) => {
  return <Image src={logo} alt="logo" className={cn("w-32", className)} />;
};

export const LogoIcon = ({ className = "" }) => {
  return <Image src={logoI} alt="logo" className={cn("w-8 h-8", className)} />;
};
