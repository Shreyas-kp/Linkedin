import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LockClosedIcon, PlusIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  return (
    <header className="card mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-linkedin-text dark:text-linkedin-dark-text">
          LinkedIn Post Optimizer
        </h1>
        <p className="text-sm text-linkedin-text/60 dark:text-linkedin-dark-text/60 mt-1 italic flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4" />
          Local AI • Private by Design
        </p>
      </div>
      <button className="btn-primary">
        <PlusIcon className="w-5 h-5" />
        New Post
      </button>
    </header>
  );
};