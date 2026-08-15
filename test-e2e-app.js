'use strict';

const http = require('http');

const GATEWAY_URL = 'http://localhost:4000';
const TEST_EMAIL = 'rohandhanerwal@gmail.com';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;
    const headers = options.headers || {};
    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers,
      timeout: 10000,
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
    if (body) req.write(body);
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
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║   FULL APP E2E INTEGRATION TEST (${TEST_EMAIL})   ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // 1. Gateway Health
  console.log('1️⃣  API Gateway Health Check');
  await check('Gateway /health responds 200 with all microservices', async () => {
    const res = await request(`${GATEWAY_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.services?.user, 'Missing user-service URL');
    assert(res.body?.services?.email, 'Missing email-service URL');
    assert(res.body?.services?.news_game, 'Missing news-game-service URL');
    assert(res.body?.services?.chat, 'Missing chat-room-service URL');
    console.log(`     ← Gateway active with MongoDB Atlas cluster`);
  });

  // 2. User Service + Email for rohandhanerwal@gmail.com
  console.log(`\n2️⃣  User Service & Registration Flow for ${TEST_EMAIL}`);
  await check(`POST /api/auth/register for ${TEST_EMAIL}`, async () => {
    const res = await request(`${GATEWAY_URL}/api/auth/register`, {
      method: 'POST',
      body: {
        name: 'Rohan Dhanerwal',
        email: TEST_EMAIL,
        password: 'Password@123',
        accountType: 'developer',
      },
    });
    // Expected: 201 created or 400 if user already exists in DB
    assert(res.status === 201 || res.status === 400, `Unexpected status ${res.status}: ${res.raw}`);
    if (res.status === 201) {
      console.log(`     ← Created new user account for ${TEST_EMAIL}`);
    } else {
      console.log(`     ← User ${TEST_EMAIL} exists in MongoDB Atlas (${res.body?.message})`);
    }
  });

  await check(`POST /api/otp/send-verification for ${TEST_EMAIL}`, async () => {
    const res = await request(`${GATEWAY_URL}/api/otp/send-verification`, {
      method: 'POST',
      body: { email: TEST_EMAIL },
    });
    assert(res.status === 200 || res.status === 400, `Unexpected status ${res.status}: ${res.raw}`);
    console.log(`     ← OTP request response: ${res.body?.message || res.raw}`);
  });

  await check(`POST /api/otp/forgot-password for ${TEST_EMAIL}`, async () => {
    const res = await request(`${GATEWAY_URL}/api/otp/forgot-password`, {
      method: 'POST',
      body: { email: TEST_EMAIL },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    console.log(`     ← Password reset OTP dispatched for ${TEST_EMAIL}`);
  });

  // 3. Direct Email Service Check
  console.log('\n3️⃣  Direct Email Service Endpoint Proxy Check');
  await check(`POST /api/email/send-otp for ${TEST_EMAIL}`, async () => {
    const res = await request(`${GATEWAY_URL}/api/email/send-otp`, {
      method: 'POST',
      body: { email: TEST_EMAIL, otp: '888999', name: 'Rohan' },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(res.body?.success === true, `Expected success=true, got ${JSON.stringify(res.body)}`);
  });

  // 4. News & Game Service
  console.log('\n4️⃣  News & Game Service Proxy Checks');
  await check('GET /api/news via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/news?limit=5`);
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(res.body?.success === true, `Expected success=true`);
  });

  await check('GET /api/games via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/games?page_size=5`);
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(Array.isArray(res.body?.results), `Expected results array`);
  });

  // 5. Chat Room Service & WebSockets
  console.log('\n5️⃣  Chat Room Service & Socket.IO Proxy Checks');
  await check('GET /api/chat/rooms via Gateway (401 without auth)', async () => {
    const res = await request(`${GATEWAY_URL}/api/chat/rooms`);
    assert(res.status === 401, `Expected 401, got ${res.status}: ${res.raw}`);
  });

  await check('GET /socket.io/?EIO=4&transport=polling via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/socket.io/?EIO=4&transport=polling`);
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
  });

  console.log('\n' + '─'.repeat(50));
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TOTAL`);
  console.log('─'.repeat(50) + '\n');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Test script crash:', e);
  process.exit(1);
});
