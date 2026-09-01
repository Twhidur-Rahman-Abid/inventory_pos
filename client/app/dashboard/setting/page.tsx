"use client";
import { useUser } from "@/app/_context/userContext";
import ChangePassword from "./ChangePassword";
import HeroSliders from "./HeroSliders";

const SettingPage = () => {
  const { user } = useUser();
  return (
    <div className="space-y-8">
      <ChangePassword />
      {user?.role === "admin" ||
        (user?.role === "warehouse_manager" && <HeroSliders />)}
    </div>
  );
};

export default SettingPage;
