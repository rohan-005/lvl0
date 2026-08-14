'use strict';

const http = require('http');

const NEWS_GAME_SERVICE_URL = 'http://localhost:5003';
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
  console.log('║  News & Game Service Integration Test Suite  ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('1️⃣  Direct Health Check');
  await check('News & Game Service /health responds 200', async () => {
    const res = await request(`${NEWS_GAME_SERVICE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.service === 'news-game-service', `Expected news-game-service, got ${res.body?.service}`);
  });

  console.log('\n2️⃣  News Endpoints via Gateway Proxy');
  await check('GET /api/news via Gateway responds with news data', async () => {
    const res = await request(`${GATEWAY_URL}/api/news?limit=5`);
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(res.body?.success === true, `Expected success=true, got ${JSON.stringify(res.body)}`);
  });

  console.log('\n3️⃣  Games Endpoints via Gateway Proxy');
  await check('GET /api/games via Gateway responds with games list (or graceful fallback)', async () => {
    const res = await request(`${GATEWAY_URL}/api/games?page_size=5`);
    assert(res.status === 200, `Expected 200, got ${res.status}: ${res.raw}`);
    assert(Array.isArray(res.body?.results), `Expected results array, got ${typeof res.body?.results}`);
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
