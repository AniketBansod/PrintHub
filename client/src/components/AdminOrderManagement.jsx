import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, Download, Calendar, User, DollarSign, FileText, CheckCircle } from "lucide-react"

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompletedOrders()
  }, [])

  const fetchCompletedOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders/status/done", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setOrders(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-amber-400">Completed Orders</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={20} />
            <span>Completed Orders: {orders.length}</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-800 p-8 rounded-lg">
          <CheckCircle size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-lg">No completed orders yet</p>
          <p className="text-sm">Orders will appear here once they are marked as done in the User Management section</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-750 transition-colors border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-amber-400" />
                      <h3 className="text-lg font-semibold text-amber-400">{order.orderId}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-400">User: {order.userId?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-400 font-medium">Completed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Order Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      <span>Total: ₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewOrder(order.orderId)}
                  className="flex items-center gap-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors"
                >
                  <Eye size={16} />
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrderManagement
