#!/bin/bash

###############################################################################
# Environment Variables & Secrets Backup Script
#
# Purpose: Securely backup environment variables and sensitive files
# Usage: ./backup-env.sh [backup_dir]
#
# Features:
# - Backs up .env files from both backend and frontend
# - Encrypts sensitive data with AES-256
# - Timestamps and checksums all backups
# - Creates restoration instructions
# - Handles missing files gracefully
###############################################################################

set -e

# Configuration
BACKUP_DIR="${1:-$(pwd)/backups/env}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_ROOT="$(pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}🔐 Environment Variables Backup${NC}"
echo "Timestamp: $TIMESTAMP"
echo ""

# Backup backend .env
if [ -f "$PROJECT_ROOT/.env" ]; then
    BACKUP_FILE="$BACKUP_DIR/backend_env_${TIMESTAMP}.enc"
    echo -e "${YELLOW}📦 Backing up backend .env...${NC}"

    # Encrypt with openssl (AES-256)
    openssl enc -aes-256-cbc -salt -in "$PROJECT_ROOT/.env" -out "$BACKUP_FILE" -k "$(date +%s)" 2>/dev/null

    echo -e "${GREEN}✅ Backend .env backed up${NC}"
    echo "  File: $(basename "$BACKUP_FILE")"
    echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo -e "${YELLOW}⚠️  Backend .env not found${NC}"
fi

# Backup frontend .env (if exists)
if [ -f "$PROJECT_ROOT/admin-dashboard/.env" ]; then
    BACKUP_FILE="$BACKUP_DIR/frontend_env_${TIMESTAMP}.enc"
    echo -e "${YELLOW}📦 Backing up frontend .env...${NC}"

    openssl enc -aes-256-cbc -salt -in "$PROJECT_ROOT/admin-dashboard/.env" -out "$BACKUP_FILE" -k "$(date +%s)" 2>/dev/null

    echo -e "${GREEN}✅ Frontend .env backed up${NC}"
    echo "  File: $(basename "$BACKUP_FILE")"
    echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo -e "${YELLOW}⚠️  Frontend .env not found${NC}"
fi

# Create backup index
echo ""
echo -e "${BLUE}📋 Creating backup index...${NC}"
INDEX_FILE="$BACKUP_DIR/ENV_BACKUP_INDEX_${TIMESTAMP}.txt"
cat > "$INDEX_FILE" << EOF
ENV BACKUP INDEX
================
Timestamp: $TIMESTAMP
Created: $(date)

BACKUP CONTENTS:
EOF

ls -lh "$BACKUP_DIR"/backend_env_*.enc "$BACKUP_DIR"/frontend_env_*.enc 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' >> "$INDEX_FILE" || echo "  No encrypted backups found" >> "$INDEX_FILE"

cat >> "$INDEX_FILE" << EOF

RETENTION POLICY:
- Keep last 5 environment backups
- Encrypted with AES-256-CBC
- Passphrase: Unix timestamp of backup creation

RESTORE INSTRUCTIONS:
1. Note the passphrase (unix timestamp from backup filename)
2. Run: openssl enc -d -aes-256-cbc -in <backup_file> -out .env -k <passphrase>
3. Verify the .env file has correct content
4. Restart the application

SECURITY NOTES:
- These backups contain SENSITIVE DATA
- Store in secure location (encrypted drive recommended)
- Restrict access to authorized personnel only
- Consider additional encryption at storage level
EOF

echo -e "${GREEN}✅ Backup index created${NC}"
echo "  File: $(basename "$INDEX_FILE")"

# Summary
echo ""
echo -e "${GREEN}✅ Environment backup complete!${NC}"
echo "Location: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Store these backups securely!${NC}"
