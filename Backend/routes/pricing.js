const express = require("express");
const Pricing = require("../models/Pricing");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Get Pricing Settings (Public - for students to see current prices)
router.get("/", async (req, res) => {
  try {
    let pricing = await Pricing.findOne().sort({ updatedAt: -1 });
    
    // If no pricing exists, create default one
    if (!pricing) {
      pricing = new Pricing({
        blackWhite: 1.0,
        color: 2.0,
        doubleSided: 0.5,
        paperSizeMultipliers: {
          A4: 1.0,
          A3: 1.5,
          Letter: 1.0,
          Legal: 1.2
        },
        gstPercentage: 18.0,
        updatedBy: null, // Will be set when admin updates
        version: 1
      });
      await pricing.save();
    }
    
    // Return only pricing data needed by students (exclude admin info)
    res.json({
      blackWhite: pricing.blackWhite,
      color: pricing.color,
      doubleSided: pricing.doubleSided,
      paperSizeMultipliers: pricing.paperSizeMultipliers,
      gstPercentage: pricing.gstPercentage
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Pricing Settings for Admin (includes admin info)
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    let pricing = await Pricing.findOne().sort({ updatedAt: -1 });
    
    if (!pricing) {
      pricing = new Pricing({
        blackWhite: 1.0,
        color: 2.0,
        doubleSided: 0.5,
        paperSizeMultipliers: {
          A4: 1.0,
          A3: 1.5,
          Letter: 1.0,
          Legal: 1.2
        },
        gstPercentage: 18.0,
        updatedBy: req.user.id,
        version: 1
      });
      await pricing.save();
    }
    
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching admin pricing:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Pricing Settings (Admin only)
router.put("/", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    const { 
      blackWhite, 
      color, 
      doubleSided, 
      paperSizeMultipliers, 
      gstPercentage 
    } = req.body;
    
    // Validate input
    if (blackWhite < 0.1 || blackWhite > 10.0) {
      return res.status(400).json({ message: 'Black & White price must be between 0.1 and 10.0' });
    }
    
    if (color < 0.1 || color > 20.0) {
      return res.status(400).json({ message: 'Color price must be between 0.1 and 20.0' });
    }
    
    if (gstPercentage < 0 || gstPercentage > 30) {
      return res.status(400).json({ message: 'GST percentage must be between 0 and 30' });
    }
    
    // Create new pricing record with version tracking
    const pricing = new Pricing({
      blackWhite,
      color,
      doubleSided: doubleSided || 0.5,
      paperSizeMultipliers: paperSizeMultipliers || {
        A4: 1.0,
        A3: 1.5,
        Letter: 1.0,
        Legal: 1.2
      },
      gstPercentage,
      updatedBy: req.user.id,
      version: 1
    });
    
    await pricing.save();
    
    console.log(`Pricing updated by admin ${req.user.id}. New prices: BW=${blackWhite}, Color=${color}`);
    
    res.json({
      message: 'Pricing updated successfully',
      pricing: {
        blackWhite: pricing.blackWhite,
        color: pricing.color,
        doubleSided: pricing.doubleSided,
        paperSizeMultipliers: pricing.paperSizeMultipliers,
        gstPercentage: pricing.gstPercentage,
        updatedAt: pricing.updatedAt,
        version: pricing.version
      }
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Calculate price for a print job (Public endpoint for students)
router.post("/calculate", async (req, res) => {
  try {
    const { 
      pages, 
      copies, 
      color, 
      sides, 
      paperSize = 'A4' 
    } = req.body;
    
    // Get current pricing
    let pricing = await Pricing.findOne().sort({ updatedAt: -1 });
    if (!pricing) {
      return res.status(500).json({ message: 'Pricing not configured' });
    }
    
    // Calculate base price
    const basePricePerPage = color === 'Color' ? pricing.color : pricing.blackWhite;
    const paperMultiplier = pricing.paperSizeMultipliers[paperSize] || 1.0;
    const doubleSidedCost = sides === 'Double-sided' ? pricing.doubleSided : 0;
    
    const pricePerPage = (basePricePerPage + doubleSidedCost) * paperMultiplier;
    const subtotal = pricePerPage * pages * copies;
    const gstAmount = (subtotal * pricing.gstPercentage) / 100;
    const total = subtotal + gstAmount;
    
    res.json({
      subtotal: Math.round(subtotal * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      breakdown: {
        pricePerPage,
        pages,
        copies,
        paperMultiplier,
        doubleSidedCost,
        gstPercentage: pricing.gstPercentage
      }
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 