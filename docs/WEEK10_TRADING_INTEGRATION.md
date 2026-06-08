# 🚀 Week 10: Zerodha Trading Integration

## Overview

Integrate Zerodha (largest Indian trading platform) with the OpenAlice system for live trading, market data streaming, order execution, and portfolio management.

**Timeline:** 5-6 hours  
**Target Code:** 1200+ lines  
**Status:** In Progress

---

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (React)                   │
│  ✓ Trading Dashboard                │
│  ✓ Order Placement UI               │
│  ✓ Portfolio View                   │
│  ✓ Market Watch                     │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  API Gateway (Express)              │
│  ✓ /api/v1/trading/...              │
│  ✓ Authentication                   │
│  ✓ Request validation               │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Trading Services                   │
│  ✓ ZerodhaService                   │
│  ✓ OrderService                     │
│  ✓ PortfolioService                 │
│  ✓ MarketDataService                │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Zerodha API                        │
│  ✓ Authentication (OAuth)           │
│  ✓ WebSocket (market data)          │
│  ✓ REST (orders, portfolio)         │
└─────────────────────────────────────┘
```

---

## Phase Breakdown

### Phase 1: Zerodha API Client (1-2 hours)
- [ ] ZerodhaService implementation
- [ ] Authentication & token management
- [ ] API request wrapper
- [ ] Error handling

### Phase 2: Order Management (1.5-2 hours)
- [ ] OrderService implementation
- [ ] Order validation
- [ ] Risk management rules
- [ ] Trade notifications

### Phase 3: Portfolio & Market Data (1-1.5 hours)
- [ ] PortfolioService implementation
- [ ] Real-time position tracking
- [ ] Account balance management
- [ ] Trade history

### Phase 4: Frontend Trading UI (1-1.5 hours)
- [ ] Trading dashboard page
- [ ] Order placement form
- [ ] Portfolio view
- [ ] Market watch component

---

## Implementation Details

### 1. Models & Types

```typescript
// Trading-specific models
interface ZerodhaAuth {
  apiKey: string
  apiSecret: string
  requestToken?: string
  accessToken?: string
  refreshToken?: string
}

interface Order {
  id: string
  instrumentToken: string
  symbol: string
  quantity: number
  price: number
  orderType: 'REGULAR' | 'BRACKET' | 'COVER'
  transactionType: 'BUY' | 'SELL'
  validity: 'DAY' | 'IOC'
  status: 'PENDING' | 'OPEN' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
  createdAt: Date
  updatedAt: Date
}

interface Position {
  symbol: string
  instrumentToken: string
  quantity: number
  buyQuantity: number
  sellQuantity: number
  avgPrice: number
  lastPrice: number
  buyValue: number
  sellValue: number
  unrealizedProfit: number
  unrealizedProfitPercent: number
  realizedProfit: number
}

interface Holdings {
  symbol: string
  quantity: number
  collateralQuantity: number
  collateralValue: number
  price: number
  lastPrice: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
}

interface MarketQuote {
  instrumentToken: string
  symbol: string
  lastPrice: number
  bidPrice: number
  askPrice: number
  bidQuantity: number
  askQuantity: number
  dayHigh: number
  dayLow: number
  dayClose: number
  volume: number
  timestamp: Date
}

interface Portfolio {
  totalEquity: number
  totalMarginUsed: number
  totalMarginAvailable: number
  marginUtilization: number
  positions: Position[]
  holdings: Holdings[]
  dayChanges: number
  dayChangesPercent: number
}
```

### 2. Services to Build

#### ZerodhaService
```typescript
class ZerodhaService {
  // Authentication
  getLoginUrl(): string
  authorizeWithCode(code: string): Promise<ZerodhaAuth>
  refreshAccessToken(): Promise<ZerodhaAuth>
  
  // Instruments
  getInstruments(): Promise<Instrument[]>
  searchInstrument(query: string): Promise<Instrument[]>
  
  // Market Data
  getQuote(symbols: string[]): Promise<MarketQuote[]>
  getQuotes(instrumentTokens: string[]): Promise<MarketQuote[]>
  
  // Account & Portfolio
  getProfile(): Promise<any>
  getPortfolio(): Promise<Portfolio>
  getPositions(): Promise<Position[]>
  getHoldings(): Promise<Holdings[]>
  getOrders(): Promise<Order[]>
  getTrades(): Promise<any[]>
  
  // Orders
  placeOrder(orderData: OrderRequest): Promise<Order>
  modifyOrder(orderId: string, modifications: any): Promise<Order>
  cancelOrder(orderId: string): Promise<any>
  
  // WebSocket for live data
  connectWebSocket(tokens: string[]): Promise<void>
  disconnectWebSocket(): Promise<void>
  subscribeToData(tokens: string[]): void
  unsubscribeFromData(tokens: string[]): void
}
```

#### OrderService
```typescript
class OrderService {
  // Order Management
  createOrder(userId: string, orderRequest: OrderRequest): Promise<Order>
  getOrders(userId: string, filters?: any): Promise<Order[]>
  getOrderById(orderId: string): Promise<Order>
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
  cancelOrder(orderId: string): Promise<Order>
  
  // Validation
  validateOrder(order: OrderRequest): Promise<ValidationResult>
  checkRiskLimits(userId: string, order: OrderRequest): Promise<boolean>
  
  // Notifications
  notifyOrderPlaced(order: Order): Promise<void>
  notifyOrderFilled(order: Order): Promise<void>
  notifyOrderCancelled(order: Order): Promise<void>
  notifyOrderRejected(order: Order): Promise<void>
}
```

#### PortfolioService
```typescript
class PortfolioService {
  // Portfolio Management
  getPortfolio(userId: string): Promise<Portfolio>
  updatePortfolio(userId: string): Promise<Portfolio>
  getPositions(userId: string): Promise<Position[]>
  getHoldings(userId: string): Promise<Holdings[]>
  
  // P&L Tracking
  getDayPnL(userId: string): Promise<DayPnL>
  getNetPnL(userId: string): Promise<NetPnL>
  getPnLBySymbol(userId: string, symbol: string): Promise<SymbolPnL>
  
  // Calculations
  calculateMarginUsed(userId: string): Promise<number>
  calculateMarginAvailable(userId: string): Promise<number>
  calculatePortfolioValue(userId: string): Promise<number>
}
```

### 3. API Endpoints

```typescript
// Trading Routes
POST   /api/v1/trading/auth/login
GET    /api/v1/trading/auth/callback
POST   /api/v1/trading/auth/refresh

GET    /api/v1/trading/orders
POST   /api/v1/trading/orders
GET    /api/v1/trading/orders/:id
PUT    /api/v1/trading/orders/:id
DELETE /api/v1/trading/orders/:id

GET    /api/v1/trading/portfolio
GET    /api/v1/trading/positions
GET    /api/v1/trading/holdings
GET    /api/v1/trading/profile

GET    /api/v1/trading/quotes?symbols=SBIN,INFY,RELIANCE
GET    /api/v1/trading/search?query=SBI
GET    /api/v1/trading/instruments

GET    /api/v1/trading/pnl/day
GET    /api/v1/trading/pnl/net
GET    /api/v1/trading/pnl/:symbol
```

### 4. Database Tables

```sql
-- Trading accounts
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  zerodha_user_id VARCHAR UNIQUE,
  api_key VARCHAR,
  api_secret VARCHAR ENCRYPTED,
  access_token VARCHAR ENCRYPTED,
  refresh_token VARCHAR ENCRYPTED,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE trading_orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  zerodha_order_id VARCHAR,
  symbol VARCHAR,
  quantity INTEGER,
  price DECIMAL,
  order_type VARCHAR,
  transaction_type VARCHAR,
  status VARCHAR,
  filled_quantity INTEGER,
  average_price DECIMAL,
  pnl DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  filled_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Positions
CREATE TABLE trading_positions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  symbol VARCHAR,
  quantity INTEGER,
  buy_quantity INTEGER,
  sell_quantity INTEGER,
  avg_price DECIMAL,
  last_price DECIMAL,
  unrealized_pnl DECIMAL,
  realized_pnl DECIMAL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Market quotes (real-time cache)
CREATE TABLE market_quotes (
  id UUID PRIMARY KEY,
  instrument_token VARCHAR UNIQUE,
  symbol VARCHAR,
  last_price DECIMAL,
  bid_price DECIMAL,
  ask_price DECIMAL,
  volume BIGINT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 5. Frontend Pages

#### Trading Dashboard
- Portfolio overview
- Current positions
- Day P&L statistics
- Recent orders
- Market watch

#### Order Placement
- Symbol search
- Quantity & price input
- Order type selection
- Risk validation
- Confirmation dialog

#### Portfolio View
- Holdings breakdown
- Positions with P&L
- Historical trades
- Account margins

#### Market Watch
- Watchlist management
- Real-time quotes
- Technical analysis charts
- Symbol search

---

## Security Considerations

### API Keys & Tokens
- [ ] Encrypt API keys in database
- [ ] Use environment variables
- [ ] Implement token refresh mechanism
- [ ] Rotate tokens regularly

### Risk Management
- [ ] Daily loss limits
- [ ] Position size limits
- [ ] Margin utilization checks
- [ ] Order validation
- [ ] Rate limiting

### Audit & Compliance
- [ ] Log all trades
- [ ] Track order history
- [ ] Audit trail for compliance
- [ ] P&L reporting

---

## Testing Strategy

### Unit Tests
- Order validation
- P&L calculations
- Margin calculations
- Risk checks

### Integration Tests
- Zerodha API integration
- Order placement flow
- Portfolio updates
- Real-time data sync

### Manual Testing
- Live paper trading
- Small real orders
- Margin management
- Error scenarios

---

## Performance Optimizations

- [ ] Cache instrument list (30 min TTL)
- [ ] Cache quotes (5 sec TTL)
- [ ] Batch API requests
- [ ] WebSocket for real-time data
- [ ] Database query optimization
- [ ] Connection pooling

---

## Error Handling

```typescript
// Trading-specific errors
class InsufficientMarginError extends Error {}
class OrderValidationError extends Error {}
class OrderRejectionError extends Error {}
class SymbolNotFoundError extends Error {}
class ZerodhaAPIError extends Error {}
```

---

## Monitoring & Alerts

- [ ] Order execution monitoring
- [ ] Failed order alerts
- [ ] Margin utilization alerts
- [ ] Daily loss alerts
- [ ] API availability monitoring
- [ ] WebSocket connection monitoring

---

## Phase Milestones

**Phase 1 Complete:** ZerodhaService functional, API client ready  
**Phase 2 Complete:** Orders working, notifications set up  
**Phase 3 Complete:** Portfolio tracking live, real-time data  
**Phase 4 Complete:** UI polished, ready for testing  

---

## Success Criteria

✅ Can authenticate with Zerodha  
✅ Can place and cancel orders  
✅ Portfolio updates in real-time  
✅ P&L calculations accurate  
✅ Risk management working  
✅ Notifications for order events  
✅ Professional UI/UX  
✅ Error handling comprehensive  

---

## Next Steps After Week 10

- Week 11: API Client Library
- Week 12: Advanced Trading Features (algo orders, basket orders)
- Week 13: Mobile trading app
- Week 14: Advanced analytics & reporting
