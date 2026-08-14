'use strict';

/**
 * Proxy factory module.
 *
 * Uses http-proxy-middleware to forward requests to internal services.
 * Uses `pathFilter` so Express does NOT strip the prefix when proxying.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Service-unavailable handler — returns a clean 503 instead of crashing.
 */
function onError(err, req, res) {
  const target = res.req?.path || req.url;
  console.error(`[gateway] Proxy error for ${target}: ${err.message}`);

  if (res.headersSent) return;

  res.status(503).json({
    error: 'Service unavailable',
    message: 'The upstream service is currently unreachable. Please try again later.',
  });
}

/**
 * Build a proxy middleware for the User Service.
 * Routes: /api/auth/*, /api/otp/*
 */
function buildUserProxy(pathFilter = ['/api/auth', '/api/otp']) {
  const target = process.env.USER_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
    on: { error: onError },
  });
}

/**
 * Build a proxy middleware for the News/Game Service.
 * Routes: /api/news/*, /api/games/*
 */
function buildNewsGameProxy(pathFilter = ['/api/news', '/api/games']) {
  const target = process.env.NEWS_GAME_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
    on: { error: onError },
  });
}

/**
 * Build a proxy middleware for the Chat Room Service (HTTP).
 * Routes: /api/chat/*, /uploads/*, /socket.io/*
 */
function buildChatProxy(pathFilter = ['/api/chat', '/uploads', '/socket.io']) {
  const target = process.env.CHAT_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
    on: { error: onError },
  });
}

/**
 * Build a WebSocket proxy for Socket.IO traffic.
 */
function buildChatWsProxy() {
  const target = process.env.CHAT_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    pathFilter: ['/socket.io'],
    on: {
      error: (err, req, res) => {
        console.error(`[gateway] WS proxy error: ${err.message}`);
        if (res && !res.headersSent) {
          res.status(503).json({ error: 'WebSocket service unavailable' });
        }
      },
    },
  });
}

module.exports = {
  buildUserProxy,
  buildNewsGameProxy,
  buildChatProxy,
  buildChatWsProxy,
};
