const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Password is no longer required for all users
  password: { type: String, required: false }, 
  role: { type: String, enum: ["student", "admin"], required: true },
  googleId: { type: String, unique: true, sparse: true }, // Add googleId
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null }
});

module.exports = mongoose.model("User", UserSchema);
