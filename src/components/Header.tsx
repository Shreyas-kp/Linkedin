import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LockClosedIcon, PlusIcon, Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';

type HeaderProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { model } = useTheme();

  return (
    <header className="card mb-6 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-4">
        {/* Menu button — placed inside header so it sits above the header visually */}
        <button
          onClick={toggleSidebar}
          aria-controls="settings-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Close settings' : 'Open settings'}
          className="z-60 bg-white dark:bg-linkedin-dark-card p-2 rounded-full shadow-md focus:outline-none focus:ring"
        >
          {isSidebarOpen ? (
            <XIcon className="w-6 h-6 text-linkedin-text dark:text-linkedin-dark-text" />
          ) : (
            <MenuIcon className="w-6 h-6 text-linkedin-text dark:text-linkedin-dark-text" />
          )}
        </button>

        <div>
          <h1 className="text-2xl font-bold text-linkedin-text dark:text-linkedin-dark-text">
            LinkedIn Post Optimizer
          </h1>
          <p className="text-sm text-linkedin-text/60 dark:text-linkedin-dark-text/60 mt-1 italic flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4" />
            Local AI • Private by Design
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-linkedin-text/70 dark:text-linkedin-dark-text/70 px-3 py-1 border rounded-md bg-white/50 dark:bg-black/10">
          <span className="sr-only">Selected model</span>
          <strong className="mr-1">Model:</strong>
          <span className="font-mono text-xs">{model}</span>
        </div>

        <button className="btn-primary">
          <PlusIcon className="w-5 h-5" />
          New Post
        </button>
      </div>
    </header>
  );
};