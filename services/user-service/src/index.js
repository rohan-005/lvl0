'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectdb');
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);

// Service Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('[user-service] Server Error:', err.message);
  res.status(500).json({ message: 'Internal User Service Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});
