'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'email-service',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, _req, res, _next) => {
  console.error('[email-service] Error:', err.message);
  res.status(500).json({ message: 'Internal Email Service Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Email Service running on port ${PORT}`);
});
