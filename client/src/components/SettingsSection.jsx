import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Bell, 
  Printer, 
  FileText, 
  Palette, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Moon,
  Sun,
  RotateCcw
} from "lucide-react";

const SettingsSection = () => {
  const [settings, setSettings] = useState({
    emailNotifications: "all",
    defaultPrinter: "library",
    defaultPaperSize: "A4",
    defaultColor: "blackWhite",
    autoSave: true,
    darkMode: true,
    language: "en"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        // Apply dark mode immediately
        applyDarkMode(parsedSettings.darkMode);
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
  }, []);

  const applyDarkMode = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Apply dark mode immediately when changed
    if (key === 'darkMode') {
      applyDarkMode(value);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      emailNotifications: "all",
      defaultPrinter: "library",
      defaultPaperSize: "A4",
      defaultColor: "blackWhite",
      autoSave: true,
      darkMode: true,
      language: "en"
    };
    setSettings(defaultSettings);
    applyDarkMode(true);
    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    setSuccess("Settings reset to defaults!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Settings className="h-8 w-8 text-amber-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your printing experience and app preferences
        </p>
      </div>

      {/* Status Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg mb-6"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </motion.div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Notifications
              </label>
              <select
                value={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all">All notifications</option>
                <option value="important">Important only</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Printer Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
              <Printer className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Printer</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Printer
              </label>
              <select
                value={settings.defaultPrinter}
                onChange={(e) => handleSettingChange('defaultPrinter', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              >
                <option value="library">Library Printer</option>
                <option value="studentCenter">Student Center Printer</option>
                <option value="dorm">Dorm Printer</option>
                <option value="lab">Computer Lab Printer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Print Defaults */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Print Defaults</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Paper Size
              </label>
              <select
                value={settings.defaultPaperSize}
                onChange={(e) => handleSettingChange('defaultPaperSize', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Color Option
              </label>
              <select
                value={settings.defaultColor}
                onChange={(e) => handleSettingChange('defaultColor', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
              >
                <option value="blackWhite">Black & White</option>
                <option value="color">Color</option>
              </select>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg mr-3">
              <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">App Preferences</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-save Settings
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically save your preferences
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.autoSave ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.span
                  animate={{ x: settings.autoSave ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use dark theme for better experience
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.darkMode ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.span
                  animate={{ x: settings.darkMode ? 24 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveSettings}
          disabled={loading}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition duration-300 flex items-center justify-center ${
            loading
              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetToDefaults}
          className="flex-1 py-3 px-6 rounded-lg font-semibold transition duration-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center justify-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </motion.button>
      </div>

      {/* Settings Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-1">Settings Information</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Your settings are automatically saved to your browser's local storage. 
              These preferences will be remembered across sessions and help personalize your printing experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;