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
    file: { type: String, required: true },
    copies: { type: Number, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    sides: { type: String, required: true },
    pages: { type: String, required: true },
    estimatedPrice: { type: Number, required: true }
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Completed',
    enum: ['Completed', 'processing', 'pending', 'cancelled']
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Order', OrderSchema); 