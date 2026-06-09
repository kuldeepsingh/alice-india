#!/bin/bash

###############################################################################
# Professional Database Backup Script
#
# Purpose: Backup PostgreSQL database with compression and metadata
# Usage: ./backup-database.sh [database_name] [backup_dir]
#
# Features:
# - Full database dump with schema and data
# - Automatic compression (gzip)
# - Timestamped filename
# - Backup metadata (size, timestamp, checksums)
# - Retention policy (keeps last 10 backups)
###############################################################################

set -e

# Configuration
DATABASE_NAME="${1:-bot_trade}"
BACKUP_DIR="${2:-$(pwd)/backups/database}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DATABASE_NAME}_backup_${TIMESTAMP}.sql.gz"
METADATA_FILE="$BACKUP_DIR/${DATABASE_NAME}_backup_${TIMESTAMP}.metadata"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}🔄 Starting database backup...${NC}"
echo "Database: $DATABASE_NAME"
echo "Backup file: $BACKUP_FILE"

# Create backup
if pg_dump -h localhost -U postgres "$DATABASE_NAME" | gzip > "$BACKUP_FILE"; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    CHECKSUM=$(md5 "$BACKUP_FILE" | awk '{print $NF}')

    # Write metadata
    cat > "$METADATA_FILE" << EOF
BACKUP METADATA
===============
Database: $DATABASE_NAME
Timestamp: $TIMESTAMP
File: $(basename "$BACKUP_FILE")
Size: $FILE_SIZE
MD5 Checksum: $CHECKSUM
Compressed: Yes (gzip)
Restore Command: pg_restore -h localhost -U postgres -d $DATABASE_NAME < <(gunzip -c "$BACKUP_FILE")
EOF

    echo -e "${GREEN}✅ Backup successful!${NC}"
    echo "File: $(basename "$BACKUP_FILE")"
    echo "Size: $FILE_SIZE"
    echo "MD5: $CHECKSUM"

    # Retention policy - keep only last 10 backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/${DATABASE_NAME}_backup_*.sql.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Removing old backups (keeping last 10)...${NC}"
        ls -1t "$BACKUP_DIR"/${DATABASE_NAME}_backup_*.sql.gz | tail -n +11 | xargs rm -f
        ls -1t "$BACKUP_DIR"/${DATABASE_NAME}_backup_*.metadata | tail -n +11 | xargs rm -f
    fi

else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backup complete. Metadata saved to $(basename "$METADATA_FILE")${NC}"
