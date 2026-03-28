const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // --- Join/Leave Rooms ---
    socket.on("room:join", ({ roomId, channel }) => {
      const roomKey = `${roomId}:${channel}`;
      socket.join(roomKey);
      
      // Optionally notify room that user joined
      // io.to(roomKey).emit("user:joined", { userId: socket.user._id, username: socket.user.name });
    });

    socket.on("room:leave", ({ roomId, channel }) => {
      const roomKey = `${roomId}:${channel}`;
      socket.leave(roomKey);
    });

    // --- Messaging ---
    socket.on("message:send", async ({ roomId, channel, messageText, attachmentUrl }) => {
      // Check if muted
      if (socket.user.mutedUntil && new Date() < new Date(socket.user.mutedUntil)) {
        return socket.emit("error:muted", { message: "You are currently muted." });
      }

      if (!messageText?.trim() && !attachmentUrl) return; // Allow empty text if image attached

      try {
        const newMessage = await ChatMessage.create({
          roomId,
          channel,
          userId: socket.user._id,
          username: socket.user.name,
          avatar: socket.user.avatar || "",
          message: messageText ? messageText.trim() : "",
          attachmentUrl: attachmentUrl || null,
        });

        const roomKey = `${roomId}:${channel}`;
        io.to(roomKey).emit("message:receive", newMessage);
      } catch (err) {
        console.error("Failed to send message", err);
        socket.emit("error:general", { message: "Failed to send message" });
      }
    });

    // --- Typing Indicators ---
    socket.on("typing:start", ({ roomId, channel }) => {
      const roomKey = `${roomId}:${channel}`;
      socket.to(roomKey).emit("user:typing", { 
        userId: socket.user._id, 
        username: socket.user.name 
      });
    });

    socket.on("typing:stop", ({ roomId, channel }) => {
      const roomKey = `${roomId}:${channel}`;
      socket.to(roomKey).emit("user:stopTyping", { userId: socket.user._id });
    });

    // --- Voting & Reactions ---
    socket.on("message:vote", async ({ messageId, type }) => {
      try {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) return;

        const userId = socket.user._id;

        // Cleanup existing votes
        const hasUpvoted = msg.upvotedBy.includes(userId);
        const hasDownvoted = msg.downvotedBy.includes(userId);

        if (type === "up") {
          if (hasUpvoted) {
            msg.upvotedBy.pull(userId);
            msg.upvotes--;
          } else {
            if (hasDownvoted) {
              msg.downvotedBy.pull(userId);
              msg.downvotes--;
            }
            msg.upvotedBy.push(userId);
            msg.upvotes++;
          }
        } else if (type === "down") {
          if (hasDownvoted) {
            msg.downvotedBy.pull(userId);
            msg.downvotes--;
          } else {
            if (hasUpvoted) {
              msg.upvotedBy.pull(userId);
              msg.upvotes--;
            }
            msg.downvotedBy.push(userId);
            msg.downvotes++;
          }
        }

        await msg.save();
        
        const roomKey = `${msg.roomId}:${msg.channel}`;
        io.to(roomKey).emit("message:update", msg);
      } catch (error) {
        console.error("Voting error", error);
      }
    });

    socket.on("message:react", async ({ messageId, emoji }) => {
      try {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) return;

        const userId = socket.user._id;
        const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex > -1) {
          const hasReacted = msg.reactions[reactionIndex].userIds.includes(userId);
          if (hasReacted) {
            msg.reactions[reactionIndex].userIds.pull(userId);
            if (msg.reactions[reactionIndex].userIds.length === 0) {
              msg.reactions.splice(reactionIndex, 1);
            }
          } else {
            msg.reactions[reactionIndex].userIds.push(userId);
          }
        } else {
          msg.reactions.push({ emoji, userIds: [userId] });
        }

        await msg.save();

        const roomKey = `${msg.roomId}:${msg.channel}`;
        io.to(roomKey).emit("message:update", msg);
      } catch (error) {
        console.error("Reaction error:", error);
      }
    });

    // --- Moderation (Delete / Pin) ---
    socket.on("message:moderate", async ({ messageId, action, reason }) => {
      // Validate permissions
      if (socket.user.role !== "admin" && socket.user.role !== "moderator") {
        return socket.emit("error:unauthorized", { message: "Moderator permissions required." });
      }

      try {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) return;

        const roomKey = `${msg.roomId}:${msg.channel}`;

        if (action === "delete") {
          await msg.deleteOne();
          io.to(roomKey).emit("message:delete", { messageId });
        } else if (action === "pin") {
          msg.pinned = !msg.pinned;
          await msg.save();
          io.to(roomKey).emit("message:update", msg);
        }
      } catch (error) {
        console.error("Moderation error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};
