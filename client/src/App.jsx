import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import StudentDashboard from "./pages/StudentDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import { PricingProvider } from "./context/PricingContext"
import OrderDetails from "./components/OrderDetails"
import { RazorpayProvider } from "./context/RazorpayContext"

const App = () => {
  return (
    <PricingProvider>
      <RazorpayProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/order/:orderId" element={<OrderDetails />} /> {/* Add this route */}
          </Routes>
        </Router>
      </RazorpayProvider>
    </PricingProvider>
  )
}

export default App
