import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export interface ThemeSettings {
  themeColor: string;
  buttonTextColor: string;
  textColor: string;
  selectionColor: string;
  inactiveButtonColor: string;
  chartTooltipBg: string;
  chartTooltipText: string;
  fontSize: number;
  fontWeight: '400' | '700';
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  settings: ThemeSettings; // Currently active settings
  lightSettings: ThemeSettings;
  darkSettings: ThemeSettings;
  updateLightSettings: (newSettings: Partial<ThemeSettings>) => void;
  updateDarkSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: (mode: Theme) => void;
}

const LIGHT_DEFAULTS: ThemeSettings = {
  themeColor: '#FF0000',
  buttonTextColor: '#FFFFFF',
  textColor: '#0f172a',
  selectionColor: '#FF000033',
  inactiveButtonColor: 'transparent',
  chartTooltipBg: '#ffffff',
  chartTooltipText: '#0f172a',
  fontSize: 14,
  fontWeight: '400',
};

const DARK_DEFAULTS: ThemeSettings = {
  themeColor: '#FF0000',
  buttonTextColor: '#FFFFFF',
  textColor: '#ffffff',
  selectionColor: '#FF000033',
  inactiveButtonColor: 'transparent',
  chartTooltipBg: '#18181b',
  chartTooltipText: '#ffffff',
  fontSize: 14,
  fontWeight: '400',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arv_tech_theme') as Theme;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [lightSettings, setLightSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arv_tech_light_theme');
      if (saved) {
        try {
          return { ...LIGHT_DEFAULTS, ...JSON.parse(saved) };
        } catch (e) {
          return LIGHT_DEFAULTS;
        }
      }
    }
    return LIGHT_DEFAULTS;
  });

  const [darkSettings, setDarkSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arv_tech_dark_theme');
      if (saved) {
        try {
          return { ...DARK_DEFAULTS, ...JSON.parse(saved) };
        } catch (e) {
          return DARK_DEFAULTS;
        }
      }
    }
    return DARK_DEFAULTS;
  });

  const activeSettings = theme === 'light' ? lightSettings : darkSettings;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('arv_tech_theme', theme);

    // Apply active settings via CSS Variables
    root.style.setProperty('--primary-custom', activeSettings.themeColor);
    root.style.setProperty('--btn-text-custom', activeSettings.buttonTextColor);
    root.style.setProperty('--font-size-base', `${activeSettings.fontSize}px`);
    root.style.setProperty('--font-weight-base', activeSettings.fontWeight);
    root.style.setProperty('--selection-custom', activeSettings.selectionColor);
    root.style.setProperty('--nav-inactive-custom', activeSettings.inactiveButtonColor);
    root.style.setProperty('--chart-tooltip-bg', activeSettings.chartTooltipBg);
    root.style.setProperty('--chart-tooltip-text', activeSettings.chartTooltipText);
    
    if (activeSettings.textColor) {
      root.style.setProperty('--text-main-custom', activeSettings.textColor);
      root.style.setProperty('--text-heading-custom', activeSettings.textColor);
    } else {
      root.style.removeProperty('--text-main-custom');
      root.style.removeProperty('--text-heading-custom');
    }

    localStorage.setItem('arv_tech_light_theme', JSON.stringify(lightSettings));
    localStorage.setItem('arv_tech_dark_theme', JSON.stringify(darkSettings));
  }, [theme, lightSettings, darkSettings, activeSettings]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateLightSettings = (newSettings: Partial<ThemeSettings>) => {
    setLightSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateDarkSettings = (newSettings: Partial<ThemeSettings>) => {
    setDarkSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = (mode: Theme) => {
    if (mode === 'light') setLightSettings(LIGHT_DEFAULTS);
    else setDarkSettings(DARK_DEFAULTS);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      settings: activeSettings, 
      lightSettings, 
      darkSettings, 
      updateLightSettings, 
      updateDarkSettings,
      resetSettings 
    }}>
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
