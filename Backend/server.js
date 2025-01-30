require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const PrintJob = require('./models/PrintJob');
const cloudinary = require('cloudinary').v2;
const ordersRouter = require('./routes/orders');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.static('uploads'));
app.use(cors()); // Enable CORS

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({ storage });





// Import Routes
const authRoutes = require("./routes/auth");
const pricingRoutes = require("./routes/pricing");
app.use("/api/auth", authRoutes);
app.use("/api/pricing", pricingRoutes);

// Routes
app.use('/api/orders', ordersRouter);

// Endpoint to handle file uploads and store print options
app.post('/api/print', upload.single('file'), async (req, res) => {
  try {
    const { copies, size, color, sides, pages, schedule, estimatedPrice } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'prints',
      resource_type: 'auto'
    });

    // Generate a unique printId
    const printId = uuidv4();

    // Create new print job with all required fields
    const printJob = new PrintJob({
      printId,
      file: result.secure_url,
      copies: copies || 1,
      size: size || 'A4',
      color: color || 'Black & White',
      sides: sides || 'Single-sided',
      pages: pages || '1',
      schedule: schedule || 'Not specified', // Provide default value
      estimatedPrice: estimatedPrice || 0
    });

    await printJob.save();

    res.status(201).json({ 
      message: 'Print job created successfully', 
      printId,
      file: result.secure_url 
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
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
