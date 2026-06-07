-- Migration: 009_create_notifications_table.sql
-- Purpose: Create notification tracking table for team alerts
-- Date: 2026-06-08

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('incident', 'assignment', 'comment', 'mention', 'on_call', 'alert')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_incident_id UUID,
  related_error_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for optimal performance
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read);

-- Foreign keys
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_incident_id
  FOREIGN KEY (related_incident_id) REFERENCES incidents(id) ON DELETE SET NULL;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_error_id
  FOREIGN KEY (related_error_id) REFERENCES errors(id) ON DELETE SET NULL;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_notifications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp update
CREATE TRIGGER notifications_update_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_timestamp();

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for team coordination and alerts';
COMMENT ON COLUMN notifications.type IS 'Notification type: incident, assignment, comment, mention, on_call, alert';
COMMENT ON COLUMN notifications.read IS 'Whether user has read this notification';
COMMENT ON COLUMN notifications.read_at IS 'When user marked as read';
