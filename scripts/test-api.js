#!/usr/bin/env node

/**
 * OpenAlice India - Automated API Test Suite
 * Comprehensive testing of all endpoints with detailed reporting
 *
 * Usage:
 *   node scripts/test-api.js
 *   node scripts/test-api.js --verbose
 *   node scripts/test-api.js --filter credentials
 */

import http from 'http';
import { URL } from 'url';

// Test Configuration
const CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  apiVersion: 'v1',
  authToken: process.env.AUTH_TOKEN || 'test-token-12345',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  timeout: 10000, // 10 seconds
  verbose: process.argv.includes('--verbose'),
  filter: process.argv.find(arg => arg === '--filter') ?
    process.argv[process.argv.indexOf('--filter') + 1] : null,
};

// Test Results Tracker
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Log helper functions
 */
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
  section: (msg) => {
    console.log('');
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}${msg}${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log('');
  },
  table: (data) => {
    console.table(data);
  },
};

/**
 * Make HTTP request
 */
async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${CONFIG.baseUrl}/api/${CONFIG.apiVersion}${path}`);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.authToken}`,
      },
      timeout: CONFIG.timeout,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test assertion
 */
async function test(name, testFn) {
  if (CONFIG.filter && !name.toLowerCase().includes(CONFIG.filter.toLowerCase())) {
    results.skipped++;
    results.tests.push({ name, status: 'SKIPPED' });
    return;
  }

  try {
    if (CONFIG.verbose) log.info(`Testing: ${name}`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    log.success(name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    log.error(`${name}: ${error.message}`);
  }
}

/**
 * Assert helpers
 */
const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
  },
  ok: (value, msg) => {
    if (!value) {
      throw new Error(msg || 'Assertion failed');
    }
  },
  includes: (str, substring, msg) => {
    if (!str.includes(substring)) {
      throw new Error(`${msg || 'Assertion failed'}: "${str}" does not include "${substring}"`);
    }
  },
  statusCode: (response, expected, msg) => {
    if (response.status !== expected) {
      throw new Error(
        `${msg || 'Status code mismatch'}: expected ${expected}, got ${response.status}. ` +
        `Body: ${response.rawBody.substring(0, 200)}`
      );
    }
  },
};

/**
 * Test Suites
 */
async function runHealthTests() {
  log.section('HEALTH CHECKS');

  await test('Liveness probe (GET /health/live)', async () => {
    const response = await request('GET', '/health/live');
    assert.statusCode(response, 200, 'Liveness probe failed');
    assert.ok(response.body.status, 'Missing status field');
  });

  await test('Readiness probe (GET /health/ready)', async () => {
    const response = await request('GET', '/health/ready');
    assert.statusCode(response, 200, 'Readiness probe failed');
    assert.ok(response.body.status, 'Missing status field');
  });
}

async function runCredentialTests() {
  log.section('CREDENTIAL MANAGEMENT (SECURITY TESTS)');

  const testCredentials = {
    apiKey: 'test_api_key_xyz123',
    apiSecret: 'test_api_secret_abc789',
  };

  await test('Save encrypted credentials (POST /credentials/zerodha)', async () => {
    const response = await request('POST', '/credentials/zerodha', testCredentials);
    assert.statusCode(response, 200, 'Failed to save credentials');
    assert.ok(response.body.keyPrefix, 'Missing keyPrefix in response');
  });

  await test('Check credential existence (GET /credentials/zerodha/check)', async () => {
    const response = await request('GET', '/credentials/zerodha/check');
    assert.statusCode(response, 200, 'Failed to check credentials');
  });

  await test('Get credential status (GET /credentials/zerodha/status)', async () => {
    const response = await request('GET', '/credentials/zerodha/status');
    assert.statusCode(response, 200, 'Failed to get status');
    assert.ok(response.body.status, 'Missing status field');
  });

  await test('Validate Zerodha connection (POST /credentials/zerodha/validate)', async () => {
    const response = await request('POST', '/credentials/zerodha/validate');
    // Status 200 or error message is fine - we're testing the endpoint works
    assert.ok([200, 400].includes(response.status), 'Unexpected status code');
  });

  await test('Delete credentials securely (DELETE /credentials/zerodha)', async () => {
    const response = await request('DELETE', '/credentials/zerodha');
    assert.statusCode(response, 200, 'Failed to delete credentials');
  });
}

async function runDiagnosticsTests() {
  log.section('DIAGNOSTICS & TESTING ENDPOINTS');

  await test('Quick health check (GET /testing/health)', async () => {
    const response = await request('GET', '/testing/health');
    assert.statusCode(response, 200, 'Health check failed');
  });

  await test('Run all tests (POST /testing/run-all)', async () => {
    const response = await request('POST', '/testing/run-all');
    assert.statusCode(response, 200, 'Test execution failed');
    assert.ok(response.body.results, 'Missing results in response');
    assert.ok(Array.isArray(response.body.results), 'Results should be an array');
  });
}

async function runTradingTests() {
  log.section('TRADING ENDPOINTS');

  await test('Fetch portfolio (GET /trading/portfolio)', async () => {
    const response = await request('GET', '/trading/portfolio');
    // May fail if no credentials, but endpoint should be accessible
    assert.ok([200, 400, 401].includes(response.status), 'Unexpected status code');
  });

  await test('Fetch orders (GET /trading/orders)', async () => {
    const response = await request('GET', '/trading/orders');
    assert.ok([200, 400, 401].includes(response.status), 'Unexpected status code');
  });

  await test('Fetch positions (GET /trading/positions)', async () => {
    const response = await request('GET', '/trading/positions');
    assert.ok([200, 400, 401].includes(response.status), 'Unexpected status code');
  });

  await test('Fetch holdings (GET /trading/holdings)', async () => {
    const response = await request('GET', '/trading/holdings');
    assert.ok([200, 400, 401].includes(response.status), 'Unexpected status code');
  });
}

async function runErrorHandlingTests() {
  log.section('ERROR HANDLING & EDGE CASES');

  await test('Unauthorized request (missing auth token)', async () => {
    // Simulate request without auth header
    const url = new URL(`${CONFIG.baseUrl}/api/${CONFIG.apiVersion}/credentials/zerodha/status`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          resolve();
        } else {
          reject(new Error(`Expected 401/403, got ${res.statusCode}`));
        }
        res.on('data', () => {});
        res.on('end', () => {});
      });
      req.on('error', reject);
      req.end();
    });
  });

  await test('Invalid endpoint returns 404', async () => {
    const response = await request('GET', '/invalid/endpoint');
    assert.statusCode(response, 404, 'Invalid endpoint should return 404');
  });

  await test('Malformed JSON rejected', async () => {
    const url = new URL(`${CONFIG.baseUrl}/api/${CONFIG.apiVersion}/credentials/zerodha`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.authToken}`,
      },
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (res.statusCode === 400) {
          resolve();
        } else {
          reject(new Error(`Expected 400, got ${res.statusCode}`));
        }
        res.on('data', () => {});
        res.on('end', () => {});
      });
      req.on('error', reject);
      req.write('{ invalid json');
      req.end();
    });
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('');
  console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  OpenAlice India - API Test Suite             ║${colors.reset}`);
  console.log(`${colors.blue}║  Testing: ${CONFIG.baseUrl.padEnd(38)}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  try {
    await runHealthTests();
    await runCredentialTests();
    await runDiagnosticsTests();
    await runTradingTests();
    await runErrorHandlingTests();
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }

  // Print summary
  printSummary();
}

function printSummary() {
  log.section('TEST SUMMARY');

  console.log(`${colors.green}✓ Passed:  ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed:  ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Skipped: ${results.skipped}${colors.reset}`);
  console.log('');

  const total = results.passed + results.failed + results.skipped;
  const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  console.log(`Overall Success Rate: ${successRate}%`);
  console.log('');

  // Print failed tests details
  if (results.failed > 0) {
    log.section('FAILED TESTS');
    results.tests
      .filter(t => t.status === 'FAILED')
      .forEach(test => {
        log.error(`${test.name}: ${test.error}`);
      });
  }

  // Exit with appropriate code
  if (results.failed === 0) {
    console.log(`${colors.green}All tests passed! ✓${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}Some tests failed!${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  log.error(`Test suite error: ${error.message}`);
  process.exit(1);
});
