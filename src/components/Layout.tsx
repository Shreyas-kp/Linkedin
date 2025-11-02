import React from 'react';
import { Cog6ToothIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-header bg-white dark:bg-surface-elevated-dark border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="font-display text-xl text-slate-900 dark:text-white">
              LinkedIn Post Optimizer
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              AI-Powered
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-header min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}