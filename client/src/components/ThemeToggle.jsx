import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`p-2 sm:p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isDarkMode
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      } ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
