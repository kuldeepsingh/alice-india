# Professional Backup & Restore Guide - Bot-Trade Platform

## Overview

This guide covers comprehensive backup and restore procedures for the Bot-Trade platform, including database, environment variables, and code state.

---

## Quick Start

### Backup Everything
```bash
cd /Users/kuldeep/projects/openalice-india
bash scripts/backup/backup-all.sh
```

### Restore Database
```bash
bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_YYYYMMDD_HHMMSS.sql.gz bot_trade
```

---

## Backup Strategy

### 1. **Database Backups**
- **What**: PostgreSQL database (bot_trade)
- **How**: Compressed SQL dumps
- **When**: Before major changes, weekly, or on-demand
- **Location**: `backups/database/`
- **Retention**: Last 10 backups automatically kept

**Manual Backup:**
```bash
bash scripts/backup/backup-database.sh bot_trade backups/database
```

**What's Included:**
- ✅ All tables and schemas
- ✅ All data
- ✅ Constraints and indexes
- ✅ User roles and permissions
- ✅ Metadata (checksums, timestamps)

---

### 2. **Environment Variables**
- **What**: .env files from backend and frontend
- **How**: AES-256 encrypted
- **When**: After env changes
- **Location**: `backups/env/`
- **Retention**: Last 5 backups

**Manual Backup:**
```bash
bash scripts/backup/backup-env.sh backups/env
```

**What's Included:**
- ✅ Backend .env (database URL, API keys, secrets)
- ✅ Frontend .env (API configuration)
- ✅ All sensitive configuration

---

### 3. **Git Repository State**
- **What**: Git commit history and branch state
- **How**: Text logs with git information
- **Included Automatically**: In `backup-all.sh`

**Backup File Contents:**
```
- Current branch
- Current commit hash
- Last commit message
- 10 recent commits
- Repository status
```

---

## Restoration Procedures

### Scenario 1: Complete Database Loss

**Step 1: Verify Backup**
```bash
ls -lh backups/database/
# Choose the most recent backup file
```

**Step 2: Stop Application**
```bash
# Kill running processes
pkill -9 node tsx npm

# Stop any active connections
psql -h localhost -U postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'bot_trade';"
```

**Step 3: Restore Database**
```bash
bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_20240609_120000.sql.gz bot_trade
```

**Step 4: Verify Restore**
```bash
psql -h localhost -U postgres -d bot_trade -c "SELECT COUNT(*) FROM users;"
psql -h localhost -U postgres -d bot_trade -c "SELECT COUNT(*) FROM user_api_keys;"
```

**Step 5: Restart Application**
```bash
npm run dev
# Or your usual startup command
```

---

### Scenario 2: Environment Variables Corrupted

**Step 1: List Backups**
```bash
ls -lh backups/env/
# Choose the backup you need
```

**Step 2: Decrypt Backup**
```bash
# The passphrase is the Unix timestamp from when backup was created
# Format: backend_env_TIMESTAMP.enc or frontend_env_TIMESTAMP.enc

TIMESTAMP="20240609_120000"  # Extract from filename
PASSPHRASE="1717948800"      # Unix timestamp (you need to track this)

# Decrypt backend .env
openssl enc -d -aes-256-cbc -in backups/env/backend_env_${TIMESTAMP}.enc -out .env -k "${PASSPHRASE}"

# Decrypt frontend .env
openssl enc -d -aes-256-cbc -in backups/env/frontend_env_${TIMESTAMP}.enc -out admin-dashboard/.env -k "${PASSPHRASE}"
```

**Step 3: Verify Content**
```bash
cat .env
cat admin-dashboard/.env
```

**Step 4: Restart Application**
```bash
pkill -9 node npm
npm run dev
```

---

### Scenario 3: Code Changes Need to be Reverted

**Step 1: Check Git State Backup**
```bash
cat backups/code/git_state_*.txt
```

**Step 2: Revert to Previous Commit**
```bash
cd /Users/kuldeep/projects/openalice-india

# Check current status
git status

# Revert to specific commit (from backup file)
git reset --hard <commit-hash>

# Or revert last N commits
git reset --hard HEAD~1
```

---

## Backup Storage & Security

### ✅ Best Practices

1. **Multiple Locations**
   - ✅ Local backup: `backups/` folder
   - ✅ External drive: Monthly backup to USB
   - ✅ Cloud storage: AWS S3 / Google Drive
   - ✅ Version control: Git (already done)

2. **Encryption**
   - ✅ Database: Can be stored as-is (sensitive data encrypted at rest)
   - ✅ Environment: Already AES-256 encrypted
   - ✅ Transport: Use HTTPS/SSH for cloud uploads

3. **Access Control**
   - ✅ Backup folder: Restrict to `chmod 700`
   - ✅ Cloud storage: Private/authenticated access only
   - ✅ Document passphrase: Store separately from backups

4. **Testing**
   - ✅ Test restore monthly
   - ✅ Keep restore time tracking
   - ✅ Verify data integrity after restore

---

## Automated Backup Schedule

### Option 1: Manual (Recommended for Development)
```bash
# Before major changes
bash scripts/backup/backup-all.sh

# Weekly reminder
# Set calendar reminder to run backup-all.sh
```

### Option 2: Cron Job (Production)
```bash
# Add to crontab: crontab -e
# Daily backup at 2 AM
0 2 * * * cd /Users/kuldeep/projects/openalice-india && bash scripts/backup/backup-all.sh

# Weekly backup (Sunday 3 AM)
0 3 * * 0 cd /Users/kuldeep/projects/openalice-india && bash scripts/backup/backup-all.sh
```

---

## Backup Verification Checklist

**After Each Backup:**
```bash
# 1. Check backup files exist
ls -lh backups/database/*.sql.gz
ls -lh backups/env/*.enc
ls -lh backups/code/*.txt

# 2. Verify sizes are reasonable
du -sh backups/

# 3. Check file integrity
md5 backups/database/bot_trade_backup_*.sql.gz

# 4. Read metadata
cat backups/database/bot_trade_backup_*.metadata
```

**Monthly Test Restore:**
```bash
# 1. Create test database
createdb -h localhost -U postgres -U postgres test_restore

# 2. Try restoring
gunzip -c backups/database/bot_trade_backup_LATEST.sql.gz | psql -h localhost -U postgres -d test_restore

# 3. Verify data
psql -h localhost -U postgres -d test_restore -c "SELECT COUNT(*) FROM users;"

# 4. Drop test database
dropdb -h localhost -U postgres test_restore
```

---

## Emergency Contacts & Documentation

**Keep this information accessible:**
- [ ] Backup location documented
- [ ] Passphrase/keys stored securely
- [ ] Cloud storage credentials noted
- [ ] Restore procedure tested
- [ ] Recovery time objective: _____ hours
- [ ] Recovery point objective: _____ hours

---

## FAQ

### Q: How long does a full backup take?
**A:** Typically 5-30 seconds depending on database size

### Q: Can I restore while the app is running?
**A:** No, you must stop the application first to avoid data conflicts

### Q: How much storage do I need?
**A:** Database: ~50MB per backup (compressed)
   Environment: <1MB per backup
   Keep 10 backups = ~500MB for database alone

### Q: What if I forget the environment encryption passphrase?
**A:** The passphrase is the Unix timestamp from backup creation
   Check the filename or search your backup logs

### Q: Can I backup to cloud storage?
**A:** Yes! After running `backup-all.sh`, upload the backups folder to:
   - AWS S3
   - Google Drive
   - Dropbox
   - Any cloud service

---

## Support

For issues with backup/restore:
1. Check the BACKUP_LOG file in backups/
2. Review error messages carefully
3. Ensure PostgreSQL is running: `psql -h localhost -U postgres -c "SELECT version();"`
4. Verify file permissions: `ls -la backups/`
