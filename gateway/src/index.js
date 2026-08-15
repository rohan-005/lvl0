'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const { buildUserProxy, buildEmailProxy, buildNewsGameProxy, buildChatProxy, buildChatWsProxy } = require('./proxy');

// ─── Validate required env ───────────────────────────────────────────────────
const REQUIRED_ENV = ['USER_SERVICE_URL', 'EMAIL_SERVICE_URL', 'NEWS_GAME_SERVICE_URL', 'CHAT_SERVICE_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[gateway] FATAL: Missing required env var: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();

// ─── Request ID ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = uuidv4();
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── Logger ───────────────────────────────────────────────────────────────────
app.use(morgan(':method :url :status :response-time ms'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ─── Gateway Health ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    services: {
      user: process.env.USER_SERVICE_URL,
      email: process.env.EMAIL_SERVICE_URL,
      news_game: process.env.NEWS_GAME_SERVICE_URL,
      chat: process.env.CHAT_SERVICE_URL,
    },
  });
});

// ─── Proxy Routes ─────────────────────────────────────────────────────────────
//
// /api/auth/*  → user-service
// /api/otp/*   → user-service
// /api/email/* → email-service
// /api/news/*  → news-game-service
// /api/games/* → news-game-service
// /api/chat/*  → chat-room-service
// /uploads/*   → chat-room-service
// /socket.io/* → chat-room-service

app.use(buildUserProxy(['/api/auth', '/api/otp']));
app.use(buildEmailProxy(['/api/email']));
app.use(buildNewsGameProxy(['/api/news', '/api/games']));
app.use(buildChatProxy(['/api/chat', '/uploads', '/socket.io']));

// ─── Gateway-level 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found on gateway' });
});

// ─── Gateway-level error handler ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[gateway] Unhandled error:', err.message);
  res.status(502).json({ error: 'Gateway error', detail: err.message });
});

// ─── Start HTTP + WebSocket server ───────────────────────────────────────────
const { createServer } = require('http');
const httpServer = createServer(app);

// Attach WebSocket proxy for Socket.IO traffic
const chatWsProxy = buildChatWsProxy();
httpServer.on('upgrade', (req, socket, head) => {
  console.log(`[gateway] WS upgrade: ${req.url}`);
  chatWsProxy.upgrade(req, socket, head);
});

httpServer.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`   → USER_SERVICE_URL  : ${process.env.USER_SERVICE_URL}`);
  console.log(`   → EMAIL_SERVICE_URL : ${process.env.EMAIL_SERVICE_URL}`);
  console.log(`   → NEWS_GAME_SERVICE : ${process.env.NEWS_GAME_SERVICE_URL}`);
  console.log(`   → CHAT_SERVICE_URL  : ${process.env.CHAT_SERVICE_URL}`);
  console.log(`   → CLIENT_URL (CORS) : ${CLIENT_URL}\n`);
});
