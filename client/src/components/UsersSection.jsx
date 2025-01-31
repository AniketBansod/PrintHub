import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const UsersSection = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    '12345678': 'Queued', // Example initial status for a user
    // Add more user IDs and their initial statuses as needed
  });

  const handleStatusChange = (id, newStatus) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [id]: newStatus,
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 border border-gray-700">Name</th>
            <th className="p-2 border border-gray-700">Student ID</th>
            <th className="p-2 border border-gray-700">Orders</th>
            <th className="p-2 border border-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-gray-700">John Doe</td>
            <td className="p-2 border border-gray-700">12345678</td>
            <td className="p-2 border border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/orders/john-doe")}
                className="text-amber-400 hover:text-amber-300"
              >
                View Order
              </motion.button>
            </td>
            <td className="p-2 border border-gray-700">
              <select
                value={status['12345678']}
                onChange={(e) => handleStatusChange('12345678', e.target.value)}
                className="bg-gray-700 text-gray-100 rounded-md"
              >
                <option value="Queued">Queued</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
              </select>
            </td>
          </tr>
          {/* Add more user rows as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default UsersSection; 