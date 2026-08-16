'use strict';

/**
 * Proxy factory module.
 *
 * Uses http-proxy-middleware to forward requests to internal services.
 * Uses `pathFilter` so Express does NOT strip the prefix when proxying.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Structured error logger helper for the API Gateway.
 */
function logProxyError(type, path, message) {
  process.stderr.write(`[gateway] ${type} proxy error for ${path}: ${message}\n`);
}

/**
 * HTTP Proxy error handler.
 * Safely returns a 503 JSON response when an Express HTTP response object is available.
 */
function onHttpError(err, req, res) {
  const target = req?.originalUrl || req?.url || 'unknown';
  logProxyError('HTTP', target, err.message);

  if (res && typeof res.status === 'function') {
    if (!res.headersSent) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'The upstream service is currently unreachable. Please try again later.',
      });
    }
  }
}

/**
 * WebSocket Proxy error handler.
 * Handles errors on WebSocket upgrade/stream connections (where 3rd arg is a net.Socket, NOT res).
 * MUST NOT call Express response methods like res.status() or res.json().
 */
function onWsError(err, req, socket) {
  const target = req?.url || 'socket.io';
  logProxyError('WS', target, err.message);

  if (socket && typeof socket.destroy === 'function') {
    if (socket.writable && !socket.destroyed) {
      try {
        socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');
      } catch (_) {
        // Ignore socket write errors during failure teardown
      }
    }
    socket.destroy();
  }
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
    on: { error: onHttpError },
  });
}

/**
 * Build a proxy middleware for the Email Service.
 * Routes: /api/email/*
 */
function buildEmailProxy(pathFilter = ['/api/email']) {
  const target = process.env.EMAIL_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
    on: { error: onHttpError },
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
    on: { error: onHttpError },
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
    on: { error: onHttpError },
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
      error: onWsError,
    },
  });
}

module.exports = {
  buildUserProxy,
  buildEmailProxy,
  buildNewsGameProxy,
  buildChatProxy,
  buildChatWsProxy,
  onHttpError,
  onWsError,
};

