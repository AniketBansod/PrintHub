const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const passport = require("passport");
const session = require("express-session");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { sendOTPEmail } = require("../services/emailService");
// --- Passport Configuration ---
// (This will be in a separate file in the next step, but let's define it here for now)

// --- 1. REQUIRE the passport configuration we just created ---
require("../config/passport-setup");

// --- 2. Initialize Passport and Session Middleware ---
// This MUST come before any routes that use Passport.
router.use(session({
  secret: process.env.SESSION_SECRET || 'a-very-secret-key-for-oauth',
  resave: false,
  saveUninitialized: false,
}));
router.use(passport.initialize());
router.use(passport.session());


// --- 3. Google OAuth Routes ---
// These routes will now use the configuration from passport-setup.js

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_ORIGIN }/login?error=google_auth_failed`,
    session: false 
  }),
  (req, res) => {
    // Authentication successful. `req.user` is now available.
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const clientOrigin = process.env.CLIENT_ORIGIN ;
    res.redirect(`${clientOrigin}/auth/success?token=${token}`);
  }
);


// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ... existing routes ...
// Send OTP for email verification
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteOne({ email });

    // Create new OTP record
    const otpRecord = new OTP({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await otpRecord.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      await OTP.deleteOne({ email });
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ 
      message: "OTP sent successfully to your email",
      email: email 
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP" });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ 
        message: "Invalid OTP",
        attemptsLeft: 3 - otpRecord.attempts
      });
    }

    // Mark as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    res.json({ 
      message: "OTP verified successfully",
      email: email,
      verified: true
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
});

// Register a New User (updated to require OTP verification)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Check if email is verified
    const otpRecord = await OTP.findOne({ email, isVerified: true });
    if (!otpRecord) {
      return res.status(400).json({ message: "Email not verified. Please verify your email first" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Delete OTP record after successful registration
    await OTP.deleteOne({ email });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin registration with admin key verification
router.post("/admin-register", async (req, res) => {
  try {
    const { name, email, password, adminKey, role } = req.body;

    // Validate input
    if (!name || !email || !password || !adminKey) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate admin key from environment variables
    const validAdminKey = process.env.ADMIN_KEY;
    if (!validAdminKey) {
      console.error("ADMIN_KEY not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (adminKey !== validAdminKey) {
      return res.status(400).json({ message: "Invalid admin key" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    await adminUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Admin account created successfully",
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Error creating admin account", error: error.message });
  }
});

// Request password reset (send OTP if user exists)
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No user found with this email" });
    // Generate OTP
    const otp = generateOTP();
    await OTP.deleteOne({ email });
    const otpRecord = new OTP({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });
    await otpRecord.save();
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      await OTP.deleteOne({ email });
      return res.status(500).json({ message: "Failed to send OTP email" });
    }
    res.json({ message: "OTP sent successfully to your email", email });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});

// Verify OTP for password reset
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found or expired" });
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: "OTP has expired" });
    }
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP" });
    }
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP", attemptsLeft: 3 - otpRecord.attempts });
    }
    otpRecord.isVerified = true;
    await otpRecord.save();
    res.json({ message: "OTP verified successfully", email, verified: true });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
});

// Reset password (after OTP verified)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: "Email and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters long" });
    const otpRecord = await OTP.findOne({ email, isVerified: true });
    if (!otpRecord) return res.status(400).json({ message: "OTP not verified for this email" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    await OTP.deleteOne({ email });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
});

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
});

module.exports = router;
