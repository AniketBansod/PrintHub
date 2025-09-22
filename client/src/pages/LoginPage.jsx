import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, ArrowLeft, AlertCircle } from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-6.627 0-12-5.373-12-12h-8c0 11.045 8.955 20 20 20z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.434 36.316 48 30.659 48 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-4 relative">
      {/* Top-left Back button (desktop/tablet) */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 hidden sm:block">
        <Link
          to="/"
          className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Mobile Back button (fixed bottom) */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center justify-center py-3 bg-gray-800 text-gray-100 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
            <User className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">
            Student Portal
          </h1>
          <p className="text-gray-300">
            Sign in to access your PrintHub account
          </p>
        </div>
        
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Student Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="student@printhub.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
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
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-amber-400 hover:underline text-sm"
              onClick={() => navigate("/forgot-password", { state: { email } })}
            >
              Forgot password?
            </button>
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
              "Sign In to Student Portal"
            )}
          </motion.button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <a
          href="http://localhost:5000/api/auth/google"
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition duration-300 bg-gray-700 hover:bg-gray-600 text-white"
        >
          <GoogleIcon />
          Sign in with Google
        </a>

        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

