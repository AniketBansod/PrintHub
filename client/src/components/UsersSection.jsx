import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsersSection = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({
    '12345678': 'Queued', // Example initial status for a user
    // Add more user IDs and their initial statuses as needed
  });

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

        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [id]: newStatus,
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
            <th className="p-2 border border-gray-700">User Name</th>
            <th className="p-2 border border-gray-700">Email</th>
            <th className="p-2 border border-gray-700">Order ID</th>
            <th className="p-2 border border-gray-700">Total Amount</th>
            <th className="p-2 border border-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
      {orders.map((order) => (
        <tr key={order.orderId}>
          <td className="p-2 border border-gray-700">{order.userId.name}</td>
          <td className="p-2 border border-gray-700">{order.userId}</td>
          <td className="p-2 border border-gray-700">{order.orderId}</td>
          <td className="p-2 border border-gray-700">₹{order.totalAmount.toFixed(2)}</td>
          <td className="p-2 border border-gray-700">
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'completed' ? 'bg-green-500' :
              order.status === 'processing' ? 'bg-amber-500' :
              order.status === 'cancelled' ? 'bg-red-500' :
              'bg-blue-500'
            } text-white`}>
              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
            </span>
          </td>
        </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
};

export default UsersSection;