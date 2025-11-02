import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';
type ToneStyle = 'casual' | 'professional' | 'technical';
type CustomColors = {
  primary: string;
  secondary: string;
  accent: string;
};

interface ThemeContextType {
  theme: Theme;
  toneStyle: ToneStyle;
  customColors: CustomColors;
  fontScale: number;
  setTheme: (theme: Theme) => void;
  setToneStyle: (style: ToneStyle) => void;
  setCustomColors: (colors: CustomColors) => void;
  setFontScale: (scale: number) => void;
}

const defaultCustomColors: CustomColors = {
  primary: '#0073b1',
  secondary: '#00A676',
  accent: '#FF6B6B'
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toneStyle: 'professional',
  customColors: defaultCustomColors,
  fontScale: 100,
  setTheme: () => {},
  setToneStyle: () => {},
  setCustomColors: () => {},
  setFontScale: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [toneStyle, setToneStyle] = useState<ToneStyle>('professional');
  const [customColors, setCustomColors] = useState<CustomColors>(defaultCustomColors);
  const [fontScale, setFontScale] = useState(100);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }

    // Apply custom colors
    root.style.setProperty('--color-custom-primary', customColors.primary);
    root.style.setProperty('--color-custom-secondary', customColors.secondary);
    root.style.setProperty('--color-custom-accent', customColors.accent);

    // Apply font scaling
    root.style.setProperty('--font-scale', `${fontScale}%`);

    // Apply tone style
    root.dataset.toneStyle = toneStyle;
  }, [theme, customColors, fontScale, toneStyle]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toneStyle,
        customColors, 
        fontScale,
        setTheme, 
        setToneStyle,
        setCustomColors, 
        setFontScale 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);