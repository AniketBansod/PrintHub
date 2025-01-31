import React from 'react';
import { motion } from 'framer-motion';

const SystemSettingsSection = ({ priceSettings, handlePriceChange, savePricing }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
    <form className="space-y-4">
      <div>
        <label htmlFor="blackWhite" className="block text-sm font-medium text-gray-300 mb-2">
          Price Per Page (Black & White)
        </label>
        <input
          type="number"
          id="blackWhite"
          step="0.1"
          value={priceSettings.blackWhite}
          onChange={handlePriceChange}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
          Price Per Page (Color)
        </label>
        <input
          type="number"
          id="color"
          step="0.1"
          value={priceSettings.color}
          onChange={handlePriceChange}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={savePricing}
        className="w-full bg-amber-500 text-gray-900 py-2 px-4 rounded-md hover:bg-amber-400 transition duration-300 ease-in-out shadow-lg font-semibold"
      >
        Save Settings
      </motion.button>
    </form>
  </div>
);

export default SystemSettingsSection; 