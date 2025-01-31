const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Function to generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Get all orders for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ orderDate: -1 }); // Sort by newest first
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: "Error fetching orders", 
      error: error.message 
    });
  }
});

// Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    console.log('User from token:', req.user);

    const { items, totalAmount } = req.body;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "Invalid order items",
        details: "Items array is required and must not be empty"
      });
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return res.status(400).json({ 
        message: "Invalid total amount",
        details: "Total amount must be a number"
      });
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // Map the items to match the Order schema
    const validatedItems = items.map(item => {
      // Map paperSize to size and ensure all required fields exist
      return {
        file: item.file || '',
        copies: Number(item.copies) || 0,
        size: item.paperSize || 'A4', // Map paperSize to size
        color: item.color || 'Black & White',
        sides: item.sides || 'Single-sided',
        pages: String(item.pages) || '1', // Convert to string as per schema
        estimatedPrice: Number(item.estimatedPrice) || 0
      };
    });

    // Create new order
    const order = new Order({
      orderId,
      userId: req.user.id,
      items: validatedItems,
      totalAmount: totalAmount
    });

    console.log('Creating order:', order);

    // Save order to database
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder);
    
    res.status(201).json({ 
      message: "Order placed successfully", 
      order: savedOrder 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: "Error creating order", 
      error: error.message,
      stack: error.stack
    });
  }
});

// Endpoint to fetch order details by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this new endpoint for file download
router.get('/:orderId/download/:filename', async (req, res) => {
  try {
    const { orderId, filename } = req.params;
    console.log('Download request for:', { orderId, filename });
    
    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the matching item in the order
    const matchingItem = order.items.find(item => {
      // Extract just the filename from the full path
      const itemFileName = item.file.split('-').slice(1).join('-'); // Remove UUID prefix
      return itemFileName === filename;
    });

    if (!matchingItem) {
      return res.status(404).json({ message: 'File not found in order' });
    }

    // Get the full file path from the uploads directory
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    // Find the actual file with UUID prefix
    const files = fs.readdirSync(uploadsDir);
    const actualFile = files.find(file => file.endsWith(filename));

    if (!actualFile) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const filePath = path.join(uploadsDir, actualFile);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', error => {
      console.error('Error streaming file:', error);
      res.status(500).json({ message: 'Error streaming file' });
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      message: 'Error downloading file', 
      error: error.message 
    });
  }
});

// Add this new endpoint
router.put('/:orderId/payment', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId } = req.body;

    const order = await Order.findOneAndUpdate(
      { orderId },
      { 
        status: 'completed',
        paymentId
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating payment status', 
      error: error.message 
    });
  }
});

// ... rest of the routes ...

module.exports = router;