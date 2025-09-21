import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.darkMode !== false); // Default to true if not set
      } catch (err) {
        console.error('Error loading theme settings:', err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Save to localStorage
    const savedSettings = localStorage.getItem('userSettings');
    let settings = {};
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (err) {
        console.error('Error parsing saved settings:', err);
      }
    }
    
    settings.darkMode = newTheme;
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme);
    
    // Save to localStorage
    const savedSettings = localStorage.getItem('userSettings');
    let settings = {};
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (err) {
        console.error('Error parsing saved settings:', err);
      }
    }
    
    settings.darkMode = theme;
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      setTheme,
      loading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
