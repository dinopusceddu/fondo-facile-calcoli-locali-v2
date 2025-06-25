// components/layout/Header.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext.js';
import { APP_NAME } from '../../constants.js';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { state } = useAppContext();
  const { currentUser } = state;

  return (
    <header className="sticky top-0 z-40 bg-[#fcf8f8] border-b border-solid border-b-[#f3e7e8]">
      <div className="mx-auto px-6 sm:px-10"> {/* Adjusted padding */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2"> {/* Adjusted gap */}
            <button
              onClick={toggleSidebar}
              className="text-[#1b0e0e] hover:text-[#ea2832] focus:outline-none focus:text-[#ea2832] md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* AppLogo SVG removed */}
            <h1 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em]">{APP_NAME}</h1>
          </div>
          <div className="flex items-center">
            <span className="text-[#1b0e0e] text-sm font-medium mr-3 hidden sm:block">
              {currentUser.name} ({currentUser.role})
            </span>
            {/* User menu can be added here */}
          </div>
        </div>
      </div>
    </header>
  );
};