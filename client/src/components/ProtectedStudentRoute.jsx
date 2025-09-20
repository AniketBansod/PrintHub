import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useServiceStatus from '../hooks/useServiceStatus';

const ProtectedStudentRoute = ({ children }) => {
  const { serviceStatus, loading } = useServiceStatus();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure service status is loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [serviceStatus]);

  // Show loading while checking service status
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking service status...</p>
        </div>
      </div>
    );
  }

  // If shop is closed, redirect to shop closed page
  if (!serviceStatus.isOpen) {
    return <Navigate to="/student/shop-closed" replace />;
  }

  // If shop is open, render the protected component
  return children;
};

export default ProtectedStudentRoute;
