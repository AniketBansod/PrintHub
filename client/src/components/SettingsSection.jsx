import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Info } from 'lucide-react';

const SettingsSection = () => {
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    defaultCopies: 1,
    printQuality: 'standard',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('preferences', JSON.stringify(preferences));
      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReset = () => {
    const defaults = {
      notifications: true,
      darkMode: false,
      defaultCopies: 1,
      printQuality: 'standard',
    };
    setPreferences(defaults);
    localStorage.setItem('preferences', JSON.stringify(defaults));
    setSuccess('Preferences reset to defaults');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start mb-2">
          <Settings className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500 mr-2" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Customize your printing experience and app preferences
        </p>
      </div>

      {/* Success & Error messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-3 rounded mb-4 text-sm sm:text-base"
        >
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4 text-sm sm:text-base"
        >
          {error}
        </motion.div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {/* Notifications */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Notifications
          </h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
              className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <span className="ml-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Enable notifications for order updates
            </span>
          </label>
        </div>

        {/* Dark Mode */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Theme
          </h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) => handleChange('darkMode', e.target.checked)}
              className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <span className="ml-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Enable dark mode
            </span>
          </label>
        </div>

        {/* Default Copies */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Default Copies
          </h3>
          <input
            type="number"
            min="1"
            value={preferences.defaultCopies}
            onChange={(e) => handleChange('defaultCopies', parseInt(e.target.value))}
            className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          />
        </div>

        {/* Print Quality */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Print Quality
          </h3>
          <select
            value={preferences.printQuality}
            onChange={(e) => handleChange('printQuality', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          >
            <option value="draft">Draft</option>
            <option value="standard">Standard</option>
            <option value="high">High Quality</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center justify-center py-3 px-4 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow w-full sm:w-auto"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Preferences
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="flex items-center justify-center py-3 px-4 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 shadow w-full sm:w-auto"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Reset Defaults
        </motion.button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm sm:text-base">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Information
        </h4>
        <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
          <li>Your preferences are saved locally in this browser</li>
          <li>These settings help personalize your printing experience</li>
          <li>You can reset to default settings anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsSection;
