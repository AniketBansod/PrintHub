import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Download, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

const OrderDetails = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrderDetails()
  }, []) // Updated dependency array

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (filename) => {
    try {
      const originalFilename = filename.split("-").slice(1).join("-")

      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/download/${originalFilename}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("File not found on server")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = originalFilename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Error downloading file: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 p-6 text-center bg-red-100 rounded-lg max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-100">No order found</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-bold mb-6 text-amber-400">Order Details - {order.orderId}</h2>
        <div className="space-y-6">
          {order.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <p>
                  <span className="font-semibold text-amber-400">File:</span> {item.file}
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Copies:</span> {item.copies}
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Size:</span> {item.size}
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Color:</span> {item.color}
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Sides:</span> {item.sides}
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Pages:</span> {item.pages}
                </p>
                <p>
                  <span className="font-semibold text-amber-400">Price:</span> ₹{item.estimatedPrice}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(item.file)}
                className="flex items-center gap-2 bg-amber-500 text-gray-900 px-6 py-3 rounded-full hover:bg-amber-400 transition-colors"
              >
                <Download size={18} />
                Download File
              </motion.button>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <p className="text-2xl font-bold text-amber-400">Total Amount: ₹{order.totalAmount}</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="mt-8 flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Orders
        </motion.button>
      </motion.div>
    </div>
  )
}

export default OrderDetails

