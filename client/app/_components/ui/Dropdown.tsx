"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { cn } from "../_lib/utils";

type DropdownContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseDropdown: () => void;
  toggleDropdown: () => void;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownContext must be used inside Dropdown");
  }
  return context;
};

type DropdownProps = {
  label: ReactNode;
  className?: string;
  children: ReactNode | ((ctx: DropdownContextType) => ReactNode);
};

const Dropdown = ({ label, className, children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onCloseDropdown = () => setIsOpen(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const contextValue: DropdownContextType = {
    isOpen,
    setIsOpen,
    onCloseDropdown,
    toggleDropdown,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div className="relative grow">
        <div
          ref={triggerRef}
          onClick={toggleDropdown}
          className={cn("cursor-pointer size-full")}
        >
          {label}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute right-0 min-w-64 z-10 my-2 p-2 bg-white rounded-xl max-h-[35vh] overflow-auto light-shadow-lg transition-all duration-300 ease-in-out opacity-100 transform",
              className,
            )}
          >
            {typeof children === "function" ? children(contextValue) : children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};

export default Dropdown;

type DropdownItemProps = {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function DropdownItem({
  children,
  className,
  onClick,
}: DropdownItemProps) {
  const { onCloseDropdown } = useDropdownContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    onCloseDropdown();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full px-3 py-2 text-left text-sm font-normal text-secondary rounded-lg hover:bg-gray-100 cursor-pointer",
        className,
      )}
    >
      {children}
    </button>
  );
}

DropdownItem.displayName = "DropdownItem";
