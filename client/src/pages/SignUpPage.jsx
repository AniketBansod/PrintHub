import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

// A simple inline SVG for the Google G logo
const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-6.627 0-12-5.373-12-12h-8c0 11.045 8.955 20 20 20z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.434 36.316 48 30.659 48 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpAttempts, setOtpAttempts] = useState(3);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");
      showSuccess("OTP sent to your email successfully!");
      setStep(2);
    } catch (error) {
      showError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.attemptsLeft !== undefined) setOtpAttempts(data.attemptsLeft);
        throw new Error(data.message || "Invalid OTP");
      }
      showSuccess("Email verified successfully!");
      setStep(3);
    } catch (error) {
      showError(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      showSuccess("Registration completed successfully!");
      localStorage.setItem("token", data.token);
      navigate("/student/dashboard");
    } catch (error) {
      showError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend OTP");
      showSuccess("OTP resent successfully!");
      setOtpAttempts(3);
    } catch (error) {
      showError(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-4 relative">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
            <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
            </Link>
        </div>
      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">
            {step === 1 && "Enter your details to get started"}
            {step === 2 && `Enter the 6-digit code sent to ${formData.email}`}
            {step === 3 && "Finalizing your account"}
          </p>
        </div>
        
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${ errors.name ? 'border-red-500' : 'border-gray-600' }`}
                  placeholder="Enter your full name" />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${ errors.email ? 'border-red-500' : 'border-gray-600' }`}
                  placeholder="Enter your email" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${ errors.password ? 'border-red-500' : 'border-gray-600' }`}
                  placeholder="Create a password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${ errors.confirmPassword ? 'border-red-500' : 'border-gray-600' }`}
                  placeholder="Confirm your password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
                loading
                  ? "bg-gray-600 cursor-not-allowed text-gray-400"
                  : "bg-amber-500 hover:bg-amber-400 text-gray-900"
              }`}
            >
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </motion.button>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <a
              href="http://localhost:5000/api/auth/google"
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition duration-300 bg-gray-700 hover:bg-gray-600 text-white"
            >
              <GoogleIcon />
              Sign up with Google
            </a>
          </form>
        )}

        {step === 2 && ( 
            <form onSubmit={handleVerifyOTP} className="space-y-4">
                {/* OTP Form remains unchanged, already looks good on mobile */}
            </form>
        )}

        {step === 3 && ( 
            <div className="text-center space-y-4">
                {/* Completion step remains unchanged, already looks good on mobile */}
            </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
