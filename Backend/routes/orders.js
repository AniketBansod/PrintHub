const express = require("express");
const Order = require("../models/Order");
const PrintJob = require("../models/PrintJob");
const authMiddleware = require("../middleware/auth");
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Note: Removed 'path' and 'fs' imports as they are no longer needed

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
        fileUrl: item.fileUrl || '', // Include the Cloudinary URL
        copies: Number(item.copies) || 0,
        size: item.paperSize || 'A4', // Map paperSize to size
        color: item.color || 'Black & White',
        sides: item.sides || 'Single-sided',
        pages: String(item.pages) || '1', // Convert to string as per schema
        estimatedPrice: Number(item.estimatedPrice) || 0
      };
    });

    // Create new order with queue status
    const newOrder = new Order({
      orderId: uuidv4(),
      userId: req.user.id,
      items: validatedItems,
      totalAmount: totalAmount,
      status: 'queue' // Set default status to queue
    });

    console.log('Creating order:', newOrder);

    // Save order to database
    const savedOrder = await newOrder.save();
    console.log('Order saved successfully:', savedOrder);

    // Create PrintJob records for each item in the order
    const printJobs = [];
    for (const item of validatedItems) {
      // Use the fileUrl if available, otherwise use the filename
      const fileToStore = item.fileUrl || item.file;
      
      // Find existing PrintJob by Cloudinary URL or filename
      let printJob = await PrintJob.findOne({ 
        $or: [
          { file: fileToStore },
          { file: { $regex: item.file, $options: 'i' } }
        ]
      });
      
      if (!printJob) {
        // Create a new PrintJob with the Cloudinary URL or filename
        printJob = new PrintJob({
          printId: uuidv4(),
          file: fileToStore, // This will be the Cloudinary URL if available
          originalFilename: item.originalFilename || item.file, // Store original filename
          copies: item.copies,
          size: item.size,
          color: item.color,
          sides: item.sides,
          pages: item.pages,
          schedule: 'Not specified',
          estimatedPrice: item.estimatedPrice,
          orderId: savedOrder._id
        });
        await printJob.save();
      } else {
        // Link existing PrintJob to this order
        printJob.orderId = savedOrder._id;
        await printJob.save();
      }
      printJobs.push(printJob);
    }
    
    res.status(201).json({ 
      message: "Order placed successfully", 
      order: savedOrder,
      printJobs: printJobs
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

// ✅ DELETED the old local file download endpoint.
// The frontend will now handle downloads directly from the Cloudinary URL stored in the database.

// Endpoint to update payment status
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

// Endpoint to update order status
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['queue', 'done', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be queue, done, or cancelled' });
    }
    
    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ 
      message: 'Order status updated successfully', 
      order 
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

// Endpoint to fetch orders by status
router.get('/orders/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    if (!['queue', 'done', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be queue, done, or cancelled' });
    }
    
    const orders = await Order.find({ status }).populate('userId', 'name email');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ message: 'Error fetching orders by status', error: error.message });
  }
});

module.exports = router;

