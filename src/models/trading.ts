/**
 * Trading Models & Types
 * Zerodha API integration and trading data structures
 */

// Authentication
export interface ZerodhaAuth {
  apiKey: string
  apiSecret: string
  requestToken?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
}

export interface AuthResponse {
  status: 'success' | 'error'
  data?: {
    user_id: string
    user_name: string
    user_shortname: string
    avatar_url: string
    broker: string
    email: string
    phone: string
    order_type?: string
    products?: string[]
    order_info?: any
  }
  error?: string
}

// Instruments
export interface Instrument {
  instrumentToken: string
  exchangeToken: string
  tradingSymbol: string
  name: string
  lastPrice: number
  expiry: string
  strikePrice: number
  tickSize: number
  lotSize: number
  instrumentType: string
  segment: string
  exchange: string
}

// Market Data
export interface MarketQuote {
  instrumentToken: string
  tradingSymbol: string
  lastPrice: number
  bidPrice: number
  askPrice: number
  bidQuantity: number
  askQuantity: number
  dailyHigh: number
  dailyLow: number
  dailyClose: number
  openPrice: number
  volume: number
  volumeTraded: number
  change: number
  changePercent: number
  timestamp: Date
}

// Orders
export type OrderType = 'REGULAR' | 'BRACKET' | 'COVER' | 'BO'
export type TransactionType = 'BUY' | 'SELL'
export type OrderValidity = 'DAY' | 'IOC' | 'TTL'
export type OrderStatus = 'PENDING' | 'OPEN' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED'
export type OrderProduct = 'MIS' | 'CNC' | 'NRML'

export interface Order {
  id?: string
  orderId?: string
  instrumentToken: string
  tradingSymbol: string
  quantity: number
  price: number
  orderType: OrderType
  transactionType: TransactionType
  validity: OrderValidity
  product: OrderProduct
  status: OrderStatus
  filledQuantity?: number
  pendingQuantity?: number
  averagePrice?: number
  parentOrderId?: string
  childOrderIds?: string[]
  exchangeOrderId?: string
  exchangeTimestamp?: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderRequest {
  tradingSymbol: string
  instrumentToken: string
  quantity: number
  price: number
  orderType: OrderType
  transactionType: TransactionType
  validity: OrderValidity
  product: OrderProduct
  triggerPrice?: number
  parentOrderId?: string
  squareOff?: number
  stoploss?: number
  trailingStoploss?: number
  disclosedQuantity?: number
  iceberg?: boolean
}

// Positions & Holdings
export interface Position {
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
  netValue: number
  exchange: string
  product: OrderProduct
  multiplier: number
  pnl: number
  pnlPercent: number
  m2m: number
  m2mPercent: number
  netValue2: number
  timestamp: Date
}

export interface Holding {
  symbol: string
  instrumentToken: string
  quantity: number
  collateralQuantity: number
  collateralValue: number
  price: number
  lastPrice: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
  exchange: string
  t1Quantity: number
  realisedQuantity: number
  authorisedQuantity: number
  openQuantity: number
  product: string
}

// Portfolio & Account
export interface Portfolio {
  profile: ProfileInfo
  equity: {
    used: number
    available: number
    payin: number
  }
  commodity: {
    used: number
    available: number
    payin: number
  }
  margin: {
    used: number
    available: number
    total: number
    utilization: number
  }
  positions: Position[]
  holdings: Holding[]
  dayChange: number
  dayChangePercent: number
  netChange: number
  netChangePercent: number
  totalEquity: number
  timestamp: Date
}

export interface ProfileInfo {
  userId: string
  userName: string
  userShortname: string
  email: string
  phone: string
  brokerName: string
  brokerCode: string
  avatarUrl: string
  products: string[]
  orderType: string[]
}

// P&L Information
export interface DayPnL {
  symbol: string
  dayChange: number
  dayChangePercent: number
  realizedProfit: number
  unrealizedProfit: number
  totalProfit: number
  quantity: number
}

export interface NetPnL {
  totalRealizedProfit: number
  totalUnrealizedProfit: number
  totalProfit: number
  positions: Position[]
  holdings: Holding[]
  dayChange: number
  dayChangePercent: number
}

// Trades
export interface Trade {
  tradeId: string
  orderId: string
  instrumentToken: string
  tradingSymbol: string
  transactionType: TransactionType
  quantity: number
  price: number
  value: number
  commissionValue: number
  tax: number
  timestamp: Date
}

// Risk Management
export interface RiskLimits {
  dailyLossLimit: number
  positionSizeLimit: number
  maxQuantityPerOrder: number
  maxMarginUtilization: number
  stopLossPercent: number
}

export interface RiskCheck {
  isValid: boolean
  reason?: string
  currentMargin?: number
  requiredMargin?: number
  availableMargin?: number
}

// WebSocket Data
export interface WebSocketQuote {
  instrumentToken: string
  mode: 'quote' | 'ltpc' | 'ohlc'
  lastPrice?: number
  lastQuantity?: number
  lastTradedTime?: number
  avgPrice?: number
  volumeTraded?: number
  totalBought?: number
  totalSold?: number
  ohlc?: {
    open: number
    high: number
    low: number
    close: number
  }
  depth?: {
    buy: Array<{ price: number; quantity: number; orders: number }>
    sell: Array<{ price: number; quantity: number; orders: number }>
  }
  oi?: number
  timestamp: Date
}

// API Response Wrappers
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error'
  data?: T[]
  meta?: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  error?: string
}
