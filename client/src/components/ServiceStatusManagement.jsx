import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useServiceStatus from '../hooks/useServiceStatus';

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
      
      // Clear success message after 3 seconds
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
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center">
        <span className="mr-3">
          {serviceStatus.isOpen ? (
            <span className="text-green-500">🟢</span>
          ) : (
            <span className="text-red-500">🔴</span>
          )}
        </span>
        Service Status Management
      </h2>

      {/* Current Status */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg border-2 ${
          serviceStatus.isOpen 
            ? 'bg-green-900 border-green-600' 
            : 'bg-red-900 border-red-600'
        }`}>
          <h3 className={`text-lg font-semibold ${
            serviceStatus.isOpen ? 'text-green-300' : 'text-red-300'
          }`}>
            {serviceStatus.isOpen ? '🟢 Shop is OPEN' : '🔴 Shop is CLOSED'}
          </h3>
          
          {!serviceStatus.isOpen && serviceStatus.reason && (
            <p className="text-red-200 mt-2">
              <strong>Reason:</strong> {serviceStatus.reason}
            </p>
          )}
          
          <p className="text-gray-400 text-sm mt-2">
            Last updated: {new Date(serviceStatus.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-4"
        >
          {success}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {serviceStatus.isOpen ? (
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-3">Close Shop</h4>
            <div className="space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for closing the shop..."
                className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none placeholder-gray-400"
                rows="3"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseShop}
                disabled={isUpdating || !reason.trim()}
                className={`w-full py-3 px-4 rounded-md font-semibold transition duration-300 ${
                  isUpdating || !reason.trim()
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isUpdating ? 'Closing Shop...' : 'Close Shop'}
              </motion.button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-3">Open Shop</h4>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenShop}
              disabled={isUpdating}
              className={`w-full py-3 px-4 rounded-md font-semibold transition duration-300 ${
                isUpdating
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isUpdating ? 'Opening Shop...' : 'Open Shop'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded-lg">
        <h4 className="font-semibold text-blue-200 mb-2">ℹ️ Information</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• When shop is closed, students cannot place new orders</li>
          <li>• Existing orders will continue to be processed</li>
          <li>• Students will see a notification about the shop closure</li>
          <li>• You must provide a reason when closing the shop</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceStatusManagement;
