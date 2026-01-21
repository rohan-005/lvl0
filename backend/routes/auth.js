const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailService');
const { protect } = require('../middleware/auth'); // Add this import
const crypto = require('crypto'); // Add this import

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      accountType,
      isVerified: false,
    });

    const otp = user.generateEmailVerificationOTP();
    await user.save();

    await sendOTPEmail(user.email, otp, user.name, user.accountType);

    res.status(201).json({
      success: true,
      message: "OTP sent to email",
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Verify OTP for email verification
// @route   POST /api/auth/verify-email
// @access  Public
router.post("/verify-email", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const hashed = crypto.createHash("sha256").update(otp).digest("hex");

  if (
    user.emailVerificationOTP !== hashed ||
    user.emailVerificationOTPExpire < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Email verified",
  });
});


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(401).json({ message: "Email not verified" });

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
    },
    token: generateToken(user._id),
  });
});


// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = user.generateEmailVerificationOTP();
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp, user.name);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP resent successfully',
      email: user.email 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => { // Add protect middleware here
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isApprovedByAdmin: user.isApprovedByAdmin,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect, // Add protect middleware here
  body('name').notEmpty().withMessage('Name is required').trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    
    console.log('Updating profile for user:', req.user._id, 'New name:', name);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully:', user.name);

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
  protect, // Add protect middleware here
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    console.log('Changing password for user:', req.user._id);

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('Password changed successfully for user:', req.user._id);

    res.json({ 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during password change' });
  }
});



// Admin routes: approve user
// PUT /api/auth/admin/approve/:id
router.put('/admin/approve/:id', protect, async (req, res) => {
  try {
    // Only admin can approve
    if (!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isApprovedByAdmin = true;
    await user.save();

    res.json({ message: 'User approved by admin', user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isApprovedByAdmin: user.isApprovedByAdmin
    }});
  } catch (error) {
    console.error('Admin approve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;