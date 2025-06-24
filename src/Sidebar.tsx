// src/Sidebar.tsx
import React from 'react';
import { PageModule } from '../types.js';
import { useAppContext } from './AppContext.js';

interface SidebarProps {
  modules: PageModule[];
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ modules, isOpen, toggleSidebar }) => {
  const { state, dispatch } = useAppContext();

  const handleNav = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: id });
    if (isOpen && window.innerWidth < 768) { // Close sidebar on mobile after navigation
        toggleSidebar();
    }
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-slate-100 p-4 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out shadow-lg`}>
        <nav>
          <ul>
            {modules.map((mod) => (
              <li key={mod.id} className="mb-2">
                <button
                  onClick={() => handleNav(mod.id)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                    ${state.activeTab === mod.id 
                      ? 'bg-slate-700 text-white shadow-inner' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  <span className="mr-3 text-lg w-6 text-center">{mod.icon}</span>
                  {mod.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};