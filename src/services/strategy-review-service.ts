/**
 * Strategy Review Service
 *
 * Analyzes trading strategy performance and provides:
 * - Performance metrics (win rate, profit factor, sharpe ratio)
 * - Strengths and weaknesses identification
 * - Specific improvement recommendations
 * - Optimal market conditions analysis
 * - Risk assessment
 *
 * Uses Claude AI to provide intelligent, context-aware analysis
 * of why strategies succeed or fail.
 */

import { claudeService } from './claude-service'
import { usageTrackingService } from './usage-tracking-service'
import { logger } from './logger'
import type { StrategyReviewRequest, StrategyReviewResponse } from '../models/claude'

export interface StrategyPerformance {
  strategyId: string
  name: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  winRate: number // 0-1
  profitFactor: number // Total wins / Total losses
  maxDrawdown: number // Negative percentage
  sharpeRatio: number
  maxConsecutiveLosses: number
  totalReturn: number // Percentage
  periodStart: Date
  periodEnd: Date
}

export interface StrategyReviewResult {
  strategyId: string
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  riskAdjustments: string[]
  marketAdaptations: string
  overallAssessment: 'Excellent' | 'Good' | 'Fair' | 'Needs improvement'
  nextActions: string[]
}

class StrategyReviewService {
  /**
   * Analyze strategy performance using Claude
   *
   * Takes historical performance data and uses Claude to provide
   * intelligent analysis of why the strategy works or doesn't work.
   */
  async reviewStrategy(
    userId: string,
    performance: StrategyPerformance
  ): Promise<StrategyReviewResult> {
    try {
      logger.debug({
        type: 'strategy_review_starting',
        userId,
        strategyId: performance.strategyId,
        totalTrades: performance.totalTrades,
      })

      const startTime = Date.now()

      // Build Claude request
      const claudeRequest: StrategyReviewRequest = {
        strategy: {
          name: performance.name,
          description: `Strategy analyzed from ${performance.periodStart.toDateString()} to ${performance.periodEnd.toDateString()}`,
          activeSince: performance.periodStart,
        },
        performance: {
          totalTrades: performance.totalTrades,
          winningTrades: performance.winningTrades,
          losingTrades: performance.losingTrades,
          avgWin: performance.avgWin,
          avgLoss: performance.avgLoss,
          winRate: performance.winRate,
          profitFactor: performance.profitFactor,
          maxDrawdown: performance.maxDrawdown,
          sharpeRatio: performance.sharpeRatio,
          maxConsecutiveLosses: performance.maxConsecutiveLosses,
          totalReturn: performance.totalReturn,
        },
      }

      // Get Claude analysis
      const claudeResponse = await claudeService.analysisFromClaude(userId, claudeRequest)

      const responseTime = Date.now() - startTime

      // Track usage
      await usageTrackingService.trackUsage({
        userId,
        useCase: 'strategy_review',
        timestamp: new Date(),
        responseTimeMs: responseTime,
        costInDollars: 0.004,
        success: true,
      })

      logger.info({
        type: 'strategy_review_completed',
        userId,
        strategyId: performance.strategyId,
        responseTime,
        assessment: claudeResponse.overallAssessment,
      })

      return claudeResponse
    } catch (error: any) {
      logger.error({
        type: 'strategy_review_error',
        userId,
        strategyId: performance.strategyId,
        error: error.message,
      })

      // Fallback response if Claude fails
      return {
        strategyId: performance.strategyId,
        strengths: [
          `Strategy has ${(performance.winRate * 100).toFixed(1)}% win rate`,
          `Profit factor of ${performance.profitFactor.toFixed(2)}`,
        ],
        weaknesses: [
          'Unable to get detailed analysis at this time',
          'Try again later for Claude insights',
        ],
        improvements: [
          'Backtest on more historical data',
          'Add risk management filters',
          'Optimize entry/exit parameters',
        ],
        riskAdjustments: [
          `Max drawdown: ${(performance.maxDrawdown * 100).toFixed(1)}%`,
          `Consider tighter stop losses`,
        ],
        marketAdaptations: 'Review performance in different market conditions',
        overallAssessment: 'Fair',
        nextActions: ['Wait for Claude service recovery', 'Use manual analysis'],
      }
    }
  }

  /**
   * Calculate performance metrics from trade list
   *
   * Converts raw trade data into standardized performance metrics.
   */
  static calculateMetrics(trades: any[]): Partial<StrategyPerformance> {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0,
      }
    }

    const winningTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl < 0)

    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0

    // Find max consecutive losses
    let maxConsecutive = 0
    let currentStreak = 0
    for (const trade of trades) {
      if (trade.pnl < 0) {
        currentStreak++
        maxConsecutive = Math.max(maxConsecutive, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    // Calculate Sharpe ratio (simplified)
    const returns = trades.map(t => (t.pnl / (t.quantity * t.entryPrice)) * 100)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // Annualized

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgWin,
      avgLoss,
      winRate: winningTrades.length / trades.length,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0,
      sharpeRatio,
      maxConsecutiveLosses: maxConsecutive,
      totalReturn: ((totalWins - totalLosses) / (trades[0].entryPrice * trades[0].quantity)) * 100,
    }
  }
}

export const strategyReviewService = new StrategyReviewService()
