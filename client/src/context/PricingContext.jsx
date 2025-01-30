import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for pricing
const PricingContext = createContext();

// Custom hook to use the PricingContext
export const usePricing = () => useContext(PricingContext);

// Provider component
export const PricingProvider = ({ children }) => {
  const [priceSettings, setPriceSettings] = useState({ blackWhite: 1.0, color: 2.0 });

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pricing");
        const data = await response.json();
        if (response.ok) {
          setPriceSettings(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch pricing settings:", error);
      }
    };

    fetchPricing();
  }, []);

  

  return (
    <PricingContext.Provider value={{ priceSettings, setPriceSettings }}>
      {children}
    </PricingContext.Provider>
  );
}; 