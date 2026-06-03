/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { cn } from "@/app/_lib/utils";
import { useEffect, useRef, useState, useMemo } from "react";
import Arrow from "./Arrow";
import Image from "next/image";
import { _optional } from "zod/v4/core";

// Option type
type OptionType = {
  value?: string | number;
  label?: string;
  id?: string | number;
  name?: string;
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
        key={selectedValue?.value || selectedValue?.id}
        value={selectedValue?.value || selectedValue?.id}
        // readOnly
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
              alt={selectedValue?.label || selectedValue?.name || "option"}
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
                    alt={option?.label || option?.name || "option"}
                    className="size-6 object-contain"
                  />
                )}
                {option?.label || option?.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default Select;

interface FormSelectProps {
  options: OptionType[];
  label?: string;
  error?: string[];
  className?: string;
  defaultValue?: string | number;
  getSelectValue?: (value: OptionType) => void;
  name: string;
  required?: boolean;
  placeholder?: string;
}

export function FormSelect({
  options = [],
  label,
  error,
  className,
  defaultValue,
  getSelectValue,
  name,
  required = true,
  placeholder = "Select Option",
  ...props
}: FormSelectProps) {
  // Memoized initial option to avoid unnecessary re-calculations

  const initialOption = useMemo(
    () =>
      options.find(
        (opt) => opt.value === defaultValue || opt.id === defaultValue,
      ) || null,
    [defaultValue, options],
  );

  const [selectedValue, setSelectedValue] = useState<OptionType | null>(
    initialOption,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<
    "bottom-right" | "bottom-left" | "top-right" | "top-left"
  >("bottom-right");

  const triggerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize state if defaultValue changes (e.g., on form reset)
  useEffect(() => {
    setSelectedValue(initialOption);
  }, [initialOption]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelectChange = (option: OptionType) => {
    setSelectedValue(option);
    setIsOpen(false);
    if (getSelectValue) getSelectValue(option);
  };

  // Outside click logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Dynamic Positioning logic
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.right;

      const vertical = spaceBelow < 250 ? "top" : "bottom";
      const horizontal = spaceRight < 150 ? "left" : "right";

      setPosition(`${vertical}-${horizontal}` as typeof position);
    }
  }, [isOpen]);

  const dropdownPositionClass: Record<typeof position, string> = {
    "bottom-right": "top-full left-0",
    "bottom-left": "top-full right-0",
    "top-right": "bottom-full left-0",
    "top-left": "bottom-full right-0",
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <label className="text-secondary font-medium text-base">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {/* Conform and native form submission support */}
      <input
        type="hidden"
        name={name}
        {...props}
        value={selectedValue?.value || selectedValue?.id || ""}
      />

      <div className="relative" ref={triggerRef}>
        <div
          onClick={toggleDropdown}
          className={cn(
            "px-2.5 md:px-5 py-3.5 input-shadow border rounded-xl flex items-center justify-between w-full cursor-pointer transition-all bg-white",
            isOpen ? "border-c-green" : "border-stock/10",
            {
              "border-red-600": error && error.length > 0,
            },
            className,
          )}
        >
          <div className="flex items-center gap-2.5 truncate text-secondary">
            {selectedValue?.img && (
              <Image
                src={selectedValue.img}
                width={24}
                height={24}
                alt=""
                className="size-6 object-contain"
              />
            )}
            <span className={cn(!selectedValue && "text-ash")}>
              {selectedValue
                ? selectedValue?.label || selectedValue?.name
                : placeholder}
            </span>
          </div>
          <div
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          >
            <Arrow move="down" />
          </div>
        </div>

        {isOpen && (
          <ul
            className={cn(
              "absolute z-100 my-2 p-2 bg-white rounded-xl max-h-[250px] overflow-auto shadow-2xl border border-gray-100 min-w-full animate-in fade-in zoom-in duration-150",
              dropdownPositionClass[position],
            )}
          >
            {options.length > 0 ? (
              options.map((option, i) => {
                let isSelected = false;
                if (
                  (option?.id && option?.id === selectedValue?.id) ||
                  (option?.value && option?.value === selectedValue?.value)
                )
                  isSelected = true;

                return (
                  <li
                    key={i}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg text-secondary hover:bg-gray-50 cursor-pointer flex items-center gap-2.5 transition-colors",
                      isSelected && "bg-gray-100 text-c-green",
                    )}
                    onClick={() => handleSelectChange(option)}
                  >
                    {option.img && (
                      <Image
                        src={option.img}
                        width={20}
                        height={20}
                        alt=""
                        className="size-5 object-contain"
                      />
                    )}
                    {option?.label || option?.name}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-3 text-sm text-ash text-center">
                No options found
              </li>
            )}
          </ul>
        )}
      </div>

      {error?.map((err, index) => (
        <p key={index} className="text-sm text-red-600">
          {err}
        </p>
      ))}
    </div>
  );
}
