const express = require('express');
const PrintJob = require('../models/PrintJob');
const Order = require('../models/Order');

const router = express.Router();

router.post('/print', async (req, res) => {
  try {
    const { printId, file, copies, size, color, sides, pages, schedule, estimatedPrice, orderId } = req.body;

    // Ensure the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found'});
    }

    const printJob = new PrintJob({
      printId,
      file,
      copies,
      size,
      color,
      sides,
      pages,
      schedule,
      estimatedPrice,
      orderId
    });

    await printJob.save();
    res.status(201).json({ message: 'Print job created successfully', printJob });
  } catch (error) {
    console.error('Error creating print job:', error);
    res.status(500).json({ message: 'Error creating print job', error: error.message });
  }
});

module.exports = router;