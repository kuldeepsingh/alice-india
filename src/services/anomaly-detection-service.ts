// @ts-nocheck
/**
 * Anomaly Detection Service
 *
 * Identifies unusual patterns in:
 * - Price movements (unexpected gaps or spikes)
 * - Volume patterns (unusually high/low volume)
 * - Trading activity (unusual order sizes or frequencies)
 * - Portfolio performance (unexpected losses or gains)
 *
 * Uses statistical analysis and Claude AI for intelligent anomaly detection.
 */

import { claudeService } from './claude-service'
import { usageTrackingService } from './usage-tracking-service'
import { logger } from './logger'
import type { AnomalyDetectionRequest, AnomalyDetectionResponse } from '../models/claude'

export interface PriceAnomalyData {
  symbol: string
  currentPrice: number
  historicalPrices: Array<{
    timestamp: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  avgPrice: number
  avgVolume: number
  volatility: number
}

export interface AnomalyResult {
  isAnomaly: boolean
  type?: 'price_gap' | 'volume_spike' | 'volatility_increase' | 'unusual_pattern' | 'data_error'
  severity: 'low' | 'medium' | 'high'
  confidence: number // 0-1
  explanation: string
  recommendation: 'investigate' | 'ignore' | 'alert' | 'caution'
  suggestedActions: string[]
}

class AnomalyDetectionService {
  /**
   * Detect anomalies in price movement
   */
  async detectPriceAnomaly(
    userId: string,
    data: PriceAnomalyData
  ): Promise<AnomalyResult> {
    try {
      logger.debug({
        type: 'anomaly_detection_starting',
        userId,
        symbol: data.symbol,
        currentPrice: data.currentPrice,
      })

      const startTime = Date.now()

      // Statistical detection first
      const priceStats = this.calculatePriceStats(data)

      // Check for statistical anomalies
      if (priceStats.zScore > 3 || priceStats.zScore < -3) {
        // Potential anomaly detected
        logger.warn({
          type: 'statistical_anomaly_detected',
          symbol: data.symbol,
          zScore: priceStats.zScore,
        })
      }

      // Get Claude analysis for confirmation
      const claudeRequest: AnomalyDetectionRequest = {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        historicalData: data.historicalPrices,
      }

      const claudeResult = await claudeService.detectAnomaly(userId, claudeRequest)

      const responseTime = Date.now() - startTime

      // Track usage
      await usageTrackingService.trackUsage({
        userId,
        useCase: 'anomaly_detection',
        timestamp: new Date(),
        responseTimeMs: responseTime,
        costInDollars: 0.0005,
        success: true,
      })

      logger.info({
        type: 'anomaly_detection_completed',
        userId,
        symbol: data.symbol,
        isAnomaly: claudeResult.isAnomaly,
        severity: claudeResult.anomalyType,
      })

      return claudeResult
    } catch (error: any) {
      logger.error({
        type: 'anomaly_detection_error',
        userId,
        symbol: data.symbol,
        error: error.message,
      })

      // Fallback: use statistical analysis only
      const priceStats = this.calculatePriceStats(data)
      return {
        isAnomaly: Math.abs(priceStats.zScore) > 2,
        type: Math.abs(priceStats.zScore) > 3 ? 'price_gap' : undefined,
        severity: Math.abs(priceStats.zScore) > 3 ? 'high' : 'low',
        confidence: Math.min(Math.abs(priceStats.zScore) / 5, 1),
        explanation: `Price deviation: ${priceStats.zScore.toFixed(2)} standard deviations`,
        recommendation: Math.abs(priceStats.zScore) > 3 ? 'investigate' : 'ignore',
        suggestedActions: ['Check recent news', 'Review order flow', 'Verify data source'],
      }
    }
  }

  /**
   * Calculate price statistics for anomaly detection
   */
  private calculatePriceStats(data: PriceAnomalyData) {
    const closePrices = data.historicalPrices.map(p => p.close)

    // Calculate moving average and standard deviation
    const mean = closePrices.reduce((a, b) => a + b) / closePrices.length
    const variance =
      closePrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / closePrices.length
    const stdDev = Math.sqrt(variance)

    // Z-score: how many std devs away from mean
    const zScore = stdDev > 0 ? (data.currentPrice - mean) / stdDev : 0

    // Volume anomaly detection
    const avgVolume = data.historicalPrices.reduce((sum, p) => sum + p.volume, 0) / data.historicalPrices.length
    const currentVolume = data.historicalPrices[data.historicalPrices.length - 1]?.volume || 0
    const volumeMultiple = avgVolume > 0 ? currentVolume / avgVolume : 1

    return {
      zScore,
      mean,
      stdDev,
      volumeMultiple,
      isPriceAnomaly: Math.abs(zScore) > 2,
      isVolumeAnomaly: volumeMultiple > 2.5,
    }
  }

  /**
   * Detect anomalies in trading activity
   */
  async detectTradingAnomaly(
    userId: string,
    trades: any[]
  ): Promise<AnomalyResult> {
    try {
      const avgTradeSize = trades.reduce((sum, t) => sum + t.quantity, 0) / trades.length
      const avgPrice = trades.reduce((sum, t) => sum + t.price, 0) / trades.length
      const frequency = trades.length

      // Check for unusual patterns
      const outliers = trades.filter(
        t => t.quantity > avgTradeSize * 3 || t.quantity < avgTradeSize * 0.3
      )

      if (outliers.length > trades.length * 0.2) {
        // More than 20% of trades are outliers
        return {
          isAnomaly: true,
          type: 'unusual_pattern',
          severity: 'medium',
          confidence: 0.8,
          explanation: `${(outliers.length / trades.length * 100).toFixed(1)}% of trades are unusual size`,
          recommendation: 'investigate',
          suggestedActions: [
            'Review position sizing logic',
            'Check for automated trading errors',
            'Validate order entry parameters',
          ],
        }
      }

      return {
        isAnomaly: false,
        severity: 'low',
        confidence: 0.95,
        explanation: 'Trading activity appears normal',
        recommendation: 'ignore',
        suggestedActions: [],
      }
    } catch (error: any) {
      logger.error({
        type: 'trading_anomaly_error',
        userId,
        error: error.message,
      })

      return {
        isAnomaly: false,
        severity: 'low',
        confidence: 0,
        explanation: 'Unable to analyze trading activity',
        recommendation: 'caution',
        suggestedActions: ['Retry analysis later'],
      }
    }
  }

  /**
   * Detect portfolio anomalies
   */
  detectPortfolioAnomaly(portfolio: any): AnomalyResult {
    // Check for extreme concentration
    const totalValue = Object.values(portfolio.positions).reduce((sum: number, pos: any) => sum + pos.value, 0)
    const positionSizes = Object.values(portfolio.positions).map((pos: any) => pos.value / totalValue)
    const maxPosition = Math.max(...positionSizes)

    if (maxPosition > 0.5) {
      return {
        isAnomaly: true,
        type: 'unusual_pattern',
        severity: 'high',
        confidence: 1.0,
        explanation: `Portfolio is ${(maxPosition * 100).toFixed(1)}% concentrated in single position`,
        recommendation: 'alert',
        suggestedActions: [
          'Rebalance portfolio',
          'Reduce position size',
          'Add diversification',
        ],
      }
    }

    // Check for unusual drawdown
    if (portfolio.currentDrawdown < -0.2) {
      return {
        isAnomaly: true,
        type: 'unusual_pattern',
        severity: 'high',
        confidence: 0.95,
        explanation: `Portfolio is down ${(portfolio.currentDrawdown * 100).toFixed(1)}%`,
        recommendation: 'alert',
        suggestedActions: [
          'Review recent trades',
          'Check stop-loss levels',
          'Pause automated trading',
        ],
      }
    }

    return {
      isAnomaly: false,
      severity: 'low',
      confidence: 1.0,
      explanation: 'Portfolio appears healthy',
      recommendation: 'ignore',
      suggestedActions: [],
    }
  }
}

export const anomalyDetectionService = new AnomalyDetectionService()
