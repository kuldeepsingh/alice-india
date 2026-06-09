# 📋 Comprehensive Logging Guide for Debugging

## Why Logs Matter

**Logs are your primary debugging tool.** Without comprehensive logs:
- ❌ You can't trace why a request failed
- ❌ You can't see validation failures
- ❌ You can't measure performance
- ❌ You can't audit security events
- ❌ You can't identify patterns in errors

**With good logs:**
- ✅ You can replay any request
- ✅ You can see every decision point
- ✅ You can measure performance per operation
- ✅ You can audit security events
- ✅ You can identify and fix bugs faster

---

## Logging Standards

### 1. **Every Request Must Log Its Flow**

Log at these key points:
1. **Request Entry** - What was requested
2. **Validation** - What validations were checked
3. **Database Operations** - What queries were executed
4. **Processing** - Key business logic steps
5. **Success/Failure** - Final result with timing

### 2. **Every Log Must Have Context**

Always include:
```javascript
{
  requestId: 'unique-request-id',        // Trace entire flow
  userId: 'user-id',                     // Who it happened to
  adminId: 'admin-id',                   // Who performed action
  startTime / durationMs: number,        // Performance timing
  previousValue / newValue: any,         // What changed
  errorType / errorMessage: string,      // Failure details
  correlationId: string,                 // Multi-service tracing
}
```

### 3. **Use Appropriate Log Levels**

- **DEBUG** - Detailed flow information, variable states, function entry/exit
- **INFO** - Important business events, successful operations
- **WARN** - Validation failures, unusual conditions
- **ERROR** - Exceptions, failures, bugs

---

## Implementation Pattern

### Basic Template for Any Endpoint

```typescript
router.post('/operation', authMiddleware, async (req: Request, res: Response) => {
  const requestId = `op-${Date.now()}`          // Unique request ID
  const startTime = Date.now()                   // Track duration

  try {
    // Extract parameters
    const { param1, param2 } = req.body
    const userId = (req as any).user?.id
    
    // Log: Request received
    logger.debug('Module', 'Request received', {
      requestId,
      userId,
      param1,
      param2,
    })

    // Validation Step 1
    if (!param1) {
      logger.warn('Module', 'Validation failed - missing param1', {
        requestId,
        userId,
      })
      return res.status(400).json({ error: 'param1 required' })
    }

    // Validation Step 2
    if (param2 < 0) {
      logger.warn('Module', 'Validation failed - param2 must be positive', {
        requestId,
        userId,
        param2,
      })
      return res.status(400).json({ error: 'param2 must be positive' })
    }

    logger.debug('Module', 'Validation passed', {
      requestId,
      userId,
    })

    // Database Operation 1
    logger.debug('Database', 'Fetching user details', {
      requestId,
      userId,
    })
    const queryStart = Date.now()
    const user = await query('SELECT * FROM users WHERE id = $1', [userId])
    const queryDuration = Date.now() - queryStart

    logger.debug('Database', 'User fetch complete', {
      requestId,
      durationMs: queryDuration,
      userFound: user.rows.length > 0,
    })

    if (user.rows.length === 0) {
      logger.warn('Module', 'Operation failed - user not found', {
        requestId,
        userId,
      })
      return res.status(404).json({ error: 'User not found' })
    }

    // Database Operation 2
    logger.debug('Database', 'Updating user record', {
      requestId,
      userId,
      param1,
    })
    const updateStart = Date.now()
    const result = await query(
      'UPDATE users SET field1 = $1 WHERE id = $2',
      [param1, userId]
    )
    const updateDuration = Date.now() - updateStart

    logger.debug('Database', 'User update complete', {
      requestId,
      durationMs: updateDuration,
      rowsAffected: result.rowCount,
    })

    // Success Log
    const totalDuration = Date.now() - startTime
    logger.info('Module', 'Operation completed successfully', {
      requestId,
      userId,
      param1,
      totalDurationMs: totalDuration,
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      data: result.rows[0],
    })

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Module', 'Operation failed with exception', error, {
      requestId,
      userId: (req as any).user?.id,
      param1: req.body.param1,
      param2: req.body.param2,
      durationMs: duration,
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    res.status(500).json({
      status: 'error',
      message: 'Operation failed',
    })
  }
})
```

---

## Real Example: Role Change Endpoint

See `src/routes/team.ts` PUT `/members/:id/role` for a complete example with:
- ✅ Request ID tracking
- ✅ Multi-step validation logging
- ✅ Database operation timing
- ✅ Comprehensive error logging
- ✅ Audit trail of who changed what

---

## Frontend Logging Pattern

### In React Components

```typescript
import { frontendLogger } from '../services/logger'

function MyComponent() {
  useEffect(() => {
    const operationId = `op-${Date.now()}`
    const startTime = Date.now()

    frontendLogger.debug('Component', 'Component mounted', {
      operationId,
    })

    // Do work...

    const duration = Date.now() - startTime
    frontendLogger.info('Component', 'Operation completed', {
      operationId,
      durationMs: duration,
    })
  }, [])

  const handleClick = async () => {
    const requestId = `action-${Date.now()}`

    frontendLogger.debug('Component', 'Button clicked', {
      requestId,
      action: 'submit-form',
    })

    try {
      const response = await fetch('/api/v1/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        frontendLogger.warn('Component', 'API request failed', {
          requestId,
          status: response.status,
        })
        return
      }

      frontendLogger.info('Component', 'API request successful', {
        requestId,
        status: response.status,
      })
    } catch (error) {
      frontendLogger.error('Component', 'API request error', error, {
        requestId,
        errorMessage: error?.message,
      })
    }
  }

  return <button onClick={handleClick}>Submit</button>
}
```

---

## Debugging With Logs

### Scenario 1: User Says "I Can't Change My Role"

1. Go to Logs page → Filter Backend by INFO
2. Look for "User role updated successfully" or "Role change failed"
3. Copy the requestId from that log
4. Search logs for that requestId
5. See the entire flow:
   - What role was requested
   - If validation failed and why
   - What happened in database
   - How long it took
   - Who made the change

### Scenario 2: Something Is Slow

1. Look at logs for operations with high durationMs
2. Identify which step is slow (database vs processing)
3. Add more detailed timing logs to isolate the issue

### Scenario 3: Error in Production

1. Get error message from logs
2. Find requestId from error log
3. Trace entire request with requestId
4. See what data was involved
5. Reproduce locally with exact same data

---

## What to Log in Each Module

### Authentication (`src/routes/auth.ts`)
- ✅ Registration request, validation steps, user creation, duration
- ✅ Login request, credential validation, token generation, duration
- ✅ Token refresh, validation, new token generation
- ✅ Logout, session cleanup

### Database (`src/services/database.ts`)
- ✅ Query start and completion with duration
- ✅ Row count (selected, affected, inserted)
- ✅ Connection pool status
- ✅ Error details

### API Endpoints (each route)
- ✅ Request received (what was requested)
- ✅ Validation failures (which field failed, why)
- ✅ Database operations (which queries, timing)
- ✅ Processing steps (key decisions)
- ✅ Response sent (status, duration)

### User Actions (sensitive operations)
- ✅ Who performed the action
- ✅ What changed (old value → new value)
- ✅ When it changed
- ✅ Total duration
- ✅ Any errors

---

## Common Mistakes to Avoid

❌ **Don't log without context:**
```javascript
logger.info('Update complete')  // Bad - what was updated? who by? how long?
```

✅ **Do include context:**
```javascript
logger.info('User', 'User updated', {
  userId,
  adminId,
  changes: { role: 'old' → 'new' },
  durationMs,
})
```

---

❌ **Don't create logs that can't be traced:**
```javascript
logger.info('Started operation')  // Which operation? Can't trace it
logger.info('Operation complete')
```

✅ **Do use request IDs:**
```javascript
const requestId = `op-${Date.now()}`
logger.info('Module', 'Started operation', { requestId })
logger.info('Module', 'Operation complete', { requestId })
```

---

❌ **Don't miss error details:**
```javascript
catch (error) {
  logger.error('Operation failed')  // What error? Stack trace?
}
```

✅ **Do include full error context:**
```javascript
catch (error) {
  logger.error('Module', 'Operation failed', error, {
    errorType: error?.constructor?.name,
    message: error?.message,
    stack: error?.stack,
    durationMs,
  })
}
```

---

## Testing Your Logs

1. **Perform an operation** (e.g., change a user's role)
2. **Go to Logs page** - `http://localhost:5173/logs`
3. **Filter backend logs by INFO level**
4. **Look for your operation log** - it should be at the top
5. **Verify it has:**
   - ✅ Request ID
   - ✅ User IDs
   - ✅ What changed (old → new values)
   - ✅ Duration
   - ✅ Timestamp
   - ✅ All relevant context

If any of these are missing, add them!

---

## Next Steps

Apply this comprehensive logging pattern to:
1. ✅ User authentication endpoints (register, login, refresh)
2. ✅ All order/transaction endpoints
3. ✅ All admin operations
4. ✅ All database queries
5. ✅ All frontend user actions
6. ✅ All error paths

**Remember:** If logs can't help you debug a problem, they're not comprehensive enough.
