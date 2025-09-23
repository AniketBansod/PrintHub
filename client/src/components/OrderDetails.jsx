import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../lib/api";
import { Download, ChevronLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${API}/api/orders/${orderId}`, {
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
        if (!response.ok) throw new Error("File not found on server");
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
        throw new Error("File URL not available");
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
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-800 dark:text-gray-100 p-4">
        <div className="text-center">
            <h2 className="text-2xl font-semibold">Order Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                Go Back
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-amber-400">Order Details</h2>
            <button onClick={() => navigate(-1)} className="flex self-start sm:self-center items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <ChevronLeft size={18} />
                Back to Orders
            </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 -mt-4 break-all">
            ID: {order.orderId}
        </p>

        <div className="space-y-6">
          {order.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <p className="font-semibold text-gray-800 dark:text-amber-400 break-all">{item.originalFilename || item.file}</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mt-2 sm:mt-0">₹{item.estimatedPrice.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Copies:</span> {item.copies}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Size:</span> {item.size}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Color:</span> {item.color}</p>
                <p><span className="font-medium text-gray-500 dark:text-gray-400">Sides:</span> {item.sides}</p>
                <p className="col-span-2"><span className="font-medium text-gray-500 dark:text-gray-400">Pages:</span> {item.pages}</p>
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
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-right"
        >
          <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-amber-400">Total Amount: ₹{order.totalAmount.toFixed(2)}</p>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default OrderDetails;
