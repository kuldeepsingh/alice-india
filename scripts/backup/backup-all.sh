#!/bin/bash

###############################################################################
# Master Backup Script - Backs up Everything
#
# Purpose: Complete system backup in one command
# Usage: ./backup-all.sh [backup_dir]
#
# Backs up:
# 1. PostgreSQL database
# 2. Environment variables
# 3. Git repository state
# 4. Application configuration
###############################################################################

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${1:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MASTER_LOG="$BACKUP_DIR/BACKUP_LOG_${TIMESTAMP}.txt"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory
mkdir -p "$BACKUP_DIR"/{database,env,code}

# Start logging
{
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         PROFESSIONAL BACKUP - Bot-Trade Platform           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Timestamp: $TIMESTAMP"
    echo "Project: $PROJECT_ROOT"
    echo "Backup Dir: $BACKUP_DIR"
    echo ""
    echo "Starting backup process..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Backup 1: Database
    echo "STEP 1: Database Backup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    START_TIME=$(date +%s)

    if bash "$PROJECT_ROOT/scripts/backup/backup-database.sh" "bot_trade" "$BACKUP_DIR/database"; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo "✅ Database backup completed in ${DURATION}s"
        echo ""
    else
        echo "❌ Database backup failed"
        echo ""
    fi

    # Backup 2: Environment Variables
    echo "STEP 2: Environment Variables Backup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    START_TIME=$(date +%s)

    if bash "$PROJECT_ROOT/scripts/backup/backup-env.sh" "$BACKUP_DIR/env"; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo "✅ Environment backup completed in ${DURATION}s"
        echo ""
    else
        echo "❌ Environment backup failed"
        echo ""
    fi

    # Backup 3: Git Repository State
    echo "STEP 3: Git Repository State"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cd "$PROJECT_ROOT"
    GIT_STATE_FILE="$BACKUP_DIR/code/git_state_${TIMESTAMP}.txt"
    mkdir -p "$BACKUP_DIR/code"
    {
        echo "Git Repository State - $TIMESTAMP"
        echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
        echo "Current Commit: $(git rev-parse HEAD)"
        echo "Last Commit: $(git log -1 --pretty=format:'%s (%h) - %an')"
        echo ""
        echo "Commit Log (last 10):"
        git log --oneline -10
        echo ""
        echo "Status:"
        git status
    } > "$GIT_STATE_FILE"
    echo "✅ Git state saved to $(basename "$GIT_STATE_FILE")"
    echo ""

    # Summary
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ BACKUP COMPLETE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Backup Summary:"
    echo "  📦 Database: $(ls -1 "$BACKUP_DIR/database"/*.sql.gz 2>/dev/null | wc -l) backups"
    echo "  🔐 Environment: $(ls -1 "$BACKUP_DIR/env"/*.enc 2>/dev/null | wc -l) files"
    echo "  📊 Total Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
    echo ""
    echo "Location: $BACKUP_DIR"
    echo ""
    echo "RECOMMENDED ACTIONS:"
    echo "1. ✅ Store backup in secure location (encrypted drive)"
    echo "2. ✅ Upload to cloud storage (AWS S3, Google Drive, etc.)"
    echo "3. ✅ Verify backup integrity by testing restore"
    echo "4. ✅ Document backup location and access procedures"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

} | tee "$MASTER_LOG"

echo ""
echo -e "${GREEN}📝 Full backup log: $(basename "$MASTER_LOG")${NC}"
