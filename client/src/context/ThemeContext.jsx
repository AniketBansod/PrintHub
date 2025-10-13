import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or system preference to avoid theme flash/mismatch
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        if (typeof settings.darkMode === "boolean") return settings.darkMode;
      }
      // Fallback to system preference
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    } catch (e) {
      console.error("Theme init error:", e);
    }
    return true; // final fallback
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save to localStorage
    const savedSettings = localStorage.getItem("userSettings");
    let settings = {};
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (err) {
        console.error("Error parsing saved settings:", err);
      }
    }

    settings.darkMode = newTheme;
    localStorage.setItem("userSettings", JSON.stringify(settings));
  };

  const setTheme = (theme) => {
    setIsDarkMode(theme);

    // Save to localStorage
    const savedSettings = localStorage.getItem("userSettings");
    let settings = {};
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (err) {
        console.error("Error parsing saved settings:", err);
      }
    }

    settings.darkMode = theme;
    localStorage.setItem("userSettings", JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        setTheme,
        theme: isDarkMode ? "dark" : "light",
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
