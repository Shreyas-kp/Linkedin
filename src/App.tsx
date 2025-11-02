import React, { useState } from 'react';
import { PostGenerator } from './components/PostGenerator';
import StyleLibrary from './components/StyleLibrary';
import { Header } from './components/Header';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ThemeProvider } from './context/ThemeContext';
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-linkedin-background dark:bg-linkedin-dark-bg">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-linkedin-dark-card p-2 rounded-full shadow-medium"
        >
          {isSidebarOpen ? (
            <XIcon className="w-6 h-6 text-linkedin-text dark:text-linkedin-dark-text" />
          ) : (
            <MenuIcon className="w-6 h-6 text-linkedin-text dark:text-linkedin-dark-text" />
          )}
        </button>

        <div className="flex">
          {/* Settings Sidebar */}
          <div 
            className={`
              fixed lg:relative top-0 left-0 h-full w-72 transform transition-transform duration-300 ease-in-out z-40
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <SettingsSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 lg:pl-72">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Header />
              
              <div className="mt-8 grid lg:grid-cols-3 gap-8">
                {/* Post Generator */}
                <div className="lg:col-span-2">
                  <PostGenerator />
                </div>

                {/* Style Library */}
                <div>
                  <StyleLibrary />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
