import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../slices/printJobSlice";
import { useNavigate } from "react-router-dom";
import { RazorpayContext } from "../context/RazorpayContext";
import { usePricing } from "../context/PricingContext";
import useServiceStatus from "../hooks/useServiceStatus";

const CartSection = () => {
  const { loadRazorpayScript } = useContext(RazorpayContext);
  const { serviceStatus } = useServiceStatus();
  const { priceSettings, loading: pricingLoading, error: pricingError } = usePricing();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartRedux = useSelector((state) => state.printJobs.cart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError("");

      // Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        setError("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Calculate total with dynamic GST
      const subtotal = cartRedux.reduce((sum, item) => sum + item.price, 0);
      const gstAmount = (subtotal * priceSettings.gstPercentage) / 100;
      const totalAmount = subtotal + gstAmount;

      // Create order in your backend
      const response = await fetch("http://localhost:5000/api/orders", {
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

      // Initialize Razorpay payment
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: (totalAmount * 100).toFixed(0), // Convert to paise
        currency: "INR",
        name: "PrintEase",
        description: "Print Job Payment",
        order_id: orderData.orderId,
        handler: async function (response) {
          // Payment successful
          try {
            await fetch(
              `http://localhost:5000/api/orders/${orderData.orderId}/payment`,
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

            // Clear cart after successful payment
            dispatch(clearCart());
            navigate("/student/dashboard");
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

  // Show loading state if pricing is still loading
  if (pricingLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shopping Cart</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
          <span className="text-gray-300">Loading pricing information...</span>
        </div>
      </div>
    );
  }

  // Show error state if pricing failed to load
  if (pricingError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shopping Cart</h2>
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded">
          <p>Error loading pricing information: {pricingError}</p>
          <p className="text-sm mt-2">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  if (cartRedux.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shopping Cart</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-4">Your cart is empty</div>
          <p className="text-gray-500">
            Add some print jobs to get started!
          </p>
        </div>
      </div>
    );
  }

  // Calculate total cost with dynamic pricing
  const subtotal = cartRedux.reduce((sum, item) => sum + item.price, 0);
  const gstAmount = (subtotal * priceSettings.gstPercentage) / 100;
  const totalCost = subtotal + gstAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shopping Cart</h2>
      
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {cartRedux.map((item) => (
          <div
            key={item.id}
            className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-100">{item.originalFilename || item.file}</h3>
              <div className="text-sm text-gray-300 mt-1">
                <div>Pages: {item.pages}</div>
                <div>Copies: {item.copies}</div>
                <div>Color: {item.color}</div>
                <div>Sides: {item.sides}</div>
                <div>Paper Size: {item.paperSize}</div>
                <div>Urgency: {item.urgency}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-bold text-amber-400">
                  ₹{item.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  {item.pageCount} pages × {item.copies} copies
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-400 hover:text-red-300 p-2"
              >
                Remove
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">
              Items ({cartRedux.length})
            </span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">GST ({priceSettings.gstPercentage}%)</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-600 my-4"></div>
          <div className="flex justify-between text-lg font-bold text-amber-400">
            <span>Total Amount</span>
            <span>₹{totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <motion.button
        whileHover={{ scale: serviceStatus.isOpen ? 1.05 : 1 }}
        whileTap={{ scale: serviceStatus.isOpen ? 0.95 : 1 }}
        onClick={handlePayment}
        disabled={isProcessing || !serviceStatus.isOpen}
        className={`w-full ${
          isProcessing || !serviceStatus.isOpen
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-400"
        } text-gray-900 py-3 px-4 rounded-md transition duration-300 ease-in-out shadow-lg font-semibold`}
      >
        {!serviceStatus.isOpen
          ? "Service Unavailable"
          : isProcessing
          ? "Processing..."
          : `Proceed to Payment (₹${totalCost.toFixed(2)})`}
      </motion.button>
    </div>
  );
};

export default CartSection;
