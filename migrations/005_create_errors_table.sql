-- Migration: 005_create_errors_table.sql
-- Purpose: Create error tracking and grouping table
-- Date: 2026-06-08

CREATE TABLE errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_hash VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT NOT NULL,
  first_occurrence TIMESTAMP NOT NULL DEFAULT now(),
  last_occurrence TIMESTAMP NOT NULL DEFAULT now(),
  occurrence_count INT NOT NULL DEFAULT 1,
  affected_users INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved')),
  assigned_to UUID,
  context JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for optimal query performance
CREATE INDEX idx_errors_hash ON errors(error_hash);
CREATE INDEX idx_errors_status ON errors(status);
CREATE INDEX idx_errors_occurrence ON errors(last_occurrence DESC);
CREATE INDEX idx_errors_created_at ON errors(created_at DESC);
CREATE INDEX idx_errors_affected_users ON errors(affected_users DESC);
CREATE INDEX idx_errors_assigned_to ON errors(assigned_to);

-- Partial indexes for active errors
CREATE INDEX idx_errors_active ON errors(created_at DESC) WHERE status != 'resolved';
CREATE INDEX idx_errors_unassigned ON errors(created_at DESC) WHERE assigned_to IS NULL AND status != 'resolved';

-- Foreign key to users table for assigned_to
ALTER TABLE errors ADD CONSTRAINT fk_errors_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_errors_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER errors_update_timestamp
BEFORE UPDATE ON errors
FOR EACH ROW
EXECUTE FUNCTION update_errors_timestamp();

-- Comments for documentation
COMMENT ON TABLE errors IS 'Grouped errors for tracking and resolution. Errors with same signature are grouped together';
COMMENT ON COLUMN errors.error_hash IS 'SHA256 hash of error message and first 3 stack frames - used for grouping';
COMMENT ON COLUMN errors.occurrence_count IS 'Total times this error has occurred';
COMMENT ON COLUMN errors.affected_users IS 'Number of unique users affected by this error';
COMMENT ON COLUMN errors.status IS 'Error status: new (unreviewed), investigating (being worked on), resolved (fixed)';
COMMENT ON COLUMN errors.assigned_to IS 'User ID of developer assigned to fix this error';
