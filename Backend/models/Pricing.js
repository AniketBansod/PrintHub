const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema({
  // Basic pricing per page
  blackWhite: { 
    type: Number, 
    required: true, 
    default: 1.0,
    min: 0.1,
    max: 10.0
  },
  color: { 
    type: Number, 
    required: true, 
    default: 2.0,
    min: 0.1,
    max: 20.0
  },
  
  // Additional pricing options
  doubleSided: {
    type: Number,
    required: true,
    default: 0.5, // Additional cost for double-sided printing
    min: 0,
    max: 5.0
  },
  
  // Paper size multipliers
  paperSizeMultipliers: {
    A4: { type: Number, default: 1.0 },
    A3: { type: Number, default: 1.5 },
    Letter: { type: Number, default: 1.0 },
    Legal: { type: Number, default: 1.2 }
  },
  
  // GST percentage
  gstPercentage: {
    type: Number,
    required: true,
    default: 18.0,
    min: 0,
    max: 30
  },
  
  // Admin tracking
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Version tracking
  version: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model("Pricing", PricingSchema); 