-- Migration 011: Create user trading credentials table
-- Stores encrypted Zerodha API credentials per user

CREATE TABLE user_trading_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Encrypted credentials
  api_key_encrypted VARCHAR NOT NULL,
  api_secret_encrypted VARCHAR NOT NULL,
  access_token_encrypted VARCHAR,
  
  -- Metadata
  status VARCHAR DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'expired', 'invalid')),
  last_validated_at TIMESTAMP,
  validation_error VARCHAR,
  
  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  
  -- Encryption key version (for key rotation)
  encryption_key_version INT DEFAULT 1
);

-- Indexes for performance
CREATE INDEX idx_user_trading_credentials_user_id ON user_trading_credentials(user_id);
CREATE INDEX idx_user_trading_credentials_status ON user_trading_credentials(status);
CREATE INDEX idx_user_trading_credentials_last_validated ON user_trading_credentials(last_validated_at);

-- Trigger for updated_at
CREATE TRIGGER update_user_trading_credentials_timestamp
BEFORE UPDATE ON user_trading_credentials
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Function to validate credentials are not empty
CREATE OR REPLACE FUNCTION validate_trading_credentials()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key_encrypted IS NULL OR NEW.api_secret_encrypted IS NULL THEN
    RAISE EXCEPTION 'API key and secret are required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent NULL credentials
CREATE TRIGGER check_trading_credentials_not_empty
BEFORE INSERT OR UPDATE ON user_trading_credentials
FOR EACH ROW
EXECUTE FUNCTION validate_trading_credentials();

COMMENT ON TABLE user_trading_credentials IS 'Encrypted Zerodha API credentials per user';
COMMENT ON COLUMN user_trading_credentials.api_key_encrypted IS 'Encrypted Zerodha API key';
COMMENT ON COLUMN user_trading_credentials.api_secret_encrypted IS 'Encrypted Zerodha API secret';
COMMENT ON COLUMN user_trading_credentials.status IS 'Credential status (active, inactive, expired, invalid)';
COMMENT ON COLUMN user_trading_credentials.last_validated_at IS 'When credentials were last validated with Zerodha';
COMMENT ON COLUMN user_trading_credentials.validation_error IS 'Error message from last validation attempt';
