'use strict';

const http = require('http');

const CHAT_SERVICE_URL = 'http://localhost:5004';
const GATEWAY_URL = 'http://localhost:4000';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

let passed = 0;
let failed = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`  ✅  ${label}`);
    passed++;
  } catch (e) {
    console.log(`  ❌  ${label} — ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function run() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Chat Room Service Integration Test Suite   ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('1️⃣  Direct Health Check');
  await check('Chat Room Service /health responds 200', async () => {
    const res = await request(`${CHAT_SERVICE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.service === 'chat-room-service', `Expected chat-room-service, got ${res.body?.service}`);
  });

  console.log('\n2️⃣  Chat Endpoints via Gateway Proxy');
  await check('GET /api/chat/rooms without auth returns 401 via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/chat/rooms`);
    assert(res.status === 401, `Expected 401, got ${res.status}: ${res.raw}`);
  });

  await check('GET /api/chat/users without auth returns 401 via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/chat/users`);
    assert(res.status === 401, `Expected 401, got ${res.status}: ${res.raw}`);
  });

  await check('GET /api/chat/General/main without auth returns 401 via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/chat/General/main`);
    assert(res.status === 401, `Expected 401, got ${res.status}: ${res.raw}`);
  });

  console.log('\n3️⃣  Socket.IO HTTP Polling endpoint via Gateway');
  await check('GET /socket.io/?EIO=4&transport=polling responds via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/socket.io/?EIO=4&transport=polling`);
    assert(res.status === 200, `Expected 200 for Socket.IO polling, got ${res.status}: ${res.raw}`);
  });

  console.log('\n' + '─'.repeat(44));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} total`);
  console.log('─'.repeat(44) + '\n');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Test suite crash:', e);
  process.exit(1);
});
