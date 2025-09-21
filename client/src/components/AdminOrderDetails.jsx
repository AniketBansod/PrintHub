import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Download, ChevronLeft, User, Calendar, FileText } from "lucide-react"
import { motion } from "framer-motion"

const AdminOrderDetails = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [printJobs, setPrintJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      
      setOrder(data)
      setPrintJobs(data.printJobs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileUrl, originalFilename) => {
    try {
      // If it's a Cloudinary URL, download directly
      if (fileUrl && fileUrl.includes('cloudinary.com')) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error("File not found on server");
        }
        
        const blob = await response.blob();
        
        // Determine MIME type based on file extension
        const getMimeType = (filename) => {
          const extension = filename.split('.').pop().toLowerCase();
          const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
          };
          return mimeTypes[extension] || 'application/octet-stream';
        };
        
        // Create blob with correct MIME type
        const mimeType = getMimeType(originalFilename);
        const typedBlob = new Blob([blob], { type: mimeType });
        
        const url = window.URL.createObjectURL(typedBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalFilename; // Use the original filename directly
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (fileUrl && fileUrl.trim() !== '') {
        // If it's not a Cloudinary URL but has a value, show a message
        alert(`File "${fileUrl}" was not uploaded to the server. Please contact the user to re-upload the file.`);
      } else {
        // No file URL available
        throw new Error("File URL not available");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file: " + error.message);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400">Order Details - {order.orderId}</h2>
          <button 
            onClick={() => navigate(-1)}
            className="text-amber-500 hover:text-amber-600 flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Back to Orders
          </button>
        </div>

        {/* Order Information */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-amber-400">Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-amber-400" />
              <div>
                <p className="text-gray-400 text-sm">Customer</p>
                <p className="font-semibold">{order.userId?.name || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{order.userId?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-amber-400" />
              <div>
                <p className="text-gray-400 text-sm">Order Date</p>
                <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-amber-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="font-semibold text-amber-400">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-amber-400">Order Items</h3>
          {order.items && order.items.length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-800 p-8 rounded-lg">
              No items found for this order.
            </div>
          ) : (
            order.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <h4 className="text-lg font-semibold mb-4 text-amber-400">Item #{index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">File:</p>
                    <p className="font-semibold">{item.originalFilename || item.file}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Copies:</p>
                    <p className="font-semibold">{item.copies}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Size:</p>
                    <p className="font-semibold">{item.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Color:</p>
                    <p className="font-semibold">{item.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Sides:</p>
                    <p className="font-semibold">{item.sides}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Pages:</p>
                    <p className="font-semibold">{item.pages}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Page Count:</p>
                    <p className="font-semibold">{item.pageCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Urgency:</p>
                    <p className="font-semibold">{item.urgency || 'Normal'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Printer:</p>
                    <p className="font-semibold">{item.printer || 'Library'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Pickup Time:</p>
                    <p className="font-semibold">
                      {item.pickupTime ? new Date(item.pickupTime).toLocaleString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Price:</p>
                    <p className="font-semibold text-amber-400">₹{item.estimatedPrice}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(item.file, item.originalFilename || item.file)}
                  className="flex items-center gap-2 bg-amber-500 text-gray-900 px-6 py-3 rounded-full hover:bg-amber-400 transition-colors"
                >
                  <Download size={18} />
                  Download File
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminOrderDetails
