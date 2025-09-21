import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Key
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";

const AdminRegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: Admin verification, 3: Complete
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.adminKey.trim()) {
      newErrors.adminKey = "Admin key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/admin-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminKey: formData.adminKey,
          role: "admin"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin registration failed");
      }

      showSuccess("Admin account created successfully!");
      navigate("/admin/login");
    } catch (error) {
      showError(error.message || "Admin registration failed");
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
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Admin Registration</h1>
          <p className="text-gray-300">Create your admin account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-amber-500 text-gray-900' : 'bg-gray-600 text-gray-300'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-amber-500' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-amber-500 text-gray-900' : 'bg-gray-600 text-gray-300'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="admin@printease.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={formData.adminKey}
                onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                  errors.adminKey ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter admin key"
              />
            </div>
            {errors.adminKey && <p className="mt-1 text-sm text-red-400">{errors.adminKey}</p>}
            <p className="mt-1 text-xs text-gray-400">
              Contact system administrator for the admin key. The admin key is configured in environment variables for security.
            </p>
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
                Creating Account...
              </div>
            ) : (
              "Create Admin Account"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm">
            Already have an admin account?{" "}
            <Link
              to="/admin/login"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            🔒 Admin accounts require special authorization and are monitored for security.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRegisterPage;
