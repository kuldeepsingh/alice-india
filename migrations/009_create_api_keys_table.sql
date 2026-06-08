/**
 * Migration: Create API Keys Storage Tables
 * 
 * Creates secure encrypted storage for user API keys:
 * - user_api_keys: Stores encrypted API keys
 * - api_key_audit_log: Tracks all access for audit trail
 */

-- Create ENUM for key types
CREATE TYPE api_key_type AS ENUM ('claude', 'zerodha');
CREATE TYPE audit_action AS ENUM ('stored', 'accessed', 'deleted', 'failed');

-- Create user_api_keys table for encrypted API key storage
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  key_type api_key_type NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  salt VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_user_key_type UNIQUE (user_id, key_type) WHERE deleted_at IS NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for user_id lookups
CREATE INDEX idx_user_api_keys_user_id_deleted 
ON user_api_keys(user_id, deleted_at)
WHERE deleted_at IS NULL;

-- Create index for key_type lookups
CREATE INDEX idx_user_api_keys_key_type 
ON user_api_keys(key_type)
WHERE deleted_at IS NULL;

-- Create index for last_used_at to track usage
CREATE INDEX idx_user_api_keys_last_used 
ON user_api_keys(last_used_at DESC)
WHERE deleted_at IS NULL;

-- Create audit log table
CREATE TABLE IF NOT EXISTS api_key_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action audit_action NOT NULL,
  key_type api_key_type,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for user_id and time (most common query)
CREATE INDEX idx_api_key_audit_user_created 
ON api_key_audit_log(user_id, created_at DESC);

-- Create index for action type
CREATE INDEX idx_api_key_audit_action 
ON api_key_audit_log(action);

-- Create index for failed attempts (security monitoring)
CREATE INDEX idx_api_key_audit_failed 
ON api_key_audit_log(user_id, created_at DESC)
WHERE status = 'failed';

-- Add comment to tables for documentation
COMMENT ON TABLE user_api_keys IS 'Stores encrypted API keys for users. Keys are AES-256-CBC encrypted.';
COMMENT ON COLUMN user_api_keys.encrypted_value IS 'AES-256-CBC encrypted key value in hex format';
COMMENT ON COLUMN user_api_keys.iv IS 'Initialization vector in hex format, unique per encryption';
COMMENT ON TABLE api_key_audit_log IS 'Audit trail for all API key operations. Used for security monitoring and compliance.';
COMMENT ON COLUMN api_key_audit_log.ip_address IS 'Source IP address of the request';
COMMENT ON COLUMN api_key_audit_log.status IS 'success or failed';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_api_keys_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp update
DROP TRIGGER IF EXISTS trigger_update_user_api_keys_timestamp ON user_api_keys;
CREATE TRIGGER trigger_update_user_api_keys_timestamp
BEFORE UPDATE ON user_api_keys
FOR EACH ROW
EXECUTE FUNCTION update_user_api_keys_timestamp();

-- Grant permissions (if using role-based access)
-- GRANT SELECT, INSERT, UPDATE ON user_api_keys TO app_user;
-- GRANT SELECT ON api_key_audit_log TO app_user;

