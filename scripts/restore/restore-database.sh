#!/bin/bash

###############################################################################
# Professional Database Restore Script
#
# Purpose: Restore PostgreSQL database from backup
# Usage: ./restore-database.sh <backup_file> [database_name]
#
# Features:
# - Validates backup file exists and integrity
# - Creates fresh database or clears existing
# - Full restore from compressed backup
# - Automatic error handling
# - Pre-restore validation
###############################################################################

set -e

# Configuration
BACKUP_FILE="${1}"
DATABASE_NAME="${2:-bot_trade}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Usage: ./restore-database.sh <backup_file> [database_name]${NC}"
    echo "Example: ./restore-database.sh bot_trade_backup_20240609_120000.sql.gz bot_trade"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if file is gzipped
if ! file "$BACKUP_FILE" | grep -q "gzip compressed"; then
    echo -e "${RED}❌ File is not gzip compressed. Expected: .sql.gz${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Backup Validation${NC}"
echo "Backup file: $(basename "$BACKUP_FILE")"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "MD5: $(md5 "$BACKUP_FILE" | awk '{print $NF}')"

# List available backups for reference
BACKUP_DIR=$(dirname "$BACKUP_FILE")
echo ""
echo -e "${BLUE}📋 Available backups in $BACKUP_DIR:${NC}"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print $9, "(" $5 ")"}' | nl || echo "No backups found"

# Confirmation
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will restore the database '$DATABASE_NAME'${NC}"
echo -e "${YELLOW}All current data in '$DATABASE_NAME' will be REPLACED!${NC}"
read -p "Type 'YES' to confirm restore: " confirm

if [ "$confirm" != "YES" ]; then
    echo -e "${RED}Restore cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🔄 Starting restore process...${NC}"

# Step 1: Check if database exists and drop it
echo "Step 1: Preparing database..."
if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DATABASE_NAME"; then
    echo "  - Dropping existing database '$DATABASE_NAME'..."
    dropdb -h localhost -U postgres "$DATABASE_NAME" || true
    sleep 1
fi

# Step 2: Create fresh database
echo "  - Creating fresh database '$DATABASE_NAME'..."
createdb -h localhost -U postgres "$DATABASE_NAME"
sleep 1

# Step 3: Restore from backup
echo "Step 2: Restoring data from backup..."
if gunzip -c "$BACKUP_FILE" | psql -h localhost -U postgres -d "$DATABASE_NAME"; then
    echo -e "${GREEN}✅ Restore successful!${NC}"

    # Step 4: Verify restore
    echo "Step 3: Verifying restore..."
    TABLE_COUNT=$(psql -h localhost -U postgres -d "$DATABASE_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | grep -oP '\d+')
    echo "  - Tables created: $TABLE_COUNT"

    echo ""
    echo -e "${GREEN}✅ Database restore complete!${NC}"
    echo "Database: $DATABASE_NAME"
    echo "Restored from: $(basename "$BACKUP_FILE")"

else
    echo -e "${RED}❌ Restore failed!${NC}"
    echo "Attempting to cleanup..."
    dropdb -h localhost -U postgres "$DATABASE_NAME" || true
    exit 1
fi
