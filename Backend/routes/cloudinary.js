// const express = require('express');
// const File = require('../models/PrintJob'); // Assuming PrintJob model stores the file URLs
// require('dotenv').config();

// const router = express.Router();

// // Endpoint to fetch all files from MongoDB
// router.get('/files', async (req, res) => {
//   try {
//     const files = await File.find();
//     res.json(files);
//   } catch (error) {
//     console.error('Error fetching files:', error);
//     res.status(500).json({ message: 'Error fetching files', error: error.message });
//   }
// });

// module.exports = router;