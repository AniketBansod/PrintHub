const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    format: async (req, file) => "pdf", // supports promises as well
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage: storage });

// Upload endpoint
router.post("/", upload.single("file"), (req, res) => {
  res.json({ url: req.file.path });
});

module.exports = router;