import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"

const OrderHistorySection = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.orderId} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Order Date: {new Date(order.date).toLocaleDateString()}</h3>
              <p>Items: {order.items.join(', ')}</p>
              <p className="text-amber-400 font-bold">Total: {order.total} credits</p>
              <p>Status: {order.status}</p>
              <a href={order.receiptUrl} className="text-blue-400 hover:text-blue-300" download>
                Download Receipt
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistorySection;
  