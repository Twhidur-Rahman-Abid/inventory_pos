"use client";
import { createContext, useContext } from "react";

export type UserContextType = {
  token: string;
  user: {
    id: number | null;
    name: string;
    email: string;
    role: string;
  };
};

const userContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  value,
  children,
}: {
  value: UserContextType;
  children: React.ReactNode;
}) => {
  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

export const useUser = () => {
  const context = useContext<UserContextType | undefined>(userContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
