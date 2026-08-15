'use strict';

const http = require('http');

const USER_SERVICE_URL = 'http://localhost:5001';
const GATEWAY_URL = 'http://localhost:4000';

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
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║    User Service Integration Test Suite   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // 1. Direct Health Check
  console.log('1️⃣  Direct User Service Health Check');
  await check('User service /health responds 200', async () => {
    const res = await request(`${USER_SERVICE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.service === 'user-service', `Expected user-service, got ${res.body?.service}`);
  });

  // 2. Gateway Proxy Health & Auth Direct
  console.log('\n2️⃣  Authentication Endpoints via Gateway Proxy');
  const testUser = {
    name: 'Test Runner',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    accountType: 'gamer',
  };

  let token = null;

  await check('POST /api/auth/register via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/auth/register`, {
      method: 'POST',
      body: testUser,
    });
    assert(res.status === 201 || res.status === 200, `Expected 201/200, got ${res.status}: ${res.raw}`);
    assert(res.body?.success === true, `Expected success=true, got ${JSON.stringify(res.body)}`);
  });

  await check('POST /api/auth/verify-email with invalid OTP gives 400', async () => {
    const res = await request(`${GATEWAY_URL}/api/auth/verify-email`, {
      method: 'POST',
      body: { email: testUser.email, otp: '000000' },
    });
    assert(res.status === 400, `Expected 400, got ${res.status}: ${res.raw}`);
  });

  await check('POST /api/auth/login with unverified user gives 400', async () => {
    const res = await request(`${GATEWAY_URL}/api/auth/login`, {
      method: 'POST',
      body: { email: testUser.email, password: testUser.password },
    });
    assert(res.status === 400, `Expected 400, got ${res.status}: ${res.raw}`);
    assert(res.body?.message?.includes('verified'), `Expected email not verified msg, got ${res.raw}`);
  });

  // 3. OTP Endpoints via Gateway Proxy
  console.log('\n3️⃣  OTP Endpoints via Gateway Proxy');
  await check('POST /api/otp/send-verification via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/otp/send-verification`, {
      method: 'POST',
      body: { email: testUser.email },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
  });

  await check('POST /api/otp/forgot-password via Gateway', async () => {
    const res = await request(`${GATEWAY_URL}/api/otp/forgot-password`, {
      method: 'POST',
      body: { email: testUser.email },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
  });

  // 4. Protected Route without token via Gateway Proxy
  console.log('\n4️⃣  Protected Route Verification');
  await check('GET /api/auth/me without token returns 401', async () => {
    const res = await request(`${GATEWAY_URL}/api/auth/me`);
    assert(res.status === 401, `Expected 401, got ${res.status}: ${res.raw}`);
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
