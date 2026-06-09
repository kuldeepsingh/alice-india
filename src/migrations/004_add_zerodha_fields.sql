-- Migration: Add Zerodha integration fields to trading_accounts
-- Date: 2026-06-09

-- Add Zerodha-related columns to trading_accounts table
ALTER TABLE trading_accounts ADD COLUMN IF NOT EXISTS (
  zerodha_user_id VARCHAR(100),
  zerodha_access_token VARCHAR(1000),
  zerodha_refresh_token VARCHAR(1000),
  zerodha_token_expires_at TIMESTAMP,
  zerodha_linked_at TIMESTAMP,
  zerodha_sync_status VARCHAR(20) DEFAULT 'not_synced',
  zerodha_last_sync_at TIMESTAMP,
  zerodha_metadata JSONB
);

-- Create zerodha_holdings table for synced holdings data
CREATE TABLE IF NOT EXISTS zerodha_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_account_id UUID NOT NULL,
  instrument_token INTEGER,
  symbol VARCHAR(20) NOT NULL,
  isin VARCHAR(20),
  quantity INTEGER NOT NULL DEFAULT 0,
  average_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  pnl DECIMAL(15, 2) DEFAULT 0,
  pnl_percent DECIMAL(10, 2) DEFAULT 0,
  multiplier INTEGER DEFAULT 1,
  exchange VARCHAR(10),
  tradingsymbol VARCHAR(50),
  last_price DECIMAL(15, 2),
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
  UNIQUE(trading_account_id, symbol)
);

-- Create zerodha_orders table for synced orders
CREATE TABLE IF NOT EXISTS zerodha_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_account_id UUID NOT NULL,
  zerodha_order_id VARCHAR(50) NOT NULL UNIQUE,
  symbol VARCHAR(20) NOT NULL,
  isin VARCHAR(20),
  instrument_token INTEGER,
  quantity INTEGER NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  side VARCHAR(10) NOT NULL,
  order_type VARCHAR(20),
  status VARCHAR(20),
  executed_quantity INTEGER DEFAULT 0,
  average_price DECIMAL(15, 2),
  order_timestamp TIMESTAMP,
  filled_at TIMESTAMP,
  parent_order_id VARCHAR(50),
  tag VARCHAR(50),
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
);

-- Create zerodha_account_balance table for synced balance data
CREATE TABLE IF NOT EXISTS zerodha_account_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trading_account_id UUID NOT NULL UNIQUE,
  cash DECIMAL(15, 2) DEFAULT 0,
  available_margin DECIMAL(15, 2) DEFAULT 0,
  used_margin DECIMAL(15, 2) DEFAULT 0,
  equity DECIMAL(15, 2) DEFAULT 0,
  unrealised_pnl DECIMAL(15, 2) DEFAULT 0,
  realised_pnl DECIMAL(15, 2) DEFAULT 0,
  net_worth DECIMAL(15, 2) DEFAULT 0,
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_zerodha_holdings_account ON zerodha_holdings(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_zerodha_orders_account ON zerodha_orders(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_zerodha_orders_status ON zerodha_orders(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_zerodha_user ON trading_accounts(zerodha_user_id);
