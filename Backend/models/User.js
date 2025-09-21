const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null }
});

module.exports = mongoose.model("User", UserSchema);
