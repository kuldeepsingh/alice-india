# 🔧 Configuration System Guide

## Overview

Bot-Trade uses a **centralized, type-safe configuration system** that manages all application settings. The configuration is organized by concern (database, cache, API, security, logging) and automatically validated on startup.

## Architecture

### Design Philosophy

```
┌─────────────────────────────────────────┐
│     Environment Variables (.env)        │
├─────────────────────────────────────────┤
│     config/env.ts (Load & Validate)    │
├─────────────────────────────────────────┤
│  Specialized Configs (database, cache, etc)
├─────────────────────────────────────────┤
│     config/index.ts (Main Manager)     │
├─────────────────────────────────────────┤
│     Application Code (Services, Routes)│
└─────────────────────────────────────────┘
```

### Directory Structure

```
config/
├── index.ts              # Main config loader & manager
├── env.ts                # Environment variables (typed, validated)
├── database.ts           # Database configuration
├── cache.ts              # Redis/Cache configuration
├── api.ts                # API endpoints & settings
├── logger.ts             # Logging configuration
├── security.ts           # Security, JWT, RBAC
└── README.md             # Quick reference
```

## Quick Start

### 1. Create `.env` File

```bash
# In project root
cat > .env << 'EOF'
# Node
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgres://user:password@localhost:5432/bot_trade
DATABASE_POOL_MAX=20
DATABASE_POOL_IDLE_TIMEOUT=30000

# Redis
REDIS_URL=redis://localhost:6379
CACHE_DEFAULT_TTL=3600

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=24h
JWT_REFRESH_TOKEN_EXPIRY=7d

# API
API_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=10

# Feature Flags
ENABLE_TWO_FACTOR=false
ENABLE_WEBHOOKS=false
ENABLE_REAL_TIME_NOTIFICATIONS=false
EOF
```

### 2. Load Configuration in Code

```typescript
import { getConfig } from '../config'

// Get entire config
const config = getConfig()

// Access specific sections
const port = config.env.port
const dbUrl = config.database.url
const jwtSecret = config.security.jwt.secret
const corsOrigins = config.api.corsOrigins
```

### 3. Use in Application

```typescript
// In Express app setup
import { getConfig } from './config'

const config = getConfig()

app.listen(config.env.port, () => {
  console.log(`Server running on port ${config.env.port}`)
})
```

## Configuration Files

### config/env.ts - Environment Variables

**Purpose:** Load and validate all environment variables with TypeScript typing

**Key Variables:**
```typescript
interface AppEnvironment {
  // Node Environment
  nodeEnv: 'development' | 'production' | 'test'
  port: number
  host: string

  // Database
  databaseUrl: string
  databasePoolMax: number
  databasePoolIdleTimeout: number

  // Cache
  redisUrl: string
  cacheDefaultTtl: number

  // JWT
  jwtSecret: string
  jwtAccessTokenExpiry: string
  jwtRefreshTokenExpiry: string

  // API
  apiBaseUrl: string
  corsOrigins: string[]

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal'

  // Security
  bcryptRounds: number
  allowedOrigins: string[]

  // Feature Flags
  features: {
    enableTwoFactor: boolean
    enableWebhooks: boolean
    enableRealTimeNotifications: boolean
  }
}
```

**Validation Rules:**
- All required variables must be set (DATABASE_URL, JWT_SECRET, REDIS_URL)
- PORT must be in range 1-65535
- BCRYPT_ROUNDS must be 4-31
- CORS_ORIGINS must be configured

**Example:**
```typescript
import { getConfig } from './config'

const env = getConfig().env
console.log(env.port)              // 3000
console.log(env.nodeEnv)           // 'development'
console.log(env.features.enableTwoFactor)  // false
```

### config/database.ts - Database Configuration

**Purpose:** Manage PostgreSQL connection pooling and query optimization

**Configuration:**
```typescript
interface DatabaseConfig {
  url: string                    // Connection string
  poolConfig: {
    max: number                  // Max connections (default: 20)
    idleTimeoutMillis: number    // Idle timeout (default: 30000)
    connectionTimeoutMillis: number  // Connection timeout
  }
  queryLogging: {
    enabled: boolean             // Enable query logging
    slowQueryThreshold: number   // Log queries >Xms
  }
  ssl: {
    rejectUnauthorized: boolean  // Enforce SSL in production
  }
}
```

**Usage:**
```typescript
const config = getConfig()

// Connection pooling
console.log(config.database.poolConfig.max)  // 20

// Slow query detection
console.log(config.database.queryLogging.slowQueryThreshold)  // 1000ms
```

**Migration Info:**
```typescript
import { DatabaseInfo } from '../config'

DatabaseInfo.migrations.directory   // './migrations'
DatabaseInfo.migrations.table       // '_migrations'
DatabaseInfo.indexes.users          // ['email', 'created_at']
DatabaseInfo.indexes.orders         // ['user_id', 'account_id', 'status', 'created_at']
```

### config/cache.ts - Cache Configuration

**Purpose:** Manage Redis caching strategies and cache key naming

**Configuration:**
```typescript
interface CacheConfig {
  redisUrl: string
  defaultTtl: number              // Default time-to-live (seconds)
  strategies: {
    session: number               // 3600 seconds (1 hour)
    user: number                  // 1800 seconds (30 minutes)
    account: number               // 1800 seconds (30 minutes)
    order: number                 // 300 seconds (5 minutes)
    marketData: number            // 60 seconds (1 minute)
  }
  keys: {
    prefix: string                // 'bot-trade'
    separator: string             // ':'
  }
}
```

**Cache Key Helpers:**
```typescript
import { CacheKeys } from '../config'

// Use helpers for consistent key naming
CacheKeys.session(sessionId)        // 'session:{id}'
CacheKeys.user(userId)              // 'user:{id}'
CacheKeys.userAccounts(userId)      // 'user:{id}:accounts'
CacheKeys.account(accountId)        // 'account:{id}'
CacheKeys.accountOrders(accountId)  // 'account:{id}:orders'
CacheKeys.marketData(symbol)        // 'market:{symbol}'
```

**Cache Invalidation:**
```typescript
import { CacheInvalidation } from '../config'

// Get all keys to invalidate on certain events
CacheInvalidation.onUserUpdate(userId)      // Keys to clear
CacheInvalidation.onAccountUpdate(accountId) // Keys to clear
CacheInvalidation.onOrderCreate(userId, accountId) // Keys to clear
```

**Example:**
```typescript
const config = getConfig()

// Set in cache with TTL
await redis.setex(
  CacheKeys.user(userId),
  config.cache.strategies.user,  // 1800 seconds
  JSON.stringify(userData)
)

// Get from cache
const cached = await redis.get(CacheKeys.user(userId))
```

### config/api.ts - API Configuration

**Purpose:** Centralize API endpoints, versioning, and CORS

**Configuration:**
```typescript
interface ApiConfig {
  baseUrl: string                 // Base API URL
  version: string                 // API version (e.g., 'v1')
  corsOrigins: string[]           // Allowed origins
  rateLimiting: {
    enabled: boolean
    windowMs: number              // 15 minutes
    maxRequests: number           // Per window
  }
  timeout: {
    request: number               // 30 seconds
    response: number              // 30 seconds
  }
  security: {
    trustProxy: boolean           // Trust X-Forwarded-For
    enableCors: boolean
    enableHelmets: boolean        // Security headers
  }
}
```

**Centralized Endpoints:**
```typescript
import { ApiEndpoints } from '../config'

// Health checks
ApiEndpoints.health.live           // '/health/live'
ApiEndpoints.health.ready          // '/health/ready'

// Authentication
ApiEndpoints.auth.register         // '/auth/register'
ApiEndpoints.auth.login            // '/auth/login'
ApiEndpoints.auth.refresh          // '/auth/refresh'
ApiEndpoints.auth.logout           // '/auth/logout'

// Resources
ApiEndpoints.users.base            // '/users'
ApiEndpoints.users.byId(id)        // '/users/{id}'
ApiEndpoints.accounts.base         // '/accounts'
ApiEndpoints.orders.base           // '/orders'
ApiEndpoints.market.data(symbol)   // '/market/data/{symbol}'
```

**HTTP Status Codes:**
```typescript
import { HttpStatus } from '../config'

HttpStatus.OK                       // 200
HttpStatus.CREATED                  // 201
HttpStatus.BAD_REQUEST              // 400
HttpStatus.UNAUTHORIZED             // 401
HttpStatus.FORBIDDEN                // 403
HttpStatus.NOT_FOUND                // 404
HttpStatus.CONFLICT                 // 409
HttpStatus.INTERNAL_ERROR           // 500
```

**Response Format:**
```typescript
// Success response
interface ApiSuccess<T> {
  status: 'success'
  data: T
  timestamp: string
}

// Error response
interface ApiError {
  status: number
  code: string
  message: string
  timestamp: string
}
```

### config/logger.ts - Logger Configuration

**Purpose:** Configure structured logging with Pino

**Log Levels:**
```typescript
LogLevels.DEBUG      // Detailed diagnostic info
LogLevels.INFO       // General info messages
LogLevels.WARN       // Warning messages
LogLevels.ERROR      // Error messages
LogLevels.FATAL      // Fatal errors
```

**Predefined Log Events:**
```typescript
import { LogEvents } from '../config'

// Authentication events
LogEvents.AUTH_REGISTER             // 'auth:register'
LogEvents.AUTH_LOGIN                // 'auth:login'
LogEvents.AUTH_FAILED               // 'auth:failed'

// Database events
LogEvents.DB_CONNECT                // 'db:connect'
LogEvents.DB_QUERY_SLOW             // 'db:query_slow'
LogEvents.DB_ERROR                  // 'db:error'

// Cache events
LogEvents.CACHE_HIT                 // 'cache:hit'
LogEvents.CACHE_MISS                // 'cache:miss'

// API events
LogEvents.API_REQUEST               // 'api:request'
LogEvents.API_RESPONSE              // 'api:response'
LogEvents.API_ERROR                 // 'api:error'
```

**Development vs Production:**
- **Development:** Pretty-printed, colored output
- **Production:** JSON structured logs

### config/security.ts - Security Configuration

**Purpose:** Manage JWT, password policy, CORS, and RBAC

**JWT Configuration:**
```typescript
{
  secret: string                  // JWT signing secret
  accessTokenExpiry: string       // '24h'
  refreshTokenExpiry: string      // '7d'
  issuer: string                  // 'bot-trade-api'
  audience: string                // 'bot-trade-frontend'
}
```

**Password Policy:**
```typescript
{
  bcryptRounds: number            // 10 (for hashing)
  minLength: number               // 8 characters
  requireUppercase: boolean       // true
  requireNumbers: boolean         // true
  requireSpecialChars: boolean    // false (optional)
}
```

**Validate Password:**
```typescript
import { validatePassword } from '../config'

const config = getConfig()

const result = validatePassword(
  'MyPassword123',
  config.security.password
)

if (!result.valid) {
  console.error(result.errors)  // Array of error messages
} else {
  console.log('Password meets policy')
}
```

**RBAC (Role-Based Access Control):**
```typescript
import { Roles, Permissions } from '../config'

// Role definitions
Roles.ADMIN                         // 'admin'
Roles.TRADER                        // 'trader'
Roles.VIEWER                        // 'viewer'

// Permissions for each role
Permissions[Roles.ADMIN]            // All permissions
Permissions[Roles.TRADER]           // Trading permissions
Permissions[Roles.VIEWER]           // Read-only permissions

// Example
if (Permissions[userRole].includes('orders:create')) {
  // User can create orders
}
```

**Security Headers:**
```typescript
{
  'Content-Security-Policy': '...'
  'X-Content-Type-Options': 'nosniff'
  'X-Frame-Options': 'DENY'
  'X-XSS-Protection': '1; mode=block'
  'Strict-Transport-Security': '...'
}
```

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_TWO_FACTOR=false
# Less strict CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Production
```bash
NODE_ENV=production
LOG_LEVEL=info
ENABLE_TWO_FACTOR=true
# Strict CORS
CORS_ORIGINS=https://bot-trade.com,https://www.bot-trade.com
```

### Testing
```bash
NODE_ENV=test
LOG_LEVEL=error
DATABASE_URL=postgres://localhost/bot_trade_test
REDIS_URL=redis://localhost:6379/1
```

## Usage Patterns

### In Express Middleware

```typescript
import { getConfig } from './config'

const config = getConfig()

// CORS setup
app.use(cors({
  origin: config.security.cors.origins,
  credentials: config.security.cors.credentials,
  methods: config.security.cors.methods,
}))

// Rate limiting
if (config.api.rateLimiting.enabled) {
  const rateLimit = require('express-rate-limit')
  app.use(rateLimit({
    windowMs: config.api.rateLimiting.windowMs,
    max: config.api.rateLimiting.maxRequests,
  }))
}

// Helmet (security headers)
if (config.api.security.enableHelmets) {
  app.use(helmet(config.security.headers))
}
```

### In Services

```typescript
import { getConfig, validatePassword } from './config'

class UserService {
  private config = getConfig()

  async createUser(email: string, password: string) {
    // Validate password
    const validation = validatePassword(
      password,
      this.config.security.password
    )

    if (!validation.valid) {
      throw new Error(`Password invalid: ${validation.errors.join(', ')}`)
    }

    // Hash password with bcrypt rounds from config
    const hashedPassword = await bcrypt.hash(
      password,
      this.config.security.password.bcryptRounds
    )

    // ... create user
  }

  checkPermission(userRole: string, requiredPermission: string): boolean {
    const { Permissions } = require('./config')
    return Permissions[userRole]?.includes(requiredPermission) || false
  }
}
```

### In Cache Operations

```typescript
import { getConfig, CacheKeys, CacheInvalidation } from './config'

class CacheManager {
  private config = getConfig()

  async getUserWithCache(userId: string) {
    const key = CacheKeys.user(userId)

    // Try cache first
    let user = await redis.get(key)
    if (user) {
      return JSON.parse(user)
    }

    // Fetch from database
    user = await db.users.findById(userId)

    // Store in cache with TTL from config
    await redis.setex(
      key,
      this.config.cache.strategies.user,
      JSON.stringify(user)
    )

    return user
  }

  async invalidateUserCache(userId: string) {
    const keys = CacheInvalidation.onUserUpdate(userId)
    await Promise.all(keys.map(key => redis.del(key)))
  }
}
```

### In Logging

```typescript
import { getConfig, LogEvents } from './config'
import { logger } from './services/logger'

class OrderService {
  async createOrder(userId: string, orderData: any) {
    try {
      logger.info({
        type: LogEvents.API_REQUEST,
        userId,
        action: 'create_order',
      })

      const order = await db.orders.create({
        userId,
        ...orderData,
      })

      logger.info({
        type: LogEvents.API_RESPONSE,
        userId,
        orderId: order.id,
        action: 'order_created',
      })

      return order
    } catch (error) {
      logger.error({
        type: LogEvents.API_ERROR,
        userId,
        action: 'create_order',
        error: error.message,
      })
      throw error
    }
  }
}
```

## Testing with Configuration

### Reset Config Between Tests

```typescript
import { resetConfig, getConfig } from '../config'

describe('UserService', () => {
  afterEach(() => {
    resetConfig()  // Get fresh config instance
  })

  it('should validate password', () => {
    const config = getConfig()
    const result = validatePassword(
      'MyPassword123',
      config.security.password
    )
    expect(result.valid).toBe(true)
  })
})
```

### Use Different Config for Tests

```bash
# Run tests with different config
NODE_ENV=test \
DATABASE_URL=postgres://localhost/bot_trade_test \
REDIS_URL=redis://localhost:6379/1 \
npm test
```

## Validation & Startup

### Automatic Validation

Configuration is automatically validated on application startup:

```
✅ Checking required variables...
✅ Validating PORT range (1-65535)...
✅ Validating BCRYPT_ROUNDS (4-31)...
✅ Checking CORS origins...
✅ Application configuration loaded
   Environment: production
   Port: 3000
   Log Level: info
```

### Validation Errors

If validation fails, the application exits with errors:

```
❌ Environment Validation Failed:
  • DATABASE_URL is required
  • JWT_SECRET is required
  • PORT must be between 1 and 65535 (got 99999)

Process exited with code 1
```

## Best Practices

### ✅ DO

```typescript
// Use typed configuration
const { port } = getConfig().env

// Use config helpers
const userKey = CacheKeys.user(userId)
const permissions = Permissions[userRole]

// Validate early
const validation = validatePassword(pwd, config.security.password)

// Use endpoints from config
const loginUrl = ApiEndpoints.auth.login
```

### ❌ DON'T

```typescript
// Don't access env directly
const port = process.env.PORT  // Bad!

// Don't hardcode cache keys
const key = `user:${userId}`  // Bad!

// Don't hardcode endpoints
const loginUrl = '/api/v1/auth/login'  // Bad!

// Don't pass env vars to functions
function login(secret) { }  // Bad!
```

## Troubleshooting

### "Configuration validation failed"

**Issue:** Application exits with validation errors

**Solution:** Check all required variables are set in `.env`:
```bash
grep -E "DATABASE_URL|JWT_SECRET|REDIS_URL" .env
```

### "Port already in use"

**Issue:** PORT 3000 is already in use

**Solution:** Change PORT in `.env`:
```bash
PORT=3001 npm run dev
```

### "Cannot read property of undefined"

**Issue:** Accessing undefined config property

**Solution:** Always use `getConfig()` and check types:
```typescript
const config = getConfig()
if (config?.api?.baseUrl) {
  // Use safely
}
```

### "Cache key inconsistency"

**Issue:** Cache keys don't match between set/get

**Solution:** Always use `CacheKeys` helpers:
```typescript
// ✅ Always use helpers
const key = CacheKeys.user(userId)

// ❌ Never hardcode
const key = `user:${userId}`
```

## Configuration Summary

| Category | Purpose | Files |
|----------|---------|-------|
| **Environment** | Load & validate variables | env.ts |
| **Database** | Connection pooling | database.ts |
| **Cache** | Redis strategies | cache.ts |
| **API** | Endpoints & versioning | api.ts |
| **Logging** | Structured logging | logger.ts |
| **Security** | JWT, passwords, RBAC | security.ts |
| **Manager** | Load all configs | index.ts |

## Quick Reference

```typescript
// Load config
import { getConfig } from './config'
const config = getConfig()

// Access sections
config.env                  // Environment variables
config.database            // Database config
config.cache               // Cache config
config.api                 // API config
config.logger              // Logger config
config.security            // Security config

// Use helpers
CacheKeys.user(userId)     // Cache key
Permissions[role]          // Role permissions
ApiEndpoints.auth.login    // API endpoint
LogEvents.AUTH_LOGIN       // Log event
HttpStatus.OK              // HTTP status
```

## Related Documentation

- [config/README.md](../config/README.md) - Config directory overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [README.md](../README.md) - Project overview

## Support

For questions or issues with configuration:

1. Check [config/README.md](../config/README.md) for quick reference
2. Review usage patterns in this document
3. Check `.env` file is properly configured
4. Verify all required variables are set
5. Check application startup logs for validation errors
