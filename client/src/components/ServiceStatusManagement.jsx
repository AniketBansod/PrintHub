import { useState } from 'react';
import { motion } from 'framer-motion';
import useServiceStatus from '../hooks/useServiceStatus';
import { ToggleRight, Info, AlertCircle, CheckCircle } from 'lucide-react'; // Added icons

const ServiceStatusManagement = () => {
  const { serviceStatus, loading, refetch } = useServiceStatus();
  const [isUpdating, setIsUpdating] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/service-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isOpen: newStatus,
          reason: newStatus ? '' : reason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update service status');
      }

      setSuccess(data.message);
      setReason('');
      await refetch(); // Refresh the status
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenShop = () => {
    handleStatusUpdate(true);
  };

  const handleCloseShop = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for closing the shop');
      return;
    }
    handleStatusUpdate(false);
  };

  if (loading) {
    return (
      // 1. Updated loading skeleton to be theme-aware
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    // 2. Updated main container to be theme-aware
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <ToggleRight className="mr-3 h-6 w-6 text-amber-500"/>
        Service Status Management
      </h2>

      {/* Current Status */}
      <div className="mb-6">
        {/* 3. Updated status display to be theme-aware */}
        <div className={`p-4 rounded-lg border-2 ${
          serviceStatus.isOpen 
            ? 'bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-600' 
            : 'bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-600'
        }`}>
          <h3 className={`text-lg font-semibold flex items-center ${
            serviceStatus.isOpen ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            <span className={`mr-2 ${serviceStatus.isOpen ? 'text-green-500' : 'text-red-500'}`}>
              {serviceStatus.isOpen ? '●' : '●'}
            </span>
            {serviceStatus.isOpen ? 'Shop is OPEN' : 'Shop is CLOSED'}
          </h3>
          
          {!serviceStatus.isOpen && serviceStatus.reason && (
            <p className="text-red-700 dark:text-red-200 mt-2">
              <strong>Reason:</strong> {serviceStatus.reason}
            </p>
          )}
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Last updated: {new Date(serviceStatus.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4. Updated status messages to be theme-aware */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4"
        >
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-600 text-green-800 dark:text-green-200 px-4 py-3 rounded mb-4"
        >
          <CheckCircle className="h-5 w-5 inline mr-2" />
          {success}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {serviceStatus.isOpen ? (
          <div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Close Shop</h4>
            <div className="space-y-3">
              {/* 5. Updated textarea to be theme-aware */}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for closing the shop..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none placeholder-gray-500 dark:placeholder-gray-400"
                rows="3"
              />
              {/* 6. Updated button disabled state */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCloseShop}
                disabled={isUpdating || !reason.trim()}
                className={`w-full py-3 px-4 rounded-md font-semibold transition duration-300 ${
                  isUpdating || !reason.trim()
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isUpdating ? 'Closing Shop...' : 'Close Shop'}
              </motion.button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Open Shop</h4>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleOpenShop}
              disabled={isUpdating}
              className={`w-full py-3 px-4 rounded-md font-semibold transition duration-300 ${
                isUpdating
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isUpdating ? 'Opening Shop...' : 'Open Shop'}
            </motion.button>
          </div>
        )}
      </div>

      {/* 7. Updated information box to be theme-aware */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Information
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>When the shop is closed, students cannot place new orders.</li>
          <li>Existing orders in the queue can still be processed.</li>
          <li>Students will see a banner notifying them of the closure.</li>
          <li>You must provide a reason when closing the shop.</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceStatusManagement;