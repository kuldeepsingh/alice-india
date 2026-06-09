# 📋 Comprehensive Operations & Logging Plan

## Overview
This document outlines **ALL user operations** in the Bot-Trade application, their inputs, outputs, and data transformations. Each operation will have comprehensive logging and debug dumps at every layer.

---

## 1. AUTHENTICATION OPERATIONS

### 1.1 User Registration
**Path:** Frontend → POST /api/v1/auth/register

**Input:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Transformations:**
1. Frontend validation → check password match, email format
2. API receives registration request
3. Database → check if email already exists
4. Database → hash password
5. Database → create user record
6. Response → return user object (without password)

**Output:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "trader",
  "created_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Form submission initiated
- [ ] Frontend: Validation passed/failed
- [ ] API: Request received
- [ ] API: Email existence check
- [ ] Database: User creation query
- [ ] API: Success response
- [ ] Frontend: User redirected to login

---

### 1.2 User Login
**Path:** Frontend → POST /api/v1/auth/login

**Input:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Transformations:**
1. Frontend validation → check email and password provided
2. API receives login request
3. Database → lookup user by email
4. Password hashing → compare with stored hash
5. Token generation → create JWT with user claims
6. Response → return token and user info

**Output:**
```json
{
  "token": "jwt-string",
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "name": "string"
  }
}
```

**Logging Points:**
- [ ] Frontend: Login form submitted
- [ ] Frontend: Validation (email format, password present)
- [ ] API: Login attempt received
- [ ] Database: User lookup by email
- [ ] API: Password verification (success/failure)
- [ ] API: Token generation with claims
- [ ] Frontend: Token stored in localStorage
- [ ] Frontend: Redirected to dashboard

---

### 1.3 Token Refresh
**Path:** Frontend → POST /api/v1/auth/refresh

**Input:**
```json
{
  "token": "expired-jwt-string"
}
```

**Transformations:**
1. API receives refresh request
2. Token validation → check signature (ignore expiry)
3. Extract user claims from token
4. Generate new token with same claims
5. Response → return new token

**Output:**
```json
{
  "token": "new-jwt-string"
}
```

**Logging Points:**
- [ ] Frontend: Token expiry detected
- [ ] API: Refresh request received
- [ ] API: Token signature validation
- [ ] API: New token generated
- [ ] Frontend: Token updated in localStorage

---

### 1.4 User Logout
**Path:** Frontend → POST /api/v1/auth/logout (or client-side)

**Input:**
```json
{
  "userId": "uuid"
}
```

**Transformations:**
1. Frontend: Clear token from localStorage
2. Frontend: Clear user state
3. Optional API: Invalidate refresh token (if using)

**Output:**
```json
{
  "status": "success"
}
```

**Logging Points:**
- [ ] Frontend: Logout button clicked
- [ ] Frontend: Token cleared
- [ ] Frontend: User state cleared
- [ ] Frontend: Redirected to login page

---

## 2. USER MANAGEMENT OPERATIONS

### 2.1 List All Users
**Path:** Frontend → GET /api/v1/users

**Input:**
```json
{
  "filter": "optional-search-term",
  "role": "optional-role-filter"
}
```

**Transformations:**
1. API receives request
2. Check user permissions (admin only)
3. Database → query users with filters
4. Data transformation → format response

**Output:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string",
      "created_at": "iso8601",
      "status": "active|inactive"
    }
  ],
  "total": "number"
}
```

**Logging Points:**
- [ ] Frontend: Users page loaded
- [ ] Frontend: Search/filter applied
- [ ] API: Request received with filters
- [ ] API: Permission check
- [ ] Database: Query execution
- [ ] Frontend: Data rendered in table

---

### 2.2 Change User Role
**Path:** Frontend → PUT /api/v1/team/members/{userId}/role

**Input:**
```json
{
  "role": "admin|trader|analyst|viewer"
}
```

**Transformations:**
1. Frontend: User selects new role from dropdown
2. API receives role change request
3. API: Validate new role is in allowed list
4. Database: Fetch current user data
5. Database: Compare old role vs new role
6. Database: Update user role
7. Response: Return updated user

**Output:**
```json
{
  "id": "uuid",
  "email": "string",
  "role": "trader",
  "updated_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Role dropdown changed
- [ ] Frontend: Confirmation shown
- [ ] API: Role change request received
- [ ] API: Role validation
- [ ] Database: Current role fetched
- [ ] Database: Role updated
- [ ] API: Success response with old→new role
- [ ] Frontend: UI table updated
- [ ] Audit: Who changed what role when

---

### 2.3 Delete User
**Path:** Frontend → DELETE /api/v1/users/{userId}

**Input:**
```json
{
  "userId": "uuid"
}
```

**Transformations:**
1. Frontend: User clicks delete (with confirmation)
2. API receives delete request
3. API: Validate user exists
4. Database: Delete user record (or soft delete)
5. Response: Confirm deletion

**Output:**
```json
{
  "status": "success",
  "message": "User deleted"
}
```

**Logging Points:**
- [ ] Frontend: Delete button clicked
- [ ] Frontend: Confirmation dialog shown
- [ ] API: Delete request received
- [ ] API: User existence check
- [ ] Database: Delete query execution
- [ ] Frontend: User removed from table
- [ ] Audit: Who deleted which user

---

## 3. TRADING OPERATIONS

### 3.1 Create Order
**Path:** Frontend → POST /api/v1/orders

**Input:**
```json
{
  "symbol": "string",
  "quantity": "number",
  "price": "number",
  "type": "buy|sell",
  "order_type": "market|limit",
  "time_in_force": "day|gtc"
}
```

**Transformations:**
1. Frontend: Form validation (all fields required, positive numbers)
2. Frontend: Check user balance sufficient (if available)
3. API receives order creation request
4. API: Validate order parameters
5. API: Check symbol exists in market
6. Database: Check user account balance
7. Database: Calculate order value (quantity × price)
8. Database: Create order record
9. Optional: Submit to trading engine/broker
10. Response: Return order confirmation with ID

**Output:**
```json
{
  "id": "uuid",
  "symbol": "string",
  "quantity": "number",
  "price": "number",
  "total_value": "number",
  "type": "buy|sell",
  "status": "pending|filled|rejected",
  "created_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Order form filled
- [ ] Frontend: Form validation
- [ ] Frontend: Submit button clicked
- [ ] API: Order creation request received
- [ ] API: Parameter validation
- [ ] API: Symbol lookup
- [ ] Database: Balance check
- [ ] Database: Order value calculation
- [ ] Database: Order creation
- [ ] Broker/Engine: Order submission (if applicable)
- [ ] API: Order confirmation response
- [ ] Frontend: Order confirmation shown
- [ ] Audit: Order history entry

---

### 3.2 Cancel Order
**Path:** Frontend → PUT /api/v1/orders/{orderId}/cancel

**Input:**
```json
{
  "orderId": "uuid"
}
```

**Transformations:**
1. Frontend: User clicks cancel on order
2. API receives cancel request
3. API: Validate order exists
4. API: Check order is cancellable (not filled)
5. Database: Update order status to cancelled
6. Optional: Notify broker/engine
7. Response: Return cancelled order

**Output:**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "cancelled_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Cancel button clicked
- [ ] Frontend: Confirmation dialog
- [ ] API: Cancel request received
- [ ] API: Order existence check
- [ ] API: Order status validation
- [ ] Database: Status update
- [ ] Broker/Engine: Cancellation notification
- [ ] Frontend: Order removed from active list

---

### 3.3 View Order History
**Path:** Frontend → GET /api/v1/orders

**Input:**
```json
{
  "filter": "all|active|completed|cancelled",
  "symbol": "optional-symbol-filter",
  "date_from": "optional-iso8601",
  "date_to": "optional-iso8601"
}
```

**Transformations:**
1. Frontend: Page loads / filters applied
2. API receives query with filters
3. Database: Query orders matching filters
4. Data transformation: Format response
5. Calculate statistics (total trades, win/loss)

**Output:**
```json
{
  "data": [
    {
      "id": "uuid",
      "symbol": "string",
      "quantity": "number",
      "price": "number",
      "total_value": "number",
      "type": "buy|sell",
      "status": "string",
      "created_at": "iso8601",
      "filled_at": "optional-iso8601"
    }
  ],
  "total": "number",
  "stats": {
    "total_trades": "number",
    "total_volume": "number",
    "win_count": "number",
    "loss_count": "number"
  }
}
```

**Logging Points:**
- [ ] Frontend: Orders page loaded
- [ ] Frontend: Filters applied
- [ ] API: Query received with filters
- [ ] Database: Query execution
- [ ] Frontend: Orders displayed in table
- [ ] Frontend: Statistics calculated and shown

---

## 4. ACCOUNT OPERATIONS

### 4.1 View Account Details
**Path:** Frontend → GET /api/v1/accounts

**Input:**
```json
{
  "userId": "uuid (optional, from auth token)"
}
```

**Transformations:**
1. Frontend: Account page loaded
2. API receives request
3. Database: Query account for authenticated user
4. Data transformation: Format account details

**Output:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "account_number": "string",
  "balance": "number",
  "available_balance": "number",
  "currency": "USD|EUR|etc",
  "status": "active|suspended",
  "created_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Account page loaded
- [ ] API: Account details request
- [ ] Database: Account query
- [ ] Frontend: Account details displayed

---

### 4.2 Add Funds (Deposit)
**Path:** Frontend → POST /api/v1/accounts/deposits

**Input:**
```json
{
  "amount": "number",
  "payment_method": "credit_card|bank_transfer|etc",
  "reference": "optional-string"
}
```

**Transformations:**
1. Frontend: Deposit form filled with amount
2. Frontend: Validation (amount > 0)
3. API receives deposit request
4. API: Validate amount and payment method
5. Payment processing (stripe/payment gateway)
6. Database: Create deposit record
7. Database: Update account balance
8. Response: Return deposit confirmation

**Output:**
```json
{
  "deposit_id": "uuid",
  "amount": "number",
  "status": "pending|confirmed|failed",
  "transaction_id": "string",
  "created_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Deposit form submitted
- [ ] Frontend: Amount validation
- [ ] API: Deposit request received
- [ ] API: Payment method validation
- [ ] Payment Gateway: Transaction initiation
- [ ] Database: Deposit record creation
- [ ] Database: Balance update calculation
- [ ] API: Confirmation response
- [ ] Frontend: Deposit confirmation shown
- [ ] Audit: Deposit history

---

### 4.3 Withdraw Funds
**Path:** Frontend → POST /api/v1/accounts/withdrawals

**Input:**
```json
{
  "amount": "number",
  "payment_method": "string",
  "account_details": "optional-string"
}
```

**Transformations:**
1. Frontend: Withdrawal form filled
2. Frontend: Validation (amount > 0, amount ≤ available balance)
3. API receives withdrawal request
4. API: Validate amount and balance
5. Database: Create withdrawal record with pending status
6. Payment processing
7. Database: Update account balance
8. Response: Return withdrawal confirmation

**Output:**
```json
{
  "withdrawal_id": "uuid",
  "amount": "number",
  "status": "pending|processing|completed|failed",
  "estimated_arrival": "iso8601",
  "created_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Withdrawal form submitted
- [ ] Frontend: Amount and balance validation
- [ ] API: Withdrawal request received
- [ ] API: Balance verification
- [ ] Database: Withdrawal record creation
- [ ] Payment Processing: Withdrawal initiation
- [ ] Database: Balance reduction
- [ ] Frontend: Withdrawal confirmation shown

---

## 5. DASHBOARD OPERATIONS

### 5.1 Load Dashboard
**Path:** Frontend → GET /api/v1/dashboard (or multiple endpoints)

**Input:**
```json
{
  "timeframe": "1d|1w|1m|3m|1y",
  "refresh": "boolean"
}
```

**Transformations:**
1. Frontend: Dashboard page mounted
2. Frontend: Fetch multiple endpoints in parallel
   - GET /api/v1/accounts → account balance
   - GET /api/v1/orders?filter=active → active orders
   - GET /api/v1/market-data → market overview
   - GET /api/v1/analytics/performance → P&L chart
3. Data aggregation: Combine all responses
4. Calculation: Calculate KPIs (profit%, win rate, etc)
5. Chart rendering: Display charts and metrics

**Output:**
```json
{
  "account": { balance, available },
  "active_orders": [ ... ],
  "market_data": { ... },
  "performance": {
    "profit_loss": "number",
    "profit_loss_pct": "number",
    "win_count": "number",
    "loss_count": "number",
    "win_rate": "number"
  },
  "charts": {
    "portfolio_value": [ { date, value } ],
    "daily_pnl": [ { date, pnl } ]
  }
}
```

**Logging Points:**
- [ ] Frontend: Dashboard page mounted
- [ ] Frontend: Data fetch initiated (multiple endpoints)
- [ ] API: Account endpoint called
- [ ] API: Orders endpoint called
- [ ] API: Market data endpoint called
- [ ] API: Analytics endpoint called
- [ ] Database: Multiple queries executed
- [ ] Frontend: Data aggregation
- [ ] Frontend: KPI calculations
- [ ] Frontend: Charts rendered
- [ ] Frontend: Dashboard fully loaded

---

## 6. SETTINGS & CONFIGURATION

### 6.1 Update User Settings
**Path:** Frontend → PUT /api/v1/users/{userId}/settings

**Input:**
```json
{
  "theme": "light|dark",
  "notifications_enabled": "boolean",
  "daily_summary": "boolean",
  "risk_limit": "number"
}
```

**Transformations:**
1. Frontend: Settings form updated
2. API receives settings update
3. Validation: Check risk_limit is positive
4. Database: Update user settings
5. Response: Return updated settings

**Output:**
```json
{
  "user_id": "uuid",
  "theme": "string",
  "notifications_enabled": "boolean",
  "daily_summary": "boolean",
  "risk_limit": "number",
  "updated_at": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Setting changed (which setting, old value, new value)
- [ ] API: Settings update request
- [ ] API: Validation of new values
- [ ] Database: Update query
- [ ] Frontend: UI reflecting new setting
- [ ] Audit: Settings change history

---

## 7. ANALYTICS & REPORTING

### 7.1 View Performance Analytics
**Path:** Frontend → GET /api/v1/analytics/performance

**Input:**
```json
{
  "timeframe": "1d|1w|1m|3m|1y|all",
  "group_by": "day|week|month"
}
```

**Transformations:**
1. Frontend: Analytics page loaded with timeframe
2. API receives analytics request
3. Database: Query orders within timeframe
4. Calculation: 
   - Total profit/loss
   - Win rate
   - Average win/loss
   - Max profit/loss
   - Sharpe ratio (if applicable)
5. Grouping: Group data by requested period
6. Response: Return calculated metrics

**Output:**
```json
{
  "summary": {
    "total_pnl": "number",
    "pnl_pct": "number",
    "win_rate": "number%",
    "total_trades": "number",
    "winning_trades": "number",
    "losing_trades": "number"
  },
  "by_period": [
    {
      "period": "iso8601",
      "pnl": "number",
      "trades": "number",
      "win_rate": "number%"
    }
  ]
}
```

**Logging Points:**
- [ ] Frontend: Analytics page loaded
- [ ] Frontend: Timeframe selected
- [ ] API: Analytics query received
- [ ] Database: Order queries by timeframe
- [ ] API: Metrics calculated
- [ ] Frontend: Charts rendered with data

---

## 8. ADMIN OPERATIONS

### 8.1 View System Health
**Path:** Frontend → GET /api/v1/admin/health

**Input:**
```json
{}
```

**Transformations:**
1. API checks system components:
   - Database connectivity
   - API responsiveness
   - Cache/Redis status
   - External service status (if any)
2. Response: Return health status

**Output:**
```json
{
  "status": "healthy|warning|critical",
  "components": {
    "database": { status, latency_ms },
    "cache": { status, latency_ms },
    "api": { status, uptime_pct },
    "services": [...]
  },
  "timestamp": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Health page loaded
- [ ] API: Health check initiated
- [ ] API: Component status checks
- [ ] API: Health status response

---

### 8.2 View Audit Logs
**Path:** Frontend → GET /api/v1/admin/audit

**Input:**
```json
{
  "user_id": "optional-uuid",
  "action": "optional-action-filter",
  "date_from": "optional-iso8601",
  "date_to": "optional-iso8601"
}
```

**Transformations:**
1. Frontend: Audit logs page loaded
2. API receives query with filters
3. Database: Query audit logs
4. Response: Return matching audit records

**Output:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "string",
      "resource": "string",
      "details": "object",
      "timestamp": "iso8601",
      "ip_address": "string"
    }
  ],
  "total": "number"
}
```

**Logging Points:**
- [ ] Frontend: Audit logs page loaded
- [ ] Frontend: Filters applied
- [ ] API: Audit query received
- [ ] Database: Audit log query execution
- [ ] Frontend: Audit records displayed

---

## 9. REAL-TIME DATA OPERATIONS

### 9.1 Subscribe to Market Data
**Path:** Frontend → WebSocket or Polling → GET /api/v1/market-data/quotes

**Input:**
```json
{
  "symbols": ["AAPL", "GOOGL", ...],
  "refresh_interval": "milliseconds"
}
```

**Transformations:**
1. Frontend: User selects symbols to watch
2. Frontend: Establish WebSocket/polling connection
3. API/Server: Receive subscription
4. Data feed: Fetch current market data
5. Stream: Send updates to client
6. Frontend: Update price displays in real-time

**Output:**
```json
{
  "symbol": "string",
  "price": "number",
  "change": "number",
  "change_pct": "number",
  "volume": "number",
  "timestamp": "iso8601"
}
```

**Logging Points:**
- [ ] Frontend: Market data page loaded
- [ ] Frontend: Symbols selected
- [ ] Frontend: WebSocket/polling connection established
- [ ] API: Subscription received
- [ ] API: Data streaming started
- [ ] Frontend: Price updates received and displayed

---

## 10. SEARCH & FILTERING

### 10.1 Search Users
**Path:** Frontend → GET /api/v1/users?search=term

**Input:**
```json
{
  "search": "string",
  "role": "optional-role",
  "status": "optional-status"
}
```

**Transformations:**
1. Frontend: User types in search box
2. API receives search query
3. Database: LIKE query on name/email
4. Filtering: Apply role and status filters
5. Response: Return matching users

**Output:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  ],
  "total": "number"
}
```

**Logging Points:**
- [ ] Frontend: Search term entered
- [ ] API: Search request received
- [ ] Database: Search query execution
- [ ] Frontend: Results displayed

---

## Summary Table

| Feature Area | Operation Count | Primary Input | Primary Output | Critical Logs |
|---|---|---|---|---|
| Authentication | 4 | Credentials | Token/User | Login attempts, failures |
| User Management | 3 | User data | User record | Role changes, deletions |
| Trading | 3 | Order data | Order confirmation | All trade details |
| Accounts | 3 | Amount/Method | Balance | Deposits, withdrawals |
| Dashboard | 1 | Timeframe | Multiple metrics | Data fetch timing |
| Settings | 1 | Setting data | Confirmation | Setting changes |
| Analytics | 1 | Timeframe | Performance metrics | Calculation details |
| Admin | 2 | Filter data | Status/Logs | System health |
| Real-time | 1 | Symbols | Price data | Data streaming |
| Search | 1 | Search term | Results | Query execution |
| **TOTAL** | **20** | - | - | - |

---

## Logging Implementation Strategy

### For Each Operation:
1. **Frontend Entry Point**
   - User action (click, form submit, navigation)
   - Input parameters and values
   - Validation results

2. **API Request**
   - Request received with parameters
   - Authorization check
   - Input validation
   - Parameter transformation

3. **Database Operations**
   - Query type and parameters
   - Execution time
   - Row count (selected, affected, inserted)
   - Query result preview

4. **Data Processing**
   - Transformations applied
   - Calculations performed
   - Aggregations done

5. **API Response**
   - Success/failure status
   - Response structure
   - Total operation time

6. **Frontend Display**
   - Data received and parsed
   - UI updated
   - User feedback (success/error message)

---

## Next Steps

1. **Review this plan** - Confirm all operations are documented
2. **Identify priorities** - Which operations are most critical?
3. **Define logging structure** - Exact JSON format for dumps
4. **Create templates** - Reusable logging code for each operation type
5. **Implement** - Add logging to each operation
6. **Test** - Verify all logs are captured correctly
7. **Monitor** - Use logs to debug issues

---

## Questions for Review

- [ ] Are there any operations missing?
- [ ] Are the inputs/outputs correctly identified?
- [ ] Should we add more detail to any operation?
- [ ] Are there operations that should NOT be logged?
- [ ] What level of detail is too much vs too little?
- [ ] Should we add response time SLAs?
- [ ] Should we add error rate expectations?

**Please review and provide feedback before we implement!**
