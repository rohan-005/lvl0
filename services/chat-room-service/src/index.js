'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/connectdb');
const chatRoutes = require('./routes/chat');
const chatHandler = require('./socket/chatHandler');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5004;

// Connect DB asynchronously with reconnection handling
connectDB();

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize socket events
chatHandler(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'chat-room-service',
    port: PORT,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, _req, res, _next) => {
  console.error('[chat-room-service] Error:', err.message);
  res.status(500).json({ message: 'Internal Chat Room Service Error' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Chat Room Service & Socket.IO running on port ${PORT}`);
});
