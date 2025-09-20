const express = require("express");
const Order = require("../models/Order");
const PrintJob = require("../models/PrintJob");
const authMiddleware = require("../middleware/auth");
const { checkServiceStatus } = require("../middleware/serviceStatus");
const { v4: uuidv4 } = require('uuid');
const { sendOrderConfirmationEmail } = require('../services/emailService');
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
router.post("/", authMiddleware, checkServiceStatus, async (req, res) => {
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

    // Send order confirmation email immediately after order creation
    try {
      // Get user details for email
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      
      if (user && user.email) {
        const emailResult = await sendOrderConfirmationEmail(
          user.email,
          user.name,
          savedOrder.orderId,
          savedOrder.totalAmount
        );
        
        if (emailResult.success) {
          console.log('Order confirmation email sent successfully');
        } else {
          console.error('Failed to send confirmation email:', emailResult.error);
        }
      } else {
        console.error('User not found or email not available for confirmation email');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

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
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
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
        status: 'queue', // Changed from 'completed' to 'queue'
        paymentId
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send confirmation email after successful payment
    try {
      const emailResult = await sendOrderConfirmationEmail(
        order.userId.email,
        order.userId.name,
        order.orderId,
        order.totalAmount
      );
      
      if (emailResult.success) {
        console.log('Order confirmation email sent successfully');
      } else {
        console.error('Failed to send confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the payment update if email fails
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
router.put('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['queue', 'done', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating order status', 
      error: error.message 
    });
  }
});

module.exports = router;

