import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Mail, KeyRound, Lock } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Optionally prefill email if passed from login page
  React.useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("OTP verified. Set your new password.");
      setStep(3);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h2>
          <p className="text-gray-600 dark:text-gray-300">Reset your password in three easy steps.</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-900/40 border border-green-500/30 rounded-lg text-green-300 text-sm text-center">
            {success}
          </div>
        )}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter the OTP sent to your email"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        <div className="mt-8 text-center">
          <button onClick={() => navigate("/login")}
            className="text-amber-500 hover:underline text-sm font-medium">
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
