import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User,
  Shield,
  ArrowRight,
  Printer,
  Users,
  BarChart3,
  Clock,
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf6-sDpgArQz0rfE__xtbQIT09llY_Wp8nA&s"
                alt="PrintHub Logo"
                className="h-10 w-10 mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                PrintHub
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
              >
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Welcome to <span className="text-amber-500">PrintHub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Your one-stop solution for campus printing services. Fast, reliable,
            and convenient printing for students and administrators.
          </motion.p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Student Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
                <User className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Student Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload documents, customize print settings, and manage your
                printing orders with ease.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Printer className="h-4 w-4 mr-2 text-amber-500" />
                  Upload and print documents
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Track order status
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <BarChart3 className="h-4 w-4 mr-2 text-amber-500" />
                  View printing history
                </div>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-semibold"
              >
                Get Started as Student
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Admin Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-6">
                <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Admin Portal
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Manage printing services, monitor orders, and oversee system
                operations with comprehensive admin tools.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Users className="h-4 w-4 mr-2 text-amber-500" />
                  Manage user orders
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <BarChart3 className="h-4 w-4 mr-2 text-amber-500" />
                  System analytics
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Shield className="h-4 w-4 mr-2 text-amber-500" />
                  Admin controls
                </div>
              </div>
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-semibold"
              >
                Access Admin Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Why Choose PrintHub?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <Printer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Fast Printing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quick and reliable printing services with high-quality output.
              </p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                24/7 Access
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload and manage your print jobs anytime, anywhere.
              </p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Track Orders
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your printing orders and get real-time updates.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
