require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const PrintJob = require('./models/PrintJob');
const cloudinary = require('cloudinary').v2;

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


// Endpoint to handle file uploads and store print options
app.post('/api/print', upload.single('file'), async (req, res) => {
  try {
    const { copies, size, color, sides, pages, schedule, estimatedPrice } = req.body;
    const printId = uuidv4();

    // Validation check
    if (!pages) {
      return res.status(400).json({ message: 'Pages are required' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'print_jobs',
    });

    console.log("File uploaded to Cloudinary:", result.secure_url);

    const newPrintJob = new PrintJob({
      printId,
      file: result.secure_url,
      copies,
      size,
      color,
      sides,
      pages,
      schedule,
      estimatedPrice
    });

    await newPrintJob.save();

    console.log({ message: 'Print job created successfully', printId })
  } catch (error) {
    console.error('Error creating print job:', error);
    console.log(error);
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
