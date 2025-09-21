import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History, Calendar, DollarSign } from "lucide-react"
import { usePricing } from "../context/PricingContext.jsx"

const OrderHistorySection = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Please login to view orders')
        }

        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch orders')
        }

        const data = await response.json()
        console.log('Fetched orders:', data) // Debug log
        setOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-red-600 dark:text-red-400 p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
          <p className="text-sm">Your order history will appear here once you place your first order.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order #{order.orderId}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  order.status === 'processing' ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' :
                  order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                  'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Ordered on: {new Date(order.orderDate).toLocaleString()}
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{item.originalFilename || item.file}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>Copies: {item.copies}</p>
                      <p>Size: {item.size}</p>
                      <p>Color: {item.color}</p>
                      <p>Sides: {item.sides}</p>
                    </div>
                    <div className="mt-2 flex items-center text-amber-600 dark:text-amber-400">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Price: ₹{item.estimatedPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Total Amount:</span>
                  <div className="flex items-center text-lg font-semibold text-amber-600 dark:text-amber-400">
                    <DollarSign className="h-5 w-5 mr-1" />
                    ₹{order.totalAmount.toFixed(2)}
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

export default OrderHistorySection
  