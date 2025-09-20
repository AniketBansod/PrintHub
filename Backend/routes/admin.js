const express = require('express');
const Order = require('../models/Order');
const PrintJob = require('../models/PrintJob');
const ServiceStatus = require('../models/ServiceStatus');
const cloudinary = require('cloudinary').v2;
const { sendOrderReadyEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/auth');

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

// Endpoint to fetch all print jobs for admin
router.get('/printjobs', async (req, res) => {
  try {
    const printJobs = await PrintJob.find().populate('orderId', 'orderId userId');
    res.json(printJobs);
  } catch (error) {
    console.error('Error fetching print jobs:', error);
    res.status(500).json({ message: 'Error fetching print jobs', error: error.message });
  }
});

// Endpoint to download file from Cloudinary
router.get('/download/:printJobId', async (req, res) => {
  try {
    const { printJobId } = req.params;
    
    // Find the print job
    const printJob = await PrintJob.findById(printJobId);
    if (!printJob) {
      return res.status(404).json({ message: 'Print job not found' });
    }

    // Get the Cloudinary URL
    const fileUrl = printJob.file;
    
    if (!fileUrl) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Generate a signed URL for secure download
    const signedUrl = cloudinary.url(fileUrl, {
      resource_type: 'raw',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    });

    // Redirect to the signed URL
    res.redirect(signedUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

// Endpoint to get order details with print jobs
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId }).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get print jobs for this order
    const printJobs = await PrintJob.find({ orderId: order._id });
    
    res.json({
      ...order.toObject(),
      printJobs
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
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
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Send email notification when status changes to 'done'
    if (status === 'done') {
      try {
        const emailResult = await sendOrderReadyEmail(
          order.userId.email,
          order.userId.name,
          order.orderId
        );
        
        if (emailResult.success) {
          console.log('Order ready email sent successfully');
        } else {
          console.error('Failed to send ready email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending ready email:', emailError);
        // Don't fail the status update if email fails
      }
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

// Test email endpoint (remove this in production)
router.post('/test-email', async (req, res) => {
  try {
    const { email, name, orderId } = req.body;
    
    console.log('Testing email with:', { email, name, orderId });
    
    const { sendOrderConfirmationEmail } = require('../services/emailService');
    const result = await sendOrderConfirmationEmail(email, name, orderId, 100);
    
    console.log('Email test result:', result);
    
    res.json({ 
      message: 'Test email sent', 
      result 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Error sending test email', 
      error: error.message 
    });
  }
});

// Service Status Endpoints

// Get current service status
router.get('/service-status', authMiddleware, async (req, res) => {
  try {
    let serviceStatus = await ServiceStatus.findOne().sort({ updatedAt: -1 });
    
    // If no service status exists, create a default one (shop is open)
    if (!serviceStatus) {
      serviceStatus = new ServiceStatus({
        isOpen: true,
        reason: '',
        updatedBy: null // Will be set when admin updates it
      });
      await serviceStatus.save();
    }
    
    res.json({
      isOpen: serviceStatus.isOpen,
      reason: serviceStatus.reason,
      updatedAt: serviceStatus.updatedAt
    });
  } catch (error) {
    console.error('Error fetching service status:', error);
    res.status(500).json({ message: 'Error fetching service status', error: error.message });
  }
});

// Update service status (open/close shop)
router.put('/service-status', authMiddleware, async (req, res) => {
  try {
    const { isOpen, reason } = req.body;
    const adminId = req.user?.id;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    // Validate input
    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ message: 'isOpen must be a boolean value' });
    }
    
    if (!isOpen && (!reason || reason.trim().length === 0)) {
      return res.status(400).json({ message: 'Reason is required when closing the shop' });
    }
    
    // Create new service status record
    const serviceStatus = new ServiceStatus({
      isOpen,
      reason: reason || '',
      updatedBy: adminId
    });
    
    await serviceStatus.save();
    
    console.log(`Shop ${isOpen ? 'opened' : 'closed'} by admin. Reason: ${reason || 'N/A'}`);
    
    res.json({
      message: `Shop ${isOpen ? 'opened' : 'closed'} successfully`,
      serviceStatus: {
        isOpen: serviceStatus.isOpen,
        reason: serviceStatus.reason,
        updatedAt: serviceStatus.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ message: 'Error updating service status', error: error.message });
  }
});

module.exports = router;