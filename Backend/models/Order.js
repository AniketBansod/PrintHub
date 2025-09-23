const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    file: { type: String, required: true }, // Cloudinary URL
    originalFilename: { type: String, required: true }, // Original filename
    copies: { type: Number, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    sides: { type: String, required: true },
    pages: { type: String, required: true },
    pageCount: { type: Number, required: true },
    estimatedPrice: { type: Number, required: true },
    pickupTime: { type: Date },
    urgency: { type: String, default: 'Normal' },
    printer: { type: String, default: 'Library' }
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'queue',
    enum: ['queue', 'done', 'cancelled']
  },
  paymentId: {
    type: String,
    default: null
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });
OrderSchema.index({ orderId: 1 }, { unique: true });
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', OrderSchema); 