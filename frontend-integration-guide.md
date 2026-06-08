# 🎨 Claude AI Trading Bot - Frontend Integration Guide

Complete guide with React/TypeScript examples for integrating all Claude AI features into your trading frontend.

---

## 📋 Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [API Client Setup](#api-client-setup)
3. [Component Examples](#component-examples)
4. [Full Dashboard Example](#full-dashboard-example)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [UI/UX Patterns](#uiux-patterns)

---

## Setup & Configuration

### Install Dependencies

```bash
npm install axios react-query recharts
npm install -D @types/react @types/node typescript
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Trading Bot
VITE_PREMIUM_UPGRADE_URL=https://bot-trade.com/upgrade
```

---

## API Client Setup

### src/services/api-client.ts

```typescript
/**
 * API Client Configuration
 * 
 * Handles all communication with Claude-powered backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Create Axios instance with auth interceptor
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor: Add auth token
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor: Handle errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      // Premium feature not available
      console.warn('Premium feature required:', error.response.data)
    }
    return Promise.reject(error)
  }
)

// ============================================================================
// TRADING API
// ============================================================================

export const tradingAPI = {
  /**
   * Create order with Claude signal validation
   */
  createOrderWithClaude: (data: {
    accountId: string
    symbol: string
    side: 'BUY' | 'SELL'
    quantity: number
    price: number
    confidence?: number
    indicators?: Record<string, number>
    marketContext?: Record<string, any>
  }) => apiClient.post('/orders/create-with-claude', data),

  /**
   * Create standard order (no Claude)
   */
  createOrder: (data: any) => apiClient.post('/orders', data),

  /**
   * Get user's orders
   */
  getOrders: () => apiClient.get('/orders'),

  /**
   * Get specific order
   */
  getOrder: (id: string) => apiClient.get(`/orders/${id}`),
}

// ============================================================================
// MARKET ANALYSIS API
// ============================================================================

export const marketAPI = {
  /**
   * Analyze market sentiment
   */
  analyzeSentiment: (data: {
    marketData: any
    recentNews?: string[]
    globalContext?: string
  }) => apiClient.post('/market-analysis/sentiment', data),

  /**
   * Assess trade risk
   */
  assessRisk: (data: {
    proposedTrade: any
    userPortfolio: any
    userRiskProfile: 'conservative' | 'moderate' | 'aggressive'
  }) => apiClient.post('/market-analysis/risk', data),

  /**
   * Get user's usage stats
   */
  getUsageStats: () => apiClient.get('/market-analysis/usage'),

  /**
   * Get cost information (public endpoint)
   */
  getCosts: () => apiClient.get('/market-analysis/costs'),
}

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsAPI = {
  /**
   * Review strategy performance
   */
  reviewStrategy: (data: any) =>
    apiClient.post('/analytics/strategy-review', data),

  /**
   * Detect anomalies in market or portfolio
   */
  detectAnomaly: (data: {
    type: 'price' | 'portfolio' | 'trading'
    symbol?: string
    currentPrice?: number
    historicalPrices?: any[]
  }) => apiClient.post('/analytics/detect-anomaly', data),

  /**
   * Get optimization recommendations
   */
  getRecommendations: (data: {
    strategyName: string
    currentMetrics: any
    portfolio: any
    marketCondition: 'bullish' | 'bearish' | 'sideways'
  }) => apiClient.post('/analytics/recommendations', data),

  /**
   * Calculate optimization score
   */
  getOptimizationScore: (data: any) =>
    apiClient.post('/analytics/optimization-score', data),
}

export default apiClient
```

---

## Component Examples

### 1. Order Creation with Claude Validation

### src/components/OrderCreator.tsx

```typescript
/**
 * Order Creator with Claude Validation
 * 
 * Creates orders and shows Claude signal validation insights
 */

import React, { useState } from 'react'
import { tradingAPI } from '../services/api-client'
import './OrderCreator.css'

interface Order {
  accountId: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  confidence?: number
}

interface ClaudeAnalysis {
  isValid: boolean
  confidence: number
  reasoning: string
  riskLevel: 'low' | 'medium' | 'high'
  adjustments?: Record<string, any>
}

export const OrderCreator: React.FC = () => {
  const [order, setOrder] = useState<Order>({
    accountId: '',
    symbol: '',
    side: 'BUY',
    quantity: 0,
    price: 0,
    confidence: 0.5,
  })

  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ClaudeAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [orderCreated, setOrderCreated] = useState(false)

  const handleInputChange = (
    field: keyof Order,
    value: any
  ) => {
    setOrder(prev => ({
      ...prev,
      [field]: field === 'quantity' || field === 'price' || field === 'confidence'
        ? parseFloat(value)
        : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await tradingAPI.createOrderWithClaude({
        ...order,
        indicators: {
          ma20: order.price * 1.02,
          ma50: order.price * 1.05,
          rsi: 55,
        },
        marketContext: {
          currentPrice: order.price,
        },
      })

      const { order: createdOrder, claudeAnalysis } = response.data

      if (claudeAnalysis) {
        setAnalysis(claudeAnalysis)
      }

      setOrderCreated(true)

      // Reset form
      setTimeout(() => {
        setOrder({
          accountId: '',
          symbol: '',
          side: 'BUY',
          quantity: 0,
          price: 0,
          confidence: 0.5,
        })
        setOrderCreated(false)
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="order-creator">
      <h2>Create Order with Claude Analysis</h2>

      {orderCreated && (
        <div className="success-message">
          ✓ Order created successfully!
        </div>
      )}

      {error && <div className="error-message">✗ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Symbol</label>
          <input
            type="text"
            value={order.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            placeholder="e.g., RELIANCE"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Side</label>
            <select
              value={order.side}
              onChange={(e) => handleInputChange('side', e.target.value)}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={order.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={order.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Your Confidence (0-1)</label>
          <input
            type="number"
            value={order.confidence}
            onChange={(e) => handleInputChange('confidence', e.target.value)}
            min="0"
            max="1"
            step="0.01"
          />
          <small>How confident are you in this signal?</small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>

      {analysis && (
        <div className={`claude-analysis ${analysis.isValid ? 'valid' : 'invalid'}`}>
          <h3>Claude Signal Validation</h3>

          <div className="analysis-grid">
            <div className="metric">
              <label>Signal Valid</label>
              <span className={analysis.isValid ? 'green' : 'red'}>
                {analysis.isValid ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>

            <div className="metric">
              <label>Confidence</label>
              <span>{(analysis.confidence * 100).toFixed(1)}%</span>
            </div>

            <div className="metric">
              <label>Risk Level</label>
              <span className={`risk-${analysis.riskLevel}`}>
                {analysis.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="reasoning">
            <h4>Analysis</h4>
            <p>{analysis.reasoning}</p>
          </div>

          {analysis.adjustments && (
            <div className="adjustments">
              <h4>Suggested Adjustments</h4>
              <ul>
                {Object.entries(analysis.adjustments).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

### 2. Market Sentiment Analyzer

### src/components/SentimentAnalyzer.tsx

```typescript
/**
 * Market Sentiment Analyzer Component
 * 
 * Shows current market sentiment with Claude analysis
 */

import React, { useState } from 'react'
import { marketAPI } from '../services/api-client'
import './SentimentAnalyzer.css'

interface MarketData {
  index_level: number
  index_change_percent: number
  breadth: { advances: number; declines: number }
  volatility_index: number
  fii_flow: number
}

interface SentimentAnalysis {
  sentiment: number
  trend: string
  confidence: number
  reasoning: string
  preferred_trades: string[]
  caution_points: string[]
}

export const SentimentAnalyzer: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    index_level: 78000,
    index_change_percent: 0.85,
    breadth: { advances: 1850, declines: 850 },
    volatility_index: 16.2,
    fii_flow: 150000000,
  })

  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await marketAPI.analyzeSentiment({
        marketData,
      })

      setSentiment(response.data.sentimentAnalysis)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze sentiment')
    } finally {
      setLoading(false)
    }
  }

  const sentimentScore = sentiment?.sentiment || 0
  const sentimentColor = sentimentScore > 0.2 ? 'bullish' : sentimentScore < -0.2 ? 'bearish' : 'neutral'

  return (
    <div className="sentiment-analyzer">
      <h2>Market Sentiment Analysis</h2>

      {error && <div className="error">{error}</div>}

      <div className="market-inputs">
        <div className="input-group">
          <label>Index Level</label>
          <input
            type="number"
            value={marketData.index_level}
            onChange={(e) =>
              setMarketData(prev => ({ ...prev, index_level: parseFloat(e.target.value) }))
            }
          />
        </div>

        <div className="input-group">
          <label>Daily Change (%)</label>
          <input
            type="number"
            value={marketData.index_change_percent}
            onChange={(e) =>
              setMarketData(prev => ({ ...prev, index_change_percent: parseFloat(e.target.value) }))
            }
            step="0.01"
          />
        </div>

        <div className="input-group">
          <label>Advances</label>
          <input
            type="number"
            value={marketData.breadth.advances}
            onChange={(e) =>
              setMarketData(prev => ({
                ...prev,
                breadth: { ...prev.breadth, advances: parseInt(e.target.value) },
              }))
            }
          />
        </div>

        <div className="input-group">
          <label>Declines</label>
          <input
            type="number"
            value={marketData.breadth.declines}
            onChange={(e) =>
              setMarketData(prev => ({
                ...prev,
                breadth: { ...prev.breadth, declines: parseInt(e.target.value) },
              }))
            }
          />
        </div>
      </div>

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Sentiment'}
      </button>

      {sentiment && (
        <div className={`sentiment-result ${sentimentColor}`}>
          <div className="sentiment-gauge">
            <h3>Market Sentiment</h3>
            <div className="gauge-container">
              <div className="gauge" style={{ width: `${(sentimentScore + 1) * 50}%` }}>
                {sentimentColor.toUpperCase()}
              </div>
            </div>
            <p className="sentiment-value">
              {sentimentScore > 0 ? '+' : ''}{(sentimentScore * 100).toFixed(1)}%
            </p>
          </div>

          <div className="sentiment-details">
            <div className="detail">
              <label>Trend</label>
              <span>{sentiment.trend}</span>
            </div>
            <div className="detail">
              <label>Confidence</label>
              <span>{(sentiment.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="reasoning">
            <h4>Claude Analysis</h4>
            <p>{sentiment.reasoning}</p>
          </div>

          <div className="recommendations">
            <div className="section">
              <h4>✓ Preferred Trades</h4>
              <ul>
                {sentiment.preferred_trades.map((trade, i) => (
                  <li key={i}>{trade}</li>
                ))}
              </ul>
            </div>

            <div className="section cautions">
              <h4>⚠ Caution Points</h4>
              <ul>
                {sentiment.caution_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### 3. Risk Assessment Component

### src/components/RiskAssessor.tsx

```typescript
/**
 * Risk Assessment Component
 * 
 * Validates if a trade is appropriate for user's portfolio
 */

import React, { useState } from 'react'
import { marketAPI } from '../services/api-client'
import './RiskAssessor.css'

interface RiskAssessment {
  isAppropriate: boolean
  riskScore: number
  recommendation: string
  marginSafety: string
  sectorConcentration: string
  suggestedAdjustments: Record<string, string>
  reasoning: string
}

export const RiskAssessor: React.FC = () => {
  const [trade, setTrade] = useState({
    symbol: 'RELIANCE',
    direction: 'long',
    entryPrice: 2850,
    quantity: 100,
    stopLoss: 2778,
    takeProfit: 2950,
  })

  const [portfolio, setPortfolio] = useState({
    totalBalance: 500000,
    cashAvailable: 50000,
    marginUsedPercent: 45,
    activePositions: 5,
    currentDrawdown: -3.5,
  })

  const [assessment, setAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAssess = async () => {
    setLoading(true)

    try {
      const response = await marketAPI.assessRisk({
        proposedTrade: trade,
        userPortfolio: portfolio,
        userRiskProfile: 'moderate',
      })

      setAssessment(response.data.riskAnalysis)
    } catch (err) {
      console.error('Risk assessment failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 0.3) return 'green'
    if (score < 0.6) return 'yellow'
    return 'red'
  }

  return (
    <div className="risk-assessor">
      <h2>Trade Risk Assessment</h2>

      <div className="input-sections">
        <section>
          <h3>Proposed Trade</h3>
          <input
            type="text"
            placeholder="Symbol"
            value={trade.symbol}
            onChange={(e) => setTrade({ ...trade, symbol: e.target.value })}
          />
          <input
            type="number"
            placeholder="Entry Price"
            value={trade.entryPrice}
            onChange={(e) => setTrade({ ...trade, entryPrice: parseFloat(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={trade.quantity}
            onChange={(e) => setTrade({ ...trade, quantity: parseInt(e.target.value) })}
          />
        </section>

        <section>
          <h3>Your Portfolio</h3>
          <input
            type="number"
            placeholder="Total Balance"
            value={portfolio.totalBalance}
            onChange={(e) => setPortfolio({ ...portfolio, totalBalance: parseFloat(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Cash Available"
            value={portfolio.cashAvailable}
            onChange={(e) => setPortfolio({ ...portfolio, cashAvailable: parseFloat(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Margin Used %"
            value={portfolio.marginUsedPercent}
            onChange={(e) => setPortfolio({ ...portfolio, marginUsedPercent: parseFloat(e.target.value) })}
          />
        </section>
      </div>

      <button onClick={handleAssess} disabled={loading}>
        {loading ? 'Assessing...' : 'Assess Risk'}
      </button>

      {assessment && (
        <div className={`risk-result ${assessment.isAppropriate ? 'approved' : 'rejected'}`}>
          <div className="risk-score">
            <h3>Risk Score</h3>
            <div className="score-circle" style={{ color: getRiskColor(assessment.riskScore) }}>
              {(assessment.riskScore * 100).toFixed(0)}
            </div>
          </div>

          <div className="assessment-details">
            <p className="recommendation">
              <strong>Recommendation:</strong> {assessment.recommendation}
            </p>

            <div className="safety-checks">
              <div className={`check ${assessment.marginSafety}`}>
                <label>Margin Safety</label>
                <span>{assessment.marginSafety}</span>
              </div>
              <div className={`check ${assessment.sectorConcentration}`}>
                <label>Sector Concentration</label>
                <span>{assessment.sectorConcentration}</span>
              </div>
            </div>
          </div>

          <div className="reasoning">
            <h4>Analysis</h4>
            <p>{assessment.reasoning}</p>
          </div>

          {Object.keys(assessment.suggestedAdjustments).length > 0 && (
            <div className="adjustments">
              <h4>Suggested Adjustments</h4>
              <ul>
                {Object.entries(assessment.suggestedAdjustments).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

### 4. Strategy Reviewer Component

### src/components/StrategyReviewer.tsx

```typescript
/**
 * Strategy Review Component
 * 
 * Analyzes strategy performance and provides improvement recommendations
 */

import React, { useState } from 'react'
import { analyticsAPI } from '../services/api-client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './StrategyReviewer.css'

interface StrategyPerformance {
  strategyId: string
  name: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
}

interface ReviewResult {
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  overallAssessment: string
}

export const StrategyReviewer: React.FC = () => {
  const [performance, setPerformance] = useState<StrategyPerformance>({
    strategyId: 'strat-123',
    name: 'Golden Cross',
    totalTrades: 45,
    winningTrades: 28,
    losingTrades: 17,
    avgWin: 2500,
    avgLoss: 1800,
    profitFactor: 1.82,
    sharpeRatio: 1.45,
    maxDrawdown: -0.12,
  })

  const [review, setReview] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleReview = async () => {
    setLoading(true)

    try {
      const response = await analyticsAPI.reviewStrategy({
        ...performance,
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-06-08'),
      })

      setReview(response.data.review)
    } catch (err) {
      console.error('Strategy review failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const winRate = (performance.winningTrades / performance.totalTrades * 100).toFixed(1)

  const chartData = [
    { name: 'Wins', value: performance.winningTrades },
    { name: 'Losses', value: performance.losingTrades },
  ]

  return (
    <div className="strategy-reviewer">
      <h2>Strategy Performance Review</h2>

      <div className="performance-inputs">
        <input
          type="text"
          placeholder="Strategy Name"
          value={performance.name}
          onChange={(e) => setPerformance({ ...performance, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Total Trades"
          value={performance.totalTrades}
          onChange={(e) => setPerformance({ ...performance, totalTrades: parseInt(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Winning Trades"
          value={performance.winningTrades}
          onChange={(e) => setPerformance({ ...performance, winningTrades: parseInt(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Losing Trades"
          value={performance.losingTrades}
          onChange={(e) => setPerformance({ ...performance, losingTrades: parseInt(e.target.value) })}
        />
      </div>

      <button onClick={handleReview} disabled={loading}>
        {loading ? 'Reviewing...' : 'Review Strategy'}
      </button>

      {review && (
        <div className="review-result">
          <div className="overall-assessment">
            <h3>Overall Assessment</h3>
            <span className={`badge ${review.overallAssessment.toLowerCase()}`}>
              {review.overallAssessment}
            </span>
          </div>

          <div className="metrics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="review-sections">
            <section>
              <h4>✓ Strengths</h4>
              <ul>
                {review.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>✗ Weaknesses</h4>
              <ul>
                {review.weaknesses.map((weakness, i) => (
                  <li key={i}>{weakness}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4>📈 Improvements</h4>
              <ul>
                {review.improvements.map((improvement, i) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="key-metrics">
            <div className="metric">
              <label>Win Rate</label>
              <span>{winRate}%</span>
            </div>
            <div className="metric">
              <label>Profit Factor</label>
              <span>{performance.profitFactor.toFixed(2)}</span>
            </div>
            <div className="metric">
              <label>Sharpe Ratio</label>
              <span>{performance.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="metric">
              <label>Max Drawdown</label>
              <span>{(performance.maxDrawdown * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### 5. Optimization Dashboard

### src/components/OptimizationDashboard.tsx

```typescript
/**
 * Optimization Dashboard Component
 * 
 * Shows optimization score and actionable recommendations
 */

import React, { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api-client'
import './OptimizationDashboard.css'

interface Recommendation {
  category: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImprovement: string
  implementationDifficulty: string
  estimatedTimeToImplement: string
  riskLevel: string
}

interface OptimizationData {
  strategyName: string
  currentMetrics: {
    winRate: number
    profitFactor: number
    sharpeRatio: number
    maxDrawdown: number
  }
  portfolio: {
    totalValue: number
    cashPercent: number
    concentrationPercent: number
  }
  marketCondition: 'bullish' | 'bearish' | 'sideways'
}

export const OptimizationDashboard: React.FC = () => {
  const [data, setData] = useState<OptimizationData>({
    strategyName: 'Golden Cross',
    currentMetrics: {
      winRate: 0.55,
      profitFactor: 1.2,
      sharpeRatio: 0.8,
      maxDrawdown: -0.25,
    },
    portfolio: {
      totalValue: 500000,
      cashPercent: 0.15,
      concentrationPercent: 0.25,
    },
    marketCondition: 'bullish',
  })

  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleGetRecommendations = async () => {
    setLoading(true)

    try {
      const response = await analyticsAPI.getRecommendations(data)
      setRecommendations(response.data.recommendations)
      setScore(response.data.optimizationScore)
    } catch (err) {
      console.error('Failed to get recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e' // green
    if (score >= 60) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getScoreInterpretation = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const highPriorityRecs = recommendations.filter(r => r.priority === 'high')

  return (
    <div className="optimization-dashboard">
      <h2>Strategy Optimization</h2>

      <div className="score-display">
        <div className="circular-score" style={{ color: getScoreColor(score) }}>
          <svg viewBox="0 0 100 100" className="circle-svg">
            <circle cx="50" cy="50" r="45" />
          </svg>
          <div className="score-value">{score}</div>
          <div className="score-label">{getScoreInterpretation(score)}</div>
        </div>
      </div>

      <button onClick={handleGetRecommendations} disabled={loading} className="primary-btn">
        {loading ? 'Analyzing...' : 'Get Recommendations'}
      </button>

      {recommendations.length > 0 && (
        <div className="recommendations-list">
          <h3>
            Top Priorities ({highPriorityRecs.length} high-priority items)
          </h3>

          {highPriorityRecs.map((rec, i) => (
            <div key={i} className={`recommendation high-priority`}>
              <div className="header">
                <h4>{rec.title}</h4>
                <span className={`priority ${rec.priority}`}>{rec.priority.toUpperCase()}</span>
              </div>

              <p className="description">{rec.description}</p>

              <div className="details">
                <span className="expected">
                  <strong>Expected:</strong> {rec.expectedImprovement}
                </span>
                <span className="difficulty">
                  <strong>Effort:</strong> {rec.implementationDifficulty}
                </span>
                <span className="time">
                  <strong>Time:</strong> {rec.estimatedTimeToImplement}
                </span>
              </div>
            </div>
          ))}

          <h3>Other Recommendations</h3>
          {recommendations
            .filter(r => r.priority !== 'high')
            .map((rec, i) => (
              <div key={i} className={`recommendation ${rec.priority}-priority`}>
                <div className="header">
                  <h4>{rec.title}</h4>
                  <span className={`priority ${rec.priority}`}>{rec.priority.toUpperCase()}</span>
                </div>
                <p className="description">{rec.description}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
```

---

### 6. Usage Tracker Component

### src/components/UsageTracker.tsx

```typescript
/**
 * Usage Tracker Component
 * 
 * Shows Claude API usage and remaining credits
 */

import React, { useEffect, useState } from 'react'
import { marketAPI } from '../services/api-client'
import './UsageTracker.css'

interface UsageStats {
  monthlyUsage: number
  monthlyLimit: number
  creditsRemaining: number
  currentCostUSD: string
  usagePercent: string
}

export const UsageTracker: React.FC = () => {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await marketAPI.getUsageStats()
      setStats(response.data.usage)
    } catch (err) {
      console.error('Failed to fetch usage stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading usage stats...</div>
  if (!stats) return <div>Unable to load usage stats</div>

  const usagePercent = parseFloat(stats.usagePercent)
  const remainingPercent = 100 - usagePercent

  return (
    <div className="usage-tracker">
      <h2>Claude AI Usage</h2>

      <div className="usage-card">
        <div className="usage-stats">
          <div className="stat">
            <label>Requests Used</label>
            <span>{stats.monthlyUsage} / {stats.monthlyLimit}</span>
          </div>

          <div className="stat">
            <label>Credits Remaining</label>
            <span className="credits">{stats.creditsRemaining}</span>
          </div>

          <div className="stat">
            <label>Estimated Cost</label>
            <span>${stats.currentCostUSD}</span>
          </div>
        </div>

        <div className="usage-bar">
          <div className="bar-label">
            <span>Monthly Usage</span>
            <span>{usagePercent.toFixed(1)}%</span>
          </div>
          <div className="bar-container">
            <div className="bar-fill" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>

        <div className="usage-breakdown">
          <h3>Feature Costs</h3>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Cost</th>
                <th>Requests/Month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Signal Validation</td>
                <td>$0.0008</td>
                <td>500+</td>
              </tr>
              <tr>
                <td>Sentiment Analysis</td>
                <td>$0.0015</td>
                <td>300+</td>
              </tr>
              <tr>
                <td>Risk Assessment</td>
                <td>$0.003</td>
                <td>200+</td>
              </tr>
              <tr>
                <td>Strategy Review</td>
                <td>$0.004</td>
                <td>100+</td>
              </tr>
              <tr>
                <td>Recommendations</td>
                <td>$0.004</td>
                <td>100+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="refresh-btn">
        <button onClick={fetchUsageStats}>Refresh Stats</button>
      </div>
    </div>
  )
}
```

---

## Full Dashboard Example

### src/pages/TradingDashboard.tsx

```typescript
/**
 * Complete Trading Dashboard
 * 
 * Integrates all Claude AI features into one comprehensive dashboard
 */

import React, { useState } from 'react'
import { OrderCreator } from '../components/OrderCreator'
import { SentimentAnalyzer } from '../components/SentimentAnalyzer'
import { RiskAssessor } from '../components/RiskAssessor'
import { StrategyReviewer } from '../components/StrategyReviewer'
import { OptimizationDashboard } from '../components/OptimizationDashboard'
import { UsageTracker } from '../components/UsageTracker'
import './TradingDashboard.css'

type TabType = 'trading' | 'sentiment' | 'risk' | 'strategy' | 'optimization' | 'usage'

export const TradingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('trading')

  return (
    <div className="trading-dashboard">
      <header className="dashboard-header">
        <h1>🤖 AI-Powered Trading Bot</h1>
        <p>Claude AI-enhanced trading decisions</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'trading' ? 'active' : ''}
          onClick={() => setActiveTab('trading')}
        >
          📊 Trading
        </button>
        <button
          className={activeTab === 'sentiment' ? 'active' : ''}
          onClick={() => setActiveTab('sentiment')}
        >
          📈 Sentiment
        </button>
        <button
          className={activeTab === 'risk' ? 'active' : ''}
          onClick={() => setActiveTab('risk')}
        >
          ⚠️ Risk
        </button>
        <button
          className={activeTab === 'strategy' ? 'active' : ''}
          onClick={() => setActiveTab('strategy')}
        >
          🎯 Strategy
        </button>
        <button
          className={activeTab === 'optimization' ? 'active' : ''}
          onClick={() => setActiveTab('optimization')}
        >
          ⚡ Optimize
        </button>
        <button
          className={activeTab === 'usage' ? 'active' : ''}
          onClick={() => setActiveTab('usage')}
        >
          📊 Usage
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'trading' && <OrderCreator />}
        {activeTab === 'sentiment' && <SentimentAnalyzer />}
        {activeTab === 'risk' && <RiskAssessor />}
        {activeTab === 'strategy' && <StrategyReviewer />}
        {activeTab === 'optimization' && <OptimizationDashboard />}
        {activeTab === 'usage' && <UsageTracker />}
      </main>
    </div>
  )
}
```

---

## State Management

### src/hooks/useClaudeFeatures.ts

```typescript
/**
 * Custom Hook for Claude Features
 * 
 * Manages state and calls for all Claude AI features
 */

import { useState, useCallback } from 'react'
import { tradingAPI, marketAPI, analyticsAPI } from '../services/api-client'

export const useClaudeFeatures = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===== TRADING =====

  const createOrderWithClaude = useCallback(async (orderData: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await tradingAPI.createOrderWithClaude(orderData)
      return response.data
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create order'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== MARKET ANALYSIS =====

  const analyzeSentiment = useCallback(async (marketData: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await marketAPI.analyzeSentiment(marketData)
      return response.data.sentimentAnalysis
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to analyze sentiment'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== ANALYTICS =====

  const reviewStrategy = useCallback(async (performance: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await analyticsAPI.reviewStrategy(performance)
      return response.data.review
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to review strategy'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createOrderWithClaude,
    analyzeSentiment,
    reviewStrategy,
  }
}
```

---

## Error Handling

### src/components/ErrorBoundary.tsx

```typescript
/**
 * Error Boundary Component
 * 
 * Catches errors and displays user-friendly messages
 */

import React, { ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>⚠️ Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## UI/UX Patterns

### Global Styles

### src/styles/variables.css

```css
:root {
  /* Colors */
  --primary: #2563eb;
  --secondary: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;

  /* Sentiments */
  --bullish: #10b981;
  --bearish: #ef4444;
  --neutral: #f59e0b;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Borders */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}
```

---

## Usage Instructions

### 1. Copy the components into your React project
```bash
cp src/components/* your-project/src/components/
cp src/services/api-client.ts your-project/src/services/
cp src/hooks/* your-project/src/hooks/
```

### 2. Set up environment variables
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Install dependencies
```bash
npm install axios react-query recharts
```

### 4. Wrap your app with error boundary
```tsx
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <TradingDashboard />
    </ErrorBoundary>
  )
}
```

### 5. Use the hooks in your components
```tsx
import { useClaudeFeatures } from './hooks/useClaudeFeatures'

function MyComponent() {
  const { createOrderWithClaude, analyzeSentiment, loading, error } = useClaudeFeatures()
  
  // Use the hooks...
}
```

---

## Testing the Integration

### Example API Calls with cURL

```bash
# Test signal validation
curl -X POST http://localhost:3000/api/v1/orders/create-with-claude \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "acc-123",
    "symbol": "RELIANCE",
    "side": "BUY",
    "quantity": 100,
    "price": 2850,
    "confidence": 0.75,
    "indicators": {"ma20": 2848, "ma50": 2835, "rsi": 62}
  }'

# Test sentiment analysis
curl -X POST http://localhost:3000/api/v1/market-analysis/sentiment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketData": {
      "index_level": 78000,
      "index_change_percent": 0.85,
      "breadth": {"advances": 1850, "declines": 850},
      "volatility_index": 16.2
    }
  }'
```

---

## Conclusion

You now have complete, production-ready React components that seamlessly integrate with your Claude AI-powered trading bot backend. All components include:

✅ Full TypeScript support  
✅ Error handling  
✅ Loading states  
✅ Responsive design  
✅ API integration  
✅ State management  
✅ Best practices  

Ready to deploy! 🚀

