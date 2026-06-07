-- Migration: 004_create_logs_table.sql
-- Purpose: Create structured logging table for all application logs
-- Date: 2026-06-08

CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL DEFAULT now(),
  level VARCHAR(10) NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
  message TEXT NOT NULL,
  user_id UUID,
  correlation_id UUID,
  module VARCHAR(50),
  context JSONB,
  stack_trace TEXT,
  request_id UUID,
  session_id UUID,
  ip_address INET,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for optimal query performance
CREATE INDEX idx_logs_user_timestamp ON logs(user_id, created_at DESC);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_module ON logs(module);
CREATE INDEX idx_logs_correlation_id ON logs(correlation_id);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);

-- Partial indexes for frequently queried error logs
CREATE INDEX idx_logs_error ON logs(created_at DESC) WHERE level IN ('ERROR', 'FATAL');

-- Foreign key to users table (optional, for data integrity)
ALTER TABLE logs ADD CONSTRAINT fk_logs_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Comment for documentation
COMMENT ON TABLE logs IS 'Structured application logs with support for filtering by level, user, module, and correlation ID';
COMMENT ON COLUMN logs.correlation_id IS 'Trace ID for tracking requests across services';
COMMENT ON COLUMN logs.context IS 'JSON object containing additional context data';
