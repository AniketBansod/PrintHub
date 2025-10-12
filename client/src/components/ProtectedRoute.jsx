import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // We need a library to decode the JWT
import useServiceStatus from "../hooks/useServiceStatus";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Service status is checked globally here to gate student routes when shop is closed
  const { serviceStatus, loading } = useServiceStatus();
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // If no token exists, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the token to get user information (like their role)
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    // If the user is a student and the shop is closed, redirect to the Shop Closed page
    if (userRole === "student") {
      // While service status is loading, avoid flashing the protected UI
      if (loading) {
        return null; // or a small loader component if you prefer
      }
      if (serviceStatus && serviceStatus.isOpen === false) {
        return (
          <Navigate
            to="/student/shop-closed"
            replace
            state={{ from: location }}
          />
        );
      }
    }

    // Check if the user's role is in the list of allowed roles for this route
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // If the role is not allowed, redirect them.
      // For example, a student trying to access an admin page.
      if (userRole === "student") {
        return <Navigate to="/student/dashboard" replace />;
      }
      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      // Fallback redirect
      return <Navigate to="/" replace />;
    }

    // If everything is fine, render the component they were trying to access
    return children;
  } catch (error) {
    // If the token is invalid or expired, clear it and redirect to login
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
