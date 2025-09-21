const express = require("express");
const Order = require("../models/Order");
const PrintJob = require("../models/PrintJob");
const authMiddleware = require("../middleware/auth");
const { checkServiceStatus } = require("../middleware/serviceStatus");
const { v4: uuidv4 } = require('uuid');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const router = express.Router();

// Function to generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Get all orders for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user.id);
    const orders = await Order.find({ userId: req.user.id })
      .sort({ orderDate: -1 }); // Sort by newest first
    
    console.log('Found orders:', orders.length);
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
        details: "Total amount must be a valid number"
      });
    }

    // Process items to add missing fields
    const processedItems = items.map(item => {
      // Calculate pageCount from pages string
      let pageCount = 0;
      if (item.pages) {
        if (item.pages.toLowerCase() === 'all') {
          pageCount = 1; // Default for 'all'
        } else {
          // Parse page ranges like "1-5", "1,3,5", "10"
          const pages = item.pages.split(',').map(p => p.trim());
          pages.forEach(page => {
            if (page.includes('-')) {
              const [start, end] = page.split('-').map(Number);
              pageCount += (end - start + 1);
            } else {
              pageCount += 1;
            }
          });
        }
      }

      return {
        file: item.file, // Cloudinary URL
        originalFilename: item.originalFilename || item.file, // Original filename
        copies: item.copies,
        size: item.size || 'A4',
        color: item.color,
        sides: item.sides,
        pages: item.pages,
        pageCount: pageCount,
        estimatedPrice: item.price || item.estimatedPrice,
        pickupTime: item.pickupTime ? new Date(item.pickupTime) : null,
        urgency: item.urgency || 'Normal',
        printer: item.printer || 'Library'
      };
    });

    // Create new order
    const newOrder = new Order({
      orderId: generateOrderId(),
      userId: req.user.id,
      items: processedItems,
      totalAmount: totalAmount,
      status: 'queue' // Changed from 'pending' to 'queue'
    });

    const savedOrder = await newOrder.save();
    console.log('Order saved successfully:', savedOrder);

    // Send order confirmation email immediately after order creation
    try {
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
    }

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: "Error creating order", 
      error: error.message 
    });
  }
});

// Update order status (for admin)
router.put("/:orderId/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Update payment status
router.put("/:orderId/payment", authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentId = paymentId;
    order.status = 'processing'; // Move to processing after payment
    await order.save();

    res.json({ message: 'Payment status updated successfully', order });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

module.exports = router;

