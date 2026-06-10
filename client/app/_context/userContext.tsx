"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type UserContextValue = {
  token: string;
  user: {
    id: number | null;
    name: string;
    email: string;
    role: string;
    branch: {
      id?: number;
      name?: string;
    };
  };
};
export type UserContextType = UserContextValue & {
  setUser: Dispatch<SetStateAction<UserContextValue>>;
};

const userContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({
  value,
  children,
}: {
  value: UserContextValue;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserContextValue>(value);
  return (
    <userContext.Provider value={{ ...user, setUser }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext<UserContextType>(userContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
