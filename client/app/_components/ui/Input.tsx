/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, ChangeEvent, ReactNode } from "react";
import { cn } from "../../_lib/utils";
import Image from "next/image";

type InputProps = {
  type?: string;
  placeholder?: string;
  name?: string;
  LeftIcon?: ReactNode;
  RightIcon?: ReactNode;
  error?: string;
  className?: string;
  required?: boolean;
  getInputValue?: (value: any) => void;
  setInputValue?: (
    e: ChangeEvent<HTMLInputElement>,
    setValue: (val: any) => void,
  ) => void;
  setDirectValue?: any;
  defaultValue?: any;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  type = "text",
  placeholder = "",
  name,
  LeftIcon,
  RightIcon,
  error,
  className,
  required,
  getInputValue = () => {},
  setInputValue = () => {},
  setDirectValue,
  defaultValue,
  ...props
}: InputProps) {
  const [value, setValue] = useState<any>(defaultValue || "");
  const isFileType = type === "file";
  const isErrorShow = error && value?.length === 0;

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = isFileType ? e.target.files?.[0] : e.target.value;
    setValue(value);
    getInputValue(value);
    setInputValue(e, setValue);
  };

  useEffect(() => {
    if (setDirectValue != null) {
      setValue(setDirectValue);
    }
  }, [setDirectValue]);

  return (
    <div className="space-y-1.5 flex-1">
      <label
        htmlFor={name}
        className={cn(
          "px-2.5 md:px-5 input-shadow border",
          {
            "border-red-600": isErrorShow,
            "border-stock/10": !isErrorShow,
            "w-full h-full py-3.5": isFileType,
          },
          "rounded-xl flex items-center w-full",
          "focus-within:border-c-green",
          className,
        )}
      >
        {LeftIcon}
        {isFileType && (
          <span className="w-full text-ash text-sm">{placeholder}</span>
        )}
        {isFileType ? (
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            name={name}
            onChange={handleOnChange}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            className={cn(
              `border-0 focus:ring-0 w-full truncate h-full py-3 focus:border-0 placeholder:text-ash active:border-0 focus:outline-0`,
              { hidden: isFileType },
            )}
            {...props}
          />
        ) : (
          <input
            id={name}
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            required={required}
            onChange={handleOnChange}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            className={cn(
              `border-0 focus:ring-0 w-full truncate h-full py-3.5 focus:border-0 placeholder:text-ash active:border-0 focus:outline-0`,
              { hidden: isFileType },
            )}
            {...props}
          />
        )}
        {RightIcon}
      </label>
      {isErrorShow && <p className="text-red-600">{error}</p>}
    </div>
  );
}

type FormInputProps = {
  label?: string;
  error?: string[];
  LeftIcon?: ReactNode;
  RightIcon?: ReactNode;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function FormInput({
  label,
  error,
  LeftIcon,
  RightIcon,
  className,
  type = "text",
  required = true,
  ...props
}: FormInputProps) {
  const isFileType = type === "file";

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && (
        <label htmlFor={label} className="text-secondary font-medium text-base">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div
        className={cn(
          "px-2.5 md:px-5 input-shadow border rounded-xl flex items-center w-full focus-within:border-c-green",
          {
            "border-red-600": error?.length,
            "border-stock/10": !error?.length,
            "py-px": isFileType,
          },
          className,
        )}
      >
        {LeftIcon}

        <input
          type={type}
          onWheel={(e) => e.currentTarget.blur()}
          className="border-0 focus:ring-0 w-full h-full py-3.5 placeholder:text-ash focus:outline-0 bg-transparent"
          {...props}
        />

        {RightIcon}
      </div>

      {error?.map((err, index) => (
        <p key={index} className="text-sm text-red-600">
          {err}
        </p>
      ))}
    </div>
  );
}

type FormFileProps = {
  previewImg?: string;
  label?: string;
  accept?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function FormFile({
  previewImg = "",
  label = "File",
  accept = "image/*",
  onChange,
  ...props
}: FormFileProps) {
  const [preview, setPreview] = useState(previewImg || "/placeholder-img.svg");
  return (
    <div className="flex justify-between items-center">
      <div className="py-2.5 text-center w-full">
        <Image
          className="mx-auto size-36 object-contain"
          src={preview}
          width={144}
          height={144}
          alt="inventory"
        />
      </div>

      <FormInput
        type="file"
        accept={accept}
        label={label}
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            setPreview(URL.createObjectURL(file));
          }
          if (file) {
            setPreview(URL.createObjectURL(file));
          }

          if (onChange) onChange(e);
        }}
        {...props}
      />
    </div>
  );
}
