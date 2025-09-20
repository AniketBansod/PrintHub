const mongoose = require('mongoose');

const ServiceStatusSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: true,
    required: true
  },
  reason: {
    type: String,
    default: '',
    maxlength: 500
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceStatus', ServiceStatusSchema);
