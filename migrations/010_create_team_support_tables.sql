-- Migration: 010_create_team_support_tables.sql
-- Purpose: Create on-call schedule and notification preferences tables
-- Date: 2026-06-08

-- On-Call Schedule Table
CREATE TABLE on_call_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  shift_type VARCHAR(20) NOT NULL DEFAULT 'daytime' CHECK (shift_type IN ('daytime', 'night', 'weekend', 'full-week')),
  primary_oncall BOOLEAN NOT NULL DEFAULT true,
  backup_oncall BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for on-call schedule
CREATE INDEX idx_oncall_user ON on_call_schedule(user_id);
CREATE INDEX idx_oncall_dates ON on_call_schedule(start_date, end_date);
CREATE INDEX idx_oncall_active ON on_call_schedule(user_id, primary_oncall);

-- Foreign keys for on-call schedule
ALTER TABLE on_call_schedule ADD CONSTRAINT fk_oncall_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Notification Preferences Table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  slack_webhook_url TEXT,
  slack_user_id VARCHAR(255),
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  slack_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  notify_on_incident BOOLEAN NOT NULL DEFAULT true,
  notify_on_assignment BOOLEAN NOT NULL DEFAULT true,
  notify_on_on_call BOOLEAN NOT NULL DEFAULT true,
  notify_on_mention BOOLEAN NOT NULL DEFAULT true,
  digest_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for notification preferences
CREATE INDEX idx_prefs_user ON notification_preferences(user_id);

-- Foreign keys for preferences
ALTER TABLE notification_preferences ADD CONSTRAINT fk_prefs_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update timestamp function for on-call
CREATE OR REPLACE FUNCTION update_oncall_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for on-call timestamp update
CREATE TRIGGER oncall_update_timestamp
BEFORE UPDATE ON on_call_schedule
FOR EACH ROW
EXECUTE FUNCTION update_oncall_timestamp();

-- Update timestamp function for preferences
CREATE OR REPLACE FUNCTION update_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for preferences timestamp update
CREATE TRIGGER prefs_update_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_prefs_timestamp();

-- Comments
COMMENT ON TABLE on_call_schedule IS 'On-call rotation schedule for team members';
COMMENT ON COLUMN on_call_schedule.shift_type IS 'Type of on-call shift: daytime, night, weekend, full-week';
COMMENT ON COLUMN on_call_schedule.primary_oncall IS 'Primary on-call person for this period';
COMMENT ON COLUMN on_call_schedule.backup_oncall IS 'Backup on-call person';

COMMENT ON TABLE notification_preferences IS 'User notification channel preferences and settings';
COMMENT ON COLUMN notification_preferences.slack_webhook_url IS 'Slack incoming webhook URL for notifications';
COMMENT ON COLUMN notification_preferences.digest_frequency IS 'How often to send digest: immediate, daily, weekly';
COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Start of quiet hours (no notifications)';
COMMENT ON COLUMN notification_preferences.quiet_hours_end IS 'End of quiet hours';
