/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Input from "./Input";

type InputGroupProps = {
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  icon?: React.ReactNode;
} & Record<string, any>;

export default function InputGroup({
  label,
  type = "text",
  required = true,
  placeholder,
  name,
  icon = null,
  ...props
}: InputGroupProps) {
  return (
    <div className="w-full flex flex-col gap-[18px]">
      <label htmlFor={name} className="text-secondary">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <Input
        className="focus:outline-1 focus:outline-primary min-w-full"
        type={type}
        placeholder={placeholder}
        name={name}
        RightIcon={icon ? icon : null}
        required={required}
        {...props}
      />
    </div>
  );
}
