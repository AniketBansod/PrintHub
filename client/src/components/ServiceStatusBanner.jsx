import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ServiceStatusBanner = () => {
  const [serviceStatus, setServiceStatus] = useState({
    isOpen: true,
    reason: '',
    updatedAt: new Date()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/service-status');
        const data = await response.json();
        setServiceStatus(data);
      } catch (error) {
        console.error('Error fetching service status:', error);
        // Default to open if there's an error
        setServiceStatus({
          isOpen: true,
          reason: '',
          updatedAt: new Date()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServiceStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 text-center">
        <div className="animate-pulse">Checking service status...</div>
      </div>
    );
  }

  if (serviceStatus.isOpen) {
    return null; // Don't show banner when shop is open
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-600 text-white p-4 text-center shadow-lg"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold">Service Temporarily Unavailable</h2>
        </div>
        
        <p className="text-lg mb-2">
          🚫 PrintHub is currently closed
        </p>
        
        {serviceStatus.reason && (
          <div className="bg-red-700 rounded-lg p-3 mb-2">
            <p className="font-semibold">Reason:</p>
            <p className="text-red-100">{serviceStatus.reason}</p>
          </div>
        )}
        
        <p className="text-sm text-red-200">
          Last updated: {new Date(serviceStatus.updatedAt).toLocaleString()}
        </p>
        
        <p className="text-sm text-red-200 mt-2">
          Please check back later or contact us for more information.
        </p>
      </div>
    </motion.div>
  );
};

export default ServiceStatusBanner;
