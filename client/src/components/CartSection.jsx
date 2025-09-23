import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../slices/printJobSlice";
import { useNavigate } from "react-router-dom";
import { RazorpayContext } from "../context/RazorpayContext";
import { usePricing } from "../context/PricingContext";
import useServiceStatus from "../hooks/useServiceStatus";
import { ShoppingCart, Trash2, AlertCircle } from "lucide-react";
import { API } from "../lib/api";

// --- Responsive Shimmer Component ---
const CartShimmer = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    {/* Shimmer for 2 cart items */}
    {[...Array(2)].map((_, i) => (
      <div key={i} className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    ))}
    {/* Summary Shimmer */}
    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
      <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
      <div className="h-5 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
      <div className="h-5 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
    </div>
    {/* Button Shimmer */}
    <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </div>
);


const CartSection = () => {
  const { loadRazorpayScript } = useContext(RazorpayContext);
  const { serviceStatus } = useServiceStatus();
  const {
    priceSettings,
    loading: pricingLoading,
    error: pricingError,
  } = usePricing();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartRedux = useSelector((state) => state.printJobs.cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError("");
      const res = await loadRazorpayScript();
      if (!res) {
        setError("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }
      const subtotal = cartRedux.reduce((sum, item) => sum + item.price, 0);
      const gstAmount = (subtotal * priceSettings.gstPercentage) / 100;
      const totalAmount = subtotal + gstAmount;
      const response = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          items: cartRedux,
          totalAmount: totalAmount,
        }),
      });
      const orderData = await response.json();
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: (totalAmount * 100).toFixed(0),
        currency: "INR",
        name: "PrintHub",
        description: "Print Job Payment",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await fetch(
              `${API}/api/orders/${orderData.orderId}/payment`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                }),
              }
            );
            dispatch(clearCart());
            navigate("/student/dashboard"); // Consider navigating to an order confirmation page
          } catch (error) {
            setError("Error updating payment status");
          }
        },
        prefill: {
          name: "Student",
          email: "student@example.com",
        },
        theme: {
          color: "#F59E0B",
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      setError(error.message || "Error processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  if (pricingLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <CartShimmer />
      </div>
    );
  }

  if (pricingError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="text-red-700 dark:text-red-300 p-4 text-center bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <h3 className="font-semibold mb-2">Error Loading Pricing</h3>
            <p className="text-sm">Could not load pricing information. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  if (cartRedux.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <ShoppingCart /> Shopping Cart
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-4">Your cart is empty</div>
          <p className="text-gray-500">Add some print jobs to get started!</p>
        </div>
      </div>
    );
  }

  const subtotal = cartRedux.reduce((sum, item) => sum + item.price, 0);
  const gstAmount = (subtotal * priceSettings.gstPercentage) / 100;
  const totalCost = subtotal + gstAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
        <ShoppingCart /> Shopping Cart
      </h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {cartRedux.map((item) => (
          <div
            key={item.id}
            className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-all">
                {item.originalFilename || item.file}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <span>Pages: {item.pages}</span>
                <span>Copies: {item.copies}</span>
                <span>Color: {item.color}</span>
                <span>Sides: {item.sides}</span>
                <span>Size: {item.paperSize}</span>
                <span>Urgency: {item.urgency}</span>
              </div>
            </div>
            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2">
              <div className="text-right">
                <div className="text-lg font-bold text-amber-500 dark:text-amber-400">
                  ₹{item.price.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.pageCount} pages × {item.copies} copies
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Remove Item"
              >
                <Trash2 size={20} />
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Order Summary
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <div className="flex justify-between">
            <span>Subtotal ({cartRedux.length} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({priceSettings.gstPercentage}%)</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-amber-400">
            <span>Total Amount</span>
            <span>₹{totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: serviceStatus.isOpen ? 1.02 : 1 }}
        whileTap={{ scale: serviceStatus.isOpen ? 0.98 : 1 }}
        onClick={handlePayment}
        disabled={isProcessing || !serviceStatus.isOpen}
        className={`w-full text-center py-3 px-4 rounded-md transition duration-300 ease-in-out shadow-lg font-semibold ${
          isProcessing || !serviceStatus.isOpen
            ? "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-600 text-gray-900"
        }`}
      >
        {!serviceStatus.isOpen
          ? "Service Currently Unavailable"
          : isProcessing
          ? "Processing..."
          : `Proceed to Payment (₹${totalCost.toFixed(2)})`}
      </motion.button>
    </div>
  );
};

export default CartSection;
