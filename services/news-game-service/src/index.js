'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const newsRoutes = require('./routes/newsRoutes');
const gamesRoutes = require('./routes/gamesRoutes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/games', gamesRoutes);

// Service Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'news-game-service',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, _req, res, _next) => {
  console.error('[news-game-service] Server Error:', err.message);
  res.status(500).json({ message: 'Internal News & Game Service Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 News & Game Service running on port ${PORT}`);
});
