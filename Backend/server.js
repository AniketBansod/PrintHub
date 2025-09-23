require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const allowedMimeTypes = require('./constants/allowedMimeTypes');
const { Readable } = require('stream');
const adminRouter = require("./routes/admin");
const ordersRouter = require('./routes/orders');
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(','),
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Middleware
app.use(express.json());
// Remove duplicate CORS; already configured above

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Multer Configuration for Memory Storage ---
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and image files are allowed.'), false);
    }
  }
});

// --- Helper function to upload to Cloudinary ---
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const filename = file.originalname.split('.').slice(0, -1).join('.');
    const publicId = filename + '-' + uuidv4();
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'print_jobs',
        resource_type: 'raw',
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Import Routes
const authRoutes = require("./routes/auth");
const pricingRoutes = require("./routes/pricing");

app.use("/api/auth", authRoutes);
app.use("/api/pricing", pricingRoutes);

// Routes
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Add a simple upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file to Cloudinary using the existing function
    const cloudinaryResult = await uploadToCloudinary(file);
    
    res.json({ 
      url: cloudinaryResult.secure_url,
      originalFilename: file.originalname 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Endpoint to handle file uploads and store print options
app.post('/api/print', upload.single('file'), async (req, res) => {
  try {
    const { copies, size, color, sides, pages, schedule, estimatedPrice } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file);

    // Generate a unique printId
    const printId = uuidv4();

    // Create new print job with all required fields
    const printJob = new PrintJob({
      printId,
      file: cloudinaryResult.secure_url, // Cloudinary URL
      originalFilename: file.originalname, // Store original filename
      copies: copies || 1,
      size: size || 'A4',
      color: color || 'Black & White',
      sides: sides || 'Single-sided',
      pages: pages || '1',
      schedule: schedule || 'Not specified',
      estimatedPrice: estimatedPrice || 0
      // Note: orderId will be set later when order is placed
    });

    await printJob.save();

    res.status(201).json({
      message: 'Print job created successfully',
      printId,
      file: cloudinaryResult.secure_url
    });
  } catch (error) {
    console.error('Error creating print job:', error);
    res.status(500).json({ message: 'Error creating print job', error: error.message });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const printJobs = await PrintJob.find();
    res.json(printJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
});

// Public endpoint to check service status
app.get('/api/service-status', async (req, res) => {
  try {
    const ServiceStatus = require('./models/ServiceStatus');
    let serviceStatus = await ServiceStatus.findOne().sort({ updatedAt: -1 });
    
    // If no service status exists, assume shop is open (default)
    if (!serviceStatus) {
      return res.json({
        isOpen: true,
        reason: '',
        updatedAt: new Date()
      });
    }
    
    res.json({
      isOpen: serviceStatus.isOpen,
      reason: serviceStatus.reason,
      updatedAt: serviceStatus.updatedAt
    });
  } catch (error) {
    console.error('Error fetching service status:', error);
    // If there's an error, assume shop is open to avoid breaking the service
    res.json({
      isOpen: true,
      reason: '',
      updatedAt: new Date()
    });
  }
});

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
});
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: 'Internal Server Error' });
});