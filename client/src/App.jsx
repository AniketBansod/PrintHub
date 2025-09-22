import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ShopClosedPage from "./pages/ShopClosedPage";
import { PricingProvider } from "./context/PricingContext";
import { ThemeProvider } from "./context/ThemeContext";
import OrderDetails from "./components/OrderDetails";
import AdminOrderDetails from "./components/AdminOrderDetails";
import { RazorpayProvider } from "./context/RazorpayContext";
import { NotificationProvider, useNotification } from './context/NotificationContext';
import NotificationContainer from './components/Notification';
import ForgotPassword from "./pages/ForgotPassword";
import AuthSuccess from "./pages/AuthSuccess";

// Import the new generic ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute'; 

// We no longer need the old ProtectedStudentRoute

const AppContent = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* These routes are accessible to everyone */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/student/shop-closed" element={<ShopClosedPage />} />

          {/* --- PROTECTED STUDENT ROUTE --- */}
          {/* This route is only accessible to logged-in users with the 'student' role */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* --- PROTECTED ADMIN ROUTE --- */}
          {/* This route is only accessible to logged-in users with the 'admin' role */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* --- OTHER PROTECTED ROUTES --- */}
          {/* These routes can be configured for specific or multiple roles */}
          <Route 
            path="/order/:orderId" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <OrderDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders/:orderId" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrderDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <NotificationContainer 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
      </div>
    </Router>
  );
};

// The main App component with all the context providers remains the same
const App = () => {
  return (
    <ThemeProvider>
      <PricingProvider>
        <RazorpayProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </RazorpayProvider>
      </PricingProvider>
    </ThemeProvider>
  );
};

export default App;

