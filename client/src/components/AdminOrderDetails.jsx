import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../lib/api";
import { Download, ChevronLeft, User, Calendar, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API}/api/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    fetchOrderDetails();
  }, [orderId]);

  const handleDownload = async (fileUrl, originalFilename) => {
    try {
      if (fileUrl && fileUrl.includes('cloudinary.com')) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error("File not found on server");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalFilename || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("File URL not available or invalid.");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-red-700 dark:text-red-300 p-6 text-center bg-red-100 dark:bg-red-900/30 rounded-lg max-w-md border border-red-300 dark:border-red-700">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Fetching Order</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-800 dark:text-gray-100">No order found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-amber-400 truncate">
            Order Details
          </h2>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
            Back to Orders
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 -mt-4">
            Order ID: {order.orderId}
        </p>

        {/* Order Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-amber-400">Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <User size={20} className="text-amber-500 mt-1" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Customer</p>
                <p className="font-semibold">{order.userId?.name || 'N/A'}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{order.userId?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-amber-500 mt-1" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Order Date</p>
                <p className="font-semibold">{new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-amber-500 mt-1" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Amount</p>
                <p className="font-semibold text-amber-500 dark:text-amber-400">₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-amber-400">Order Items</h3>
          {order.items && order.items.length === 0 ? (
            <div className="text-center text-gray-500 bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
              No items found for this order.
            </div>
          ) : (
            order.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-amber-400">
                        {item.originalFilename || item.file}
                    </h4>
                    <p className="font-semibold text-amber-500 dark:text-amber-400 text-lg mt-2 md:mt-0">
                        Price: ₹{item.estimatedPrice.toFixed(2)}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Copies</p>
                    <p className="font-semibold">{item.copies}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Size</p>
                    <p className="font-semibold">{item.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Color</p>
                    <p className="font-semibold">{item.color}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Sides</p>
                    <p className="font-semibold">{item.sides}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Pages</p>
                    <p className="font-semibold">{item.pages}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Page Count</p>
                    <p className="font-semibold">{item.pageCount}</p>
                  </div>
                   <div>
                    <p className="text-gray-500 dark:text-gray-400">Urgency</p>
                    <p className="font-semibold">{item.urgency || 'Normal'}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-500 dark:text-gray-400">Pickup Time</p>
                    <p className="font-semibold">
                      {item.pickupTime ? new Date(item.pickupTime).toLocaleString() : 'Not specified'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(item.file, item.originalFilename || item.file)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors font-semibold"
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
  );
};

export default AdminOrderDetails;
