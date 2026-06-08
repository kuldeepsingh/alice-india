/**
 * Optimization Service
 *
 * Provides AI-powered recommendations for improving:
 * - Trading strategy performance
 * - Risk management parameters
 * - Portfolio allocation
 * - Entry/exit timing
 * - Position sizing
 *
 * Analyzes performance data and suggests specific, actionable improvements.
 */

import { claudeService } from './claude-service'
import { usageTrackingService } from './usage-tracking-service'
import { logger } from './logger'

export interface OptimizationContext {
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

export interface Recommendation {
  category: 'strategy' | 'risk' | 'sizing' | 'timing' | 'allocation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImprovement: string // e.g., "10-15% win rate improvement"
  implementationDifficulty: 'easy' | 'medium' | 'hard'
  estimatedTimeToImplement: string // e.g., "2-3 days"
  riskLevel: 'low' | 'medium' | 'high'
}

class OptimizationService {
  /**
   * Generate optimization recommendations using Claude
   */
  async generateRecommendations(
    userId: string,
    context: OptimizationContext
  ): Promise<Recommendation[]> {
    try {
      logger.debug({
        type: 'optimization_starting',
        userId,
        strategy: context.strategyName,
        winRate: context.currentMetrics.winRate,
      })

      const startTime = Date.now()

      // Get Claude recommendations
      const recommendations = await this.getClaudeRecommendations(userId, context)

      const responseTime = Date.now() - startTime

      // Track usage
      await usageTrackingService.trackUsage({
        userId,
        useCase: 'strategy_optimization',
        timestamp: new Date(),
        responseTimeMs: responseTime,
        costInDollars: 0.004,
        success: true,
      })

      logger.info({
        type: 'optimization_completed',
        userId,
        recommendationCount: recommendations.length,
        topPriority: recommendations[0]?.priority,
      })

      return recommendations
    } catch (error: any) {
      logger.error({
        type: 'optimization_error',
        userId,
        error: error.message,
      })

      // Fallback recommendations based on metrics
      return this.getFallbackRecommendations(context)
    }
  }

  /**
   * Get Claude-generated recommendations
   */
  private async getClaudeRecommendations(
    userId: string,
    context: OptimizationContext
  ): Promise<Recommendation[]> {
    // This would call Claude API with optimization request
    // For now, return static recommendations

    const recommendations: Recommendation[] = []

    // High-priority recommendations based on metrics
    if (context.currentMetrics.winRate < 0.5) {
      recommendations.push({
        category: 'strategy',
        priority: 'high',
        title: 'Improve Entry Signal Quality',
        description: `Your win rate is ${(context.currentMetrics.winRate * 100).toFixed(1)}%. Consider adding additional confirmation filters to your entry signals.`,
        expectedImprovement: '10-20% win rate increase',
        implementationDifficulty: 'medium',
        estimatedTimeToImplement: '3-5 days',
        riskLevel: 'low',
      })
    }

    if (Math.abs(context.currentMetrics.maxDrawdown) > 0.2) {
      recommendations.push({
        category: 'risk',
        priority: 'high',
        title: 'Tighten Stop Loss Levels',
        description: `Your max drawdown is ${(context.currentMetrics.maxDrawdown * 100).toFixed(1)}%. Implementing tighter stop-loss levels could reduce drawdown.`,
        expectedImprovement: '5-10% drawdown reduction',
        implementationDifficulty: 'easy',
        estimatedTimeToImplement: '1 day',
        riskLevel: 'low',
      })
    }

    if (context.currentMetrics.profitFactor < 1.5) {
      recommendations.push({
        category: 'sizing',
        priority: 'medium',
        title: 'Optimize Position Sizing',
        description: 'Your profit factor suggests over-sizing losing positions. Use Kelly Criterion or fixed fractional sizing.',
        expectedImprovement: '15-25% profit factor improvement',
        implementationDifficulty: 'medium',
        estimatedTimeToImplement: '2-3 days',
        riskLevel: 'medium',
      })
    }

    if (context.portfolio.concentrationPercent > 0.3) {
      recommendations.push({
        category: 'allocation',
        priority: 'high',
        title: 'Diversify Portfolio',
        description: `Your portfolio is ${(context.portfolio.concentrationPercent * 100).toFixed(1)}% concentrated. Diversify across more symbols.`,
        expectedImprovement: 'Reduce portfolio risk by 20-30%',
        implementationDifficulty: 'easy',
        estimatedTimeToImplement: '1-2 days',
        riskLevel: 'low',
      })
    }

    if (context.portfolio.cashPercent < 0.1) {
      recommendations.push({
        category: 'risk',
        priority: 'medium',
        title: 'Maintain Cash Buffer',
        description: 'Keep 10-20% cash for opportunities and emergency exits.',
        expectedImprovement: 'Improve flexibility and reduce forced liquidations',
        implementationDifficulty: 'easy',
        estimatedTimeToImplement: '1 day',
        riskLevel: 'low',
      })
    }

    if (context.currentMetrics.sharpeRatio < 1.0) {
      recommendations.push({
        category: 'strategy',
        priority: 'medium',
        title: 'Reduce Volatility',
        description: 'Your Sharpe ratio suggests high volatility relative to returns. Add volatility filters.',
        expectedImprovement: '20-40% Sharpe ratio improvement',
        implementationDifficulty: 'hard',
        estimatedTimeToImplement: '5-7 days',
        riskLevel: 'medium',
      })
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * Fallback recommendations when Claude is unavailable
   */
  private getFallbackRecommendations(context: OptimizationContext): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Always recommend diversification
    recommendations.push({
      category: 'allocation',
      priority: 'high',
      title: 'Review Position Diversification',
      description: 'Ensure portfolio is properly diversified across symbols and sectors.',
      expectedImprovement: 'Reduced portfolio risk',
      implementationDifficulty: 'easy',
      estimatedTimeToImplement: '1-2 days',
      riskLevel: 'low',
    })

    // Risk management
    recommendations.push({
      category: 'risk',
      priority: 'high',
      title: 'Review Risk Management Rules',
      description: 'Check position sizing and stop-loss levels against portfolio size.',
      expectedImprovement: 'Better risk-adjusted returns',
      implementationDifficulty: 'medium',
      estimatedTimeToImplement: '2-3 days',
      riskLevel: 'low',
    })

    // Strategy review
    recommendations.push({
      category: 'strategy',
      priority: 'medium',
      title: 'Backtest Strategy Changes',
      description: 'Before implementing changes, backtest on historical data.',
      expectedImprovement: 'Verify improvements before live trading',
      implementationDifficulty: 'medium',
      estimatedTimeToImplement: '3-5 days',
      riskLevel: 'low',
    })

    return recommendations
  }

  /**
   * Calculate optimization score (0-100)
   *
   * Rates how well the strategy is optimized based on metrics.
   */
  calculateOptimizationScore(context: OptimizationContext): number {
    let score = 100

    // Deduct for poor metrics
    if (context.currentMetrics.winRate < 0.5) score -= 20
    if (context.currentMetrics.profitFactor < 1.5) score -= 15
    if (Math.abs(context.currentMetrics.maxDrawdown) > 0.2) score -= 20
    if (context.currentMetrics.sharpeRatio < 1.0) score -= 15

    // Deduct for portfolio issues
    if (context.portfolio.concentrationPercent > 0.3) score -= 15
    if (context.portfolio.cashPercent < 0.1) score -= 10

    return Math.max(0, Math.min(100, score))
  }
}

export const optimizationService = new OptimizationService()
