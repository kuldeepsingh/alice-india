-- Migration: 006_create_audit_logs_table.sql
-- Purpose: Create immutable audit trail for compliance and security
-- Date: 2026-06-08

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  immutable BOOLEAN NOT NULL DEFAULT true
);

-- Indexes for optimal query performance
CREATE INDEX idx_audit_user_timestamp ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Partial indexes for specific actions
CREATE INDEX idx_audit_login ON audit_logs(created_at DESC) WHERE action = 'login';
CREATE INDEX idx_audit_logout ON audit_logs(created_at DESC) WHERE action = 'logout';
CREATE INDEX idx_audit_permission_change ON audit_logs(created_at DESC) WHERE action = 'permission_changed';

-- Audit trigger - prevent deletion of immutable logs
CREATE OR REPLACE FUNCTION prevent_audit_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.immutable = true THEN
    RAISE EXCEPTION 'Cannot delete immutable audit log';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_prevent_deletion
BEFORE DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_deletion();

-- Audit trigger - prevent update of immutable logs
CREATE OR REPLACE FUNCTION prevent_audit_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.immutable = true THEN
    RAISE EXCEPTION 'Cannot update immutable audit log';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_prevent_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_update();

-- Foreign key to users table
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for compliance. Records all significant user actions and system changes';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: login, logout, create, update, delete, permission_changed, debug_enabled, etc';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected: user, order, account, etc';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the resource that was affected';
COMMENT ON COLUMN audit_logs.old_value IS 'Previous value (for update actions)';
COMMENT ON COLUMN audit_logs.new_value IS 'New value (for update/create actions)';
COMMENT ON COLUMN audit_logs.immutable IS 'If true, this log cannot be modified or deleted (for compliance)';
