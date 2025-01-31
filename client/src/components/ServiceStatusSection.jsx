import React from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const ServiceStatusSection = ({ serviceStatus, reason, setReason, handleServiceToggle }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Service Status</h2>
    <div className="flex items-center mb-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleServiceToggle}
        className="flex items-center p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
      >
        {serviceStatus ? <ToggleRight className="mr-2 h-5 w-5" /> : <ToggleLeft className="mr-2 h-5 w-5" />}
        {serviceStatus ? 'Service is Active' : 'Service is Inactive'}
      </motion.button>
    </div>
    {!serviceStatus && (
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
          Reason for Inactivity
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
        />
      </div>
    )}
  </div>
);

export default ServiceStatusSection; 