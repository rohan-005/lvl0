const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const ChatMessage = require("../models/ChatMessage");

// @route   GET /api/chat/:roomId/:channel
// @desc    Get chat message history for a specific room and channel
// @access  Private
router.get("/:roomId/:channel", protect, async (req, res) => {
  try {
    const { roomId, channel } = req.params;
    
    // Pagination params
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Fetch messages sorted aggressively by date descending (to get most recent)
    // Then we reverse them in frontend to display chronologically downwards
    const messages = await ChatMessage.find({ roomId, channel })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get pinned messages (we want to ensure they are available in the payload)
    const pinnedMessages = await ChatMessage.find({ roomId, channel, pinned: true });

    res.json({
      messages: messages.reverse(),
      pinnedMessages,
      hasMore: messages.length === limit
    });
  } catch (err) {
    console.error("Failed to fetch chat history:", err);
    res.status(500).json({ message: "Server error fetching chat history." });
  }
});

module.exports = router;
