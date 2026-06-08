# 🤖 Automated Trading Implementation Guide

## Overview

This guide explains how to integrate **real broker APIs** and implement **automated trading strategies** in your Bot-Trade application.

Current Status:
- ✅ Frontend: Full trading UI (place orders, view history)
- ✅ Backend: Order management structure
- ❌ Real Trading: Currently using mock data
- ❌ Strategies: Not yet implemented
- ❌ Backtesting: Not yet implemented

---

## 🎯 Quick Start: Three Paths to Automated Trading

### **Path 1: Zerodha Integration (Most Popular in India)**
Best for: Indian traders, best tools, large community
- Integrate with Zerodha Kite API
- Real order execution
- Live market data
- Account access

### **Path 2: Alice Algorithmic Trading Framework**
Best for: Advanced strategies, backtesting, optimization
- Build trading strategies
- Backtest on historical data
- Run strategies live
- Track performance

### **Path 3: Multi-Broker Support**
Best for: Flexibility, choice
- Support multiple brokers
- Unified interface
- User-selected broker
- Fallback brokers

---

## 📊 Architecture for Automated Trading

```
┌─────────────────────────────────────────────────────────────────┐
│                    Bot-Trade App (Frontend)                      │
│  • Strategy Management                                            │
│  • Live Trading Dashboard                                         │
│  • Performance Analytics                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ REST API ↓
┌─────────────────────────────────────────────────────────────────┐
│               Backend Trading Engine (Express.js)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Strategy Manager                                          │   │
│  │ • Load strategies                                         │   │
│  │ • Run backtests                                           │   │
│  │ • Execute trades                                          │   │
│  │ • Track performance                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Broker Adapter                                            │   │
│  │ • Zerodha Kite API                                        │   │
│  │ • Shoonya API                                             │   │
│  │ • Alice Framework                                         │   │
│  │ • Unified interface                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Risk Management                                           │   │
│  │ • Position size calculator                                │   │
│  │ • Stop-loss enforcement                                   │   │
│  │ • Portfolio limits                                        │   │
│  │ • Drawdown monitoring                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Data Pipeline                                             │   │
│  │ • Real-time market data                                   │   │
│  │ • WebSocket updates                                       │   │
│  │ • Technical indicators                                    │   │
│  │ • Historical candles                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Execution Engine                                          │   │
│  │ • Order placement                                         │   │
│  │ • Position tracking                                       │   │
│  │ • Exit logic                                              │   │
│  │ • Error handling                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ API ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Broker Integration                              │
│  • Zerodha Kite (WebSocket)                                       │
│  • Alice Framework (REST)                                         │
│  • Shoonya/xTS (WebSocket)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Path: Zerodha Kite API

### **Step 1: Set Up Zerodha Kite API**

```bash
# Install Zerodha Kite client
npm install kiteconnect

# Install technical analysis library
npm install tulind  # or ta-lib or others

# Install backtesting library
npm install backtesting  # or backtrader
```

### **Step 2: Create Broker Adapter**

```typescript
/**
 * /src/services/brokers/zerodha-adapter.ts
 * 
 * Handles all communication with Zerodha Kite API
 */

import KiteConnect from 'kiteconnect'
import { loggingService } from '../logging-service'

class ZerodhaBrokerAdapter {
  private kite: KiteConnect
  private userId: string
  private apiKey: string

  /**
   * Initialize Zerodha connection
   * @param apiKey - API key from Zerodha
   * @param userId - User ID
   * @param accessToken - Access token from login
   */
  async initialize(apiKey: string, userId: string, accessToken: string) {
    try {
      this.apiKey = apiKey
      this.userId = userId

      this.kite = new KiteConnect({
        api_key: apiKey,
        access_token: accessToken,
      })

      loggingService.info('Zerodha', 'Connected to Zerodha Kite API', {
        userId,
        apiKey: apiKey.substring(0, 5) + '***',
      })

      return true
    } catch (error) {
      loggingService.error('Zerodha', 'Failed to connect', error as Error, {
        userId,
      })
      return false
    }
  }

  /**
   * Place an order on Zerodha
   */
  async placeOrder(order: {
    symbol: string          // e.g., "NSE:INFY"
    quantity: number
    price: number
    orderType: 'BUY' | 'SELL'
    productType: 'MIS' | 'CNC'  // Intraday or Delivery
  }) {
    try {
      loggingService.debug('Zerodha', 'Placing order', order)

      const response = await this.kite.placeOrder({
        exchange: 'NSE',
        tradingsymbol: order.symbol,
        transaction_type: order.orderType,
        quantity: order.quantity,
        price: order.price,
        order_type: 'LIMIT',
        product: order.productType,
      })

      loggingService.info('Zerodha', 'Order placed successfully', {
        orderId: response.order_id,
        symbol: order.symbol,
        quantity: order.quantity,
        price: order.price,
      })

      return response
    } catch (error) {
      loggingService.error('Zerodha', 'Order placement failed', error as Error, {
        symbol: order.symbol,
        quantity: order.quantity,
      })
      throw error
    }
  }

  /**
   * Get live market data
   */
  async getLiveData(symbols: string[]) {
    try {
      const data = await this.kite.getLTP(symbols)
      return data
    } catch (error) {
      loggingService.error('Zerodha', 'Failed to fetch live data', error as Error)
      throw error
    }
  }

  /**
   * Get historical candles for backtesting
   */
  async getHistoricalData(symbol: string, interval: string, fromDate: Date, toDate: Date) {
    try {
      const candles = await this.kite.getHistoricalData(
        symbol,
        interval,  // "5minute", "60minute", "day"
        fromDate,
        toDate
      )
      return candles
    } catch (error) {
      loggingService.error('Zerodha', 'Failed to fetch candles', error as Error)
      throw error
    }
  }

  /**
   * Get current positions
   */
  async getPositions() {
    try {
      const positions = await this.kite.getPositions()
      return positions
    } catch (error) {
      loggingService.error('Zerodha', 'Failed to fetch positions', error as Error)
      throw error
    }
  }
}

export const zerodhaAdapter = new ZerodhaBrokerAdapter()
```

### **Step 3: Create Strategy Framework**

```typescript
/**
 * /src/services/strategies/strategy-base.ts
 * 
 * Base class for all trading strategies
 */

interface Signal {
  action: 'BUY' | 'SELL' | 'HOLD'
  symbol: string
  price: number
  confidence: number  // 0-1
  reason: string
}

abstract class TradingStrategy {
  protected name: string
  protected symbols: string[]

  /**
   * Analyze market data and generate trading signal
   */
  abstract analyze(marketData: any): Signal[]

  /**
   * Calculate position size based on risk
   */
  calculatePositionSize(accountBalance: number, riskPercent: number, entryPrice: number, stopLoss: number): number {
    const riskAmount = accountBalance * (riskPercent / 100)
    const priceRisk = Math.abs(entryPrice - stopLoss)
    const quantity = Math.floor(riskAmount / priceRisk)
    return quantity
  }

  /**
   * Backtest strategy on historical data
   */
  async backtest(historicalData: any[]): Promise<any> {
    let balance = 100000  // Starting capital
    let trades = []
    let positions = []

    for (const candle of historicalData) {
      const signals = this.analyze([candle])

      for (const signal of signals) {
        if (signal.action === 'BUY') {
          const position = {
            entryPrice: candle.close,
            quantity: this.calculatePositionSize(balance, 2, candle.close, candle.close * 0.98),
            timestamp: candle.timestamp,
          }
          positions.push(position)
        } else if (signal.action === 'SELL' && positions.length > 0) {
          const position = positions.pop()!
          const profit = (candle.close - position.entryPrice) * position.quantity
          balance += profit
          trades.push({
            entry: position.entryPrice,
            exit: candle.close,
            profit,
            quantity: position.quantity,
          })
        }
      }
    }

    return {
      totalTrades: trades.length,
      winRate: trades.filter(t => t.profit > 0).length / trades.length,
      totalProfit: trades.reduce((sum, t) => sum + t.profit, 0),
      finalBalance: balance,
      trades,
    }
  }
}
```

### **Step 4: Create Specific Strategies**

```typescript
/**
 * /src/services/strategies/moving-average-strategy.ts
 * 
 * Simple Moving Average Crossover Strategy
 * Buy when fast MA crosses above slow MA
 * Sell when fast MA crosses below slow MA
 */

class MovingAverageStrategy extends TradingStrategy {
  private fastPeriod = 20  // 20-candle MA
  private slowPeriod = 50  // 50-candle MA

  analyze(marketData: any[]): Signal[] {
    if (marketData.length < this.slowPeriod) {
      return []  // Not enough data
    }

    const closes = marketData.map(candle => candle.close)
    const fastMA = this.calculateMA(closes, this.fastPeriod)
    const slowMA = this.calculateMA(closes, this.slowPeriod)

    const signals: Signal[] = []
    const lastCandle = marketData[marketData.length - 1]

    // Check for crossover
    if (fastMA > slowMA && marketData[marketData.length - 2]) {
      const prevFastMA = this.calculateMA(closes.slice(0, -1), this.fastPeriod)
      const prevSlowMA = this.calculateMA(closes.slice(0, -1), this.slowPeriod)

      // Golden cross: fast MA crosses above slow MA
      if (prevFastMA <= prevSlowMA) {
        signals.push({
          action: 'BUY',
          symbol: 'NSE:INFY',
          price: lastCandle.close,
          confidence: 0.7,
          reason: `Golden cross: MA${this.fastPeriod} crossed above MA${this.slowPeriod}`,
        })
      }
    }

    // Death cross: fast MA crosses below slow MA
    if (fastMA < slowMA && marketData[marketData.length - 2]) {
      const prevFastMA = this.calculateMA(closes.slice(0, -1), this.fastPeriod)
      const prevSlowMA = this.calculateMA(closes.slice(0, -1), this.slowPeriod)

      if (prevFastMA >= prevSlowMA) {
        signals.push({
          action: 'SELL',
          symbol: 'NSE:INFY',
          price: lastCandle.close,
          confidence: 0.7,
          reason: `Death cross: MA${this.fastPeriod} crossed below MA${this.slowPeriod}`,
        })
      }
    }

    return signals
  }

  private calculateMA(prices: number[], period: number): number {
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }
}

export const maStrategy = new MovingAverageStrategy()
```

### **Step 5: Create Trading Engine**

```typescript
/**
 * /src/services/trading-engine.ts
 * 
 * Main trading engine that orchestrates everything
 */

class TradingEngine {
  private broker: ZerodhaBrokerAdapter
  private strategy: TradingStrategy
  private isRunning = false

  async startAutomatedTrading() {
    this.isRunning = true
    loggingService.info('TradingEngine', 'Starting automated trading')

    while (this.isRunning) {
      try {
        // 1. Get live market data
        const liveData = await this.broker.getLiveData(['NSE:INFY', 'NSE:TCS'])
        loggingService.debug('TradingEngine', 'Got live data', { symbols: ['INFY', 'TCS'] })

        // 2. Analyze with strategy
        const signals = this.strategy.analyze([liveData])
        loggingService.debug('TradingEngine', 'Strategy analyzed', { signals })

        // 3. Execute trades
        for (const signal of signals) {
          if (signal.action === 'BUY') {
            await this.broker.placeOrder({
              symbol: signal.symbol,
              quantity: 1,
              price: signal.price,
              orderType: 'BUY',
              productType: 'MIS',
            })
            loggingService.info('TradingEngine', 'BUY order placed', signal)
          }
        }

        // 4. Check positions for exit
        const positions = await this.broker.getPositions()
        loggingService.debug('TradingEngine', 'Checked positions', { count: positions.length })

        // 5. Wait before next iteration (e.g., 5 minutes)
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000))

      } catch (error) {
        loggingService.error('TradingEngine', 'Error in trading loop', error as Error)
      }
    }
  }

  stopAutomatedTrading() {
    this.isRunning = false
    loggingService.info('TradingEngine', 'Stopped automated trading')
  }
}

export const tradingEngine = new TradingEngine()
```

---

## 🧪 Backtesting Example

```typescript
/**
 * Backtest Moving Average Strategy on historical data
 */

async function backtest() {
  // 1. Get historical data
  const historicalData = await zerodhaAdapter.getHistoricalData(
    'NSE:INFY',
    '60minute',  // Hourly candles
    new Date('2024-01-01'),
    new Date('2024-06-01')
  )

  // 2. Run backtest
  const results = await maStrategy.backtest(historicalData)

  // 3. Log results
  console.log(`
    Backtest Results:
    Total Trades: ${results.totalTrades}
    Win Rate: ${(results.winRate * 100).toFixed(2)}%
    Total Profit: ${results.totalProfit.toFixed(2)}
    Final Balance: ${results.finalBalance.toFixed(2)}
  `)

  // 4. Log to backend
  loggingService.info('Backtesting', 'Backtest completed', results)
}
```

---

## 🛡️ Risk Management

```typescript
/**
 * Risk management rules
 */

class RiskManager {
  /**
   * Maximum position size (% of portfolio)
   */
  maxPositionSize = 2  // 2% per position

  /**
   * Maximum daily loss (% of portfolio)
   */
  maxDailyLoss = 5  // 5% stop loss

  /**
   * Maximum open positions
   */
  maxOpenPositions = 5

  /**
   * Validate trade before execution
   */
  validateTrade(trade: any, currentPositions: any[], accountBalance: number): boolean {
    // Check max positions
    if (currentPositions.length >= this.maxOpenPositions) {
      loggingService.warn('RiskManager', 'Max open positions reached')
      return false
    }

    // Check position size
    const positionSize = (trade.quantity * trade.price) / accountBalance
    if (positionSize > this.maxPositionSize / 100) {
      loggingService.warn('RiskManager', 'Position size exceeds limit')
      return false
    }

    // Check daily loss
    const dailyLoss = currentPositions.reduce((sum, pos) => {
      return sum + pos.unrealizedLoss
    }, 0)

    if (dailyLoss > (this.maxDailyLoss / 100) * accountBalance) {
      loggingService.error('RiskManager', 'Daily loss limit reached')
      return false
    }

    return true
  }
}
```

---

## 📊 Frontend Integration

### **Strategy Management Page**

```typescript
/**
 * admin-dashboard/src/pages/StrategiesPage.tsx
 * 
 * Manage and monitor trading strategies
 */

export function StrategiesPage() {
  const [strategies, setStrategies] = useState([])
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  const startStrategy = async () => {
    try {
      const response = await fetch('/api/v1/trading/start', {
        method: 'POST',
        body: JSON.stringify({ strategyId: selectedStrategy.id }),
      })
      setIsRunning(true)
      frontendLogger.info('Strategies', 'Strategy started', { strategyId: selectedStrategy.id })
    } catch (error) {
      frontendLogger.error('Strategies', 'Failed to start strategy', error as Error)
    }
  }

  const stopStrategy = async () => {
    try {
      const response = await fetch('/api/v1/trading/stop', { method: 'POST' })
      setIsRunning(false)
      frontendLogger.info('Strategies', 'Strategy stopped')
    } catch (error) {
      frontendLogger.error('Strategies', 'Failed to stop strategy', error as Error)
    }
  }

  return (
    <LayoutPro>
      <Box sx={{ p: SPACING_PRO.xxxl }}>
        <Typography variant="h4">📈 Trading Strategies</Typography>

        {/* Strategy list */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, my: SPACING_PRO.lg }}>
          {strategies.map((strategy) => (
            <Card key={strategy.id} sx={{ p: SPACING_PRO.lg }}>
              <Typography sx={{ fontWeight: 700, mb: SPACING_PRO.sm }}>
                {strategy.name}
              </Typography>
              <Typography sx={{ color: THEME_PRO.textSecondary, mb: SPACING_PRO.md }}>
                {strategy.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: SPACING_PRO.sm }}>
                <Button
                  variant={isRunning ? 'outlined' : 'contained'}
                  onClick={startStrategy}
                  disabled={isRunning}
                  sx={{ flex: 1 }}
                >
                  Start
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={stopStrategy}
                  disabled={!isRunning}
                  sx={{ flex: 1 }}
                >
                  Stop
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Performance stats */}
        <Card sx={{ p: SPACING_PRO.lg, mt: SPACING_PRO.lg }}>
          <Typography sx={{ fontWeight: 700, mb: SPACING_PRO.lg }}>
            Strategy Performance
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Total Trades</Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700 }}>125</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Win Rate</Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: THEME_PRO.success }}>
                68.4%
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Total Profit</Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: THEME_PRO.success }}>
                ₹45,230
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>Drawdown</Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: THEME_PRO.warning }}>
                -8.2%
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>
    </LayoutPro>
  )
}
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Broker Integration (Week 1-2)**
- [ ] Set up Zerodha Kite API connection
- [ ] Create broker adapter
- [ ] Test live data retrieval
- [ ] Test order placement in paper trading

### **Phase 2: Strategy Framework (Week 2-3)**
- [ ] Build base strategy class
- [ ] Implement Moving Average strategy
- [ ] Add backtesting framework
- [ ] Test on historical data

### **Phase 3: Trading Engine (Week 3-4)**
- [ ] Create main trading engine
- [ ] Implement execution logic
- [ ] Add position tracking
- [ ] Add exit logic

### **Phase 4: Risk Management (Week 4)**
- [ ] Implement position sizing
- [ ] Add stop-loss enforcement
- [ ] Portfolio limits
- [ ] Drawdown monitoring

### **Phase 5: Frontend Integration (Week 5)**
- [ ] Strategy management page
- [ ] Live trading dashboard
- [ ] Performance tracking
- [ ] Alert system

### **Phase 6: Monitoring & Logging (Week 5-6)**
- [ ] Real-time event logging
- [ ] Error handling
- [ ] Performance metrics
- [ ] Admin dashboard updates

---

## 💡 Strategy Ideas to Implement

### **1. Moving Average Crossover**
```
Buy: Fast MA crosses above Slow MA
Sell: Fast MA crosses below Slow MA
Risk: Low | Complexity: Easy
```

### **2. RSI Mean Reversion**
```
Buy: RSI < 30 (oversold)
Sell: RSI > 70 (overbought)
Risk: Medium | Complexity: Easy
```

### **3. MACD Momentum**
```
Buy: MACD crosses above signal line
Sell: MACD crosses below signal line
Risk: Medium | Complexity: Medium
```

### **4. Bollinger Band Breakout**
```
Buy: Price breaks above upper band
Sell: Price breaks below lower band
Risk: Medium | Complexity: Medium
```

### **5. Pair Trading**
```
Buy: Undervalued stock, Sell: Overvalued stock
Use: Correlation-based arbitrage
Risk: High | Complexity: High
```

---

## 🔗 API Endpoints to Add

```typescript
// Trading endpoints
POST   /api/v1/trading/start      - Start automated trading
POST   /api/v1/trading/stop       - Stop automated trading
GET    /api/v1/trading/status     - Get trading status
GET    /api/v1/trading/performance - Get performance metrics

// Strategy endpoints
GET    /api/v1/strategies         - List all strategies
POST   /api/v1/strategies         - Create new strategy
GET    /api/v1/strategies/:id     - Get strategy details
POST   /api/v1/strategies/:id/backtest - Run backtest

// Broker endpoints
POST   /api/v1/broker/connect     - Connect to broker
GET    /api/v1/broker/positions   - Get current positions
GET    /api/v1/broker/orders      - Get orders history
```

---

## ⚠️ Important Considerations

### **Paper Trading First**
Always backtest and paper trade before live trading:
1. Test strategy on historical data
2. Paper trade for 2-4 weeks
3. Monitor results closely
4. Only then go live with small capital

### **Risk Management**
```typescript
const safetyRules = {
  // Risk per trade: 1-2% of portfolio
  riskPerTrade: 1,
  
  // Max daily loss: 5-10% of portfolio
  maxDailyLoss: 5,
  
  // Max open positions: 3-10
  maxOpenPositions: 5,
  
  // Max leverage: 1:1 to 1:5 (avoid high leverage)
  maxLeverage: 2,
  
  // Profit target: 1:2 or 1:3 risk-reward ratio
  profitTarget: 2,
}
```

### **Monitoring**
```typescript
const monitoring = {
  // Daily P&L tracking
  dailyProfit: trackDailyProfit(),
  
  // Win rate tracking
  winRate: calculateWinRate(),
  
  // Drawdown monitoring
  maxDrawdown: calculateMaxDrawdown(),
  
  // Performance vs benchmark
  alpha: calculateAlpha(),
  
  // Risk-adjusted returns
  sharpeRatio: calculateSharpeRatio(),
}
```

---

## 📈 Next Steps

1. **Set up Zerodha API credentials**
   - Create account on Zerodha
   - Generate API key
   - Set up live/paper trading

2. **Implement broker adapter**
   - Create `/src/services/brokers/zerodha-adapter.ts`
   - Test with sample data

3. **Build strategy framework**
   - Create base strategy class
   - Implement Moving Average strategy
   - Create backtesting framework

4. **Create trading engine**
   - Implement execution logic
   - Add position tracking
   - Add exit logic

5. **Add risk management**
   - Position sizing
   - Stop-loss enforcement
   - Portfolio limits

6. **Build frontend**
   - Strategy management page
   - Live trading dashboard
   - Performance tracking

7. **Deploy and monitor**
   - Paper trade first
   - Monitor performance
   - Go live with small capital

---

**Ready to build the ultimate automated trading system! 🚀**
