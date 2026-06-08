/**
 * Migration: Add Claude API Integration Tables
 *
 * This migration adds:
 * 1. Subscriptions table - user tier and credits
 * 2. Claude decisions table - track all Claude API calls
 * 3. Claude usage analytics table - cost and performance tracking
 * 4. Add subscription_tier column to users table
 *
 * This is non-breaking - new tables, no drops
 */

-- =====================================================
-- 1. SUBSCRIPTIONS TABLE
-- =====================================================
-- Tracks user subscription tier, credits, and feature access

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
  
  -- Claude API credits
  credits_monthly INT NOT NULL DEFAULT 0,
  credits_used INT NOT NULL DEFAULT 0,
  
  -- Feature flags
  features TEXT[] DEFAULT '{}',
  
  -- Billing
  starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for quick tier checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at);

-- =====================================================
-- 2. CLAUDE DECISIONS TABLE
-- =====================================================
-- Tracks all Claude API calls and decisions

CREATE TABLE IF NOT EXISTS claude_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Use case
  use_case VARCHAR(50) NOT NULL CHECK (use_case IN (
    'signal_validation',
    'sentiment_analysis',
    'risk_assessment',
    'strategy_review',
    'anomaly_detection'
  )),
  
  -- Request and response data
  request JSONB NOT NULL,
  response JSONB NOT NULL,
  
  -- Performance metrics
  response_time_ms INT,
  cost_credits DECIMAL(5,3),
  
  -- Decision outcome
  decision JSONB,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_claude_decisions_user_date 
  ON claude_decisions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claude_decisions_use_case 
  ON claude_decisions(use_case);

-- =====================================================
-- 3. ORDER CLAUDE DECISIONS TABLE
-- =====================================================
-- Tracks Claude decisions for specific orders

CREATE TABLE IF NOT EXISTS order_claude_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Claude analysis
  signal_validity BOOLEAN,
  confidence DECIMAL(3,2),
  reasoning TEXT,
  adjustments JSONB,
  risk_level VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (order_id) REFERENCES trading_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_claude_decisions_order 
  ON order_claude_decisions(order_id);
CREATE INDEX IF NOT EXISTS idx_order_claude_decisions_user 
  ON order_claude_decisions(user_id);

-- =====================================================
-- 4. CLAUDE USAGE ANALYTICS TABLE
-- =====================================================
-- Tracks usage patterns and costs for billing/optimization

CREATE TABLE IF NOT EXISTS claude_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Time period
  date DATE NOT NULL,
  use_case VARCHAR(50),
  
  -- Metrics
  request_count INT NOT NULL DEFAULT 1,
  avg_response_time_ms DECIMAL(7,2),
  total_cost_usd DECIMAL(8,4),
  success_count INT,
  error_count INT,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Unique index for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS idx_claude_analytics_user_date_usecase 
  ON claude_usage_analytics(user_id, date, use_case);

-- =====================================================
-- 5. ALTER USERS TABLE (if needed)
-- =====================================================
-- Add subscription_tier to users table for quick access

ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- =====================================================
-- 6. GRANT PERMISSIONS (if using roles)
-- =====================================================
-- Uncomment if using database roles

-- GRANT SELECT, INSERT, UPDATE, DELETE ON subscriptions TO app_user;
-- GRANT SELECT, INSERT ON claude_decisions TO app_user;
-- GRANT SELECT, INSERT ON claude_usage_analytics TO app_user;
-- GRANT SELECT, INSERT ON order_claude_decisions TO app_user;

