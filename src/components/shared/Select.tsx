// components/shared/Select.tsx
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
  labelClassName?: string;
  selectClassName?: string;
  placeholder?: string;
}

const CustomChevronIcon = () => (
  <div
    className="text-[#994d51] flex items-center justify-center pr-3 md:pr-4 pointer-events-none"
    data-icon="CaretUpDown"
    data-size="20px" // Adjusted size
    data-weight="regular"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
      <path
        d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"
      ></path>
    </svg>
  </div>
);


export const Select: React.FC<SelectProps> = ({
  label,
  id,
  error,
  options,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  placeholder,
  ...props
}) => {
  const baseSelectClass = `form-select appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] border-none bg-[#f3e7e8] h-12 md:h-14 placeholder:text-[#994d51] p-3 md:pl-4 md:pr-10 text-base font-normal leading-normal focus:ring-2 focus:ring-[#ea2832]/50 focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed`;
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`block text-base font-medium text-[#1b0e0e] pb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative flex w-full flex-1 items-stretch rounded-lg bg-[#f3e7e8]">
        <select
          id={id}
          className={`${baseSelectClass} ${error ? 'ring-1 ring-red-500 focus:ring-red-500' : ''} ${selectClassName}`}
          {...props}
        >
          {placeholder && <option value="" disabled={props.value !== ""} hidden={props.value !== ""}>{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center">
            <CustomChevronIcon />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
