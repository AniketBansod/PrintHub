const mongoose = require('mongoose');

const PrintJobSchema = new mongoose.Schema({
  printId: { type: String, required: true, unique: true },
  file: { type: String, required: true }, // Cloudinary URL
  originalFilename: { type: String, required: true }, // Original filename with extension
  copies: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  sides: { type: String, required: true },
  pages: { type: String, required: true },
  schedule: { type: String, required: true },
  estimatedPrice: { type: Number, required: true },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    // required: true 
  }
});

module.exports = mongoose.model('PrintJob', PrintJobSchema);