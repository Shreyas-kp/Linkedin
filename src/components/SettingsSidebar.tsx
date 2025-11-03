import React from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

export const SettingsSidebar: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    toneStyle, 
    setToneStyle,
    fontScale, 
    setFontScale,
    customColors,
    setCustomColors,
    model: customModel,
    setModel
  } = useTheme();

  return (
    <aside className="sidebar p-6 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme & Appearance</h3>
        
        {/* Theme Toggle */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`theme-selector ${theme === 'light' ? 'bg-linkedin-lighter' : ''}`}
            >
              <SunIcon className="w-5 h-5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`theme-selector ${theme === 'dark' ? 'bg-linkedin-lighter' : ''}`}
            >
              <MoonIcon className="w-5 h-5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`theme-selector ${theme === 'auto' ? 'bg-linkedin-lighter' : ''}`}
            >
              <ComputerDesktopIcon className="w-5 h-5" />
              <span>Auto</span>
            </button>
          </div>

          {/* Font Scale */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Scale</label>
            <input
              type="range"
              min="80"
              max="150"
              value={fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm mt-1 text-linkedin-text/60">
              {fontScale}%
            </div>
          </div>
        </div>
      </div>

      {/* Tone & Style */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tone & Style</h3>
        <div className="space-y-4">
          <button
            onClick={() => setToneStyle('casual')}
            className={`theme-selector w-full ${toneStyle === 'casual' ? 'bg-theme-casual-background' : ''}`}
          >
            <span role="img" aria-label="casual">😎</span>
            <span>Casual</span>
          </button>
          <button
            onClick={() => setToneStyle('professional')}
            className={`theme-selector w-full ${toneStyle === 'professional' ? 'bg-theme-professional-background' : ''}`}
          >
            <span role="img" aria-label="professional">👔</span>
            <span>Professional</span>
          </button>
          <button
            onClick={() => setToneStyle('technical')}
            className={`theme-selector w-full ${toneStyle === 'technical' ? 'bg-theme-technical-background' : ''}`}
          >
            <span role="img" aria-label="technical">🔧</span>
            <span>Technical</span>
          </button>
        </div>
      </div>

      {/* Model Selector */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Generation Model</h3>
        <div className="space-y-2">
          <label className="block text-sm text-linkedin-text/70 mb-1">Choose model used for generation</label>
          <select
            value={customModel}
            onChange={(e) => setModel(e.target.value as any)}
            className="w-full p-2 border rounded"
            aria-label="Select generation model"
            id="model-select"
          >
            <option value="heuristic">Heuristic (fast, local)</option>
            <option value="tfjs-small">TFJS - Small (local)</option>
            <option value="tfjs-local">TFJS - Full TFJS (local)</option>
            <option value="remote-api">Remote API (remote)</option>
          </select>
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Colors</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <input
              type="color"
              value={customColors.primary}
              onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <input
              type="color"
              value={customColors.secondary}
              onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <input
              type="color"
              value={customColors.accent}
              onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};