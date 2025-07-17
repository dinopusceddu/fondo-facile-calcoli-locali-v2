// components/shared/Card.tsx
import React, { useState } from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  footer?: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '', 
  titleClassName = '', 
  footer,
  isCollapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible ? defaultCollapsed : false);

  const toggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-[#f3e7e8] ${className}`}>
      {title && (
        <div 
          className={`px-6 py-4 border-b border-[#f3e7e8] flex justify-between items-center ${isCollapsible ? 'cursor-pointer hover:bg-[#fcf8f8]' : ''} ${titleClassName}`}
          onClick={isCollapsible ? toggleCollapse : undefined}
          role={isCollapsible ? "button" : undefined}
          tabIndex={isCollapsible ? 0 : undefined}
          onKeyDown={isCollapsible ? (e) => (e.key === 'Enter' || e.key === ' ') && toggleCollapse() : undefined}
          aria-expanded={isCollapsible ? !isCollapsed : undefined}
          aria-controls={isCollapsible && title ? title.replace(/\s+/g, '-').toLowerCase() + '-content' : undefined}
        >
          <h3 className="text-lg font-bold text-[#1b0e0e] leading-tight">{title}</h3>
          {isCollapsible && (
            <button 
              type="button" 
              className="text-[#994d51] hover:text-[#ea2832] text-xl p-1 -mr-1 rounded-full focus:outline-none focus:ring-1 focus:ring-[#ea2832]"
              aria-label={isCollapsed ? "Espandi sezione" : "Comprimi sezione"}
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
      )}
      {!isCollapsed && (
        <div id={isCollapsible && title ? title.replace(/\s+/g, '-').toLowerCase() + '-content' : undefined}>
          <div className="p-6">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 bg-[#fcf8f8] border-t border-[#f3e7e8] rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
