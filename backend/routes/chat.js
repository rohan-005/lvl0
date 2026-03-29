const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const ChatMessage = require("../models/ChatMessage");
const ChatRoom = require("../models/ChatRoom");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// Configure Multer Storage for Uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // Root backend /uploads dir
  },
  filename(req, file, cb) {
    cb(null, `chat-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

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

// @route   POST /api/chat/upload
// @desc    Upload an attachment (img/video/file)
router.post("/upload", protect, upload.single("attachment"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// @route   GET /api/chat/users
// @desc    Get platform user directory for DM search / Right Sidebar
// @access  Private
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id name email role accountType createdAt")
      .sort({ createdAt: -1 })
      .limit(100); 

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch user directory:", err);
    res.status(500).json({ message: "Server error fetching directory" });
  }
});

// @route   GET /api/chat/rooms
// @desc    Get all chatrooms, optionally seed defaults if empty
router.get("/rooms", protect, async (req, res) => {
  try {
    let rooms = await ChatRoom.find({});

    // Seed defaults if empty
    if (rooms.length === 0) {
      const adminSchema = await User.findOne({ role: "admin" }) || await User.findOne();
      const adminId = adminSchema ? adminSchema._id : req.user._id;

      const defaults = [
        ...["General", "Action", "RPG", "FPS", "Indie"].map(n => ({ name: n, category: "gamer", isDefault: true, createdBy: adminId })),
        ...["General", "Unity", "Unreal Engine", "WebGL", "Indie Dev"].map(n => ({ name: n, category: "developer", isDefault: true, createdBy: adminId }))
      ];

      rooms = await ChatRoom.insertMany(defaults);
    }

    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/chat/rooms
// @desc    Create a new dynamic chatroom
router.post("/rooms", protect, async (req, res) => {
  try {
    const { name, category } = req.body;
    
    if (!name || name.trim().length > 30) {
      return res.status(400).json({ message: "Invalid room name" });
    }

    if (!["gamer", "developer"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const exists = await ChatRoom.findOne({ name: name.trim(), category });
    if (exists) return res.status(400).json({ message: "Room already exists in this category" });

    const newRoom = await ChatRoom.create({
      name: name.trim(),
      category,
      createdBy: req.user._id,
      isDefault: false,
    });

    res.status(201).json(newRoom);
  } catch (err) {
    console.error("Error creating room", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
