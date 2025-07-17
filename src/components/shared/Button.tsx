// components/shared/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyle = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition ease-in-out duration-150 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed tracking-[0.015em]';
  
  // Note: text color for primary is #fcf8f8 (page bg), for secondary is #1b0e0e (main text)
  const variantStyles = {
    primary: 'bg-[#ea2832] hover:bg-[#c02128] text-[#fcf8f8] focus:ring-[#ea2832]', // Red button
    secondary: 'bg-[#f3e7e8] hover:bg-[#e9dcdf] text-[#1b0e0e] focus:ring-[#994d51]', // Light pink/gray button
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500', // Kept for consistency if needed, but primary is red
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500', // Standard success
    ghost: 'bg-transparent hover:bg-[#f3e7e8] text-[#ea2832] focus:ring-[#ea2832]', // Ghost button with red text
    link: 'bg-transparent hover:underline text-[#ea2832] p-0 h-auto focus:ring-0', // Link-style button
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs h-8', // Adjusted for new design
    md: 'px-4 text-sm h-10',      // Default height from example
    lg: 'px-6 py-3 text-base h-12', // Larger button
  };

  return (
    <button
      type="button"
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
            className={`animate-spin h-5 w-5 ${variant === 'primary' || variant === 'danger' || variant === 'success' ? 'text-white' : 'text-[#1b0e0e]'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {!isLoading && children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
