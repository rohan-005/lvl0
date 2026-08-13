/**
 * API Configuration — Gateway-only architecture.
 *
 * The frontend communicates EXCLUSIVELY with the API Gateway.
 * Individual service URLs (user-service, chat-service, etc.) are
 * internal to the gateway and are NEVER sent to the browser.
 *
 * All axios instances and socket connections must use GATEWAY_URL.
 */

const GATEWAY_URL =
  (import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000').replace(/\/$/, '');

export const API_CONFIG = {
  /** Base URL for all HTTP API calls → goes through the gateway */
  GATEWAY_URL,

  /** Base URL for axios instances pointing to the REST API */
  API_BASE_URL: `${GATEWAY_URL}/api`,

  /** Socket.IO connection URL → gateway proxies WS upgrades to chat-service */
  SOCKET_URL: GATEWAY_URL,
};

export default API_CONFIG;
