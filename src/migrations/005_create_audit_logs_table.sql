-- Migration: Create audit_logs table for immutable audit trail
-- Date: 2026-06-10

-- Enable extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(255),
  resource_id VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  immutable BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT audit_logs_status_check CHECK (status IN ('success', 'failure', 'warning'))
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);

-- Add comment to table
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all user actions and system events';
COMMENT ON COLUMN audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., login, create_order, update_settings)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., order, portfolio, account)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN audit_logs.old_value IS 'Previous value of the resource (as JSON)';
COMMENT ON COLUMN audit_logs.new_value IS 'New value of the resource (as JSON)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user who made the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the browser/client';
COMMENT ON COLUMN audit_logs.status IS 'Status of the action (success, failure, warning)';
COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the action occurred';
COMMENT ON COLUMN audit_logs.immutable IS 'Flag indicating this log entry cannot be modified';
