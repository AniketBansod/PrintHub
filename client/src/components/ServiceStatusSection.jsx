import React from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const ServiceStatusSection = ({ serviceStatus, reason, setReason, handleServiceToggle }) => (
  <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Title */}
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center sm:text-left">
      Service Status
    </h2>

    {/* Toggle Button */}
    <div className="flex justify-center sm:justify-start mb-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleServiceToggle}
        className="flex items-center px-4 py-2 rounded-md bg-gray-800 dark:bg-gray-700 text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition text-sm sm:text-base"
      >
        {serviceStatus ? (
          <ToggleRight className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
        ) : (
          <ToggleLeft className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
        )}
        {serviceStatus ? 'Service is Active' : 'Service is Inactive'}
      </motion.button>
    </div>

    {/* Reason Box */}
    {!serviceStatus && (
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Reason for Inactivity
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full rounded-md p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm sm:text-base"
          rows="3"
        />
      </div>
    )}
  </div>
);

export default ServiceStatusSection;
