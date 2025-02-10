/*
 * ThemeManager.ts
 *
 * A reusable theme system for our project inspired by Wallos.
 * Provides light/dark (and auto), color themes, and custom theming via CSS variables.
 */

export type ThemeType = 'light' | 'dark' | 'auto';
export type ColorTheme = 'blue' | 'green' | 'red' | 'yellow' | 'purple';

interface CustomColors {
  main: string;
  accent: string;
  hover: string;
}

class ThemeManager {
  static init(defaultTheme: ThemeType = 'auto', defaultColorTheme: ColorTheme = 'blue') {
    // Load saved theme or use default
    const storedTheme = localStorage.getItem('theme') as ThemeType | null;
    const theme = storedTheme || defaultTheme;
    this.setTheme(theme);

    // Initialize color theme if needed
    const storedColorTheme =
      (localStorage.getItem('colorTheme') as ColorTheme) || defaultColorTheme;
    this.setColorTheme(storedColorTheme);

    // Listen for system theme changes if using 'auto'
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', () => {
        this.setTheme('auto');
      });
    }
  }

  static setTheme(theme: ThemeType) {
    // 'auto' mode uses system preference
    if (theme === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Remove existing theme classes
    document.documentElement.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-ocean',
      'theme-forest',
      'theme-blossom'
    );
    // Add the new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }

  static setColorTheme(color: ColorTheme) {
    localStorage.setItem('colorTheme', color);
    // Future integration: adjust any additional logic for color themes if needed.
  }

  static setCustomColors({ main, accent, hover }: CustomColors) {
    document.documentElement.style.setProperty('--main-color', main);
    document.documentElement.style.setProperty('--accent-color', accent);
    document.documentElement.style.setProperty('--hover-color', hover);
    localStorage.setItem('customColors', JSON.stringify({ main, accent, hover }));
  }
}

export default ThemeManager;
