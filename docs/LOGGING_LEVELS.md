# 📊 Logging Levels Guide

## Overview

This document defines **exhaustive logging standards** for the application. Every critical operation should be logged at the appropriate level.

---

## Log Levels

### 🔴 FATAL
**When:** System cannot continue operating
**Examples:**
- Database connection failure
- Cache connection failure
- Critical configuration missing
- Unhandled exception in critical path

**Code:**
```typescript
loggingService.fatal('Database', 'Cannot connect to database', error)
```

---

### 🔴 ERROR
**When:** Operation failed but system continues
**Examples:**
- Authentication failed
- API call failed
- Database query failed
- Validation error
- File not found
- Permission denied
- Timeout
- Invalid input

**Code:**
```typescript
loggingService.error('Auth', 'Login failed', error, { email, reason: 'invalid_password' })
loggingService.error('Orders', 'Order placement failed', error, { symbol, quantity, reason: 'insufficient_funds' })
```

---

### 🟡 WARN
**When:** Unusual but recoverable situation
**Examples:**
- Retry attempt
- Timeout with fallback
- Performance degradation
- Deprecated API usage
- Partial failure
- Rate limit approaching

**Code:**
```typescript
loggingService.warn('API', 'Slow response detected', { duration: 5000, threshold: 3000 })
loggingService.warn('Cache', 'Cache miss, fetching from DB', { key, missCount: 5 })
```

---

### 🟢 INFO
**When:** Important business event
**Examples:**
- User registration
- User login
- Order created
- Order executed
- Trade completed
- Settings changed
- API key configured
- Deposit received
- Withdrawal processed

**Code:**
```typescript
loggingService.info('Auth', 'User registered', { email, userId, timestamp })
loggingService.info('Orders', 'Order created', { orderId, symbol, quantity, price, userId })
loggingService.info('Trading', 'Trade executed', { tradeId, symbol, quantity, price, profit })
```

---

### 🔵 DEBUG
**When:** Detailed debugging information
**Examples:**
- Function entry/exit
- Variable values
- Loop iterations
- Conditional branches
- Data transformation
- Cache hits
- Query execution

**Code:**
```typescript
loggingService.debug('Orders', 'Processing order', { orderId, symbol, quantity })
loggingService.debug('API', 'Request received', { method, path, userId })
loggingService.debug('Cache', 'Cache hit', { key, value })
```

---

## Backend Logging Checklist

### Authentication
- [ ] Login attempt (DEBUG)
- [ ] Login success (INFO)
- [ ] Login failure (ERROR)
- [ ] Password validation failed (ERROR)
- [ ] Token generation (DEBUG)
- [ ] Token verification (DEBUG)
- [ ] Token refresh (DEBUG)
- [ ] Logout (INFO)

### API Endpoints
- [ ] Request received (DEBUG with method/path)
- [ ] Validation error (ERROR)
- [ ] Authorization denied (ERROR)
- [ ] Processing started (DEBUG)
- [ ] Response sent (DEBUG with status)
- [ ] Exception caught (ERROR with stack)

### Business Logic
- [ ] Order creation (INFO)
- [ ] Order execution (INFO)
- [ ] Trade completion (INFO)
- [ ] Deposit processed (INFO)
- [ ] Withdrawal processed (INFO)
- [ ] Position opened (INFO)
- [ ] Position closed (INFO)
- [ ] Settings updated (INFO)

### Database Operations
- [ ] Query start (DEBUG)
- [ ] Query slow (WARN if >1000ms)
- [ ] Query failed (ERROR)
- [ ] Migration start (INFO)
- [ ] Migration complete (INFO)
- [ ] Migration failed (ERROR)

### Error Handling
- [ ] Every catch block must log (ERROR level minimum)
- [ ] Include error message and stack trace
- [ ] Include context data
- [ ] Include request/user info when applicable

---

## Frontend Logging Checklist

### API Calls
- [ ] Request start (DEBUG)
- [ ] Request success (DEBUG)
- [ ] Request failure (ERROR)
- [ ] Timeout (ERROR)
- [ ] Network error (ERROR)

### User Actions
- [ ] Login attempt (DEBUG)
- [ ] Order placement (INFO)
- [ ] Trade execution (INFO)
- [ ] Settings change (INFO)
- [ ] Form submission (DEBUG)

### Component Lifecycle
- [ ] Component mount (DEBUG)
- [ ] State change (DEBUG)
- [ ] Props change (DEBUG)
- [ ] Component unmount (DEBUG)

### Error Boundaries
- [ ] Uncaught error (ERROR)
- [ ] Error boundary trigger (ERROR)
- [ ] Fallback render (WARN)

---

## Example: Order Creation Flow

```typescript
// 1. API Request
loggingService.debug('Orders', 'Order creation request received', { 
  symbol, quantity, price, userId 
})

// 2. Validation
if (!symbol) {
  loggingService.error('Orders', 'Symbol validation failed', 
    new Error('Missing symbol'), { symbol, quantity, price }
  )
  return res.status(400).json({ error: 'Symbol required' })
}

// 3. Business Logic
loggingService.debug('Orders', 'Checking balance', { userId, amount: quantity * price })

// 4. Insufficient Funds
if (balance < totalCost) {
  loggingService.error('Orders', 'Order failed - insufficient funds', 
    new Error('Insufficient funds'), { userId, balance, required: totalCost }
  )
  return res.status(400).json({ error: 'Insufficient funds' })
}

// 5. Database Operation
loggingService.debug('Orders', 'Creating order in database', { orderId, symbol, quantity })

try {
  const order = await db.createOrder({ symbol, quantity, price, userId })
  
  // 6. Success
  loggingService.info('Orders', 'Order created successfully', { 
    orderId: order.id,
    symbol,
    quantity,
    price,
    userId,
    totalValue: quantity * price,
    timestamp: new Date().toISOString()
  })
  
  return res.status(201).json(order)
} catch (error) {
  // 7. Database Error
  loggingService.error('Orders', 'Order creation failed', error, { 
    symbol, quantity, price, userId, reason: 'database_error' 
  })
  return res.status(500).json({ error: 'Order creation failed' })
}
```

---

## Example: Login Flow

```typescript
// 1. Request received
loggingService.debug('Auth', 'Login request received', { email })

// 2. Input validation
if (!email || !password) {
  loggingService.error('Auth', 'Login validation failed', 
    new Error('Missing credentials'), { email }
  )
  return res.status(400).json({ error: 'Email and password required' })
}

// 3. Check if user exists
const user = await db.findUserByEmail(email)
if (!user) {
  loggingService.error('Auth', 'Login failed - user not found', 
    new Error('Invalid credentials'), { email, reason: 'user_not_found' }
  )
  return res.status(401).json({ error: 'Invalid email or password' })
}

// 4. Verify password
const isValid = await crypto.verify(password, user.passwordHash)
if (!isValid) {
  loggingService.error('Auth', 'Login failed - invalid password', 
    new Error('Invalid credentials'), { email, userId: user.id, reason: 'invalid_password' }
  )
  return res.status(401).json({ error: 'Invalid email or password' })
}

// 5. Generate tokens
loggingService.debug('Auth', 'Generating tokens', { userId: user.id })

const token = jwt.sign({ userId: user.id, email: user.email, role: user.role })
const refreshToken = jwt.sign({ userId: user.id }, { expiresIn: '7d' })

// 6. Login success
loggingService.info('Auth', 'User login successful', { 
  userId: user.id,
  email: user.email,
  role: user.role,
  timestamp: new Date().toISOString(),
  ipAddress: req.ip
})

return res.json({ token, refreshToken, user })
```

---

## Error Return Logging

**CRITICAL RULE:** Every error response must log at ERROR level minimum.

```typescript
// ❌ BAD
if (!email) {
  return res.status(400).json({ error: 'Email required' })
}

// ✅ GOOD
if (!email) {
  loggingService.error('Auth', 'Email validation failed', 
    new Error('Missing email'), { email }
  )
  return res.status(400).json({ error: 'Email required' })
}
```

---

## Frontend Logging Strategy

### API Calls
```typescript
// Wrapper for all API calls
async function apiCall(method, path, body = null) {
  loggingService.debug('API', `${method} ${path}`, { body })
  
  try {
    const response = await fetch(path, { method, body: JSON.stringify(body) })
    const data = await response.json()
    
    if (!response.ok) {
      loggingService.error('API', `${method} ${path} failed`, 
        new Error(data.error), { status: response.status, response: data }
      )
      throw new Error(data.error)
    }
    
    loggingService.debug('API', `${method} ${path} success`, { status: response.status })
    return data
  } catch (error) {
    loggingService.error('API', `${method} ${path} error`, error)
    throw error
  }
}
```

### State Changes
```typescript
const handleOrderPlacement = async () => {
  loggingService.debug('Orders', 'Order placement started', { symbol, quantity, price })
  
  try {
    const result = await apiCall('POST', '/api/v1/orders', { symbol, quantity, price })
    loggingService.info('Orders', 'Order placed successfully', { orderId: result.id })
    // Update UI
  } catch (error) {
    loggingService.error('Orders', 'Order placement failed', error)
    // Show error message
  }
}
```

---

## Aggregating Logs for Analysis

**Example Queries in Admin Logs Page:**

1. **Find all failed logins:**
   ```
   Filter: Service = "Auth", Level = ERROR
   Search: "invalid password"
   ```

2. **Find slow API responses:**
   ```
   Filter: Service = "API", Level = WARN
   Search: "slow response"
   ```

3. **Find all database errors:**
   ```
   Filter: Service contains "DB", Level = ERROR
   ```

4. **Find successful orders:**
   ```
   Filter: Service = "Orders", Level = INFO
   Search: "created successfully"
   ```

---

## Best Practices

1. **Always log errors** - Every catch block must log
2. **Log at right level** - Use DEBUG/INFO/WARN/ERROR/FATAL appropriately
3. **Include context** - Always pass relevant data
4. **Include identifiers** - userId, orderId, email, etc.
5. **Include timestamps** - Log when events occur
6. **Include IPs** - For security events
7. **Redact sensitive** - No passwords, API keys, credit cards
8. **Include error reasons** - Why did it fail?
9. **Be consistent** - Use same format throughout
10. **Test logs** - Verify important events are logged

---

## Log File Analysis

When troubleshooting:

1. **Find the error in logs**
   ```
   Time: When user reported issue
   Filter: ERROR level
   Search: Related keywords
   ```

2. **Trace back to root cause**
   ```
   Look at DEBUG logs before error
   Check validation failures
   Check permission denials
   ```

3. **Understand the flow**
   ```
   Follow DEBUG logs in order
   See what succeeded/failed
   Identify the problem point
   ```

4. **Share with developers**
   ```
   Download log file
   Attach to bug report
   Include timestamp range
   Include error message
   ```

---

Last Updated: June 8, 2026
