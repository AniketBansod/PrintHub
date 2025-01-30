const express = require("express");
const Pricing = require("../models/Pricing");
const router = express.Router();

// Get Pricing Settings
router.get("/", async (req, res) => {
  try {
    const pricing = await Pricing.findOne();
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Pricing Settings
router.put("/", async (req, res) => {
  try {
    const { blackWhite, color } = req.body;
    const pricing = await Pricing.findOneAndUpdate({}, { blackWhite, color }, { new: true, upsert: true });
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 