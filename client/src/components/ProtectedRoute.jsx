import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // We need a library to decode the JWT

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token exists, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the token to get user information (like their role)
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    // Check if the user's role is in the list of allowed roles for this route
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // If the role is not allowed, redirect them.
      // For example, a student trying to access an admin page.
      if (userRole === 'student') {
        return <Navigate to="/student/dashboard" replace />;
      }
      if (userRole === 'admin') {
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
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
