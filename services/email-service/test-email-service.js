'use strict';

const http = require('http');

const EMAIL_SERVICE_URL = 'http://localhost:5002';
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
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║     Email Service Integration Test Suite     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('1️⃣  Direct Health Check');
  await check('Email Service /health responds 200', async () => {
    const res = await request(`${EMAIL_SERVICE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.service === 'email-service', `Expected email-service, got ${res.body?.service}`);
  });

  console.log('\n2️⃣  Email Endpoints via Gateway Proxy');
  await check('POST /api/email/send-otp via Gateway responds 200', async () => {
    const res = await request(`${GATEWAY_URL}/api/email/send-otp`, {
      method: 'POST',
      body: { email: 'test@example.com', otp: '123456', name: 'Tester' },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(res.body?.success === true, `Expected success=true, got ${JSON.stringify(res.body)}`);
  });

  await check('POST /api/email/send-reset-otp via Gateway responds 200', async () => {
    const res = await request(`${GATEWAY_URL}/api/email/send-reset-otp`, {
      method: 'POST',
      body: { email: 'test@example.com', otp: '654321', name: 'Tester' },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(res.body?.success === true, `Expected success=true, got ${JSON.stringify(res.body)}`);
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
