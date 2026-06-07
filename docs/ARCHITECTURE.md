# 🏗 Architecture Design

## System Overview

Bot-Trade is built on a **three-layer architecture** designed for scalability, maintainability, and security.

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend Layer (React)                  │
│   - Admin Dashboard                                       │
│   - User Interface Components                             │
│   - State Management (Zustand)                            │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │   REST API   │   WebSocket  │
        │  (Express)   │   (Real-time)│
        └──────────────┼──────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              Backend Layer (Node.js)                     │
│   - Express Server (Port 3000)                           │
│   - Business Logic                                       │
│   - Authentication & Authorization                       │
│   - API Endpoints                                        │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │  PostgreSQL  │    Redis     │
        │   (OLTP)     │   (Cache)    │
        └──────────────┼──────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              Data Layer                                  │
│   - PostgreSQL Database                                  │
│   - Redis Cache Layer                                    │
│   - File Storage (S3 concept)                            │
│   - Git Audit Trail                                      │
└──────────────────────────────────────────────────────────┘
```

## Layer Details

### Layer 1: Frontend (React 18)

**Components:**
- Header with branding and help system
- Sidebar with navigation menu
- Dashboard with analytics
- User, Account, Order management pages
- Professional UI with gold/black theme

**State Management:**
- Zustand for global state
- Token and user info persistence
- localStorage for session management

**API Integration:**
- Axios HTTP client
- Automatic JWT token injection
- Error handling and retries
- Base URL configuration

### Layer 2: Backend (Node.js + Express)

**Core Responsibilities:**
- REST API endpoints (/api/v1/*)
- User authentication & authorization
- Business logic implementation
- Data validation
- Error handling

**Structure:**
```
src/
├── routes/              # API endpoints
├── services/            # Business logic
├── middleware/          # Request processing
├── cache/              # Redis integration
└── types/              # TypeScript types
```

**Key Features:**
- JWT-based authentication
- Role-based access control (RBAC)
- Ownership verification
- Structured logging
- Error tracking

### Layer 3: Data (PostgreSQL + Redis)

**PostgreSQL:**
- Primary data store (OLTP)
- User accounts and authentication
- Trading accounts and orders
- Transactional consistency
- Connection pooling (max 20 connections)

**Redis:**
- Session caching
- Frequent data caching
- Real-time notifications
- Performance optimization

## API Design

### RESTful Endpoints

```
Authentication:
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - User login
POST   /api/v1/auth/refresh           - Refresh token

Users:
GET    /api/v1/users                  - List all users
GET    /api/v1/users/:id              - Get user details
POST   /api/v1/users                  - Create user
PUT    /api/v1/users/:id              - Update user
DELETE /api/v1/users/:id              - Delete user

Accounts:
GET    /api/v1/accounts               - List trading accounts
POST   /api/v1/accounts               - Create account
PUT    /api/v1/accounts/:id           - Update account
DELETE /api/v1/accounts/:id           - Delete account

Orders:
GET    /api/v1/orders                 - List orders
POST   /api/v1/orders                 - Create order
PUT    /api/v1/orders/:id             - Update order
DELETE /api/v1/orders/:id             - Cancel order

Market Data:
GET    /api/v1/market/data/:symbol    - Get market data
GET    /api/v1/market/quote/:symbol   - Get quote
```

### Request/Response Format

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "trader"
    }
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'trader', 'viewer'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Trading Accounts Table
```sql
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  broker_type VARCHAR(50),
  account_label VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  account_id UUID FOREIGN KEY,
  symbol VARCHAR(20),
  side ENUM('BUY', 'SELL'),
  quantity DECIMAL(10, 2),
  price DECIMAL(10, 4),
  status VARCHAR(50),
  filled_quantity DECIMAL(10, 2),
  avg_fill_price DECIMAL(10, 4),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Security Architecture

### Authentication Flow

```
1. User Login
   ├─ Email + Password → Backend
   ├─ Password verification (Bcrypt)
   └─ Generate JWT tokens
   
2. Token Generation
   ├─ Access Token (24h expiry)
   ├─ Refresh Token (7d expiry)
   └─ Return both tokens
   
3. Token Usage
   ├─ Store in localStorage
   ├─ Add to Authorization header
   └─ API validates on each request
   
4. Token Refresh
   ├─ Access token expired?
   ├─ Use refresh token
   └─ Get new access token
```

### Authorization Levels

**Admin:** Full access to all features
**Trader:** Access to trading features and own data
**Viewer:** Read-only access to dashboard

## Performance Optimization

### Caching Strategy

```
1. Database Query
   ├─ Check Redis cache
   ├─ Cache hit? Return cached data
   └─ Cache miss? Query database → Cache result
   
2. Cache Invalidation
   ├─ TTL-based expiry (default: 1 hour)
   ├─ Event-based invalidation
   └─ Manual invalidation on updates
```

### Database Optimization

- Connection pooling (max 20 connections)
- Query indexing on frequently searched columns
- Slow query logging (>1 second)
- Query optimization

### Frontend Optimization

- Code splitting with Vite
- Lazy loading of routes
- Image optimization
- CSS minification

## Scalability Considerations

### Horizontal Scaling

- **Stateless backend:** Can run multiple instances
- **Load balancing:** Distribute requests across servers
- **Session management:** Use Redis for shared sessions
- **Database replication:** Master-slave setup

### Vertical Scaling

- **Increase resources:** CPU, RAM, network
- **Optimize code:** Reduce complexity
- **Caching:** Cache frequently accessed data
- **Monitoring:** Track performance metrics

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Application Server              │
│  ├─ Node.js Runtime                     │
│  ├─ Express Server                      │
│  └─ React Static Files                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│    Load Balancer (Optional)              │
│  ├─ Distribute traffic                   │
│  ├─ SSL/TLS termination                  │
│  └─ Health checks                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│    Infrastructure Services              │
│  ├─ PostgreSQL Database                  │
│  ├─ Redis Cache                          │
│  ├─ File Storage (S3)                    │
│  └─ Monitoring & Logging                 │
└──────────────────────────────────────────┘
```

## Monitoring & Logging

### Structured Logging

- **Format:** JSON structured logs
- **Levels:** DEBUG, INFO, WARN, ERROR, FATAL
- **Tools:** Pino logger
- **Output:** Console & file-based

### Metrics Tracked

- API response times
- Database query performance
- Cache hit/miss rates
- User authentication attempts
- Error rates and types

### Alerting

- Slow query alerts (>1s)
- High error rate alerts
- Authentication failures
- Resource usage alerts

## Design Patterns

### Service Layer Pattern
Each service encapsulates specific business logic:
- UserService
- AccountService
- OrderService
- MarketDataService

### Repository Pattern
Data access abstraction:
- Database queries abstracted
- Consistent interface
- Easy testing and mocking

### Middleware Pattern
Request/response processing:
- Authentication middleware
- Error handling middleware
- Logging middleware
- CORS middleware

## Technology Decisions

### Why React + Vite?

- **Fast development:** HMR for instant updates
- **Optimized builds:** Smaller bundle size
- **Modern tooling:** ES modules support
- **Excellent DX:** Great developer experience

### Why Express.js?

- **Lightweight:** Minimal overhead
- **Flexible:** Unopinionated framework
- **Mature:** Well-established ecosystem
- **Easy to learn:** Gentle learning curve

### Why PostgreSQL?

- **Relational:** ACID compliance
- **Scalable:** Handles large datasets
- **Reliable:** Data consistency
- **Cost-effective:** Open source

### Why Redis?

- **In-memory:** Ultra-fast performance
- **Flexible:** Multiple data structures
- **Persistent:** Optional data persistence
- **Distributed:** Support for clustering

## Future Architecture Enhancements

1. **Microservices:** Split services into separate deployments
2. **GraphQL:** Alternative to REST API
3. **Message Queue:** Async processing with RabbitMQ
4. **WebSocket:** Real-time updates
5. **Mobile Apps:** Native iOS/Android
6. **Kubernetes:** Container orchestration

## References

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)
- [OpenAPI Specification](https://swagger.io/specification)
