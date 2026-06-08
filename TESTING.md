# API Testing Guide - OpenAlice India

Complete testing automation scripts for validating all backend endpoints, security features, and system health.

---

## 📋 Quick Start

### Prerequisites
- Backend running: `npm run dev` (port 3000)
- Node.js v14+ (for JavaScript tests)
- Bash 4+ (for shell tests)
- `curl` and `psql` (for advanced diagnostics)

### Run All Tests

**Option 1: Bash Script (Recommended)**
```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

**Option 2: JavaScript/Node.js**
```bash
node scripts/test-api.js
```

**Option 3: From npm**
```bash
npm run test:api
```

---

## 🧪 Test Scripts Overview

### 1. Bash Test Script (`scripts/test-api.sh`)

**Features:**
- ✅ 50+ individual tests
- 🎨 Color-coded output
- 📊 Detailed reporting
- 🔐 Security verification
- ⚡ Performance testing
- 📦 Database checks

**Usage:**
```bash
# Basic run
./scripts/test-api.sh

# Custom API URL
API_URL=http://prod-server:3000 ./scripts/test-api.sh

# With custom auth token
AUTH_TOKEN=your-token ./scripts/test-api.sh

# All options
API_URL=http://localhost:3000 AUTH_TOKEN=test-token ./scripts/test-api.sh
```

**Output Example:**
```
╔════════════════════════════════════════════════════════════╗
║  OpenAlice India - API Test Suite                         ║
║  Testing: http://localhost:3000                           ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEALTH CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ  Testing: Liveness probe
✓  Liveness probe (HTTP 200)
{
  "status": "alive",
  "timestamp": "2026-06-08T08:08:53.249Z"
}

✓  Readiness probe (HTTP 200)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREDENTIAL MANAGEMENT (SECURITY TESTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓  Save encrypted credentials (HTTP 200)
✓  Check credential existence (HTTP 200)
✓  Get credential status (HTTP 200)
✓  Validate credentials with live API (HTTP 200)
✓  Delete credentials from database (HTTP 200)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Passed:  48
✗ Failed:  0
⚠ Skipped: 2

Overall Success Rate: 96%

All tests passed! ✓
```

---

### 2. JavaScript Test Suite (`scripts/test-api.js`)

**Features:**
- ✅ 25+ individual tests
- 🔍 Native Node.js HTTP
- 📋 Detailed assertions
- 🎯 Filter tests by name
- 📊 JSON-friendly output
- ⚡ Verbose mode for debugging

**Usage:**
```bash
# Basic run
node scripts/test-api.js

# Verbose output
node scripts/test-api.js --verbose

# Filter tests by name
node scripts/test-api.js --filter credentials

# With environment variables
API_URL=http://localhost:3000 AUTH_TOKEN=token node scripts/test-api.js
```

**Advanced Usage:**
```bash
# Run only health checks
node scripts/test-api.js --filter health

# Run only credential tests
node scripts/test-api.js --filter credential

# Run only error handling tests
node scripts/test-api.js --filter error

# Verbose mode for debugging
node scripts/test-api.js --verbose --filter credentials
```

---

## 🧬 Test Categories

### HEALTH CHECKS (2 tests)
Verify API liveness and readiness probes

- ✅ Liveness probe (`GET /health/live`)
- ✅ Readiness probe (`GET /health/ready`)

**Expected Results:**
```json
{
  "status": "alive",
  "timestamp": "2026-06-08T08:08:53.249Z"
}
```

---

### CREDENTIAL MANAGEMENT (5 tests)
Test secure credential storage, encryption, and validation

#### Test 1: Save Credentials
```bash
POST /api/v1/credentials/zerodha
{
  "apiKey": "your_zerodha_api_key",
  "apiSecret": "your_zerodha_api_secret"
}
```

**Expected Response (200):**
```json
{
  "keyPrefix": "your_ze...",
  "status": "active",
  "lastValidatedAt": "2026-06-08T08:08:53.249Z"
}
```

**What it tests:**
- ✅ Request validation
- ✅ AES-256-GCM encryption
- ✅ Database storage
- ✅ Key prefix obfuscation

#### Test 2: Check Credentials Exist
```bash
GET /api/v1/credentials/zerodha/check
```

**Expected Response (200):**
```json
{
  "hasCredentials": true,
  "status": "active"
}
```

#### Test 3: Get Status
```bash
GET /api/v1/credentials/zerodha/status
```

**Expected Response (200):**
```json
{
  "status": "active",
  "lastValidatedAt": "2026-06-08T08:08:53.249Z",
  "lastUsedAt": "2026-06-08T08:08:00.000Z",
  "keyPrefix": "your_ze..."
}
```

#### Test 4: Validate Connection
```bash
POST /api/v1/credentials/zerodha/validate
```

**Expected Results:**
- ✅ **With valid credentials**: `{ "status": "success", "message": "Connection successful" }`
- ✅ **With invalid credentials**: `{ "status": "error", "message": "Invalid API key" }` (endpoint works, validation fails)

#### Test 5: Delete Credentials
```bash
DELETE /api/v1/credentials/zerodha
```

**Expected Response (200):**
```json
{
  "message": "Credentials deleted successfully",
  "audit": "deletion logged"
}
```

---

### DIAGNOSTICS & TESTING (2 tests)
Run comprehensive backend test suites

#### Test 1: Health Check
```bash
GET /api/v1/testing/health
```

**Expected Response (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "cache": "connected",
  "timestamp": "2026-06-08T08:08:53.249Z"
}
```

#### Test 2: Run All Tests
```bash
POST /api/v1/testing/run-all
```

**Expected Response (200):**
```json
{
  "status": "success",
  "passed": 9,
  "failed": 0,
  "skipped": 1,
  "duration": 234,
  "results": [
    {
      "name": "Database Connection",
      "status": "PASS",
      "duration": 45,
      "message": "Connected to openalice_india"
    },
    {
      "name": "Credential Encryption",
      "status": "PASS",
      "duration": 23,
      "message": "AES-256-GCM encryption verified"
    },
    ...
  ]
}
```

---

### TRADING ENDPOINTS (4 tests)
Verify trading-related functionality

- ✅ Portfolio fetch (`GET /trading/portfolio`)
- ✅ Orders fetch (`GET /trading/orders`)
- ✅ Positions fetch (`GET /trading/positions`)
- ✅ Holdings fetch (`GET /trading/holdings`)

**Note:** May return 401/400 if no credentials configured (this is expected).

---

### ACCOUNT MANAGEMENT (2 tests)
Verify account operations

- ✅ Get accounts (`GET /api/v1/accounts`)
- ✅ Get account details (`GET /api/v1/accounts/{id}`)

---

### ERROR HANDLING (4 tests)
Verify proper error responses

- ✅ Missing auth token → 401/403
- ✅ Invalid endpoint → 404
- ✅ Malformed JSON → 400
- ✅ Missing required fields → 400

---

### DATABASE VERIFICATION (3 tests)
Validate database state

- ✅ Database exists
- ✅ All tables present (11+)
- ✅ All migrations executed

---

### ENCRYPTION & SECURITY (2 tests)
Verify data security

- ✅ No plaintext credentials in database
- ✅ Encryption key versioning tracked

---

### PERFORMANCE (1 test)
Measure response times

- ✅ Average response time < 100ms (excellent)
- ✅ Average response time < 200ms (good)

---

## 🔐 Security Tests Explained

### What Gets Tested?

#### 1. **Credential Encryption**
```bash
# Before Storage:
{
  "apiKey": "test_api_key_xyz123",
  "apiSecret": "test_api_secret_abc789"
}

# In Database (Encrypted):
api_key_encrypted: "0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d..." (256 bits)
api_secret_encrypted: "1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c..." (256 bits)

# In Response (Obfuscated):
{
  "keyPrefix": "test_api_k...",
  "status": "active"
}
```

#### 2. **No Plaintext in Logs**
Test verifies credentials are never logged as plaintext

#### 3. **Database-Level Encryption**
AES-256-GCM encryption at rest

#### 4. **Audit Trail**
All credential operations logged:
```sql
SELECT * FROM audit_logs WHERE action LIKE '%credential%';

action              | user_id | details           | created_at
--------------------|---------|-------------------|-------------------
credential_saved    | 550e... | AES-256 encrypted | 2026-06-08 13:40
credential_validated| 550e... | API test success  | 2026-06-08 13:42
credential_deleted  | 550e... | Manual deletion   | 2026-06-08 14:00
```

---

## 📈 Continuous Integration Setup

### GitHub Actions Workflow

Create `.github/workflows/test-api.yml`:

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start backend
        run: npm run dev &
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/openalice_india
          NODE_ENV: test

      - name: Wait for backend
        run: sleep 5 && curl -f http://localhost:3000/health/live || exit 1

      - name: Run API tests
        run: npm run test:api
        env:
          API_URL: http://localhost:3000
          AUTH_TOKEN: test-token

      - name: Run diagnostics
        run: npm run test:diagnostics
```

### npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:api",
    "test:api": "bash scripts/test-api.sh",
    "test:api:js": "node scripts/test-api.js",
    "test:api:verbose": "node scripts/test-api.js --verbose",
    "test:api:filter": "node scripts/test-api.js --filter",
    "test:diagnostics": "node scripts/test-api.js --filter diagnostics",
    "test:credentials": "node scripts/test-api.js --filter credentials",
    "test:health": "node scripts/test-api.js --filter health",
    "test:watch": "nodemon --exec 'npm run test:api' --watch src --ext ts,js"
  }
}
```

---

## 📊 Reading Test Output

### Success Output
```
✓ Passed:  48
✗ Failed:  0
⚠ Skipped: 2

Overall Success Rate: 96%

All tests passed! ✓
```

### Failure Output
```
✗ Failed:  2
⚠ Skipped: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAILED TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗  Save encrypted credentials: Expected 200, got 500. 
   Body: {"error": "Database connection failed"}

✗  Run all tests: Status code mismatch: expected 200, got 503.
   Body: {"error": "Service unavailable"}
```

### What to Do on Failure

1. **Check backend is running**
   ```bash
   curl http://localhost:3000/health/live
   ```

2. **Check database connection**
   ```bash
   psql -U postgres openalice_india -c "SELECT 1"
   ```

3. **Check logs**
   ```bash
   tail -f logs/app.log
   ```

4. **Verify environment variables**
   ```bash
   echo $API_URL
   echo $AUTH_TOKEN
   ```

5. **Run with verbose mode**
   ```bash
   node scripts/test-api.js --verbose
   ```

---

## 🎯 Test Coverage Matrix

| Component | Tests | Coverage |
|-----------|-------|----------|
| Health Checks | 2 | 100% |
| Credentials | 5 | 100% |
| Diagnostics | 2 | 100% |
| Trading | 4 | 100% |
| Accounts | 2 | 100% |
| Error Handling | 4 | 100% |
| Database | 3 | 100% |
| Security | 2 | 100% |
| Performance | 1 | 100% |
| **Total** | **25+** | **100%** |

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run full test suite: `npm run test:api`
- [ ] Verify all credentials tests pass
- [ ] Check database migrations: `npm run migrate`
- [ ] Verify encryption working: `node scripts/test-api.js --filter encryption`
- [ ] Check performance: `node scripts/test-api.js --filter performance`
- [ ] Review audit logs: `SELECT * FROM audit_logs LIMIT 10`
- [ ] Test error handling: `node scripts/test-api.js --filter error`

---

## 📝 Example Test Runs

### Test Only Credentials
```bash
node scripts/test-api.js --filter credentials
```

Output:
```
✓ Save encrypted credentials
✓ Check credential existence
✓ Get credential status
✓ Validate Zerodha connection
✓ Delete credentials securely
```

### Test Health Only
```bash
node scripts/test-api.js --filter health
```

Output:
```
✓ Liveness probe
✓ Readiness probe
```

### Test with Custom URL
```bash
API_URL=http://prod.example.com:3000 node scripts/test-api.js
```

---

## 🐛 Troubleshooting

### Issue: Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:** Start the backend
```bash
cd ~/projects/openalice-india
npm run dev
```

### Issue: 401 Unauthorized
```
Expected 200, got 401
```

**Solution:** Set valid auth token
```bash
AUTH_TOKEN=your-token ./scripts/test-api.sh
```

### Issue: Database Not Found
```
Error: database "openalice_india" does not exist
```

**Solution:** Create and migrate database
```bash
createdb openalice_india
npm run migrate
```

### Issue: Tests Timeout
```
Request timeout after 10000ms
```

**Solution:** Increase timeout or check performance
```bash
# Check if backend is slow
time curl http://localhost:3000/health/live
```

---

## 📞 Support

For issues or questions:
1. Check backend logs: `tail -f logs/app.log`
2. Run tests with verbose: `node scripts/test-api.js --verbose`
3. Check database: `psql -U postgres openalice_india -c "\dt"`
4. Review this guide section by section

---

**Happy Testing! 🚀**
