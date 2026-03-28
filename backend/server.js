const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "https://lvl-0.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Initialize Socket logic
const chatHandler = require('./socket/chatHandler');
chatHandler(io);

// Import routes
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const newsRoutes = require("./routes/newsRoutes");
const games = require("./routes/games");
const chatRoutes = require("./routes/chat");




// Connect to database
const connectdb = require('./config/connectdb');
connectdb();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// -------------------- API ROUTES --------------------
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/games", games);
app.use("/api/chat", chatRoutes);


// -------------------- STATIC FILES --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- HEALTH CHECK --------------------
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running!',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server & Socket.IO running on port ${PORT}`);
});
