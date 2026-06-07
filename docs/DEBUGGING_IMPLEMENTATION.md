# 🔍 Debugging Features Implementation Roadmap

## Overview

Comprehensive 4-5 week implementation plan for professional debugging and monitoring features for Bot-Trade. Designed for enterprise teams (10+ developers).

---

## 📋 Implementation Timeline

### Week 1: Core Infrastructure & Database Schema ⏳ STARTING NOW
**Goal:** Create database tables and core logging infrastructure

**Tasks:**
- ✅ Create database migrations (4 new tables)
- ✅ Create TypeScript models/interfaces
- ✅ Implement logging service (store/retrieve logs)
- ✅ Implement error service (grouping, tracking)
- ✅ Implement audit service (user activity)
- ✅ Add logging middleware (capture all requests)
- ✅ Add RBAC protection to logging routes

**Files to Create:**
```
migrations/
├── 004_create_logs_table.sql
├── 005_create_errors_table.sql
├── 006_create_audit_logs_table.sql
└── 007_create_debug_sessions_table.sql

src/models/
├── log.ts
├── error.ts
├── audit.ts
└── debug-session.ts

src/services/
├── logging-service.ts
├── error-service.ts
├── audit-service.ts
└── debug-service.ts

src/routes/
├── logs.ts
├── errors.ts
├── audit.ts
└── debug.ts

src/middleware/
└── log-capture.ts
```

**Database Schema:**
```sql
-- logs table (Structured logging)
CREATE TABLE logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP,
  level VARCHAR(10),
  message TEXT,
  user_id UUID,
  correlation_id UUID,
  module VARCHAR(50),
  context JSONB,
  stack_trace TEXT,
  request_id UUID,
  session_id UUID,
  ip_address INET,
  created_at TIMESTAMP
)

-- errors table (Grouped errors)
CREATE TABLE errors (
  id UUID PRIMARY KEY,
  error_hash VARCHAR(64),
  title VARCHAR(255),
  message TEXT,
  stack_trace TEXT,
  first_occurrence TIMESTAMP,
  last_occurrence TIMESTAMP,
  occurrence_count INT,
  affected_users INT,
  status VARCHAR(20),
  assigned_to UUID,
  context JSONB,
  created_at TIMESTAMP
)

-- audit_logs table (Compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP,
  immutable BOOLEAN
)

-- debug_sessions table (Per-user debug)
CREATE TABLE debug_sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  enabled_by_admin_id UUID,
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  reason TEXT,
  log_level VARCHAR(10),
  created_at TIMESTAMP
)
```

**API Endpoints (Week 1):**
```
POST   /api/v1/logs           # Store logs
GET    /api/v1/logs           # Get logs (filtered)
POST   /api/v1/debug          # Enable debug mode
DELETE /api/v1/debug/:id      # Disable debug mode
GET    /api/v1/errors         # Get errors (grouped)
POST   /api/v1/audit          # Store audit log
GET    /api/v1/audit          # Get audit logs
```

---

### Week 2: Log Viewer & Debug Mode UI
**Goal:** Build admin UI for viewing logs and enabling debug mode

**Tasks:**
- Create Log Viewer API with filters
- Build Log Viewer React component
- Create Debug Mode toggle UI
- Implement search functionality
- Add error grouping algorithm
- Create error detail view API

**Frontend Components:**
```
admin-dashboard/src/pages/
├── Logs.tsx
├── Errors.tsx
└── AuditTrail.tsx

admin-dashboard/src/components/
├── LogViewer.tsx
├── LogFilter.tsx
├── DebugToggle.tsx
├── ErrorDetail.tsx
└── filters/
    ├── LogFilter.tsx
    ├── ErrorFilter.tsx
    └── AuditFilter.tsx
```

---

### Week 3: Error Dashboard & Incident Management
**Goal:** Build comprehensive error dashboard

**Tasks:**
- Create error rate charts
- Implement error detail view
- Add developer assignment
- Create error status tracking
- Build error timeline view
- Implement error deduplication

**Features:**
- Error frequency chart (hourly, daily, weekly)
- Top errors list
- Error history timeline
- Affected users count
- Developer assignment UI
- Error resolution status

---

### Week 4: Audit Trail UI & Performance Optimization
**Goal:** Build audit trail interface and optimize queries

**Tasks:**
- Create activity timeline UI
- Add audit log export (CSV, JSON)
- Optimize database queries (indexes)
- Add search functionality
- Implement pagination
- Add performance metrics logging

---

### Week 5: Team Features & Scaling for 10+ Developers
**Goal:** Add team coordination and scaling features

**Tasks:**
- Incident assignment system
- Team notifications (Slack/Email)
- On-call rotation support
- Multi-developer RBAC refinement
- Audit trail reporting
- Preparation for Sentry integration (Phase 2)

---

## 🗂️ File Structure (Final)

```
bot-trade/
├── migrations/
│   ├── 004_create_logs_table.sql
│   ├── 005_create_errors_table.sql
│   ├── 006_create_audit_logs_table.sql
│   └── 007_create_debug_sessions_table.sql
│
├── src/
│   ├── models/
│   │   ├── log.ts
│   │   ├── error.ts
│   │   ├── audit.ts
│   │   └── debug-session.ts
│   │
│   ├── services/
│   │   ├── logging-service.ts
│   │   ├── error-service.ts
│   │   ├── audit-service.ts
│   │   ├── debug-service.ts
│   │   └── error-grouping.ts
│   │
│   ├── routes/
│   │   ├── logs.ts
│   │   ├── errors.ts
│   │   ├── audit.ts
│   │   └── debug.ts
│   │
│   └── middleware/
│       └── log-capture.ts
│
└── admin-dashboard/src/
    ├── pages/
    │   ├── Logs.tsx
    │   ├── Errors.tsx
    │   └── AuditTrail.tsx
    │
    └── components/
        ├── LogViewer.tsx
        ├── ErrorDetail.tsx
        ├── AuditTimeline.tsx
        ├── DebugToggle.tsx
        └── filters/
            ├── LogFilter.tsx
            ├── ErrorFilter.tsx
            └── AuditFilter.tsx
```

---

## 🔐 RBAC Implementation

### Role-Based Access Control

```typescript
Admin:
  ├── View all logs (any user, any level)
  ├── Enable debug mode for any user
  ├── View all errors
  ├── View all audit logs
  ├── Assign errors to developers
  └── Configure retention policies

Senior Dev:
  ├── View all application logs
  ├── Enable debug mode
  ├── View all errors
  ├── View own audit log
  └── Assign errors to team

Developer:
  ├── View own logs only
  ├── Cannot enable debug mode
  ├── View published errors
  └── View own audit log

Support:
  ├── View specific user's logs
  ├── Cannot modify anything
  ├── See user activity timeline
  └── Cannot view other users' logs
```

---

## 💾 Database Indexes

For optimal performance:

```sql
-- logs table indexes
CREATE INDEX idx_logs_user_timestamp ON logs(user_id, created_at DESC);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_correlation_id ON logs(correlation_id);

-- errors table indexes
CREATE INDEX idx_errors_hash ON errors(error_hash);
CREATE INDEX idx_errors_status ON errors(status);
CREATE INDEX idx_errors_occurrence ON errors(last_occurrence DESC);

-- audit_logs table indexes
CREATE INDEX idx_audit_user_timestamp ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- debug_sessions table indexes
CREATE INDEX idx_debug_sessions_user ON debug_sessions(user_id);
CREATE INDEX idx_debug_sessions_expires ON debug_sessions(expires_at);
```

---

## 📊 API Design Details

### Log Viewer API

```typescript
// GET /api/v1/logs
Query Parameters:
  - userId: string (filter by user)
  - level: string (DEBUG, INFO, WARN, ERROR, FATAL)
  - module: string (auth, orders, market, etc)
  - startDate: ISO timestamp
  - endDate: ISO timestamp
  - search: string (search in message)
  - limit: number (default 50)
  - offset: number (pagination)
  - correlationId: string

Response:
{
  data: Log[],
  total: number,
  page: number,
  pageSize: number
}

// POST /api/v1/logs (internal only)
{
  level: string,
  message: string,
  userId?: string,
  module: string,
  context?: any,
  stackTrace?: string
}
```

### Error Tracking API

```typescript
// GET /api/v1/errors
Query Parameters:
  - status: string (new, investigating, resolved)
  - assignedTo: string (developer user_id)
  - sortBy: string (occurrence, timestamp, affected_users)
  - limit: number

Response:
{
  data: Error[],
  total: number,
  errorRate: number,
  topErrors: Error[]
}

// GET /api/v1/errors/:id
Response:
{
  id: string,
  title: string,
  message: string,
  stackTrace: string,
  occurrenceCount: number,
  affectedUsers: number,
  firstOccurrence: timestamp,
  lastOccurrence: timestamp,
  status: string,
  assignedTo: User | null,
  instances: Log[]  // Recent occurrences
}

// PUT /api/v1/errors/:id
{
  status: string,
  assignedTo: string
}
```

### Debug Mode API

```typescript
// POST /api/v1/debug
{
  userId: string,
  duration: number,  // in minutes (60, 240, 480, 1440)
  reason: string
}

Response:
{
  sessionId: string,
  userId: string,
  expiresAt: timestamp,
  reason: string
}

// DELETE /api/v1/debug/:sessionId
Response:
{
  success: boolean,
  message: string
}
```

### Audit Trail API

```typescript
// GET /api/v1/audit
Query Parameters:
  - userId: string
  - action: string (login, logout, debug_enabled, etc)
  - resourceType: string
  - startDate: timestamp
  - endDate: timestamp

Response:
{
  data: AuditLog[],
  total: number
}

// Export endpoint
GET /api/v1/audit/export?format=csv|json
// Returns downloadable file
```

---

## 🧪 Testing Strategy

### Unit Tests (Per Service)
```typescript
// logging-service.test.ts
- Store log successfully
- Retrieve logs with filters
- Handle log levels correctly
- Format context properly

// error-service.test.ts
- Create error entry
- Group similar errors
- Update error count
- Assign error to developer

// audit-service.test.ts
- Log user actions
- Track permission changes
- Maintain immutability
- Export audit trail

// debug-service.test.ts
- Create debug session
- Auto-expire session
- Update log level
```

### Integration Tests
```typescript
// Log flow: capture → store → retrieve
// Error flow: occur → group → track
// Audit flow: action → log → search
// Debug flow: enable → log at DEBUG level → disable
```

---

## 📈 Performance Considerations

1. **Log Retention:** 30 days for DEBUG, 90 days for ERROR
2. **Archival:** Move old logs to S3 (optional)
3. **Indexes:** Strategic indexing on search fields
4. **Pagination:** Always paginate large result sets
5. **Caching:** Cache error grouping results (5 min TTL)
6. **Batching:** Batch log writes (every 10 logs or 5 seconds)

---

## 🔄 Error Grouping Algorithm

```typescript
// Group errors by signature
function createErrorSignature(error: Error): string {
  const lines = error.stack
    ?.split('\n')
    .slice(0, 3)  // First 3 stack frames
    .join('\n') || error.message
  
  return createHash('sha256')
    .update(lines)
    .digest('hex')
}

// Similar errors are grouped together
// Prevents duplicate error reports
// Tracks frequency and affected users
```

---

## 📚 Documentation Tasks

### Create Documentation
- API reference for debugging features
- Admin user guide
- Developer troubleshooting guide
- Performance tuning guide
- Scaling guide for 10+ developers

---

## ✅ Acceptance Criteria (Week 1)

- [ ] All 4 migrations created and tested
- [ ] All models/types defined
- [ ] Logging service working (store/retrieve)
- [ ] Audit service tracking user actions
- [ ] Error service grouping errors
- [ ] Logging middleware capturing requests
- [ ] All API endpoints functional
- [ ] RBAC protection implemented
- [ ] Unit tests passing (50+ tests)
- [ ] Commit pushed to GitHub

---

## 🎯 Success Metrics

### Week 1
- All database tables created ✓
- Core services functional ✓
- API endpoints responding ✓
- 50+ unit tests passing ✓

### Week 2
- Log viewer UI working ✓
- Debug mode toggle functional ✓
- Search/filter working ✓

### Week 3
- Error dashboard displaying data ✓
- Error assignment working ✓
- Charts rendering correctly ✓

### Week 4
- Audit trail UI complete ✓
- Export functionality working ✓
- Performance optimized ✓

### Week 5
- Incident management system ✓
- Team notifications ✓
- RBAC fully implemented ✓

---

## 🚀 Getting Started

Ready to start? Let's begin with Week 1!

**Next Steps:**
1. Create database migrations
2. Define TypeScript models
3. Implement services
4. Create API routes
5. Add middleware
6. Write tests
7. Commit to GitHub

Let's build professional-grade debugging features! 💪

---

**Timeline:** 4-5 weeks  
**Team:** Designed for 10+ developers  
**Status:** Ready to start Week 1 ⏳
