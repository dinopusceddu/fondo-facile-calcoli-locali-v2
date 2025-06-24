// components/layout/MainLayout.tsx
import React, { useState } from 'react';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { PageModule } from '../../types.js';

interface MainLayoutProps {
  modules: PageModule[];
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ modules, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#fcf8f8] overflow-x-hidden">
      <div className="flex h-full grow flex-col"> {/* layout-container */}
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar modules={modules} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 sm:px-10 md:px-10 lg:px-10 flex flex-1 justify-center"> {/* Adjusted padding */}
              <div className="flex flex-col max-w-[960px] flex-1 w-full"> {/* layout-content-container */}
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};