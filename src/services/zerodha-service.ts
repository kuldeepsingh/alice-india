import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger.ts'
import { query } from './database.ts'

export interface ZerodhaHolding {
  id: string
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  exchange: string
}

export interface ZerodhaOrder {
  zerodhaOrderId: string
  symbol: string
  quantity: number
  price: number
  side: string
  status: string
  executedQuantity: number
  averagePrice: number
  filledAt: string
}

export interface ZerodhaBalance {
  cash: number
  availableMargin: number
  usedMargin: number
  equity: number
  unrealisedPnl: number
  realisedPnl: number
  netWorth: number
}

// Dummy data generator
const generateDummyHoldings = (): ZerodhaHolding[] => {
  const holdings = [
    { symbol: 'INFY', quantity: 50, avgPrice: 1850, currentPrice: 1920, pnl: 3500, pnlPercent: 3.78 },
    { symbol: 'TCS', quantity: 25, avgPrice: 3450, currentPrice: 3680, pnl: 5750, pnlPercent: 6.67 },
    { symbol: 'RELIANCE', quantity: 100, avgPrice: 2890, currentPrice: 3150, pnl: 26000, pnlPercent: 8.99 },
    { symbol: 'WIPRO', quantity: 200, avgPrice: 380, currentPrice: 425, pnl: 9000, pnlPercent: 11.84 },
    { symbol: 'ICICBANK', quantity: 75, avgPrice: 1125, currentPrice: 1250, pnl: 9375, pnlPercent: 11.11 },
  ]
  return holdings.map(h => ({
    id: uuidv4(),
    symbol: h.symbol,
    quantity: h.quantity,
    averagePrice: h.avgPrice,
    currentPrice: h.currentPrice,
    pnl: h.pnl,
    pnlPercent: h.pnlPercent,
    exchange: 'NSE'
  }))
}

const generateDummyOrders = (): ZerodhaOrder[] => {
  const orders = [
    { id: 'ORD001', symbol: 'INFY', qty: 50, price: 1850, side: 'BUY', status: 'COMPLETE', execQty: 50, avgPrice: 1850 },
    { id: 'ORD002', symbol: 'TCS', qty: 25, price: 3450, side: 'BUY', status: 'COMPLETE', execQty: 25, avgPrice: 3450 },
    { id: 'ORD003', symbol: 'RELIANCE', qty: 100, price: 2890, side: 'BUY', status: 'COMPLETE', execQty: 100, avgPrice: 2890 },
    { id: 'ORD004', symbol: 'ICICBANK', qty: 50, price: 1125, side: 'SELL', status: 'PENDING', execQty: 0, avgPrice: 0 },
  ]
  return orders.map(o => ({
    zerodhaOrderId: o.id,
    symbol: o.symbol,
    quantity: o.qty,
    price: o.price,
    side: o.side,
    status: o.status,
    executedQuantity: o.execQty,
    averagePrice: o.avgPrice,
    filledAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }))
}

const generateDummyBalance = (): ZerodhaBalance => {
  const cash = 250000
  const equity = 850000
  return {
    cash: cash,
    availableMargin: cash * 5,
    usedMargin: equity * 0.4,
    equity: equity,
    unrealisedPnl: 54625,
    realisedPnl: 15800,
    netWorth: equity + cash
  }
}

export const zerodhaService = {
  async linkAccount(accountId: string, zerodhaUserId: string, accessToken: string): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      const result = await query(
        `UPDATE trading_accounts
         SET zerodha_user_id = $1,
             zerodha_access_token = $2,
             zerodha_linked_at = $3,
             zerodha_sync_status = 'synced',
             zerodha_last_sync_at = $3
         WHERE id = $4`,
        [zerodhaUserId, accessToken, now, accountId]
      )

      logger.info({
        type: 'zerodha_account_linked',
        accountId,
        zerodhaUserId,
      })

      return result.rowCount && result.rowCount > 0
    } catch (error) {
      logger.error({
        type: 'zerodha_link_error',
        accountId,
        error: error instanceof Error ? error.message : String(error),
      })
      return false
    }
  },

  async syncAccount(accountId: string): Promise<boolean> {
    try {
      logger.info({ type: 'zerodha_sync_start', accountId })

      const holdings = generateDummyHoldings()
      for (const holding of holdings) {
        await query(
          `INSERT INTO zerodha_holdings
           (trading_account_id, symbol, quantity, average_price, current_price, pnl, pnl_percent, exchange, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (trading_account_id, symbol)
           DO UPDATE SET
             quantity = $3, average_price = $4, current_price = $5, pnl = $6, pnl_percent = $7, synced_at = NOW()`,
          [accountId, holding.symbol, holding.quantity, holding.averagePrice, holding.currentPrice, holding.pnl, holding.pnlPercent, holding.exchange]
        )
      }

      const orders = generateDummyOrders()
      for (const order of orders) {
        await query(
          `INSERT INTO zerodha_orders
           (trading_account_id, zerodha_order_id, symbol, quantity, price, side, status, executed_quantity, average_price, filled_at, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
           ON CONFLICT (zerodha_order_id)
           DO UPDATE SET status = $7, executed_quantity = $8, average_price = $9, synced_at = NOW()`,
          [accountId, order.zerodhaOrderId, order.symbol, order.quantity, order.price, order.side, order.status, order.executedQuantity, order.averagePrice, order.filledAt]
        )
      }

      const balance = generateDummyBalance()
      await query(
        `INSERT INTO zerodha_account_balance
         (trading_account_id, cash, available_margin, used_margin, equity, unrealised_pnl, realised_pnl, net_worth, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (trading_account_id)
         DO UPDATE SET
           cash = $2, available_margin = $3, used_margin = $4, equity = $5,
           unrealised_pnl = $6, realised_pnl = $7, net_worth = $8, synced_at = NOW()`,
        [accountId, balance.cash, balance.availableMargin, balance.usedMargin, balance.equity, balance.unrealisedPnl, balance.realisedPnl, balance.netWorth]
      )

      await query(
        `UPDATE trading_accounts SET zerodha_sync_status = 'synced', zerodha_last_sync_at = NOW() WHERE id = $1`,
        [accountId]
      )

      logger.info({ type: 'zerodha_sync_complete', accountId, holdings: holdings.length, orders: orders.length })
      return true
    } catch (error) {
      logger.error({ type: 'zerodha_sync_error', accountId, error: error instanceof Error ? error.message : String(error) })
      await query(`UPDATE trading_accounts SET zerodha_sync_status = 'error' WHERE id = $1`, [accountId])
      return false
    }
  },

  async getHoldings(accountId: string): Promise<ZerodhaHolding[]> {
    try {
      const result = await query(
        `SELECT id, symbol, quantity, average_price, current_price, pnl, pnl_percent, exchange
         FROM zerodha_holdings WHERE trading_account_id = $1 ORDER BY current_price * quantity DESC`,
        [accountId]
      )

      return result.rows.map(row => ({
        id: row.id,
        symbol: row.symbol,
        quantity: row.quantity,
        averagePrice: parseFloat(row.average_price),
        currentPrice: parseFloat(row.current_price),
        pnl: parseFloat(row.pnl),
        pnlPercent: parseFloat(row.pnl_percent),
        exchange: row.exchange
      }))
    } catch (error) {
      logger.error({ type: 'zerodha_get_holdings_error', accountId, error: error instanceof Error ? error.message : String(error) })
      return []
    }
  },

  async getOrders(accountId: string): Promise<ZerodhaOrder[]> {
    try {
      const result = await query(
        `SELECT zerodha_order_id, symbol, quantity, price, side, status, executed_quantity, average_price, filled_at
         FROM zerodha_orders WHERE trading_account_id = $1 ORDER BY filled_at DESC LIMIT 50`,
        [accountId]
      )

      return result.rows.map(row => ({
        zerodhaOrderId: row.zerodha_order_id,
        symbol: row.symbol,
        quantity: row.quantity,
        price: parseFloat(row.price),
        side: row.side,
        status: row.status,
        executedQuantity: row.executed_quantity,
        averagePrice: row.average_price ? parseFloat(row.average_price) : 0,
        filledAt: row.filled_at
      }))
    } catch (error) {
      logger.error({ type: 'zerodha_get_orders_error', accountId, error: error instanceof Error ? error.message : String(error) })
      return []
    }
  },

  async getBalance(accountId: string): Promise<ZerodhaBalance | null> {
    try {
      const result = await query(
        `SELECT cash, available_margin, used_margin, equity, unrealised_pnl, realised_pnl, net_worth
         FROM zerodha_account_balance WHERE trading_account_id = $1`,
        [accountId]
      )

      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        cash: parseFloat(row.cash),
        availableMargin: parseFloat(row.available_margin),
        usedMargin: parseFloat(row.used_margin),
        equity: parseFloat(row.equity),
        unrealisedPnl: parseFloat(row.unrealised_pnl),
        realisedPnl: parseFloat(row.realised_pnl),
        netWorth: parseFloat(row.net_worth)
      }
    } catch (error) {
      logger.error({ type: 'zerodha_get_balance_error', accountId, error: error instanceof Error ? error.message : String(error) })
      return null
    }
  }
}
