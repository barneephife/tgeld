'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Define available themes
export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'blossom' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Exclude<Theme, 'system'>; // The actual theme being applied
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider props type
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme-preference') as Theme | null;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  // Initialize theme from localStorage or default
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = getStoredTheme();
    return stored || defaultTheme;
  });

  // Track the resolved theme (actual theme being applied)
  const resolvedTheme: Exclude<Theme, 'system'> =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : (theme as Exclude<Theme, 'system'>);

  // Handle system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // Initial check
    updateResolvedTheme();

    // Listen for system theme changes
    const listener = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Apply theme to document root and store preference
  useEffect(() => {
    const root = document.documentElement;
    const themeClasses = [
      'theme-light',
      'theme-dark',
      'theme-ocean',
      'theme-forest',
      'theme-blossom',
    ];

    // Remove all theme classes and data attributes
    root.classList.remove(...themeClasses);
    root.removeAttribute('data-theme');

    // Add the new theme class and data attribute
    const newThemeClass = `theme-${resolvedTheme}`;
    root.classList.add(newThemeClass);
    root.setAttribute('data-theme', resolvedTheme);

    // Store the theme preference
    localStorage.setItem('theme-preference', theme);

    console.log('Theme updated:', { theme, resolvedTheme }); // Debug log
  }, [resolvedTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
