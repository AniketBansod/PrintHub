import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for pricing
const PricingContext = createContext();

// Custom hook to use the PricingContext
export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};

// Provider component
export const PricingProvider = ({ children }) => {
  const [priceSettings, setPriceSettings] = useState({
    blackWhite: 1.0,
    color: 2.0,
    doubleSided: 0.5,
    paperSizeMultipliers: {
      A4: 1.0,
      A3: 1.5,
      Letter: 1.0,
      Legal: 1.2
    },
    gstPercentage: 18.0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("http://localhost:5000/api/pricing");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate the data structure
        if (data && typeof data === 'object') {
          setPriceSettings(prev => ({
            ...prev,
            ...data
          }));
        } else {
          console.warn('Invalid pricing data received:', data);
        }
      } catch (error) {
        console.error("Failed to fetch pricing settings:", error);
        setError(error.message);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
    
    // Refresh pricing every 5 minutes
    const interval = setInterval(fetchPricing, 300000);
    return () => clearInterval(interval);
  }, []);

  const calculatePrice = (pages, copies, color, sides, paperSize = 'A4') => {
    try {
      // Ensure we have valid inputs
      if (!pages || !copies || pages <= 0 || copies <= 0) {
        return {
          subtotal: 0,
          gstAmount: 0,
          total: 0,
          pricePerPage: 0
        };
      }

      const basePricePerPage = color === 'Color' ? priceSettings.color : priceSettings.blackWhite;
      const paperMultiplier = priceSettings.paperSizeMultipliers[paperSize] || 1.0;
      const doubleSidedCost = sides === 'Double-sided' ? priceSettings.doubleSided : 0;
      
      const pricePerPage = (basePricePerPage + doubleSidedCost) * paperMultiplier;
      const subtotal = pricePerPage * pages * copies;
      const gstAmount = (subtotal * priceSettings.gstPercentage) / 100;
      const total = subtotal + gstAmount;
      
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        gstAmount: Math.round(gstAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        pricePerPage: Math.round(pricePerPage * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      return {
        subtotal: 0,
        gstAmount: 0,
        total: 0,
        pricePerPage: 0
      };
    }
  };

  return (
    <PricingContext.Provider value={{ 
      priceSettings, 
      setPriceSettings, 
      calculatePrice,
      loading,
      error
    }}>
      {children}
    </PricingContext.Provider>
  );
}; 