import React, { useState } from 'react';
import { PostGenerator } from './components/PostGenerator';
import StyleLibrary from './components/StyleLibrary';
import { Header } from './components/Header';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ThemeProvider } from './context/ThemeContext';


export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-linkedin-background dark:bg-linkedin-dark-bg">
        {/* Header will render the menu toggle so it can be placed visually above the header */}

        <div className="flex">
          {/* Settings Sidebar */}
          <div 
            className={`
              fixed top-0 left-0 h-full w-72 transform transition-transform duration-300 ease-in-out z-50
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            id="settings-sidebar"
          >
            <SettingsSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
              <Header isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
              
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

        {/* Sidebar Overlay (covers content when sidebar is open) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
