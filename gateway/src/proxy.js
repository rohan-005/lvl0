'use strict';

/**
 * Proxy factory module.
 *
 * Uses http-proxy-middleware to forward requests to internal services.
 * Headers (Authorization, Content-Type, etc.), request bodies, query
 * parameters and HTTP methods are all forwarded transparently.
 *
 * Multipart/form-data (file uploads) work because http-proxy-middleware
 * streams the raw request — it does NOT parse/consume the body first.
 *
 * NOTE: Do NOT add express.json() / express.urlencoded() before these
 * proxies, or the body stream will be consumed before proxying.
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Service-unavailable handler — returns a clean 503 instead of crashing.
 */
function onError(err, req, res) {
  const target = res.req?.path || req.url;
  console.error(`[gateway] Proxy error for ${target}: ${err.message}`);

  // res may already have been used if the upstream sent a partial response
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
function buildUserProxy(pathPrefix) {
  const target = process.env.USER_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // Preserve the full path — the service expects /api/auth/…
    pathRewrite: undefined,
    on: { error: onError },
    // Forward the raw Authorization header so JWT auth works unchanged
    headers: {},
  });
}

/**
 * Build a proxy middleware for the News/Game Service.
 * Routes: /api/news/*, /api/games/*
 */
function buildNewsGameProxy(pathPrefix) {
  const target = process.env.NEWS_GAME_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: undefined,
    on: { error: onError },
  });
}

/**
 * Build a proxy middleware for the Chat Room Service (HTTP).
 * Routes: /api/chat/*, /uploads/*
 */
function buildChatProxy(pathPrefix) {
  const target = process.env.CHAT_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: undefined,
    on: { error: onError },
  });
}

/**
 * Build a WebSocket proxy for Socket.IO traffic.
 * Used by the HTTP server's 'upgrade' event handler.
 *
 * Socket.IO connections arrive as:
 *   GET /socket.io/?EIO=4&transport=websocket  (upgrade)
 *   GET /socket.io/?EIO=4&transport=polling    (HTTP long-poll fallback)
 *
 * We proxy both /socket.io/* to the Chat Service.
 */
function buildChatWsProxy() {
  const target = process.env.CHAT_SERVICE_URL;
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,            // Enable WebSocket proxying
    pathRewrite: undefined,
    on: {
      error: (err, req, res) => {
        console.error(`[gateway] WS proxy error: ${err.message}`);
        // For WebSocket upgrade failures, the socket may already be destroyed
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
