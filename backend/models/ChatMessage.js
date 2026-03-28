const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        emoji: { type: String, required: true },
        userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
