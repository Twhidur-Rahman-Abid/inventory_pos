"use client";
import React from "react";

interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked = false,
  onChange = () => {},
  ...props
}) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        {...props}
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:bg-primary transition-all duration-300"></div>
      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
    </label>
  );
};

export default ToggleSwitch;
