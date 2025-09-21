import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

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
      <div className="text-red-500 p-4 text-center bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Management - Print Queue</h2>
      <p className="text-gray-400 mb-4">Orders waiting to be processed: {orders.length}</p>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-800 p-8 rounded-lg">
          <p className="text-lg">No orders in queue</p>
          <p className="text-sm">All orders have been processed!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 border border-gray-700">Student Name</th>
                <th className="p-3 border border-gray-700">Order ID</th>
                <th className="p-3 border border-gray-700">Total Amount</th>
                <th className="p-3 border border-gray-700">Status</th>
                <th className="p-3 border border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr 
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-750 transition-colors"
                >
                  <td className="p-3 border border-gray-700">
                    {order.userId?.name || 'Unknown User'}
                  </td>
                  <td className="p-3 border border-gray-700">{order.orderId}</td>
                  <td className="p-3 border border-gray-700">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="p-3 border border-gray-700">
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-500 text-white">
                      Queue
                    </span>
                  </td>
                  <td className="p-3 border border-gray-700">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(order.orderId)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Mark as Done
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors text-sm"
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