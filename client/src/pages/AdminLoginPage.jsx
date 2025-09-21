import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, ArrowLeft, AlertCircle } from "lucide-react";
import { useNotification } from "../context/NotificationContext";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Check if user is admin
      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showSuccess("Welcome back, Admin!");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative"
      >
        {/* Back to Home Button */}
        <Link
          to="/"
          className="absolute -top-16 left-0 flex items-center text-gray-300 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
            <Shield className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Admin Portal</h1>
          <p className="text-gray-300">Secure access to PrintEase management</p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg flex items-center"
          >
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="admin@printease.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-lg"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Sign In to Admin Portal"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm">
            Need admin access?{" "}
            <Link
              to="/admin/register"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200"
            >
              Request Admin Account
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
             This is a secure admin portal. All activities are logged and monitored.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
