const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    category: {
      type: String,
      required: true,
      enum: ["gamer", "developer"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
