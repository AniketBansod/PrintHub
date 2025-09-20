const ServiceStatus = require('../models/ServiceStatus');

// Middleware to check if the service is open before allowing orders
const checkServiceStatus = async (req, res, next) => {
  try {
    // Get the latest service status
    const serviceStatus = await ServiceStatus.findOne().sort({ updatedAt: -1 });
    
    // If no service status exists, assume shop is open (default behavior)
    if (!serviceStatus || serviceStatus.isOpen) {
      return next();
    }
    
    // If shop is closed, return error with reason
    return res.status(503).json({
      message: 'Service temporarily unavailable',
      error: 'SHOP_CLOSED',
      reason: serviceStatus.reason,
      isOpen: false,
      updatedAt: serviceStatus.updatedAt
    });
  } catch (error) {
    console.error('Error checking service status:', error);
    // If there's an error checking status, allow the request to proceed
    // This ensures the service doesn't break if there's a database issue
    return next();
  }
};

module.exports = { checkServiceStatus };
