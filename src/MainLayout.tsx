// src/MainLayout.tsx
import React, { useState } from 'react';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { PageModule } from '../types.js';

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
    <div className="flex flex-col h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar modules={modules} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};