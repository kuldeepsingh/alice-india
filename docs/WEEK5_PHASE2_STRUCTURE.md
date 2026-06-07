# Week 5 Phase 2: Backend Services & API Routes Structure

## Overview

This document outlines the exact structure for implementing Phase 2 (Services & API Routes) and Phase 3 (Frontend) of Week 5.

## Phase 2A: Backend Services (6 services, 1500+ lines)

### 1. IncidentService (`src/services/incident-service.ts`)

```typescript
class IncidentService {
  // Create
  static async createIncident(
    input: CreateIncidentInput,
    createdBy: string
  ): Promise<Incident>
  
  // Read
  static async getIncidents(filter: IncidentFilter): Promise<IncidentQueryResult>
  static async getIncidentById(id: string): Promise<IncidentWithUser>
  
  // Update
  static async updateIncident(id: string, updates: UpdateIncidentInput): Promise<Incident>
  static async assignIncident(id: string, input: AssignIncidentInput, assignedBy: string): Promise<Incident>
  static async updateStatus(id: string, status: IncidentStatus): Promise<Incident>
  
  // Delete
  static async closeIncident(id: string, notes: string): Promise<void>
  
  // Analytics
  static async getIncidentStats(): Promise<IncidentStats>
  static async getIncidentTrends(days: number): Promise<TrendData[]>
}
```

**Key Methods:** 8 methods, ~250 lines

---

### 2. NotificationService (`src/services/notification-service.ts`)

```typescript
class NotificationService {
  // Create
  static async sendNotification(input: CreateNotificationInput): Promise<Notification>
  static async broadcastToTeam(message: string, type: NotificationType): Promise<Notification[]>
  
  // Read
  static async getNotifications(userId: string, filter: NotificationFilter): Promise<NotificationQueryResult>
  static async getUnreadCount(userId: string): Promise<number>
  
  // Update
  static async markAsRead(notificationId: string): Promise<void>
  static async markAllAsRead(userId: string): Promise<void>
  
  // Delete
  static async deleteNotification(id: string): Promise<void>
  static async deleteOldNotifications(daysOld: number): Promise<number>
}
```

**Key Methods:** 8 methods, ~200 lines

---

### 3. OnCallService (`src/services/on-call-service.ts`)

```typescript
class OnCallService {
  // Create
  static async createSchedule(input: CreateScheduleInput): Promise<OnCallSchedule>
  
  // Read
  static async getSchedule(userId: string, dateRange: DateRange): Promise<OnCallSchedule[]>
  static async getActiveOnCall(date: Date): Promise<{
    primary: User
    backup: User
  }>
  static async getTeamSchedule(dateRange: DateRange): Promise<ScheduleView>
  
  // Update
  static async updateSchedule(id: string, updates: any): Promise<OnCallSchedule>
  
  // Utilities
  static async validateNoConflicts(userId: string, startDate: Date, endDate: Date): Promise<boolean>
  static async notifyOnCallUsers(): Promise<void>
}
```

**Key Methods:** 7 methods, ~200 lines

---

### 4. SlackService (`src/services/slack-service.ts`)

```typescript
class SlackService {
  // Send notifications
  static async sendIncidentAlert(webhookUrl: string, incident: Incident): Promise<void>
  static async sendAssignmentNotification(webhookUrl: string, incident: Incident, assignedTo: User): Promise<void>
  static async sendStatusUpdate(webhookUrl: string, incident: Incident): Promise<void>
  
  // Format messages
  private static formatIncidentAlert(incident: Incident): SlackMessage
  private static formatAssignmentNotification(incident: Incident, assignedTo: User): SlackMessage
  
  // Error handling
  static async handleWebhookError(error: Error, webhookUrl: string): Promise<void>
}
```

**Key Methods:** 6 methods, ~150 lines

---

### 5. EmailService (`src/services/email-service.ts`)

```typescript
class EmailService {
  // Send emails
  static async sendIncidentAlert(email: string, incident: Incident): Promise<void>
  static async sendAssignmentNotification(email: string, incident: Incident): Promise<void>
  static async sendStatusUpdate(email: string, incident: Incident): Promise<void>
  static async sendDailyDigest(email: string, incidents: Incident[]): Promise<void>
  
  // Template rendering
  private static renderTemplate(template: string, data: any): string
  
  // Error handling
  static async logEmailFailure(error: Error, recipient: string): Promise<void>
}
```

**Key Methods:** 7 methods, ~200 lines

---

### 6. TeamService (`src/services/team-service.ts`)

```typescript
class TeamService {
  // Team info
  static async getTeamMembers(): Promise<User[]>
  static async getTeamAvailability(date: Date): Promise<AvailabilityMap>
  
  // Incident coordination
  static async getIncidentMetrics(): Promise<TeamMetrics>
  static async escalateIncident(incidentId: string, escalateTo: User): Promise<void>
  
  // On-call management
  static async getOnCallMetrics(): Promise<OnCallMetrics>
  static async rotateOnCall(): Promise<void>
}
```

**Key Methods:** 6 methods, ~150 lines

---

## Phase 2B: API Routes (10 endpoints, 800+ lines)

### Incident Routes (`src/routes/incidents.ts`)

```typescript
POST   /api/v1/incidents              # Create incident
GET    /api/v1/incidents              # List incidents
GET    /api/v1/incidents/:id          # Get incident details
PUT    /api/v1/incidents/:id          # Update incident
PUT    /api/v1/incidents/:id/assign   # Assign incident
PUT    /api/v1/incidents/:id/status   # Update status
```

**Requirements:**
- Authentication via JWT
- RBAC: Admin can create, assigned dev can update
- Query parameters: status, severity, assignedTo, limit, offset
- Response: Incident with user details

---

### Notification Routes (`src/routes/notifications.ts`)

```typescript
POST   /api/v1/notifications              # Send notification
GET    /api/v1/notifications              # Get user notifications
PUT    /api/v1/notifications/:id/read     # Mark as read
DELETE /api/v1/notifications/:id          # Delete notification
```

**Requirements:**
- User can only access own notifications
- Unread count in response
- Filter by type, read status
- Pagination support

---

### Team Routes (`src/routes/team.ts`)

```typescript
GET    /api/v1/team/members           # Get team members
GET    /api/v1/team/on-call           # Get on-call schedule
POST   /api/v1/team/on-call           # Create schedule
GET    /api/v1/team/metrics           # Team metrics
```

**Requirements:**
- Admin access for scheduling
- Date-based filtering
- User detail population

---

## Phase 2C: Testing (300+ lines)

### Test Files

```
tests/services/
├── incident-service.test.ts
├── notification-service.test.ts
├── on-call-service.test.ts
└── team-service.test.ts

tests/routes/
├── incidents.test.ts
├── notifications.test.ts
└── team.test.ts
```

**Test Coverage:**
- CRUD operations for each service
- RBAC enforcement
- Error handling
- Edge cases (no incidents, invalid status, etc)
- ~50+ test cases total

---

## Phase 3: Frontend (1300+ lines)

### Pages

#### IncidentManagement.tsx (600+ lines)
```
Features:
- List all incidents with filters
- Create new incident modal
- View incident details
- Assign incident
- Update incident status
- Delete incident
- Real-time status updates

Components:
- IncidentList
- IncidentForm
- IncidentDetail
- IncidentFilter
- AssignmentDialog
```

#### TeamCoordination.tsx (400+ lines)
```
Features:
- View on-call schedule
- See current on-call person
- Manage on-call rotations
- Team availability
- Notification settings
- Activity feed

Components:
- OnCallSchedule
- TeamMembers
- AvailabilityView
- NotificationSettings
```

#### Shared Components (300+ lines)
- StatusBadge
- SeverityBadge
- UserAvatar
- DatePicker
- SearchBar
- Pagination

---

## Implementation Order

**Recommended:**
1. Start with IncidentService (foundational)
2. Add IncidentService API routes
3. Test incident creation/listing
4. Add NotificationService
5. Add Team routes
6. Add Slack/Email integration
7. Write tests
8. Build frontend

---

## Dependencies

### External Libraries Needed
```json
{
  "nodemailer": "^6.9.0",
  "axios": "^1.4.0",
  "@slack/webhook": "^6.3.0"
}
```

### Internal Dependencies
- Services depend on database connection
- Routes depend on services
- Frontend depends on API routes
- Tests depend on all of the above

---

## Timeline & Effort

| Component | Lines | Hours | Status |
|-----------|-------|-------|--------|
| Models (done) | 150 | 0.5 | ✅ |
| 6 Services | 1200 | 3-4 | ⏳ |
| 10 API Routes | 800 | 2-3 | ⏳ |
| 50+ Tests | 300 | 2 | ⏳ |
| 2 Frontend Pages | 1000 | 3-4 | ⏳ |
| **TOTAL** | **3450** | **10-14** | ⏳ |

---

## Success Criteria

✅ All 6 services functional  
✅ All 10 API endpoints working  
✅ RBAC protecting sensitive operations  
✅ 50+ tests passing  
✅ 2 professional frontend pages  
✅ Slack/Email integration ready  
✅ No TS errors  
✅ Full documentation  

---

## Next Steps

Ready to build? Choose an approach:

**Option 1: Incremental (Recommended)**
- Build IncidentService + routes (30 min)
- Test and verify
- Build NotificationService + routes (30 min)
- Build frontend (60 min)

**Option 2: Service-First**
- Build all 6 services at once
- Then build routes
- Then build frontend
- Then test

**Option 3: Full Stack**
- Build everything in this session
- Timeline: 3-4 hours

Which approach would you like?
