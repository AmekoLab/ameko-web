import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn; // Props của react-hook-form
  error?: string;
}

export const InputField = ({
  label,
  type = "text",
  placeholder,
  registration,
  error,
}: InputFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`border p-3 rounded-md outline-none transition-all ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:ring-blue-500 focus:ring-2"
        }`}
        {...registration}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};
