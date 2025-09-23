import { useState, useEffect } from 'react';
import { API } from "../lib/api";

const useServiceStatus = () => {
  const [serviceStatus, setServiceStatus] = useState({
    isOpen: true,
    reason: '',
    updatedAt: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServiceStatus = async () => {
    try {
      setError(null);
      const response = await fetch(`${API}/api/service-status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service status');
      }
      
      const data = await response.json();
      setServiceStatus(data);
    } catch (err) {
      console.error('Error fetching service status:', err);
      setError(err.message);
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

  useEffect(() => {
    fetchServiceStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    serviceStatus,
    loading,
    error,
    refetch: fetchServiceStatus
  };
};

export default useServiceStatus;
