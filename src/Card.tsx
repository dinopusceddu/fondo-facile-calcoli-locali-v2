// src/Card.tsx
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', footer }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl border border-gray-200 ${className}`}>
      {title && (
        <div className={`px-6 py-4 border-b border-gray-200 ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};