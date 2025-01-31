const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const router = express.Router();

// Simulate payment and create order
router.post('/create', async (req, res) => {
  try {
    const { userId, items, total, billingInfo } = req.body;

    // Simulate payment success
    const orderId = uuidv4();

    // Generate a receipt URL (for simplicity, using a placeholder URL)
    const receiptUrl = `http://example.com/receipts/${orderId}.pdf`;

    // Create a new order
    const order = new Order({
      orderId,
      userId,
      items,
      total,
      billingInfo,
      receiptUrl,
    });

    await order.save();

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

module.exports = router; 