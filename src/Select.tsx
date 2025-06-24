// src/Select.tsx
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string; // Added placeholder prop
}

export const Select: React.FC<SelectProps> = ({
  label,
  id,
  error,
  options,
  containerClassName = '',
  placeholder, // Destructure placeholder
  ...props
}) => {
  const baseSelectClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm";
  const errorSelectClass = "border-red-500 focus:ring-red-500 focus:border-red-500";
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${baseSelectClass} ${error ? errorSelectClass : ''}`}
        {...props}
      >
        {placeholder && <option value="" disabled={props.value !== ""} hidden={props.value !== ""}>{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};