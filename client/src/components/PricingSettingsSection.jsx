import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calculator, Save, AlertCircle } from 'lucide-react';

const PricingSettingsSection = () => {
  const [pricing, setPricing] = useState({
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pricing/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pricing settings');
      }
      
      const data = await response.json();
      setPricing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPricing(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaperSizeChange = (size, value) => {
    setPricing(prev => ({
      ...prev,
      paperSizeMultipliers: {
        ...prev.paperSizeMultipliers,
        [size]: parseFloat(value) || 1.0
      }
    }));
  };

  const savePricing = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pricing)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save pricing');
      }
      
      setSuccess('Pricing settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateSamplePrice = () => {
    const basePrice = pricing.blackWhite;
    const paperMultiplier = pricing.paperSizeMultipliers.A4;
    const subtotal = basePrice * paperMultiplier * 10; // 10 pages
    const gstAmount = (subtotal * pricing.gstPercentage) / 100;
    const total = subtotal + gstAmount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const samplePrice = calculateSamplePrice();

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <DollarSign className="h-6 w-6 text-amber-400 mr-3" />
        <h2 className="text-2xl font-bold text-gray-100">Pricing Settings</h2>
      </div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-6"
        >
          {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pricing Configuration */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Base Pricing</h3>
          
          {/* Black & White Price */}
          <div>
            <label htmlFor="blackWhite" className="block text-sm font-medium text-gray-300 mb-2">
              Price Per Page (Black & White) - ₹
            </label>
            <input
              type="number"
              id="blackWhite"
              step="0.1"
              min="0.1"
              max="10.0"
              value={pricing.blackWhite}
              onChange={(e) => handleInputChange('blackWhite', parseFloat(e.target.value))}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Color Price */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
              Price Per Page (Color) - ₹
            </label>
            <input
              type="number"
              id="color"
              step="0.1"
              min="0.1"
              max="20.0"
              value={pricing.color}
              onChange={(e) => handleInputChange('color', parseFloat(e.target.value))}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Double-sided Additional Cost */}
          <div>
            <label htmlFor="doubleSided" className="block text-sm font-medium text-gray-300 mb-2">
              Additional Cost for Double-sided - ₹
            </label>
            <input
              type="number"
              id="doubleSided"
              step="0.1"
              min="0"
              max="5.0"
              value={pricing.doubleSided}
              onChange={(e) => handleInputChange('doubleSided', parseFloat(e.target.value))}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* GST Percentage */}
          <div>
            <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-300 mb-2">
              GST Percentage - %
            </label>
            <input
              type="number"
              id="gstPercentage"
              step="0.1"
              min="0"
              max="30"
              value={pricing.gstPercentage}
              onChange={(e) => handleInputChange('gstPercentage', parseFloat(e.target.value))}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Paper Size Multipliers */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Paper Size Multipliers</h3>
          
          {Object.entries(pricing.paperSizeMultipliers).map(([size, multiplier]) => (
            <div key={size}>
              <label htmlFor={size} className="block text-sm font-medium text-gray-300 mb-2">
                {size} Size Multiplier
              </label>
              <input
                type="number"
                id={size}
                step="0.1"
                min="0.1"
                max="3.0"
                value={multiplier}
                onChange={(e) => handlePaperSizeChange(size, e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Price Preview */}
      <div className="mt-8 p-4 bg-blue-900 border border-blue-600 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-200 mb-3 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Price Preview (10 pages, A4, Black & White)
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-300">Subtotal:</span>
            <div className="text-blue-100 font-semibold">₹{samplePrice.subtotal}</div>
          </div>
          <div>
            <span className="text-blue-300">GST ({pricing.gstPercentage}%):</span>
            <div className="text-blue-100 font-semibold">₹{samplePrice.gstAmount}</div>
          </div>
          <div>
            <span className="text-blue-300">Total:</span>
            <div className="text-blue-100 font-semibold text-lg">₹{samplePrice.total}</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={savePricing}
        disabled={saving}
        className={`w-full mt-6 py-3 px-4 rounded-md font-semibold transition duration-300 flex items-center justify-center ${
          saving
            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
            : 'bg-amber-500 hover:bg-amber-600 text-gray-900'
        }`}
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Pricing Settings
          </>
        )}
      </motion.button>
    </div>
  );
};

export default PricingSettingsSection;
