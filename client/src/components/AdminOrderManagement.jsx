import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Calendar, User, DollarSign, FileText, CheckCircle } from "lucide-react";

// --- NEW SHIMMER COMPONENT ---
const AdminOrderShimmer = () => {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        {/* Header Shimmer */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
        
        {/* Shimmer for 3 order cards */}
        <div className="grid gap-4 mt-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex items-center gap-6">
                    <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      // Simulate loading for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await fetch("http://localhost:5000/api/admin/orders/status/done", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrders(data);
    } catch (err)
    {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // --- USE SHIMMER COMPONENT ON LOAD ---
  if (loading) {
    return <AdminOrderShimmer />;
  }

  if (error) {
    return (
      <div className="text-red-700 dark:text-red-300 p-6 text-center bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Completed Orders</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
            <CheckCircle size={20} />
            <span>Completed: {orders.length}</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
          <CheckCircle size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No completed orders yet</p>
          <p className="text-sm">Orders will appear here once they are marked as 'done'.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{order.orderId}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-500 dark:text-gray-400">User: {order.userId?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Completed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Order Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      <span>Total: ₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewOrder(order.orderId)}
                  className="flex items-center gap-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors font-semibold"
                >
                  <Eye size={16} />
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;

