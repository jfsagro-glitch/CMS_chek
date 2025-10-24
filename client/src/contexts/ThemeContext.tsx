import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'windows97' | 'windowsXP' | 'ios' | 'matrix' | 'nokia3110';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getNextTheme: () => Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Theme[] = ['light', 'dark', 'windows97', 'windowsXP', 'ios', 'matrix', 'nokia3110'];

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cms-check-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('cms-check-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Добавляем класс для анимаций Matrix
    if (theme === 'matrix') {
      document.body.classList.add('matrix-theme');
    } else {
      document.body.classList.remove('matrix-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getNextTheme = () => {
    const currentIndex = themes.indexOf(theme);
    return themes[(currentIndex + 1) % themes.length];
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, getNextTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};