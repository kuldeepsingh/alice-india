-- Migration: 008_create_incidents_table.sql
-- Purpose: Create incident tracking table for team coordination
-- Date: 2026-06-08

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  severity VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_by UUID NOT NULL,
  assigned_to UUID,
  related_error_id UUID,
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for optimal performance
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_assigned ON incidents(assigned_to);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);
CREATE INDEX idx_incidents_error ON incidents(related_error_id);

-- Foreign keys
ALTER TABLE incidents ADD CONSTRAINT fk_incidents_created_by
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE incidents ADD CONSTRAINT fk_incidents_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE incidents ADD CONSTRAINT fk_incidents_error_id
  FOREIGN KEY (related_error_id) REFERENCES errors(id) ON DELETE SET NULL;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_incidents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp update
CREATE TRIGGER incidents_update_timestamp
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION update_incidents_timestamp();

-- Comments
COMMENT ON TABLE incidents IS 'Core incident tracking for team coordination and error management';
COMMENT ON COLUMN incidents.status IS 'Incident workflow: open → investigating → resolved → closed';
COMMENT ON COLUMN incidents.severity IS 'Impact level: low, medium, high, critical';
COMMENT ON COLUMN incidents.assigned_to IS 'Developer assigned to resolve this incident';
COMMENT ON COLUMN incidents.related_error_id IS 'Link to related error for context';
