# 📐 BOT-TRADE Application Architecture

## Overview

**Bot-Trade** is a **professional financial trading dashboard** built with modern web technologies. It provides a complete platform for users to manage trades, view analytics, deposit/withdraw funds, and administrators to monitor system activity.

**Stack:**
- **Frontend:** React 18, TypeScript, Material-UI v5, Vite
- **Backend:** Express.js, Node.js, PostgreSQL
- **State Management:** Zustand (client), localStorage (persistence)
- **Logging:** File-based system + Professional Admin UI
- **Security:** JWT authentication, AES-256-GCM encryption

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOT-TRADE PLATFORM                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   UI Layer (Material-UI)                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • LayoutPro - Main layout wrapper                       │   │
│  │  • NavbarPro - Top navigation with Help button           │   │
│  │  • SidebarPro - 14 menu items for different pages        │   │
│  │  • HelpModal - Context-specific help system              │   │
│  │  • Theme System - Professional color scheme              │   │
│  │  • Recharts - Interactive data visualizations            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Pages (14 Functional Pages)                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  TRADING:                                                 │   │
│  │  • DashboardPro - Overview with charts & metrics         │   │
│  │  • TradingPage - Buy/Sell orders with execution          │   │
│  │  • AccountsPage - Trading account management             │   │
│  │  • OrdersPage - Order history and tracking               │   │
│  │  • AnalyticsPage - Performance metrics & analysis        │   │
│  │                                                            │   │
│  │  ADMIN:                                                   │   │
│  │  • UsersPage - User management with role dropdown        │   │
│  │  • SettingsPage - API keys & currency configuration      │   │
│  │  • AdminLogsPage - Complete system logs viewer           │   │
│  │  • DiagnosticsPage - System health checks                │   │
│  │  • ErrorsPage - Error tracking & severity                │   │
│  │  • DebugPage - API request debugging                     │   │
│  │  • AuditPage - Audit trail of actions                    │   │
│  │  • IncidentsPage - Incident tracking                     │   │
│  │  • PerformancePage - System performance metrics          │   │
│  │  • TeamPage - Team members & statistics                  │   │
│  │                                                            │   │
│  │  AUTH:                                                    │   │
│  │  • Login - User authentication                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         State Management (Zustand + localStorage)        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • useAuthStore - User auth state & persistence          │   │
│  │    - token, user, isAuthenticated, currency              │   │
│  │  • localStorage - Data persistence across sessions       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Services & Utilities                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • api.ts - Axios HTTP client with interceptors          │   │
│  │  • logging-client.ts - Frontend logger (console + API)   │   │
│  │  • currencies.ts - Currency formatting & conversion      │   │
│  │  • helpContent.ts - Help text for all 14 pages           │   │
│  │  • theme-pro.ts - Professional color & spacing system    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

         ↓ HTTP/REST API ↓
    (Axios with JWT auth)

┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Express.js + TypeScript)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Routes                                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  POST   /auth/login - User login                         │   │
│  │  POST   /auth/register - User registration               │   │
│  │  POST   /auth/refresh - Token refresh                    │   │
│  │  GET    /users - List all users                          │   │
│  │  POST   /orders - Create order                           │   │
│  │  GET    /orders - List orders                            │   │
│  │  GET    /admin/logs - Retrieve logs with filters         │   │
│  │  GET    /admin/logs/stats - Log file statistics          │   │
│  │  GET    /admin/logs/download/:file - Download log        │   │
│  │  POST   /admin/logs/clear - Clear old logs               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Middleware & Authentication                       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • authMiddleware - JWT token verification               │   │
│  │  • requireAdmin - Admin-only endpoint protection         │   │
│  │  • errorHandler - Centralized error handling             │   │
│  │  • loggerMiddleware - Request/response logging           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Services & Business Logic                        │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • user-service.ts - User CRUD & authentication          │   │
│  │  • jwt.ts - JWT token generation & verification          │   │
│  │  • crypto.ts - Password hashing (Scrypt) & encryption    │   │
│  │  • logging-service.ts - File-based logging system        │   │
│  │  • database.ts - PostgreSQL connection & migrations      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Logging System                                  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • File-based logging to /logs directory                 │   │
│  │  • Daily rotation with auto-cleanup (10 files max)       │   │
│  │  • Structured format with timestamps & context           │   │
│  │  • DEBUG, INFO, WARN, ERROR, FATAL levels                │   │
│  │  • Stack traces for errors                               │   │
│  │  • API endpoint to query & download logs                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

         ↓ Database Connection ↓
      (PostgreSQL via pg library)

┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tables:                                                          │
│  • users - User accounts with roles                              │
│  • orders - Trading orders & execution history                   │
│  • accounts - Trading accounts                                   │
│  • audit_log - All system actions                                │
│  • api_logs - Detailed API request logs                          │
│  • logs - Application logs (alternative to files)                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

         ↓ File System ↓

┌─────────────────────────────────────────────────────────────────┐
│                  FILE STORAGE                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /logs/ - Application log files                                  │
│  • application-2026-06-08.log                                    │
│  • application-2026-06-07.log                                    │
│  • ... (up to 10 files, auto-rotated daily)                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend Architecture

### Directory Structure

```
admin-dashboard/
├── src/
│   ├── pages/                    # 14 page components
│   │   ├── Login.tsx            # Authentication
│   │   ├── DashboardPro.tsx     # Trading dashboard with charts
│   │   ├── TradingPage.tsx      # Order execution
│   │   ├── AccountsPage.tsx     # Account management
│   │   ├── OrdersPage.tsx       # Order history
│   │   ├── AnalyticsPage.tsx    # Performance analytics
│   │   ├── UsersPage.tsx        # User management with role dropdown
│   │   ├── SettingsPage.tsx     # Settings & currency config
│   │   ├── AdminLogsPage.tsx    # Log viewer
│   │   ├── DiagnosticsPage.tsx  # Health checks
│   │   ├── ErrorsPage.tsx       # Error tracking
│   │   ├── DebugPage.tsx        # API debugging
│   │   ├── AuditPage.tsx        # Audit trail
│   │   ├── IncidentsPage.tsx    # Incident tracking
│   │   ├── PerformancePage.tsx  # Performance metrics
│   │   └── TeamPage.tsx         # Team information
│   │
│   ├── components/
│   │   ├── LayoutPro.tsx        # Main layout wrapper
│   │   ├── NavbarPro.tsx        # Top navigation bar
│   │   ├── SidebarPro.tsx       # Side menu navigation
│   │   └── HelpModal.tsx        # Help dialog
│   │
│   ├── services/
│   │   ├── api.ts               # HTTP client with logging
│   │   └── logging-client.ts    # Frontend logger service
│   │
│   ├── state/
│   │   └── store.ts             # Zustand auth store
│   │
│   ├── content/
│   │   ├── currencies.ts        # Currency system
│   │   ├── helpContent.ts       # Help text for all pages
│   │   └── ...
│   │
│   ├── theme-pro.ts             # Professional theme system
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### State Management

**Zustand Store** (`store.ts`):
```typescript
interface AuthState {
  token: string | null              // JWT auth token
  user: User | null                 // Current user object
  isAuthenticated: boolean           // Auth status
  currency: string                  // User's selected currency
  setToken: (token: string) => void
  setUser: (user: User) => void
  setCurrency: (currency: string) => void
  logout: () => void
}
```

**Data Persistence:**
- `authToken` → localStorage
- `user` → localStorage
- `userCurrency` → localStorage
- `appSettings` → localStorage (theme, notifications, etc.)

### Component Hierarchy

```
App.tsx
└── Router
    ├── Login.tsx
    └── ProtectedRoute
        └── LayoutPro.tsx
            ├── NavbarPro.tsx
            │   ├── HelpModal.tsx
            │   └── Logout button
            ├── SidebarPro.tsx
            │   └── 14 menu items
            └── Page Component (one of 14)
```

---

## 🔧 Backend Architecture

### Directory Structure

```
src/
├── routes/
│   ├── auth.ts                  # Login, register, refresh
│   ├── users.ts                 # User management
│   ├── orders.ts                # Order operations
│   ├── logs-admin.ts            # Admin log endpoints
│   └── ...
│
├── middleware/
│   ├── auth.ts                  # JWT verification
│   ├── error.ts                 # Error handling
│   └── logger.ts                # Request logging
│
├── services/
│   ├── user-service.ts          # User business logic
│   ├── jwt.ts                   # JWT generation/verify
│   ├── crypto.ts                # Password hashing
│   ├── logging-service.ts       # File-based logging
│   ├── database.ts              # DB connection
│   └── ...
│
├── app.ts                       # Express app setup
├── index.ts                     # Server entry point
└── ...
```

### API Routes

#### Authentication
```
POST /api/v1/auth/login
  Input:  { email, password }
  Output: { token, refreshToken, user }
  Logs:   DEBUG, ERROR (failed), INFO (success)

POST /api/v1/auth/register
  Input:  { email, password }
  Output: { id, email, role }
  Logs:   DEBUG, ERROR (validation), INFO (success)

POST /api/v1/auth/refresh
  Input:  { refreshToken }
  Output: { token }
  Logs:   DEBUG, ERROR (invalid token), INFO (success)
```

#### Admin Logs
```
GET /api/v1/admin/logs?limit=100&offset=0&level=ERROR&search=failed
  Output: { logs: LogEntry[], total: number }
  Auth:   Admin only

GET /api/v1/admin/logs/stats
  Output: { files: [{ name, size, modified }], totalSize }
  Auth:   Admin only

GET /api/v1/admin/logs/download/:filename
  Output: File download
  Auth:   Admin only

POST /api/v1/admin/logs/clear
  Input:  { daysToKeep: 30 }
  Output: { message, deletedCount }
  Auth:   Admin only
```

### Authentication Flow

```
1. User Login Request
   ├─ POST /auth/login { email, password }
   ├─ Backend validates credentials
   ├─ [ERROR] Invalid password → Log ERROR, return 401
   └─ [SUCCESS] Generate tokens
       ├─ Generate JWT token (short-lived)
       ├─ Generate refresh token (long-lived)
       ├─ Log INFO with userId, email, role, IP
       └─ Return tokens to frontend

2. Frontend Token Storage
   ├─ Store token in localStorage
   ├─ Store user info in state + localStorage
   └─ Set isAuthenticated = true

3. Subsequent API Calls
   ├─ Add Authorization header: Bearer <token>
   ├─ Backend validates JWT
   ├─ [INVALID] Return 401 Unauthorized
   └─ [VALID] Process request, log activity

4. Token Refresh
   ├─ POST /auth/refresh { refreshToken }
   ├─ Backend verifies refresh token
   ├─ Generate new access token
   └─ Return new token
```

---

## 🔐 Security Architecture

### Password Security
```
Registration:
1. User enters password
2. Backend hashes with Scrypt (slow, memory-intensive)
3. Store hash in database (never store plain password)
4. Return success

Login:
1. User enters password
2. Backend retrieves user's password hash
3. Compare entered password with stored hash
4. [MATCH] Generate tokens
5. [NO MATCH] Return 401 Unauthorized
```

### API Key Encryption
```
User saves API key:
1. User enters API key in Settings
2. Frontend encrypts with AES-256-GCM
3. Send encrypted key to backend
4. Backend stores encrypted key
5. Log: API key saved (INFO)

User retrieves API key:
1. User clicks "Show" in Settings
2. Frontend sends request
3. Backend returns encrypted key
4. Frontend decrypts with AES-256-GCM
5. Display to user

Encryption Key:
- Derived from password using Scrypt
- Per-user isolation
- Lost if password forgotten
```

### JWT Tokens
```
Access Token:
- Short-lived (15 minutes)
- Contains: userId, email, role
- Used for API authentication
- Sent in Authorization header

Refresh Token:
- Long-lived (7 days)
- Used to get new access token
- Stored securely
- Can be revoked
```

---

## 📊 Logging Architecture

### Log Levels

```
DEBUG (Development info)
  ├─ API requests received
  ├─ Function entry/exit
  ├─ Validation steps
  ├─ Token generation
  └─ Cache operations

INFO (Business events)
  ├─ User login SUCCESS
  ├─ Order created
  ├─ Order executed
  ├─ Deposit processed
  ├─ Withdrawal processed
  └─ Settings changed

WARN (Unusual but recoverable)
  ├─ Retry attempts
  ├─ Timeouts with fallback
  ├─ Performance degradation
  └─ Rate limits approaching

ERROR (Recoverable failures) ⭐ ALL ERROR RETURNS LOGGED
  ├─ Login failed (invalid credentials)
  ├─ Order validation failed
  ├─ Insufficient balance
  ├─ Database errors
  ├─ API errors
  └─ Network errors

FATAL (System cannot continue)
  ├─ Database connection failed
  ├─ Critical configuration missing
  └─ Startup failures
```

### Log Storage

```
Files:
- Location: /logs/ directory
- Format: application-YYYY-MM-DD.log
- Daily rotation
- Size limit: 10MB per file
- Max files: 10 (auto-cleanup)

Log Entry Format:
[2026-06-08T14:32:45.123Z] [ERROR] [Orders] Order failed | 
Error: Insufficient balance | Data: {"symbol":"INFY","balance":100000}

Admin Access:
- Logs page in dashboard
- Search & filter by level/service
- Download log files
- Pagination for large datasets
```

### Logging in Code

```typescript
// ❌ BAD - No logging
if (!email) {
  return res.status(400).json({ error: 'Email required' })
}

// ✅ GOOD - All error returns logged
if (!email) {
  loggingService.error('Auth', 'Email validation failed', error, { email })
  return res.status(400).json({ error: 'Email required' })
}

// ✅ GOOD - Success logged with context
loggingService.info('Orders', 'Order created', {
  orderId: order.id,
  symbol,
  quantity,
  price,
  userId,
  timestamp: new Date().toISOString()
})
```

---

## 🎨 UI/UX Architecture

### Theme System

```typescript
// Colors
PRIMARY:      #0066FF (Blue - main actions)
SUCCESS:      #10B981 (Green - positive)
ERROR:        #EF4444 (Red - negative)
WARNING:      #F59E0B (Amber - warnings)
INFO:         #3B82F6 (Info blue)

// Spacing (8px base)
sm:  8px
md:  16px
lg:  24px
xl:  32px
xxl: 48px
xxxl: 64px

// Border Radius
sm:  4px
md:  8px
lg:  12px
```

### Professional Components

```
LayoutPro      - Main layout with sidebar & navbar
NavbarPro      - Top navigation with help & logout
SidebarPro     - 14-item menu with icons
Card           - Material-UI Card with custom styling
Chips          - Status badges (colored)
Tables         - Professional data tables
Charts         - Recharts for visualizations
Dialogs        - Add/edit/confirm operations
Dropdowns      - Select with descriptions (role)
```

### Page Structure

```
Each Page:
├── Header section (title + description)
├── Filters/Search section
├── Main content (table/form/chart)
└── Dialogs (add/edit/delete)

Example: UsersPage
├── Header (👥 Users Management, count)
├── Search bar (filter by name/email)
├── Users table (name, email, role, status, actions)
└── Add/Edit dialog (name, email, role dropdown)
```

---

## 🚀 Data Flow

### Order Execution Flow

```
Frontend:
1. User enters: symbol, quantity, price
2. LOG: [DEBUG] Order placement started
3. Validate inputs
4. [ERROR] Validation fails → LOG: [ERROR]
5. [SUCCESS] Open confirmation dialog
6. LOG: [DEBUG] Order validation passed

User confirms order:
7. LOG: [DEBUG] Order confirmation started
8. Create ExecutedOrder object
9. Add to local state
10. LOG: [INFO] Order executed successfully

Backend (future):
11. API call: POST /orders
12. LOG: [DEBUG] Order request received
13. Validate against balance
14. [ERROR] Insufficient funds → LOG: [ERROR]
15. [SUCCESS] Create order record
16. LOG: [INFO] Order created (orderId, symbol, qty, price)
```

### User Login Flow

```
Frontend:
1. User enters email & password
2. LOG: [DEBUG] Login attempt started
3. POST /auth/login
4. LOG: [DEBUG] Login request sent (via interceptor)

Backend:
5. LOG: [DEBUG] Login request received
6. Validate email/password format
7. [ERROR] Validation fails → LOG: [ERROR]
8. Query user from database
9. [ERROR] User not found → LOG: [ERROR]
10. Compare password hash
11. [ERROR] Password mismatch → LOG: [ERROR]
12. [SUCCESS] Generate tokens
13. LOG: [INFO] User login successful (userId, email, role, IP)

Frontend:
14. LOG: [DEBUG] Login response received (via interceptor)
15. Store token & user in state + localStorage
16. LOG: [INFO] User authenticated, redirecting to dashboard
17. Navigate to home page
```

---

## 📈 Scalability & Performance

### Current Optimization

```
Frontend:
- Code splitting with React.lazy()
- Virtualized tables for large datasets
- Debounced search input
- Memoized components (React.memo)
- CSS-in-JS with emotion (via MUI)

Backend:
- Connection pooling for database
- Request/response compression
- JWT for stateless auth
- File-based logging (no database writes)
- Pagination on API endpoints

Database:
- Indexes on frequently queried columns
- Connection pooling
- Prepared statements to prevent SQL injection
```

### Future Improvements

```
Frontend:
- Service workers for offline support
- Image optimization
- Lazy load charts/tables
- Progressive rendering

Backend:
- Redis caching for user data
- Database query optimization
- API rate limiting
- Request throttling

Infrastructure:
- CDN for static assets
- Load balancing
- Database replication
- Log archival system
```

---

## 🧪 Testing Strategy

### Current Status
```
✅ Manual testing: All features working
✅ Logging: Comprehensive coverage
⚠️  Unit tests: Not implemented yet
⚠️  Integration tests: Not implemented yet
⚠️  E2E tests: Not implemented yet
```

### Recommended Testing
```
Unit Tests:
- utilities (currency formatting, date parsing)
- validators (email, password strength)
- formatters (logging, data transformation)

Integration Tests:
- API endpoints with database
- Authentication flow
- Order execution with balance validation

E2E Tests:
- Complete user journeys
- Login → Order → Logout
- Admin: View logs → Filter → Download
```

---

## 📚 Key Technologies

### Frontend Dependencies
```
react@18                - UI framework
react-router-dom@6     - Routing
@mui/material@5        - UI components
zustand                - State management
axios                  - HTTP client
recharts               - Charts & graphs
typescript             - Type safety
vite                   - Build tool
```

### Backend Dependencies
```
express                - Web framework
typescript             - Type safety
pg                     - PostgreSQL driver
jsonwebtoken           - JWT generation
bcrypt/scrypt          - Password hashing
dotenv                 - Environment variables
cors                   - Cross-origin support
```

---

## 🔄 Development Workflow

### Local Setup
```bash
# Install dependencies
npm install

# Backend
cd project-root
npm run dev          # Start backend on :3000

# Frontend
cd admin-dashboard
npm run dev          # Start frontend on :5173

# View logs
# Logs appear in:
# - Browser console (frontend)
# - logs/ directory (backend)
# - Admin Logs page (UI)
```

### Git Workflow
```bash
git add .
git commit -m "feat: description"
git push origin main

# All commits logged to backend files
```

---

## 🎯 Implementation Status

### ✅ Completed
- [x] Professional UI with 14 pages
- [x] Authentication (login/logout)
- [x] Role-based users with dropdown
- [x] Currency configuration (15 currencies)
- [x] Exhaustive logging (DEBUG to FATAL)
- [x] File-based log system with admin viewer
- [x] Deposit/withdrawal functionality
- [x] Order execution with confirmation
- [x] Interactive charts (4 types)
- [x] Help system for all pages
- [x] Professional theme system
- [x] Comprehensive comments in code

### 🚧 In Progress
- [ ] Backend API integration (endpoints exist, need data)
- [ ] Real market data feeds
- [ ] WebSocket for live updates

### 📋 Planned
- [ ] Unit/integration/E2E tests
- [ ] Database migrations
- [ ] Payment gateway integration
- [ ] Advanced order types (stop-loss, limit)
- [ ] Performance optimization
- [ ] Mobile responsiveness

---

## 📞 Support & Troubleshooting

### Check Logs
```
1. Go to Admin → Logs page
2. Filter by ERROR level
3. Search for relevant keyword
4. See complete error details
5. Download log file if needed
```

### Common Issues
```
Login fails:
→ Check: Logs page, filter ERROR + Auth service
  See exact error reason

Order placement fails:
→ Check: Logs page, filter ERROR + Orders service
  Check balance, symbol validation, API errors

API timeout:
→ Check: Logs page, filter WARN + API service
  See response times, identify slow endpoints
```

---

Last Updated: June 8, 2026
Maintained by: Development Team
Version: 1.0 Production Ready
