# 🔧 Configuration Management

This directory contains all centralized configuration for the Bot-Trade application.

## 📁 Structure

```
config/
├── index.ts          # Main config loader (entry point)
├── env.ts            # Environment variables (typed & validated)
├── database.ts       # Database configuration
├── cache.ts          # Redis/Cache configuration
├── api.ts            # API endpoints and configuration
├── logger.ts         # Logging configuration
├── security.ts       # Security, JWT, password, roles
└── README.md         # This file
```

## 🚀 Quick Start

### Loading Configuration

```typescript
import { getConfig } from './config'

const config = getConfig()

// Access any configuration
console.log(config.api.baseUrl)
console.log(config.database.url)
console.log(config.security.jwt.secret)
```

### Configuration Structure

```typescript
interface AppConfig {
  env: AppEnvironment
  database: DatabaseConfig
  cache: CacheConfig
  api: ApiConfig
  logger: LoggerConfig
  security: SecurityConfig
}
```

## 📋 Configuration Files

### env.ts - Environment Variables

Loads and validates all environment variables with types.

**Key Variables:**
- `NODE_ENV` - development, production, test
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGINS` - Allowed origins (comma-separated)
- `LOG_LEVEL` - debug, info, warn, error, fatal

**Example:**
```typescript
const env = getConfig().env
console.log(env.port)  // 3000
console.log(env.nodeEnv)  // 'development'
```

### database.ts - Database Configuration

Manages PostgreSQL connection pooling and query logging.

**Features:**
- Connection pooling (default: 20 max connections)
- Slow query detection (>1 second)
- Migrations tracking
- Index definitions

**Example:**
```typescript
const dbConfig = getConfig().database
console.log(dbConfig.poolConfig.max)  // 20
console.log(dbConfig.queryLogging.slowQueryThreshold)  // 1000ms
```

### cache.ts - Cache Configuration

Redis caching strategies and cache key definitions.

**Features:**
- TTL per resource type (session, user, account, order, market data)
- Centralized cache key naming
- Cache invalidation patterns

**Example:**
```typescript
const cacheConfig = getConfig().cache
const sessionKey = CacheKeys.session(sessionId)
const userKey = CacheKeys.user(userId)
```

### api.ts - API Configuration

API endpoints, versioning, and CORS configuration.

**Features:**
- Centralized endpoint definitions
- HTTP status codes
- Request/response formats
- Rate limiting configuration

**Example:**
```typescript
const apiConfig = getConfig().api
console.log(apiConfig.baseUrl)  // http://localhost:3000
console.log(ApiEndpoints.auth.login)  // /auth/login
```

### logger.ts - Logger Configuration

Structured logging with Pino.

**Features:**
- Log level configuration
- Pretty printing in development
- Structured JSON in production
- Log event types predefined

**Example:**
```typescript
const loggerConfig = getConfig().logger
console.log(loggerConfig.level)  // 'info'
```

### security.ts - Security Configuration

JWT, password policy, and role-based access control.

**Features:**
- JWT token configuration
- Password validation rules
- CORS and security headers
- Role-based permissions matrix

**Example:**
```typescript
const securityConfig = getConfig().security
console.log(securityConfig.jwt.secret)
console.log(securityConfig.password.minLength)  // 8

// Validate password
const result = validatePassword('MyPassword123!', securityConfig.password)
console.log(result.valid)  // true/false
```

## 🔐 Environment Variables

Create `.env` file in project root:

```bash
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
JWT_SECRET=your-secret-key-here
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
```

## 🎯 Usage Examples

### In Express Middleware

```typescript
import { getConfig } from './config'

const config = getConfig()

app.use(cors({
  origin: config.security.cors.origins,
  credentials: config.security.cors.credentials,
}))
```

### In Services

```typescript
import { getConfig } from './config'

class UserService {
  private config = getConfig()

  async registerUser(email: string, password: string) {
    // Validate password
    const validation = validatePassword(
      password,
      this.config.security.password
    )
    
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    // Hash password
    const hash = await bcrypt.hash(
      password,
      this.config.security.password.bcryptRounds
    )
  }
}
```

### In Cache Operations

```typescript
import { getConfig, CacheKeys } from './config'

const config = getConfig()
const userKey = CacheKeys.user(userId)

// Get from cache
const cached = await redis.get(userKey)

// Set in cache with TTL
await redis.setex(
  userKey,
  config.cache.strategies.user,
  JSON.stringify(userData)
)
```

## ✅ Validation

Configuration is automatically validated on startup:

```typescript
// These checks run automatically
- DATABASE_URL must be set
- JWT_SECRET must be set
- PORT must be 1-65535
- BCRYPT_ROUNDS must be 4-31
- CORS_ORIGINS must be configured
```

If validation fails, the application exits with error messages:

```
❌ Environment Validation Failed:
  • DATABASE_URL is required
  • JWT_SECRET is required
```

## 🧪 Testing

For testing, use different environment:

```bash
NODE_ENV=test npm test
```

In tests, reset and reload config:

```typescript
import { resetConfig, getConfig } from './config'

afterEach(() => {
  resetConfig()  // Reset for next test
})

const config = getConfig()  // Fresh instance
```

## 🚀 Development vs Production

### Development
- Pretty-printed logs
- CORS allows localhost
- No rate limiting
- SSL not enforced

### Production
- JSON structured logs
- CORS restricted to allowed origins
- Rate limiting enabled
- SSL enforced
- Security headers enabled

## 🔄 Reloading Configuration

To reload configuration without restarting:

```typescript
import { resetConfig, getConfig } from './config'

resetConfig()
const newConfig = getConfig()
```

## 📚 Best Practices

1. **Always use typed config** - Never access env directly
   ```typescript
   // ✅ Good
   const { port } = getConfig().env
   
   // ❌ Bad
   const port = process.env.PORT
   ```

2. **Validate early** - Config validation runs on startup

3. **Use config singletons** - `getConfig()` returns same instance

4. **Cache key consistency** - Use `CacheKeys` helpers

5. **Role-based access** - Use `Permissions` matrix

6. **Secure secrets** - Never commit `.env` to git

## 🆘 Troubleshooting

### "Configuration validation failed"
- Check all required environment variables are set
- Verify PORT is valid (1-65535)
- Check DATABASE_URL format

### "Cache key inconsistency"
- Use `CacheKeys` helpers from config
- Don't hardcode cache keys

### "Invalid password policy"
- Check password meets `securityConfig.password` requirements
- Use `validatePassword()` helper

## 📖 Related Documentation

- [API Documentation](../docs/API.md)
- [Architecture Guide](../docs/ARCHITECTURE.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [README.md](../README.md)

## 🤝 Contributing

When adding new configuration:

1. Add to appropriate config file
2. Export from `config/index.ts`
3. Add TypeScript interface
4. Update documentation
5. Add validation if needed
6. Update example `.env`
