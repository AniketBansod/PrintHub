const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ type: String, required: true }],
  total: { type: Number, required: true },
  status: { type: String, default: 'Completed' },
  billingInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  receiptUrl: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema); 