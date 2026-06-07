# 🎯 Week 5: Team Features & Notifications Implementation

## Overview

Build comprehensive team coordination features including incident management, multi-channel notifications, and on-call rotation support for the debugging system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard (Frontend)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Incident Management Page                           │  │
│  │ • Team Coordination Dashboard                        │  │
│  │ • On-Call Rotation Schedule                          │  │
│  │ • Notification Settings                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Express.js API (Backend)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Incident Routes:                                     │  │
│  │  • POST   /api/v1/incidents - Create incident       │  │
│  │  • GET    /api/v1/incidents - List incidents        │  │
│  │  • GET    /api/v1/incidents/:id - Get details       │  │
│  │  • PUT    /api/v1/incidents/:id - Update incident   │  │
│  │                                                      │  │
│  │ Notification Routes:                                 │  │
│  │  • POST   /api/v1/notifications - Send notif        │  │
│  │  • GET    /api/v1/notifications - Get notifs        │  │
│  │  • DELETE /api/v1/notifications/:id - Mark read     │  │
│  │                                                      │  │
│  │ Team Routes:                                         │  │
│  │  • GET    /api/v1/team/on-call - On-call schedule   │  │
│  │  • POST   /api/v1/team/on-call - Set on-call        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            External Services Integration                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Slack API - Channel notifications                  │  │
│  │ • Email Service - SMTP/SendGrid                      │  │
│  │ • Push Notifications - Web/Mobile                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ New Tables:                                          │  │
│  │  • incidents - Core incident tracking                │  │
│  │  • incident_assignments - Developer assignments      │  │
│  │  • notifications - User notifications                │  │
│  │  • on_call_schedule - On-call rotation               │  │
│  │  • notification_preferences - User preferences       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### incidents table
```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  related_error_id UUID REFERENCES errors(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_assigned ON incidents(assigned_to);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);
```

### incident_assignments table
```sql
CREATE TABLE incident_assignments (
  id UUID PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_assignments_incident ON incident_assignments(incident_id);
CREATE INDEX idx_assignments_user ON incident_assignments(assigned_to);
```

### notifications table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('incident', 'assignment', 'comment', 'mention', 'on_call')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_incident_id UUID REFERENCES incidents(id),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### on_call_schedule table
```sql
CREATE TABLE on_call_schedule (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  shift_type VARCHAR(20) CHECK (shift_type IN ('daytime', 'night', 'weekend')),
  primary_oncall BOOLEAN DEFAULT true,
  backup_oncall BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_oncall_user ON on_call_schedule(user_id);
CREATE INDEX idx_oncall_dates ON on_call_schedule(start_date, end_date);
```

### notification_preferences table
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slack_webhook_url TEXT,
  email_enabled BOOLEAN DEFAULT true,
  slack_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  notify_on_incident BOOLEAN DEFAULT true,
  notify_on_assignment BOOLEAN DEFAULT true,
  notify_on_on_call BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_prefs_user ON notification_preferences(user_id);
```

## Week 5 Deliverables

### Database Layer
- [ ] 5 new migrations (incidents, assignments, notifications, on_call, preferences)
- [ ] Proper indexes and foreign keys
- [ ] Triggers for timestamp updates
- [ ] Audit logging integration

### Backend Services
- [ ] IncidentService (CRUD, status management)
- [ ] NotificationService (send, retrieve, mark read)
- [ ] OnCallService (schedule management)
- [ ] SlackService (webhook integration)
- [ ] EmailService (SMTP integration)
- [ ] TeamService (team coordination)

### API Routes
- [ ] /api/v1/incidents (4 endpoints)
- [ ] /api/v1/notifications (3 endpoints)
- [ ] /api/v1/team/on-call (2 endpoints)
- [ ] /api/v1/team/assignments (2 endpoints)

### Frontend Components
- [ ] IncidentManagement page
- [ ] TeamCoordination page
- [ ] NotificationCenter component
- [ ] OnCallSchedule component
- [ ] NotificationBell with badge

### Integrations
- [ ] Slack webhook integration
- [ ] Email notification service
- [ ] Push notifications (optional)
- [ ] Webhook retry logic

## Implementation Timeline

**Days 1-2: Database & Core Services**
- Create 5 migrations
- Build IncidentService
- Build NotificationService
- Build OnCallService
- Build BaseServices (Slack, Email)

**Days 3-4: API Routes**
- Implement incident endpoints
- Implement notification endpoints
- Implement team endpoints
- Add authentication & authorization

**Days 5: Frontend Pages**
- Build IncidentManagement page
- Build TeamCoordination page
- Build NotificationCenter
- Integrate with sidebar

**Days 6-7: Testing & Polish**
- Integration tests
- End-to-end tests
- UI/UX refinement
- Documentation

## Key Features

### Incident Management
- Create incidents from errors
- Manual incident creation
- Status workflow (open → investigating → resolved → closed)
- Severity levels (low, medium, high, critical)
- Developer assignment
- Resolution tracking
- Timeline/history

### Notifications
- Multi-channel (In-app, Email, Slack, Push)
- Notification types (incident, assignment, comment, mention)
- User preferences
- Read/unread tracking
- Notification history
- Smart batching for high-volume scenarios

### Team Coordination
- On-call rotation schedule
- Primary and backup on-call
- Team dashboard
- Assignment history
- Performance metrics

### Advanced Features
- Automatic incident creation from critical errors
- Escalation rules
- SLA tracking
- Team notifications
- Integration with Slack channels
- Email notifications with templates

## Success Criteria

✅ All 5 migrations applied successfully  
✅ 6 backend services implemented  
✅ 10 API endpoints working with proper RBAC  
✅ 4 frontend pages built and integrated  
✅ Slack/Email integration functional  
✅ 50+ unit tests passing  
✅ Incident creation and assignment working  
✅ Notifications sent and received correctly  
✅ On-call schedule functioning  
✅ Team dashboard displaying real-time data  

## Next Steps After Week 5

- Week 6: Performance optimization & caching
- Week 7: Production deployment & monitoring
- Week 8: Mobile app integration
- Future: Sentry integration upgrade (Phase 2)

---

**Status:** Ready to begin Week 5 implementation  
**Target Completion:** 5-7 days  
**Code Target:** 2000+ additional lines  
**Tests Target:** 50+ new tests
