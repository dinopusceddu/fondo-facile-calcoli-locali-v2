// components/layout/Header.tsx
import React from 'react';
import { useAppContext } from '../../contexts/AppContext.js';
import { APP_NAME } from '../../constants.js';

interface HeaderProps {
  toggleSidebar: () => void;
}

const AppLogo = () => (
  <div className="size-5 text-[#1b0e0e]"> {/* Adjusted size to fit better */}
    <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
    </svg>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { state } = useAppContext();
  const { currentUser } = state;

  return (
    <header className="sticky top-0 z-40 bg-[#fcf8f8] border-b border-solid border-b-[#f3e7e8]">
      <div className="mx-auto px-6 sm:px-10"> {/* Adjusted padding from px-10 to px-6 sm:px-10 for better responsiveness */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3"> {/* Reduced gap from 4 */}
            <button
              onClick={toggleSidebar}
              className="text-[#1b0e0e] hover:text-[#ea2832] focus:outline-none focus:text-[#ea2832] md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <AppLogo />
            <h1 className="text-[#1b0e0e] text-lg font-bold leading-tight tracking-[-0.015em]">{APP_NAME}</h1>
          </div>
          <div className="flex items-center">
            <span className="text-[#1b0e0e] text-sm font-medium mr-3 hidden sm:block">
              {currentUser.name} ({currentUser.role})
            </span>
            {/* User menu can be added here, example:
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{backgroundImage: 'url("...")'}} // Placeholder for avatar
            ></div>
            */}
          </div>
        </div>
      </div>
    </header>
  );
};