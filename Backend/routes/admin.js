const express = require('express');
const Order = require('../models/Order');
// const { verifyAdmin } = require('../middleware/auth'); // Middleware to verify admin

const router = express.Router();

// Endpoint to fetch all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().select('orderId userId totalAmount');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

module.exports = router;