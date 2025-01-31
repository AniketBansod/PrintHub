import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      // Extract the original filename without the UUID prefix
      const originalFilename = filename.split('-').slice(1).join('-');
      
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/download/${originalFilename}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('File not found on server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show this error to the user
      alert('Error downloading file: ' + error.message);
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

  if (!order) {
    return <div>No order found</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Order Details - {order.orderId}</h2>
      <div className="space-y-4">
        {order.items.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <p><strong>File:</strong> {item.file}</p>
              <p><strong>Copies:</strong> {item.copies}</p>
              <p><strong>Size:</strong> {item.size}</p>
              <p><strong>Color:</strong> {item.color}</p>
              <p><strong>Sides:</strong> {item.sides}</p>
              <p><strong>Pages:</strong> {item.pages}</p>
              <p><strong>Price:</strong> ₹{item.estimatedPrice}</p>
            </div>
            <button
              onClick={() => handleDownload(item.file)}
              className="mt-4 flex items-center gap-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-md hover:bg-amber-400 transition-colors"
            >
              <Download size={16} />
              Download File
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xl font-semibold">Total Amount: ₹{order.totalAmount}</p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 text-amber-500 hover:text-amber-400"
      >
        Back to Orders
      </button>
    </div>
  );
};

export default OrderDetails;