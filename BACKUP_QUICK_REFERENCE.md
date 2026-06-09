# Backup & Restore - Quick Reference

## 🚀 One-Command Backup (Recommended)
```bash
bash scripts/backup/backup-all.sh
```

**Backs up:**
- ✅ PostgreSQL database (bot_trade) → `backups/database/`
- ✅ Environment variables (.env) → `backups/env/`
- ✅ Git repository state → `backups/code/`
- ✅ Detailed backup log → `backups/BACKUP_LOG_*.txt`

---

## 🔧 Individual Backup Commands

### Database Only
```bash
bash scripts/backup/backup-database.sh bot_trade backups/database
```

### Environment Only
```bash
bash scripts/backup/backup-env.sh backups/env
```

---

## ⚡ Emergency Restore

### 1. List Available Backups
```bash
ls -lh backups/database/*.sql.gz
```

### 2. Restore Database
```bash
bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_YYYYMMDD_HHMMSS.sql.gz bot_trade
```

**When prompted:**
- Type `YES` to confirm restore
- All current data will be replaced

### 3. Restore Environment
```bash
# Get the Unix timestamp from the filename
TIMESTAMP="20260609_193418"
PASSPHRASE="1717948800"  # Unix timestamp

# Decrypt .env file
openssl enc -d -aes-256-cbc -in backups/env/backend_env_${TIMESTAMP}.enc -out .env -k "${PASSPHRASE}"
```

---

## 📊 Backup Files Explained

```
backups/
├── database/
│   ├── bot_trade_backup_20260609_193417.sql.gz     ← Database dump (compressed)
│   └── bot_trade_backup_20260609_193417.metadata   ← Backup info & checksum
├── env/
│   ├── backend_env_20260609_193418.enc             ← Encrypted .env
│   └── ENV_BACKUP_INDEX_20260609_193418.txt        ← Backup index
├── code/
│   └── git_state_20260609_193417.txt               ← Git commit snapshot
├── BACKUP_LOG_20260609_193417.txt                  ← Full backup log
```

---

## ✅ Verify Backup

### Check Integrity
```bash
# View metadata
cat backups/database/bot_trade_backup_*.metadata

# Check MD5 checksum
md5 backups/database/bot_trade_backup_*.sql.gz

# View git state
cat backups/code/git_state_*.txt
```

### Test Restore (Monthly)
```bash
# Create test database
createdb -h localhost -U postgres test_restore

# Restore backup
gunzip -c backups/database/bot_trade_backup_LATEST.sql.gz | psql -h localhost -U postgres -d test_restore

# Verify data
psql -h localhost -U postgres -d test_restore -c "SELECT COUNT(*) FROM users;"

# Cleanup
dropdb -h localhost -U postgres test_restore
```

---

## 🔐 Security Checklist

- [ ] Backups stored in secure location
- [ ] Environment backups encrypted
- [ ] Passphrases documented separately
- [ ] Cloud backup copy created
- [ ] Restore tested monthly
- [ ] Old backups (>10 db, >5 env) cleaned up

---

## 📅 Backup Schedule

### Recommended
- **Before major changes**: Manual `bash scripts/backup/backup-all.sh`
- **Weekly**: Automated via cron (see BACKUP_RESTORE_GUIDE.md)
- **Monthly**: Test restore procedure

### Add to Crontab
```bash
# crontab -e
# Daily backup at 2 AM
0 2 * * * cd /Users/kuldeep/projects/openalice-india && bash scripts/backup/backup-all.sh
```

---

## 🆘 Emergency Procedures

### Database Corrupted
1. Run restore: `bash scripts/restore/restore-database.sh backups/database/LATEST.sql.gz bot_trade`
2. Verify: `psql -h localhost -U postgres -d bot_trade -c "SELECT COUNT(*) FROM users;"`
3. Restart app: `npm run dev`

### Lost .env Files
1. Decrypt: `openssl enc -d -aes-256-cbc -in backups/env/backend_env_*.enc -out .env -k PASSPHRASE`
2. Verify: `cat .env`
3. Restart app: `npm run dev`

### Need Previous Code State
1. Check: `cat backups/code/git_state_*.txt`
2. Revert: `git reset --hard COMMIT_HASH`

---

## 📚 Full Guide
See `BACKUP_RESTORE_GUIDE.md` for complete procedures and troubleshooting.

---

**Last Backup:** Run `bash scripts/backup/backup-all.sh` and note the timestamp!
