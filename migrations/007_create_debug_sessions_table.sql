-- Migration: 007_create_debug_sessions_table.sql
-- Purpose: Create debug session tracking for per-user debug logging
-- Date: 2026-06-08

CREATE TABLE debug_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enabled_by_admin_id UUID NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  reason TEXT,
  log_level VARCHAR(10) NOT NULL DEFAULT 'DEBUG' CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for optimal query performance
CREATE INDEX idx_debug_sessions_user ON debug_sessions(user_id);
CREATE INDEX idx_debug_sessions_expires ON debug_sessions(expires_at);
CREATE INDEX idx_debug_sessions_admin ON debug_sessions(enabled_by_admin_id);
CREATE INDEX idx_debug_sessions_created_at ON debug_sessions(created_at DESC);

-- Foreign keys
ALTER TABLE debug_sessions ADD CONSTRAINT fk_debug_sessions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE debug_sessions ADD CONSTRAINT fk_debug_sessions_admin_id
  FOREIGN KEY (enabled_by_admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- Function to get active debug session for a user
CREATE OR REPLACE FUNCTION get_user_debug_level(p_user_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
  v_log_level VARCHAR(10);
BEGIN
  SELECT log_level INTO v_log_level
  FROM debug_sessions
  WHERE user_id = p_user_id
    AND expires_at > now()
  LIMIT 1;

  RETURN COALESCE(v_log_level, 'INFO');
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE debug_sessions IS 'Tracks debug sessions for users. When active, logs for that user are captured at DEBUG level';
COMMENT ON COLUMN debug_sessions.user_id IS 'User ID for whom debug mode is enabled';
COMMENT ON COLUMN debug_sessions.enabled_by_admin_id IS 'Admin user ID who enabled debug mode';
COMMENT ON COLUMN debug_sessions.expires_at IS 'When this debug session expires (auto-disable)';
COMMENT ON COLUMN debug_sessions.reason IS 'Reason for enabling debug (e.g., "Investigating issue #123")';
COMMENT ON COLUMN debug_sessions.log_level IS 'Log level for this session (usually DEBUG)';
COMMENT ON FUNCTION get_user_debug_level(UUID) IS 'Get the current log level for a user (DEBUG if active session, INFO otherwise)';
