// src/EmployeeCountsForm.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { EmployeeCategory, ALL_EMPLOYEE_CATEGORIES } from '../types.js';
import { Input } from './Input.js';

interface EmployeeCountsFormProps {
  title: string;
}

export const EmployeeCountsForm: React.FC<EmployeeCountsFormProps> = ({ title }) => {
  const { state, dispatch } = useAppContext();
  const { personaleServizioAttuale } = state.fundData.annualData;

  const handleChange = (category: EmployeeCategory, value: string) => {
    const count = value === '' ? undefined : parseInt(value, 10);
    // if (count !== undefined && isNaN(count)) return; // Allow undefined, prevent NaN for actual numbers

    dispatch({ type: 'UPDATE_EMPLOYEE_COUNT', payload: { category, count: (count !== undefined && isNaN(count)) ? 0 : count as number } }); // Ensure count is a number or undefined
  };

  return (
    <>
      <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-1">
        {ALL_EMPLOYEE_CATEGORIES.map(category => {
          const empData = personaleServizioAttuale.find(emp => emp.category === category);
          return (
            <Input
              key={category}
              label={category}
              type="number"
              id={`emp_count_${category.replace(/\s+/g, '_')}`}
              name={`emp_count_${category.replace(/\s+/g, '_')}`}
              value={empData?.count ?? ''}
              onChange={(e) => handleChange(category, e.target.value)}
              placeholder="N."
              step="1"
              min="0"
              containerClassName="mb-2"
            />
          );
        })}
      </div>
    </>
  );
};