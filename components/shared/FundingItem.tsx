// components/shared/FundingItem.tsx
import React from 'react';
import { Input } from './Input.js';

interface FundingItemProps<T> {
  id: keyof T;
  description: string | React.ReactNode;
  value?: number;
  isSubtractor?: boolean;
  onChange: (field: keyof T, value?: number) => void;
  riferimentoNormativo?: string;
  disabled?: boolean;
  inputInfo?: string | React.ReactNode;
  isPercentage?: boolean;
}

export function FundingItem<T extends Record<string, any>>(props: FundingItemProps<T>) {
  const {
    id,
    description,
    value,
    isSubtractor = false,
    onChange,
    riferimentoNormativo,
    disabled = false,
    inputInfo,
    isPercentage = false,
  } = props;

  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange(id, val);
  };

  return (
    <div className={`grid grid-cols-12 gap-x-4 gap-y-2 py-4 border-b border-[#f3e7e8] last:border-b-0 items-start transition-colors hover:bg-[#fcf8f8] ${disabled ? 'opacity-60 bg-gray-50' : ''}`}>
      <div className="col-span-12 md:col-span-8 flex flex-col justify-center h-full">
        <label htmlFor={id as string} className={`block text-sm text-[#1b0e0e] ${disabled ? 'cursor-not-allowed' : ''}`}>
          {description}
          {isSubtractor && <span className="text-xs text-[#ea2832] ml-1">(da sottrarre)</span>}
        </label>
        {riferimentoNormativo && <p className="text-xs text-[#5f5252] mt-0.5">{riferimentoNormativo}</p>}
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="relative">
          <Input
            type="number"
            id={id as string}
            name={id as string}
            value={value ?? ''}
            onChange={handleChangeEvent}
            placeholder="0.00"
            step={isPercentage ? "0.01" : "0.01"}
            inputClassName={`text-right w-full h-11 p-2.5 ${isPercentage ? 'pr-8' : ''} ${disabled ? 'bg-white' : 'bg-[#f3e7e8]'}`}
            containerClassName="mb-0"
            aria-label={typeof description === 'string' ? description : (id as string)}
            disabled={disabled}
          />
          {isPercentage && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-[#5f5252] pointer-events-none">%</span>}
        </div>
        {inputInfo && <div className="text-xs text-[#5f5252] mt-1">{inputInfo}</div>}
      </div>
    </div>
  );
}
