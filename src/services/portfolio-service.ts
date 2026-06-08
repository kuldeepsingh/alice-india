/**
 * Portfolio Service
 * Portfolio management, P&L tracking, and position analysis
 */

import { ZerodhaService } from './zerodha-service.ts'
import { CacheService } from './cache-service.ts'
import { Portfolio, Position, Holding, DayPnL, NetPnL } from '../models/trading.ts'

export class PortfolioService {
  private zerodhaService: ZerodhaService | null = null

  constructor(zerodhaService?: ZerodhaService) {
    this.zerodhaService = zerodhaService || null
  }

  /**
   * Get complete portfolio
   */
  async getPortfolio(): Promise<Portfolio> {
    if (!this.zerodhaService) {
      throw new Error('Zerodha service not configured')
    }

    const cacheKey = CacheService.getDebugKey('portfolio:complete')
    const cached = await CacheService.get<Portfolio>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const portfolio = await this.zerodhaService.getPortfolio()
      await CacheService.set(cacheKey, portfolio, { ttl: 5 * 60 })
      return portfolio
    } catch (error) {
      console.error('Portfolio fetch error:', error)
      throw error
    }
  }

  /**
   * Get positions with P&L
   */
  async getPositions(): Promise<Position[]> {
    if (!this.zerodhaService) {
      throw new Error('Zerodha service not configured')
    }

    try {
      const positions = await this.zerodhaService.getPositions()

      return positions.map((pos) => ({
        ...pos,
        pnl: pos.m2m,
        pnlPercent: ((pos.m2m / Math.max(pos.buyValue, 1)) * 100) || 0,
      }))
    } catch (error) {
      console.error('Positions fetch error:', error)
      throw error
    }
  }

  /**
   * Get holdings
   */
  async getHoldings(): Promise<Holding[]> {
    if (!this.zerodhaService) {
      throw new Error('Zerodha service not configured')
    }

    try {
      return await this.zerodhaService.getHoldings()
    } catch (error) {
      console.error('Holdings fetch error:', error)
      throw error
    }
  }

  /**
   * Calculate day P&L
   */
  async getDayPnL(): Promise<DayPnL[]> {
    try {
      const positions = await this.getPositions()

      return positions.map((pos) => ({
        symbol: pos.symbol,
        dayChange: pos.m2m,
        dayChangePercent: pos.m2mPercent,
        realizedProfit: pos.realizedProfit,
        unrealizedProfit: pos.unrealizedProfit,
        totalProfit: pos.unrealizedProfit + pos.realizedProfit,
        quantity: pos.quantity,
      }))
    } catch (error) {
      console.error('Day P&L error:', error)
      throw error
    }
  }

  /**
   * Calculate net P&L
   */
  async getNetPnL(): Promise<NetPnL> {
    try {
      const [positions, holdings] = await Promise.all([
        this.getPositions(),
        this.getHoldings(),
      ])

      const totalRealizedProfit = positions.reduce((sum, p) => sum + p.realizedProfit, 0)
      const totalUnrealizedProfit = positions.reduce((sum, p) => sum + p.unrealizedProfit, 0)
      const holdingsPnL = holdings.reduce((sum, h) => sum + h.pnl, 0)

      const totalProfit = totalRealizedProfit + totalUnrealizedProfit + holdingsPnL

      const dayChange = positions.reduce((sum, p) => sum + p.m2m, 0)
      const totalValue = positions.reduce((sum, p) => sum + p.netValue, 0) || 1

      return {
        totalRealizedProfit,
        totalUnrealizedProfit,
        totalProfit,
        positions,
        holdings,
        dayChange,
        dayChangePercent: ((dayChange / totalValue) * 100) || 0,
      }
    } catch (error) {
      console.error('Net P&L error:', error)
      throw error
    }
  }

  /**
   * Get P&L for specific symbol
   */
  async getSymbolPnL(symbol: string): Promise<DayPnL | null> {
    try {
      const dayPnL = await this.getDayPnL()
      return dayPnL.find((p) => p.symbol === symbol) || null
    } catch (error) {
      console.error('Symbol P&L error:', error)
      throw error
    }
  }

  /**
   * Calculate margin used
   */
  async getMarginUsed(): Promise<number> {
    try {
      const portfolio = await this.getPortfolio()
      return portfolio.margin.used
    } catch (error) {
      console.error('Margin used error:', error)
      return 0
    }
  }

  /**
   * Calculate margin available
   */
  async getMarginAvailable(): Promise<number> {
    try {
      const portfolio = await this.getPortfolio()
      return portfolio.margin.available
    } catch (error) {
      console.error('Margin available error:', error)
      return 0
    }
  }

  /**
   * Calculate portfolio value
   */
  async getPortfolioValue(): Promise<number> {
    try {
      const portfolio = await this.getPortfolio()
      return portfolio.totalEquity
    } catch (error) {
      console.error('Portfolio value error:', error)
      return 0
    }
  }

  /**
   * Get margin utilization percentage
   */
  async getMarginUtilization(): Promise<number> {
    try {
      const portfolio = await this.getPortfolio()
      return portfolio.margin.utilization
    } catch (error) {
      console.error('Margin utilization error:', error)
      return 0
    }
  }

  /**
   * Get positions by symbol
   */
  async getPositionBySymbol(symbol: string): Promise<Position | null> {
    try {
      const positions = await this.getPositions()
      return positions.find((p) => p.symbol === symbol) || null
    } catch (error) {
      console.error('Get position error:', error)
      return null
    }
  }

  /**
   * Get holdings by symbol
   */
  async getHoldingBySymbol(symbol: string): Promise<Holding | null> {
    try {
      const holdings = await this.getHoldings()
      return holdings.find((h) => h.symbol === symbol) || null
    } catch (error) {
      console.error('Get holding error:', error)
      return null
    }
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(): Promise<any> {
    try {
      const [positions, holdings, netPnL] = await Promise.all([
        this.getPositions(),
        this.getHoldings(),
        this.getNetPnL(),
      ])

      return {
        totalPositions: positions.length,
        totalHoldings: holdings.length,
        totalSymbols: new Set([
          ...positions.map((p) => p.symbol),
          ...holdings.map((h) => h.symbol),
        ]).size,
        profitablePositions: positions.filter((p) => p.pnl > 0).length,
        losingPositions: positions.filter((p) => p.pnl < 0).length,
        netPnL: netPnL.totalProfit,
        dayPnL: netPnL.dayChange,
        largestPosition: positions.length > 0
          ? positions.reduce((max, p) => 
              Math.abs(p.netValue) > Math.abs(max.netValue) ? p : max
            )
          : null,
        largestGain: positions.length > 0
          ? positions.reduce((max, p) => (p.pnl > max.pnl ? p : max))
          : null,
        largestLoss: positions.length > 0
          ? positions.reduce((min, p) => (p.pnl < min.pnl ? p : min))
          : null,
      }
    } catch (error) {
      console.error('Portfolio stats error:', error)
      throw error
    }
  }

  /**
   * Get top gainers
   */
  async getTopGainers(limit: number = 5): Promise<Position[]> {
    try {
      const positions = await this.getPositions()
      return positions.sort((a, b) => b.pnl - a.pnl).slice(0, limit)
    } catch (error) {
      console.error('Top gainers error:', error)
      return []
    }
  }

  /**
   * Get top losers
   */
  async getTopLosers(limit: number = 5): Promise<Position[]> {
    try {
      const positions = await this.getPositions()
      return positions.sort((a, b) => a.pnl - b.pnl).slice(0, limit)
    } catch (error) {
      console.error('Top losers error:', error)
      return []
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await CacheService.invalidateStats()
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}
