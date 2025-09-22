import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { Users, CheckCircle, Info } from 'lucide-react'; // Added icons for UI

const UsersSection = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchQueueOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to view orders');
        }

        const response = await axios.get('http://localhost:5000/api/admin/orders/status/queue', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch queue orders');
        }

        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching queue orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueOrders();
  }, []);

  const handleStatusChange = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: 'done' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Remove the order from the queue list
        setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderId));
        showSuccess('Order status updated to Done!');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showError('Failed to update order status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      // 1. Updated error message to be theme-aware
      <div className="text-red-700 dark:text-red-300 p-4 text-center bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {/* 2. Updated header text colors */}
      <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center">
        <Users className="mr-3 h-6 w-6 text-amber-500"/>
        User Management - Print Queue
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Orders waiting to be processed: {orders.length}</p>
      
      {orders.length === 0 ? (
        // 3. Updated empty state to be theme-aware
        <div className="text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 p-8 rounded-lg">
          <CheckCircle size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg">No orders in the queue</p>
          <p className="text-sm">All orders have been processed!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              {/* 4. Updated table header to be theme-aware */}
              <tr>
                <th scope="col" className="p-4">Student Name</th>
                <th scope="col" className="p-4">Order ID</th>
                <th scope="col" className="p-4">Total Amount</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr 
                  key={order.orderId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  // 5. Updated table row to be theme-aware
                  className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="p-4 text-gray-900 dark:text-white">
                    {order.userId?.name || 'Unknown User'}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{order.orderId}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      In Queue
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(order.orderId)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                      >
                        Mark as Done
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors text-sm font-semibold"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersSection;