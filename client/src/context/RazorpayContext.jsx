import React from 'react';

export const RazorpayContext = React.createContext();

export const RazorpayProvider = ({ children }) => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <RazorpayContext.Provider value={{ loadRazorpayScript }}>
      {children}
    </RazorpayContext.Provider>
  );
}; 