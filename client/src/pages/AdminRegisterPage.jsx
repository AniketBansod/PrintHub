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
  Key,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext"; // theme context

const AdminRegisterPage = () => {
  const { theme } = useTheme(); // get current theme (light/dark)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.adminKey.trim()) newErrors.adminKey = "Admin key is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API}/api/auth/admin-register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            adminKey: formData.adminKey,
            role: "admin",
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Admin registration failed");
      showSuccess("Admin account created successfully!");
      navigate("/admin/login");
    } catch (error) {
      showError(error.message || "Admin registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Theme-based classes
  const bgClass = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-900";
  const placeholderColor = theme === "dark" ? "placeholder-gray-500" : "placeholder-gray-400";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-300";

  return (
    <div className={`min-h-screen ${bgClass} flex justify-center items-center p-4 relative`}>
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          to="/"
          className={`flex items-center ${textColor} hover:text-amber-500 transition-colors duration-200`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${cardBg} p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md`}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
            <Shield className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">
            Admin Registration
          </h1>
          <p className={`${textColor}`}>Create your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textColor}`}>Full Name</label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${placeholderColor}`} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 ${cardBg} border rounded-lg ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${errors.name ? "border-red-500" : borderColor}`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textColor}`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${placeholderColor}`} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 ${cardBg} border rounded-lg ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${errors.email ? "border-red-500" : borderColor}`}
                placeholder="admin@printhub.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textColor}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${placeholderColor}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 ${cardBg} border rounded-lg ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${errors.password ? "border-red-500" : borderColor}`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${placeholderColor} hover:text-gray-400 transition-colors duration-200`}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textColor}`}>Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${placeholderColor}`} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 ${cardBg} border rounded-lg ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? "border-red-500" : borderColor}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${placeholderColor} hover:text-gray-400 transition-colors duration-200`}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
          </div>

          {/* Admin Key */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textColor}`}>Admin Key</label>
            <div className="relative">
              <Key className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${placeholderColor}`} />
              <input
                type="password"
                value={formData.adminKey}
                onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 ${cardBg} border rounded-lg ${textColor} ${placeholderColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${errors.adminKey ? "border-red-500" : borderColor}`}
                placeholder="Enter admin key"
              />
            </div>
            {errors.adminKey && <p className="mt-1 text-sm text-red-400">{errors.adminKey}</p>}
            <p className={`mt-1 text-xs ${placeholderColor}`}>
              Contact system administrator for the admin key.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? `bg-gray-600 cursor-not-allowed ${textColor}`
                : "bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-lg"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2`}></div>
                Creating Account...
              </div>
            ) : (
              "Create Admin Account"
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className={`${textColor} text-sm`}>
            Already have an admin account?{" "}
            <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className={`text-xs ${placeholderColor}`}>
            🔒 Admin accounts require special authorization and are monitored.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRegisterPage;
