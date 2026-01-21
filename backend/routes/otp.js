const express = require("express");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
} = require("../utils/emailService");
const generateToken = require("../utils/generateToken");

const router = express.Router();

/* =========================
   TEST ROUTES
   ========================= */
router.get("/test", (req, res) => {
  res.json({ message: "OTP routes are working!" });
});

/* =========================
   SEND EMAIL VERIFICATION OTP
   ========================= */
router.post(
  "/send-verification",
  [body("email").isEmail().withMessage("Valid email required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const otp = user.generateEmailVerificationOTP();
      await user.save();

      await sendOTPEmail(user.email, otp, user.name);

      res.json({
        message: "OTP sent successfully",
        email: user.email,
      });
    } catch (err) {
      console.error("Send verification OTP error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   VERIFY EMAIL OTP ✅ FIXED
   ========================= */
router.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("otp")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be a 6-digit number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      if (
        user.emailVerificationOTP !== hashedOTP ||
        user.emailVerificationOTPExpire < Date.now()
      ) {
        return res.status(400).json({
          message: "Invalid or expired OTP",
        });
      }

      user.isVerified = true;
      user.emailVerificationOTP = undefined;
      user.emailVerificationOTPExpire = undefined;
      await user.save();

      // Optional: auto-login token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Email verified successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
        },
        token,
      });
    } catch (err) {
      console.error("Verify email OTP error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   FORGOT PASSWORD - SEND OTP
   ========================= */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email required")],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.json({
          message:
            "If an account exists, a password reset OTP has been sent",
          email,
        });
      }

      const otp = user.generatePasswordResetOTP();
      await user.save();

      await sendPasswordResetOTPEmail(user.email, otp, user.name);

      res.json({
        message: "Password reset OTP sent",
        email: user.email,
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   VERIFY PASSWORD RESET OTP
   ========================= */
router.post(
  "/verify-password-reset",
  [
    body("email").isEmail(),
    body("otp")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (!user || !user.passwordResetOTP) {
        return res.status(400).json({
          message: "No active password reset request",
        });
      }

      const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      if (
        user.passwordResetOTP !== hashedOTP ||
        user.passwordResetOTPExpire < Date.now()
      ) {
        return res.status(400).json({
          message: "Invalid or expired OTP",
        });
      }

      const resetToken = generateToken(user._id, "15m");

      user.clearPasswordResetOTP();
      await user.save();

      res.json({
        message: "OTP verified",
        resetToken,
        email: user.email,
      });
    } catch (err) {
      console.error("Verify password reset OTP error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   RESET PASSWORD
   ========================= */
router.put(
  "/reset-password",
  [
    body("resetToken").notEmpty(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { resetToken, password } = req.body;

      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = password;
      await user.save();

      res.json({
        message: "Password reset successful",
        email: user.email,
      });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   RESEND EMAIL OTP
   ========================= */
router.post(
  "/resend-otp",
  [body("email").isEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user || user.isVerified) {
        return res
          .status(400)
          .json({ message: "Invalid request" });
      }

      const otp = user.generateEmailVerificationOTP();
      await user.save();

      await sendOTPEmail(user.email, otp, user.name);

      res.json({
        message: "OTP resent successfully",
        email: user.email,
      });
    } catch (err) {
      console.error("Resend OTP error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
