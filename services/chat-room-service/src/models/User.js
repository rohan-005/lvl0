const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    accountType: {
      type: String,
      enum: ["gamer", "developer"],
      default: "gamer",
    },
    avatar: {
      type: String,
      default: "",
    },
    mutedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
