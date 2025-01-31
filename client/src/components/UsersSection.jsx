import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsersSection = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to view orders');
        }

        const response = await axios.get('http://localhost:5000/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch orders');
        }

        const ordersData = response.data;
        const initialStatus = {};
        ordersData.forEach(order => {
          initialStatus[order.orderId] = 'Queue';
        });

        setOrders(ordersData);
        setStatus(initialStatus);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = (orderId) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [orderId]: prevStatus[orderId] === 'Queue' ? 'Done' : 'Queue',
    }));
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
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 border border-gray-700">Student ID</th>
            <th className="p-2 border border-gray-700">Order ID</th>
            <th className="p-2 border border-gray-700">Total Amount</th>
            <th className="p-2 border border-gray-700">Status</th>
            <th className="p-2 border border-gray-700">View Doc</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td className="p-2 border border-gray-700">{order.userId}</td>
              <td className="p-2 border border-gray-700">{order.orderId}</td>
              <td className="p-2 border border-gray-700">₹{order.totalAmount.toFixed(2)}</td>
              <td className="p-2 border border-gray-700">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    status[order.orderId] === 'Done' ? 'bg-green-500' : 'bg-blue-500'
                  } text-white`}
                  onClick={() => handleStatusChange(order.orderId)}
                >
                  {status[order.orderId]}
                </button>
              </td>
              <td className="p-2 border border-gray-700">
                <button
                  className="text-blue-500 underline"
                  onClick={() => navigate(`/order/${order.orderId}`)}
                >
                  View Doc
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersSection;