import React from 'react';
import { motion } from 'framer-motion';

const SystemSettingsSection = ({ priceSettings, handlePriceChange, savePricing }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center sm:text-left">
      System Settings
    </h2>

    <form className="space-y-6">
      {/* Grid layout for inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Black & White Pricing */}
        <div>
          <label
            htmlFor="blackWhite"
            className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Price Per Page (Black & White)
          </label>
          <input
            type="number"
            id="blackWhite"
            step="0.1"
            value={priceSettings.blackWhite}
            onChange={handlePriceChange}
            className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 px-3 py-2 text-sm sm:text-base"
          />
        </div>

        {/* Color Pricing */}
        <div>
          <label
            htmlFor="color"
            className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Price Per Page (Color)
          </label>
          <input
            type="number"
            id="color"
            step="0.1"
            value={priceSettings.color}
            onChange={handlePriceChange}
            className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 px-3 py-2 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={savePricing}
        className="w-full sm:w-auto bg-amber-500 text-gray-900 py-3 px-6 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold text-sm sm:text-base"
      >
        Save Settings
      </motion.button>
    </form>
  </div>
);

export default SystemSettingsSection;
