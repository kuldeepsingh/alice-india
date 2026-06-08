# 🧪 End-to-End Testing Guide - Secure API Key Integration

## Overview

This guide walks you through testing the complete end-to-end flow of the secure API key storage system with order creation and Claude AI features.

---

## ✅ Pre-Test Checklist

Before starting tests, ensure:

- [ ] PostgreSQL is running with bot_trade database
- [ ] User API key tables created (user_api_keys, api_key_audit_log)
- [ ] Backend service running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] Node.js dependencies installed in both directories
- [ ] Database connection string correct in .env

---

## 🚀 Setup Steps

### 1. Start PostgreSQL Database

```bash
# Verify database exists
psql -h localhost -U postgres -d bot_trade -c "\dt"

# Should show:
# - user_api_keys
# - api_key_audit_log
# - trading_orders (and other tables)
```

### 2. Start Backend

```bash
cd /Users/kuldeep/projects/openalice-india
npm run dev
# Should show:
# [nodemon] starting `tsx watch src/index.ts`
# Server is listening on port 3000
```

### 3. Start Frontend

```bash
cd /Users/kuldeep/projects/openalice-india/admin-dashboard
npm run dev
# Should show:
# VITE v8.0.16 ready in XXX ms
# ➜ Local: http://localhost:5173/
```

---

## 📋 Test Scenarios

### Test 1: Settings Tab - Configure API Keys

**Objective**: Verify that API keys can be entered and saved securely

**Steps**:

1. **Open Frontend**
   - Navigate to: http://localhost:5173
   - Login to admin dashboard

2. **Navigate to Autonomous Bot**
   - Click "Autonomous Bot" in sidebar
   - Should see "🤖 Autonomous Trading Bot" header
   - Should see two tabs: "⚙️ Settings" and "📊 Trading"

3. **Verify Settings Tab**
   - Click "⚙️ Settings" tab
   - Should see two sections:
     - 🤖 Claude API Key (status: ❌ Not Set)
     - 📈 Zerodha API Keys (status: ❌ Not Set)

4. **Enter Claude API Key**
   - Click "Add Key" button under Claude section
   - Enter Claude API key (get from https://console.anthropic.com/account/keys)
   - Click "👁️ Show" to verify input
   - Click "👁️ Hide" to mask the input

5. **Enter Zerodha Keys**
   - Click "Add Keys" button under Zerodha section
   - Enter Zerodha API Key (from https://kite.zerodha.com)
   - Enter Zerodha API Secret
   - Click "👁️ Show" to verify both fields
   - Click "👁️ Hide" to mask

6. **Save API Keys**
   - Click "💾 Save API Keys" button
   - Should see success message: "✅ API keys saved securely!"
   - Status badges should change to "✓ Configured"
   - Message should disappear after 3 seconds

7. **Refresh and Verify Persistence**
   - Click "🔄 Refresh" button
   - Status should still show "✓ Configured"
   - (Keys are NOT loaded locally - this just checks server status)

**Expected Results**:
- ✅ Keys saved without errors
- ✅ Status indicators show "Configured"
- ✅ No keys visible in browser DevTools
- ✅ No keys in Network tab requests/responses
- ✅ No console errors

**Backend Verification** (While test is running):

```bash
# In new terminal, check database
psql -h localhost -U postgres -d bot_trade -c "
  SELECT user_id, key_type, encrypted_value, iv, created_at 
  FROM user_api_keys 
  WHERE user_id = 'default-user' 
  ORDER BY created_at DESC LIMIT 5;
"

# Should show encrypted entries:
# user_id      | key_type | encrypted_value          | iv                 | created_at
# default-user | claude   | a7f3e9d2c1b8f4a6e8... | f3e9d2c1b8f4a6e... | [timestamp]
```

---

### Test 2: Trading Tab - Check Key Status

**Objective**: Verify that Trading tab shows correct key status from backend

**Steps**:

1. **Go to Trading Tab**
   - Click "📊 Trading" tab
   - Should see backend status indicator
   - Both Claude and Zerodha should show "✅ Ready"

2. **Verify Status Display**
   - Backend Status card should show green (Connected)
   - API Status chips should show:
     - 🤖 Claude: ✅ Ready
     - 📈 Zerodha: ✅ Ready

**Expected Results**:
- ✅ Status matches what was configured in Settings
- ✅ No keys visible in form fields
- ✅ Status fetched from backend (not local storage)

---

### Test 3: Create Order with Zerodha

**Objective**: Verify order creation fetches Zerodha key from backend and places order

**Steps**:

1. **Configure Zerodha Key** (if not done)
   - Go to Settings tab
   - Add real Zerodha API key and secret
   - Save keys

2. **Create Test Order**
   - Go to Trading tab
   - Enter order details:
     - Symbol: RELIANCE (or any valid NSE stock)
     - Quantity: 1
     - Price: 2850.00
   - Click "Create Order" button

3. **Monitor Request**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Filter for XHR/Fetch requests
   - Look for POST to /api/v1/orders

4. **Verify Request Contents**
   - Request body should NOT contain Zerodha keys
   - Should contain: symbol, quantity, price, side
   - Response should NOT contain Zerodha keys
   - Response should contain: orderId, status, timestamp

5. **Check Backend Logs**
   ```
   [Claude] Order created successfully
   Order ID: xxxxxxxx
   Symbol: RELIANCE
   Quantity: 1
   ```

6. **Verify Database**
   ```bash
   # Check if order was stored
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT id, user_id, symbol, quantity, price, status, created_at 
     FROM trading_orders 
     ORDER BY created_at DESC LIMIT 5;
   "
   ```

**Expected Results**:
- ✅ Order created successfully
- ✅ No Zerodha keys in network requests
- ✅ No Zerodha keys in browser console
- ✅ Order stored in database
- ✅ Audit log records the access

**Backend Audit Log** (Check that key access was logged):

```bash
psql -h localhost -U postgres -d bot_trade -c "
  SELECT user_id, action, key_type, ip_address, status, created_at 
  FROM api_key_audit_log 
  WHERE action = 'accessed' AND key_type = 'zerodha' 
  ORDER BY created_at DESC LIMIT 5;
"

# Should show 'accessed' action for zerodha key
```

---

### Test 4: Test Claude AI Features

**Objective**: Verify Claude API key is fetched from backend for sentiment analysis

**Steps**:

1. **Prepare Test Data**
   - Stay in Trading tab
   - Prepare market data JSON for sentiment analysis

2. **Call Sentiment Analysis**
   - Click "🧠 Claude AI Analysis" button (if available in Trading tab)
   - Or make curl request:

   ```bash
   curl -X POST http://localhost:3000/api/v1/market-analysis/sentiment \
     -H "Content-Type: application/json" \
     -H "X-User-ID: default-user" \
     -d '{
       "marketData": {
         "index_level": 78000,
         "index_change_percent": 0.85,
         "volatility_index": 16.2
       },
       "recentNews": ["RBI policy stable"],
       "globalContext": "Global markets positive"
     }'
   ```

3. **Monitor Network Request**
   - DevTools → Network tab
   - Look for POST to /api/v1/market-analysis/sentiment
   - Verify:
     - No Claude API key in request body
     - No Claude API key in response
     - Response contains sentiment analysis

4. **Verify Response**
   - Should get sentiment analysis from Claude
   - Response should include:
     - sentiment: (0-1 score)
     - trend: (bull/neutral/bear)
     - confidence: (0-1 score)
     - reasoning: (explanation)
     - claudeUsed: true

5. **Check Backend Logs**
   ```
   [Claude] Sentiment analysis completed
   Response time: XXXms
   Sentiment: 0.72
   ```

**Expected Results**:
- ✅ Claude API key fetched from backend
- ✅ Sentiment analysis returned successfully
- ✅ No Claude API key in network traffic
- ✅ No Claude key in browser console
- ✅ Audit log records the access

---

### Test 5: Verify Encryption in Database

**Objective**: Confirm that API keys are encrypted and unreadable in database

**Steps**:

1. **Examine Encrypted Values**
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT encrypted_value, iv FROM user_api_keys 
     WHERE key_type = 'claude' LIMIT 1;
   "
   ```

2. **Try to Decrypt Manually** (Should Fail)
   - Copy encrypted_value
   - Try to read it directly
   - It should be unreadable hex string

3. **Verify IV is Unique**
   ```bash
   # Get multiple Claude keys for same user
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT encrypted_value, iv FROM user_api_keys 
     WHERE key_type = 'claude' LIMIT 5;
   "
   
   # IVs should all be DIFFERENT (not reused)
   ```

**Expected Results**:
- ✅ Encrypted values are hex strings (a-f0-9)
- ✅ Keys are unreadable without master key
- ✅ Each encryption has unique IV
- ✅ Same user, different IVs for updates

---

### Test 6: Audit Trail Verification

**Objective**: Confirm that all API key access is logged

**Steps**:

1. **Check Complete Audit Log**
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT * FROM api_key_audit_log 
     ORDER BY created_at DESC LIMIT 20;
   "
   ```

2. **Verify Log Entries**
   Should see entries for:
   - 'stored' action when keys saved
   - 'accessed' action when keys used
   - 'deleted' action if keys cleared
   - Correct key_type (claude/zerodha)
   - IP address of requester
   - Timestamp of each action

3. **Check Success/Failure Status**
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT action, status, COUNT(*) as count 
     FROM api_key_audit_log 
     GROUP BY action, status 
     ORDER BY action, status;
   "
   ```

**Expected Results**:
- ✅ Complete audit trail for all key operations
- ✅ IP addresses logged
- ✅ Timestamps accurate
- ✅ Success/failure tracked
- ✅ No sensitive data in logs

---

### Test 7: Security - Verify No Key Exposure

**Objective**: Confirm keys never appear in insecure locations

**Check 1: Browser localStorage**
```javascript
// In browser console (F12 → Console)
localStorage
```
- ❌ Should NOT contain claudeApiKey
- ❌ Should NOT contain zerodhaApiKey
- ✅ Should be empty or only contain auth tokens

**Check 2: Network Traffic**
1. Open DevTools (F12)
2. Go to Network tab
3. Make API call (create order or sentiment)
4. Click request → Request tab
5. Look at body and headers
- ❌ Should NOT contain API keys
- ✅ Only should have X-User-ID, Authorization headers

**Check 3: Browser Console**
1. Open DevTools (F12) → Console
2. Make API calls
3. Look for any logged keys
- ❌ Should NOT see sk-ant-xxxxx
- ❌ Should NOT see zerodha keys
- ✅ Should see info messages only

**Check 4: Server Logs**
```bash
# Check backend logs
tail -f /tmp/backend.log | grep -i "key"
```
- ❌ Should NOT log plaintext keys
- ✅ Should only log "key accessed" / "key stored" messages

**Expected Results**:
- ✅ Zero key exposure in frontend
- ✅ Zero key exposure in network traffic
- ✅ Zero key exposure in browser logs
- ✅ Backend logs don't expose keys

---

## 🔄 Cleanup & Reset Tests

### Clear All API Keys

**Steps**:

1. **Go to Settings Tab**
   - Click "⚙️ Settings"
   - Click "🗑️ Clear All" button
   - Confirm deletion

2. **Verify Deletion**
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT * FROM user_api_keys 
     WHERE deleted_at IS NULL AND user_id = 'default-user';
   "
   # Should return 0 rows
   ```

3. **Check Audit Log**
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
     SELECT * FROM api_key_audit_log 
     WHERE action = 'deleted' 
     ORDER BY created_at DESC LIMIT 3;
   "
   # Should show deletion record
   ```

---

## 📊 Test Results Summary

Create a test results table:

| Test | Scenario | Result | Notes |
|------|----------|--------|-------|
| 1 | Configure Claude key | PASS/FAIL | |
| 2 | Configure Zerodha keys | PASS/FAIL | |
| 3 | Save keys | PASS/FAIL | |
| 4 | Check status | PASS/FAIL | |
| 5 | Create order | PASS/FAIL | |
| 6 | Test Claude | PASS/FAIL | |
| 7 | Check encryption | PASS/FAIL | |
| 8 | Verify audit log | PASS/FAIL | |
| 9 | No key exposure | PASS/FAIL | |

---

## ⚠️ Common Issues & Solutions

### Issue: "Claude API key not configured"
**Solution**: 
1. Go to Settings tab
2. Verify Claude key is entered and saved
3. Check backend logs for key retrieval errors
4. Verify API key format (should start with sk-ant-)

### Issue: "Zerodha credentials not found"
**Solution**:
1. Go to Settings tab
2. Both API key AND secret must be filled
3. Click Save API Keys
4. Verify in database they were stored

### Issue: Order creation fails
**Solution**:
1. Check that Zerodha keys are configured
2. Verify valid stock symbol (e.g., RELIANCE, INFY)
3. Verify quantity > 0 and price > 0
4. Check backend logs for Zerodha API errors

### Issue: Keys visible in browser console
**Solution**:
1. This should NOT happen
2. If it does, check browser extensions
3. Verify you're not logging keys manually
4. Check apiKeyService for console.log calls

---

## 🎉 Test Completion Checklist

When all tests pass:

- [ ] All 7 test scenarios completed
- [ ] No API keys in frontend
- [ ] No API keys in network traffic
- [ ] All operations in audit log
- [ ] Encryption working correctly
- [ ] Orders created successfully
- [ ] Claude features working
- [ ] Database secure
- [ ] No errors in logs
- [ ] System ready for production

---

## Next Steps

After successful testing:

1. **Production Deployment**
   - Set up secure master key (not default)
   - Enable HTTPS/TLS
   - Set up monitoring

2. **Performance Optimization**
   - Monitor key fetch cache hits
   - Optimize database indexes
   - Load test with concurrent users

3. **Security Hardening**
   - Enable API rate limiting
   - Add DDoS protection
   - Set up intrusion detection

---

**All tests passing? You're ready to launch! 🚀**

