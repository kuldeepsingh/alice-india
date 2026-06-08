-- Migration 010: Create database utility functions
-- Functions used by triggers across the database

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to raise an error from a trigger
CREATE OR REPLACE FUNCTION raise_error(message TEXT)
RETURNS VOID AS $$
BEGIN
  RAISE EXCEPTION '%', message;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_timestamp() IS 'Automatically updates the updated_at column to current timestamp';
COMMENT ON FUNCTION raise_error(TEXT) IS 'Raises an error from a trigger with a custom message';
