/**
 * Claude API Types and Interfaces
 *
 * Defines all TypeScript types for Claude API requests and responses
 */

/**
 * Signal validation request from trading bot
 */
export interface SignalValidationRequest {
  symbol: string // e.g., "RELIANCE", "INFY"
  action: 'BUY' | 'SELL'
  confidence: number // 0.0 to 1.0
  indicators?: {
    ma20?: number
    ma50?: number
    ma200?: number
    rsi?: number
    macd?: number
    signal_line?: number
    bb_upper?: number
    bb_lower?: number
    atr?: number
    [key: string]: number | undefined
  }
  marketContext?: {
    currentPrice: number
    high24h?: number
    low24h?: number
    volume?: number
    avgVolume?: number
    volatility?: number
    trend?: 'uptrend' | 'downtrend' | 'sideways'
  }
}

/**
 * Claude's signal validation response
 */
export interface SignalValidationResponse {
  isValid: boolean // Should user execute this signal?
  confidence: number // 0.0 to 1.0, Claude's confidence in assessment
  reasoning: string // Why is it valid/invalid
  riskLevel: 'low' | 'medium' | 'high'
  adjustments?: {
    position_size_multiplier?: number // 0.5 to 2.0
    stop_loss_adjustment?: string // e.g., "-2.5%", "-₹50"
    take_profit_adjustment?: string
  }
}

/**
 * Market sentiment analysis request
 */
export interface SentimentAnalysisRequest {
  symbol?: string
  marketData: {
    index_level?: number
    index_change_percent?: number
    sector_performance?: Record<string, number> // {sector: percent}
    breadth?: {
      advances: number
      declines: number
      unchanged: number
    }
    volatility_index?: number
    put_call_ratio?: number
    fii_flow?: number
  }
  recentNews?: string[] // Recent news headlines
  globalContext?: string // Global market conditions
}

/**
 * Sentiment analysis response from Claude
 */
export interface SentimentAnalysisResponse {
  sentiment: number // -1.0 (very bearish) to +1.0 (very bullish)
  trend: 'strong_bull' | 'moderate_bull' | 'neutral' | 'moderate_bear' | 'strong_bear'
  confidence: number // 0.0 to 1.0
  reasoning: string
  preferred_trades?: string[] // e.g., ["momentum", "value", "sector_rotation"]
  caution_points?: string[]
}

/**
 * Risk assessment request
 */
export interface RiskAssessmentRequest {
  proposedTrade: {
    symbol: string
    direction: 'long' | 'short'
    entryPrice: number
    quantity: number
    stopLoss: number
    takeProfit?: number
    timeHorizon?: string // e.g., "1 day", "1 week"
  }
  userPortfolio: {
    totalBalance: number
    cashAvailable: number
    marginUsedPercent: number
    activePositions: number
    positionsBySymbol?: Record<string, number> // {symbol: quantity}
    positionsBySector?: Record<string, number> // {sector: % of portfolio}
    currentDrawdown?: number
    beta?: number
  }
  userRiskProfile: 'conservative' | 'moderate' | 'aggressive'
}

/**
 * Risk assessment response from Claude
 */
export interface RiskAssessmentResponse {
  isAppropriate: boolean
  riskScore: number // 0.0 (safe) to 1.0 (risky)
  reasoning: string
  marginSafety: 'comfortable' | 'tight' | 'concerning'
  sectorConcentration: 'balanced' | 'slightly_concentrated' | 'concerning'
  recommendation: 'Approve' | 'Approve with adjustments' | 'Reject' | 'Investigate'
  suggestedAdjustments?: {
    position_size?: string
    margin_cushion?: string
    hedging?: string
  }
}

/**
 * Strategy performance review request
 */
export interface StrategyReviewRequest {
  strategy: {
    name: string
    description: string
    parameters?: Record<string, any>
    activeSince: Date
  }
  performance: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    avgWin: number
    avgLoss: number
    winRate: number
    profitFactor: number
    maxDrawdown: number
    sharpeRatio: number
    maxConsecutiveLosses: number
    totalReturn: number
  }
  underperformancePeriods?: Array<{
    dateRange: string
    reason?: string
    loss: number
  }>
}

/**
 * Strategy review response from Claude
 */
export interface StrategyReviewResponse {
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  riskAdjustments: string[]
  marketAdaptations: string // When to use/avoid
  overallAssessment: 'Excellent' | 'Good' | 'Fair' | 'Needs improvement'
  nextActions: string[]
}

/**
 * Anomaly detection request
 */
export interface AnomalyDetectionRequest {
  symbol: string
  currentPrice: number
  historicalData: Array<{
    timestamp: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
  }> // Last 10-20 candles
}

/**
 * Anomaly detection response
 */
export interface AnomalyDetectionResponse {
  isAnomaly: boolean
  anomalyType?: 'data_error' | 'news_driven' | 'technical' | 'market_impact' | 'unusual_pattern'
  confidence: number // 0.0 to 1.0
  explanation: string
  recommendation: 'Investigate' | 'Ignore' | 'Act cautiously' | 'Take advantage'
  suggestedActions?: string[]
}

/**
 * Generic Claude request wrapper
 */
export interface ClaudeRequest {
  useCase: 'signal_validation' | 'sentiment_analysis' | 'risk_assessment' | 'strategy_review' | 'anomaly_detection'
  userId: string
  data: any
  timestamp: Date
}

/**
 * Generic Claude response wrapper
 */
export interface ClaudeResponse {
  useCase: string
  success: boolean
  data?: any
  error?: string
  responseTimeMs: number
  costInCredits: number
  timestamp: Date
}

/**
 * Claude decision logging
 */
export interface ClaudeDecisionLog {
  id: string
  userId: string
  useCase: string
  request: any
  response: any
  responseTimeMs: number
  costInCredits: number
  createdAt: Date
}
