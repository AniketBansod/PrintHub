const express = require('express');
const Order = require('../models/Order');
const PrintJob = require('../models/PrintJob');
const User = require('../models/User'); 
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


router.get('/overview', authMiddleware, async (req, res) => {
  try {
    // Ensure only admins can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    // Pending requests (orders still in queue)
    const pendingRequests = await Order.countDocuments({ status: 'queue' });

    // Total users
    const totalUsers = await User.countDocuments();

    // Total revenue (all-time)
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Total print jobs today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const totalPrintJobsToday = await PrintJob.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    // Total revenue this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const revenueMonthAgg = await Order.aggregate([
      { $match: { orderDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenueThisMonth = revenueMonthAgg.length > 0 ? revenueMonthAgg[0].total : 0;

    res.json({
      pendingRequests,
      totalUsers,
      totalRevenue,
      totalPrintJobsToday,
      totalRevenueThisMonth
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({ message: "Error fetching overview stats", error: error.message });
  }
});


// GET /api/admin/urgent-requests
// GET /api/admin/urgent-requests
// GET /api/admin/urgent-requests
router.get("/urgent-requests", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const urgentOrders = await Order.find({
      status: "queue",   // ✅ only pending orders (same as UsersSection)
      $or: [
        { "items.urgency": { $in: ["Urgent", "Express"] } },
        { "items.pickupTime": { $lte: oneHourLater } }
      ]
    })
      .populate("userId", "name email")
      .sort({ "items.pickupTime": 1 });

    res.json(urgentOrders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching urgent requests", error: err.message });
  }
});


// GET /api/admin/queue-prediction
router.get("/queue-prediction", authMiddleware, async (req, res) => {
  try {
  const start = new Date();
  start.setHours(0,0,0,0); // midnight today
  const end = new Date();
  end.setDate(end.getDate() + 2); // midnight 2 days later

  const orders = await Order.find({
  status: "queue",
  "items.pickupTime": { $gte: start, $lt: end }
  });

    // Group by hour slot
    const slots = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.pickupTime) {
          const date = new Date(item.pickupTime);
          const dayKey = date.toDateString();
          const hour = date.getHours();
          const slot = `${hour}:00 - ${hour + 1}:00`;

          if (!slots[dayKey]) slots[dayKey] = {};
          if (!slots[dayKey][slot]) slots[dayKey][slot] = 0;
          slots[dayKey][slot]++;
        }
      });
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching queue prediction", error: err.message });
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