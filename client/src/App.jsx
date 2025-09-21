import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import StudentDashboard from "./pages/StudentDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import ShopClosedPage from "./pages/ShopClosedPage"
import { PricingProvider } from "./context/PricingContext"
import { ThemeProvider } from "./context/ThemeContext"
import OrderDetails from "./components/OrderDetails"
import AdminOrderDetails from "./components/AdminOrderDetails"
import { RazorpayProvider } from "./context/RazorpayContext"
import ServiceStatusBanner from "./components/ServiceStatusBanner"
import ProtectedStudentRoute from "./components/ProtectedStudentRoute"
import { NotificationProvider, useNotification } from './context/NotificationContext';
import NotificationContainer from './components/Notification';

// Inner App component that can use the notification context
const AppContent = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/student/dashboard" element={
            <ProtectedStudentRoute>
              <StudentDashboard />
            </ProtectedStudentRoute>
          } />
          <Route path="/student/shop-closed" element={<ShopClosedPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
        </Routes>
        <NotificationContainer 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
      </div>
    </Router>
  );
};

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
  )
}

export default App
