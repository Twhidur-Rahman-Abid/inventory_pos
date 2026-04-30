"use client";
import { cn } from "@/app/_lib/utils";
import { useEffect, useRef, useState } from "react";
import Arrow from "./Arrow";
import Image from "next/image";

// Option type
type OptionType = {
  value: string | number;
  label: string;
  img?: string;
};

// Props type
interface SelectProps {
  options: OptionType[];
  label?: string;
  className?: string;
  defaultValue?: OptionType;
  getSelectValue?: (value: OptionType) => void;
  errorMessage?: string;
  name?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  label,
  className,
  defaultValue,
  getSelectValue = () => {},
  errorMessage,
  name = "custom-select",
}) => {
  // Get hidden option
  const hiddenOption = options.find((opt) => opt.label === "hidden");

  const defaultOption: OptionType = defaultValue || hiddenOption || options[0];

  const [selectedValue, setSelectedValue] = useState<OptionType>(defaultOption);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectChange = (optionValue: OptionType) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
  };

  // Outside click detection
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
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Dropdown position
  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left" | "top-right" | "top-left"
  >("bottom-right");

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;

      const vertical =
        spaceBelow < 150 && spaceAbove > spaceBelow ? "top" : "bottom";

      const horizontal =
        spaceRight < 150 && spaceLeft > spaceRight ? "left" : "right";

      setPosition(`${vertical}-${horizontal}` as typeof position);
    }
  }, [isOpen]);

  const dropdownPositionClass: Record<typeof position, string> = {
    "bottom-right": "top-full left-0",
    "bottom-left": "top-full right-0",
    "top-right": "bottom-full left-0",
    "top-left": "bottom-full right-0",
  };

  useEffect(() => {
    getSelectValue(selectedValue);
  }, [selectedValue, getSelectValue]);

  return (
    <div className="relative w-full min-h-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}

      {/* Hidden input */}
      <input
        type="hidden"
        name={name}
        defaultValue={
          selectedValue?.value === "hidden" ? "" : selectedValue?.value
        }
      />

      <div
        onClick={toggleDropdown}
        ref={triggerRef}
        className={cn(
          "relative text-body-text flex gap-3 items-center justify-between cursor-pointer bg-white border border-[#E2E2E2] rounded-lg input-shadow px-2.7 md:px-5 py-3 min-h-full",
          {
            "border-red-500": errorMessage,
          },
          className,
        )}
      >
        <div className="w-full whitespace-nowrap truncate flex items-center gap-2.5">
          {selectedValue?.img && (
            <Image
              src={selectedValue.img}
              width={24}
              height={24}
              alt={selectedValue.label}
              className="size-6 object-contain"
            />
          )}
          {selectedValue?.label}
        </div>
        <Arrow move="down" />
      </div>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {isOpen && (
        <ul
          ref={dropdownRef}
          className={cn(
            "absolute z-10 my-2 p-2 bg-white rounded-xl max-h-[30vh] overflow-auto light-shadow-lg transition-all duration-300 ease-in-out min-w-full",
            dropdownPositionClass[position],
          )}
        >
          {options
            .filter((opt) => opt.value !== "hidden")
            .map((option, i) => (
              <li
                key={i}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2.5",
                  option.label === selectedValue.label &&
                    "text-primary bg-gray-100",
                )}
                onClick={() => handleSelectChange(option)}
              >
                {option?.img && (
                  <Image
                    src={option.img}
                    width={24}
                    height={24}
                    alt={option.label}
                    className="size-6 object-contain"
                  />
                )}
                {option.label}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
