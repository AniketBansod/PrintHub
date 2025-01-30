const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema({
  blackWhite: { type: Number, required: true, default: 1.0 },
  color: { type: Number, required: true, default: 2.0 },
});

module.exports = mongoose.model("Pricing", PricingSchema); 