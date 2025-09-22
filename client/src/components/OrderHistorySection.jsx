import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, DollarSign, FileText, Clock, AlertCircle } from "lucide-react";

// --- Responsive Shimmer Component ---
const OrderHistoryShimmer = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="animate-pulse">
        {/* Header Shimmer */}
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>

        {/* Shimmer for 2 order cards */}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <div className="h-6 w-3/5 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
                <div className="h-6 w-1/4 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              </div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded-md mb-4"></div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-3">
                <div className="h-5 w-1/4 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between">
                  <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
                  <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderHistorySection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Please login to view orders');

        const response = await fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <OrderHistoryShimmer />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="text-red-700 dark:text-red-300 p-4 text-center bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-semibold mb-2">Error Loading History</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
          <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Order History</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-medium mb-2">No orders found</p>
          <p className="text-sm">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
                    Order #{order.orderId}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium self-start sm:self-center ${
                  order.status === 'done' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  order.status === 'queue' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>Ordered on: {new Date(order.orderDate).toLocaleString()}</span>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                      <p className="text-gray-900 dark:text-gray-100 font-medium break-all">{item.originalFilename || item.file}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600 dark:text-gray-400 pl-6">
                      <p>Copies: {item.copies}</p>
                      <p>Size: {item.size || item.paperSize}</p>
                      <p>Color: {item.color}</p>
                      <p>Sides: {item.sides}</p>
                    </div>
                    <div className="mt-2 flex items-center text-amber-600 dark:text-amber-400 pl-6">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold">Price: ₹{item.price ? item.price.toFixed(2) : (item.estimatedPrice ? item.estimatedPrice.toFixed(2) : 'N/A')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-base">Total Amount:</span>
                  <div className="flex items-center text-xl font-semibold text-amber-600 dark:text-amber-400">
                    <DollarSign className="h-5 w-5 mr-1" />
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistorySection;

