import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Save the token from the URL to local storage
      localStorage.setItem('token', token);
      
      // Redirect the user to their dashboard
      // You might want to fetch the user profile here to decide
      // between student/admin dashboard if needed in the future.
      navigate('/student/dashboard');
    } else {
      // If no token is found, redirect to login with an error
      console.error("Google authentication failed: No token received.");
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
      <h1 className="text-xl font-semibold">Authenticating</h1>
      <p className="text-gray-400">Please wait while we sign you in...</p>
    </div>
  );
};

export default AuthSuccess;
