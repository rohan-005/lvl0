const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    accountType: {
      type: String,
      enum: ["gamer", "developer"],
      default: "gamer",
    },

    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // OTPs
    emailVerificationOTP: String,
    emailVerificationOTPExpire: Date,
    passwordResetOTP: String,
    passwordResetOTPExpire: Date,
  },
  { timestamps: true }
);

/* Password hash */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/* Email OTP */
userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  this.emailVerificationOTPExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

/* Password Reset OTP */
userSchema.methods.generatePasswordResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");
  this.passwordResetOTPExpire = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.clearPasswordResetOTP = function () {
  this.passwordResetOTP = undefined;
  this.passwordResetOTPExpire = undefined;
};

module.exports = mongoose.model("User", userSchema);
