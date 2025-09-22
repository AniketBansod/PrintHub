import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, RefreshCw, LogOut, Menu, X } from 'lucide-react';
import useServiceStatus from '../hooks/useServiceStatus';

const ShopClosedPage = () => {
  const { serviceStatus, loading, refetch } = useServiceStatus();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Redirect to dashboard if shop opens
  useEffect(() => {
    if (!loading && serviceStatus.isOpen) {
      navigate('/student/dashboard');
    }
  }, [serviceStatus.isOpen, loading, navigate]);

  // Calculate time since last update
  useEffect(() => {
    if (serviceStatus.updatedAt) {
      const updateTime = new Date(serviceStatus.updatedAt);
      const now = new Date();
      const diffMs = now - updateTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffHours > 0) {
        setTimeLeft(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`);
      } else if (diffMins > 0) {
        setTimeLeft(`${diffMins} minute${diffMins > 1 ? 's' : ''} ago`);
      } else {
        setTimeLeft('Just now');
      }
    }
  }, [serviceStatus.updatedAt]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking service status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* --- Responsive Header --- */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf6-sDpgArQz0rfE__xtbQIT09llY_Wp8nA&s"
                alt="PrintHub Logo"
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-amber-400">PrintHub</h1>
            </div>
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </motion.button>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <motion.button onClick={handleRefresh} className="w-full flex items-center px-4 py-2 text-left bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </motion.button>
              <motion.button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-left bg-red-600 text-white rounded-md hover:bg-red-700">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* --- Responsive Main Content --- */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-red-900 rounded-full border-4 border-red-600">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-bold text-red-400 mb-4"
          >
            Service Temporarily Unavailable
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-300 mb-8"
          >
            PrintHub is currently closed
          </motion.p>

          {serviceStatus.reason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-red-900 border border-red-600 rounded-lg p-4 sm:p-6 mb-8 max-w-2xl mx-auto"
            >
              <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Reason for Closure
              </h3>
              <p className="text-red-200 text-base sm:text-lg leading-relaxed">
                {serviceStatus.reason}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-400">Last Updated</span>
            </div>
            <p className="text-gray-300 text-base sm:text-lg">
              {new Date(serviceStatus.updatedAt).toLocaleString()}
            </p>
            {timeLeft && (
              <p className="text-gray-500 text-sm mt-2">
                ({timeLeft})
              </p>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ShopClosedPage;

