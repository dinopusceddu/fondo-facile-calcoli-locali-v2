// src/Header.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { APP_NAME } from '../constants.js';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { state } = useAppContext();
  const { currentUser } = state;

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 md:hidden mr-4"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{APP_NAME}</h1>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 text-sm mr-3 hidden sm:block">
              {currentUser.name} ({currentUser.role})
            </span>
            {/* User menu can be added here */}
          </div>
        </div>
      </div>
    </header>
  );
};