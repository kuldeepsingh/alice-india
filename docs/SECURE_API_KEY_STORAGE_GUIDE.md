# 🔐 Secure API Key Storage Architecture

## Overview

API keys are now stored securely in an encrypted database instead of the browser's localStorage. This provides enterprise-grade security for your trading system.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Browser (Frontend)                      │
│                                                                 │
│  ⚙️ Settings Page                                               │
│  ├─ User enters Claude API key                                 │
│  └─ User enters Zerodha API key + secret                      │
│                 │                                               │
│                 │ (Send to backend, NOT stored locally)        │
│                 ↓                                               │
│  [Encrypted HTTPS Connection]                                 │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
│                    (Node.js/Express)                            │
│                                                                 │
│  POST /api/v1/user/api-keys                                    │
│  ├─ Receive plaintext key from user                           │
│  ├─ Encrypt using AES-256-CBC                                 │
│  │  ├─ Generate random IV (initialization vector)             │
│  │  ├─ Use master key from environment variable              │
│  │  └─ Produce encrypted ciphertext                           │
│  └─ Pass encrypted data to database                           │
│                 │                                               │
│                 ↓                                               │
├─────────────────────────────────────────────────────────────────┤
│              Database (PostgreSQL)                              │
│                                                                 │
│  Table: user_api_keys                                          │
│  ├─ id: UUID                                                   │
│  ├─ user_id: VARCHAR                                           │
│  ├─ key_type: ENUM ('claude', 'zerodha')                      │
│  ├─ encrypted_value: TEXT (AES-256-CBC encrypted)            │
│  ├─ iv: VARCHAR (initialization vector)                       │
│  ├─ created_at: TIMESTAMP                                      │
│  ├─ updated_at: TIMESTAMP                                      │
│  ├─ last_used_at: TIMESTAMP                                    │
│  └─ deleted_at: TIMESTAMP (soft delete)                        │
│                                                                 │
│  Example Encrypted Entry:                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ user_id: "user123"                                       │ │
│  │ key_type: "claude"                                       │ │
│  │ encrypted_value: "a7f3e9d2c1b8f4a6e8d0c1b3f5a7e9c1..." │ │
│  │ iv: "f3e9d2c1b8f4a6e8d0c1b3f5a7e9c1b8"                 │ │
│  │ created_at: "2026-06-08T14:30:00Z"                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Encryption Details

### Algorithm: AES-256-CBC
- **Key Size**: 256 bits (32 bytes)
- **Cipher Mode**: CBC (Cipher Block Chaining)
- **IV**: 128 bits (16 bytes), randomly generated for each encryption
- **Master Key**: Derived from `API_KEY_ENCRYPTION_KEY` environment variable using PBKDF2

### Encryption Process
```
Plaintext Key (sk-ant-xxxxx...)
        │
        ↓ Encrypt (master key + random IV)
        │
Ciphertext (hex) + IV (hex) → Store in database
```

### Decryption Process (Backend Only)
```
Ciphertext + IV (from database)
        │
        ↓ Decrypt (master key)
        │
Plaintext Key (used internally only)
```

---

## 📋 Backend Endpoints

### 1. Save API Keys (Protected)
```bash
POST /api/v1/user/api-keys
Content-Type: application/json
Authorization: Bearer <token>
X-User-ID: user123

{
  "claudeApiKey": "sk-ant-xxxxxxxxxxxxx",
  "zerodhaApiKey": "your-zerodha-api-key",
  "zerodhaApiSecret": "your-zerodha-api-secret"
}

Response:
{
  "status": "success",
  "message": "API keys stored securely",
  "results": {
    "claude": { "stored": true, "timestamp": "2026-06-08T14:30:00Z" },
    "zerodha": { "stored": true, "timestamp": "2026-06-08T14:30:00Z" }
  }
}
```

### 2. Check Key Status (Protected)
```bash
GET /api/v1/user/api-keys/status
Authorization: Bearer <token>
X-User-ID: user123

Response:
{
  "status": "success",
  "data": {
    "claude": {
      "configured": true,
      "updatedAt": "2026-06-08T14:30:00Z"
    },
    "zerodha": {
      "configured": true,
      "updatedAt": "2026-06-08T14:30:00Z"
    }
  }
}
```

### 3. Delete API Key (Protected)
```bash
DELETE /api/v1/user/api-keys/claude
Authorization: Bearer <token>
X-User-ID: user123

Response:
{
  "status": "success",
  "message": "claude API key deleted"
}
```

### 4. Internal Endpoint (Backend Only)
```bash
POST /api/v1/user/api-keys/internal/get
Content-Type: application/json

{
  "userId": "user123",
  "keyType": "claude"
}

Response:
{
  "status": "success",
  "data": {
    "key": "sk-ant-xxxxxxxxxxxxx",
    "expiresIn": 3600
  }
}
```

---

## 🔒 Security Features

### 1. **At-Rest Encryption**
- Keys are encrypted before saving to database
- Only encrypted values stored
- Cannot be recovered without master key

### 2. **Master Key Management**
```bash
# Set in environment (do NOT hardcode)
export API_KEY_ENCRYPTION_KEY="your-secure-master-key"
```
- Should be 32+ characters
- Store in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate periodically
- Never commit to git

### 3. **In-Transit Encryption**
- All API endpoints use HTTPS (enforced in production)
- TLS 1.3 minimum
- No API keys in URLs or query strings

### 4. **Access Control**
- Only user can access their own keys (via `x-user-id` header)
- Keys never returned to frontend after storage
- Internal endpoints for backend-to-backend only
- Audit trail of all access

### 5. **Soft Deletes**
- Keys marked as deleted, not physically removed
- Maintains audit trail
- Can be recovered if needed

### 6. **Rate Limiting**
- Limit key updates to prevent brute force
- Track failed attempts
- Alert on suspicious activity

---

## 📱 Frontend Implementation

### Before (Insecure - localStorage)
```javascript
// ❌ BAD - Keys exposed to XSS
localStorage.setItem('claudeApiKey', key)
const key = localStorage.getItem('claudeApiKey')
```

### After (Secure - Backend)
```javascript
// ✅ GOOD - Keys never touch browser storage
const saveKeys = async (claudeKey, zerodhaKey, zerodhaSecret) => {
  const response = await fetch('/api/v1/user/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-ID': userId,
    },
    body: JSON.stringify({
      claudeApiKey: claudeKey,
      zerodhaApiKey: zerodhaKey,
      zerodhaApiSecret: zerodhaSecret,
    }),
  })
  
  // Keys are NOT stored locally
  // Backend handles everything
}

const checkStatus = async () => {
  const response = await fetch('/api/v1/user/api-keys/status', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-User-ID': userId,
    },
  })
  
  // Only shows status, not actual keys
  return response.json()
}
```

---

## 🗄️ Database Migration

```sql
-- Create user_api_keys table
CREATE TABLE user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  key_type VARCHAR(50) NOT NULL CHECK (key_type IN ('claude', 'zerodha')),
  encrypted_value TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  salt VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Constraints
  UNIQUE(user_id, key_type) WHERE deleted_at IS NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_user_api_keys_user_id_deleted 
ON user_api_keys(user_id, deleted_at)
WHERE deleted_at IS NULL;

-- Create audit log table
CREATE TABLE api_key_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  key_type VARCHAR(50),
  ip_address INET,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_api_key_audit_user_id 
ON api_key_audit_log(user_id, created_at DESC);
```

---

## ⚙️ Environment Setup

### Development
```bash
# .env
API_KEY_ENCRYPTION_KEY="dev-key-only-for-testing-change-in-production"
```

### Production
```bash
# Use secure vault, NEVER hardcode
# Example with AWS Secrets Manager
export API_KEY_ENCRYPTION_KEY=$(aws secretsmanager get-secret-value --secret-id api-key-encryption-key --query SecretString --output text)
```

---

## 📝 Implementation Checklist

- [ ] Create `user_api_keys` table in database
- [ ] Create `api_key_audit_log` table for audit trail
- [ ] Implement `ApiKeyVaultService` encryption methods
- [ ] Create backend routes (`/api/v1/user/api-keys`)
- [ ] Add authentication middleware
- [ ] Update frontend to use backend endpoints
- [ ] Remove localStorage API key storage
- [ ] Add rate limiting
- [ ] Add audit logging
- [ ] Set up monitoring/alerts
- [ ] Document for ops team
- [ ] Test encryption/decryption
- [ ] Set up secure master key management
- [ ] Deploy to production

---

## 🚨 Security Considerations

### DO ✅
- Use HTTPS in production (TLS 1.3+)
- Store master key in secure vault
- Rotate master key periodically
- Log all API key access
- Monitor for suspicious activity
- Use strong passwords for database
- Implement rate limiting
- Validate all inputs
- Use prepared statements (prevent SQL injection)
- Encrypt database backups

### DON'T ❌
- Hardcode API keys in code
- Commit keys to git (even in comments)
- Log plaintext keys
- Store keys in cookies
- Use weak encryption
- Expose keys in error messages
- Use HTTP (insecure)
- Share master key via email
- Use same key for all environments
- Disable HTTPS validation

---

## 🔍 Monitoring & Auditing

### Key Metrics
- Failed key retrieval attempts
- Unusual access patterns
- Failed decryption attempts
- Keys accessed at unusual times

### Alerts
```
- 5+ failed access attempts in 5 minutes
- Key accessed from new IP address
- Key accessed after hours
- Master key access
```

### Audit Log Query
```sql
SELECT 
  user_id,
  action,
  key_type,
  ip_address,
  created_at
FROM api_key_audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 📞 Support

For questions about secure API key management:
1. Check this guide
2. Review backend implementation
3. Check audit logs
4. Contact security team

---

**Status**: ✅ Architecture Designed | ⏳ Implementation In Progress

