import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Printer, Clock, FileText, Settings, User, LogOut, Cloud, ShoppingCart, History } from "lucide-react"
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
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center bg-red-100 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No orders found. Your order history will appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-amber-400">
                  Order #{order.orderId}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'completed' ? 'bg-green-500' :
                  order.status === 'processing' ? 'bg-amber-500' :
                  order.status === 'cancelled' ? 'bg-red-500' :
                  'bg-blue-500'
                } text-white`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                Ordered on: {new Date(order.orderDate).toLocaleString()}
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border-t border-gray-700 pt-4">
                    <p className="text-white">{item.file}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-400">
                      <p>Copies: {item.copies}</p>
                      <p>Size: {item.size}</p>
                      <p>Color: {item.color}</p>
                      <p>Sides: {item.sides}</p>
                    </div>
                    <p className="mt-2 text-amber-400">
                      Price: ₹{item.estimatedPrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-lg font-semibold text-amber-400">
                  Total Amount: ₹{order.totalAmount.toFixed(2)}
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
  