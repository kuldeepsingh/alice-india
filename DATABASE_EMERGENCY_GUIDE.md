# Database Emergency & Manipulation Guide

## 🚨 When to Use This Guide

Use this guide when you encounter:
- ❌ Database corruption
- ❌ Lost or deleted data
- ❌ User authentication issues
- ❌ Orphaned records
- ❌ Performance problems
- ❌ Data inconsistencies
- ❌ Need to manually fix database state

---

## Quick Access: Database Management Script

```bash
bash scripts/db-manage.sh
```

This interactive menu provides 31 different database operations.

---

## Emergency Scenarios & Solutions

### Scenario 1: User Can't Login

**Symptoms:** User reports login failing but account exists

**Steps:**
1. Verify user exists:
   ```bash
   bash scripts/db-manage.sh
   # Select option 7: Find user by email
   ```

2. Check password hash is not NULL:
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
   SELECT id, email, password_hash FROM users WHERE email = 'user@example.com';
   "
   ```

3. If password_hash is empty, reset password:
   ```bash
   bash scripts/db-manage.sh
   # Select option 9: Reset user password
   ```

4. Test login with new password

**Prevention:** Always verify password hash exists when creating users

---

### Scenario 2: Admin User Deleted by Accident

**Symptoms:** Can't access admin panel

**Steps:**

1. **Quick Fix**: Create new admin user:
   ```bash
   bash scripts/db-manage.sh
   # Select option 12: Create test user
   # Then option 11: Change user role to admin
   ```

2. **Or Restore from Backup**:
   ```bash
   # Restore backup (see BACKUP_RESTORE_GUIDE.md)
   bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_*.sql.gz
   ```

3. **Verify admin access**:
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
   SELECT email, role FROM users WHERE role = 'admin';
   "
   ```

---

### Scenario 3: API Keys Missing or Corrupted

**Symptoms:** Claude AI or Zerodha features not working, "API key not found" errors

**Steps:**

1. Check API key status:
   ```bash
   bash scripts/db-manage.sh
   # Select option 13: Show API keys status
   ```

2. View specific user's keys:
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
   SELECT user_id, key_type, created_at, deleted_at
   FROM user_api_keys
   WHERE user_id = 'USER_ID_HERE';
   "
   ```

3. Find orphaned keys (users deleted but keys remain):
   ```bash
   bash scripts/db-manage.sh
   # Select option 14: Find orphaned records
   ```

4. Delete orphaned keys:
   ```bash
   bash scripts/db-manage.sh
   # Select option 18: Remove orphaned API keys
   ```

5. User reconfigures API keys in Settings

---

### Scenario 4: Database Growing Too Large

**Symptoms:** Disk space low, slow queries

**Steps:**

1. Check database size:
   ```bash
   bash scripts/db-manage.sh
   # Select option 3: Show database size
   ```

2. Clean old backups:
   ```bash
   bash scripts/db-manage.sh
   # Select option 19: Clean old backups
   ```

3. Vacuum database (reclaim space):
   ```bash
   bash scripts/db-manage.sh
   # Select option 22: Analyze & vacuum database
   ```

4. Archive old user data if needed:
   ```bash
   bash scripts/db-manage.sh
   # Select option 25: Export user data to CSV
   # Then delete archived users
   ```

---

### Scenario 5: Duplicate User Accounts

**Symptoms:** Multiple accounts with same email, data confusion

**Steps:**

1. Find duplicates:
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
   SELECT email, COUNT(*) as count
   FROM users
   GROUP BY email
   HAVING COUNT(*) > 1;
   "
   ```

2. Review each duplicate:
   ```bash
   psql -h localhost -U postgres -d bot_trade -c "
   SELECT id, email, created_at, role
   FROM users
   WHERE email = 'duplicate@example.com'
   ORDER BY created_at;
   "
   ```

3. Delete duplicates (keep oldest):
   ```bash
   bash scripts/db-manage.sh
   # Select option 10: Delete user
   # Delete the newer duplicate accounts
   ```

---

### Scenario 6: Database Refuses Connections

**Symptoms:** "too many connections", application can't connect

**Steps:**

1. Check active connections:
   ```bash
   bash scripts/db-manage.sh
   # Select option 29: Show active connections
   ```

2. Kill idle connections:
   ```bash
   bash scripts/db-manage.sh
   # Select option 30: Kill idle connections
   ```

3. Restart PostgreSQL if needed:
   ```bash
   # macOS
   brew services restart postgresql
   
   # Linux
   sudo systemctl restart postgresql
   ```

4. Verify connection pool settings in .env

---

### Scenario 7: Data Inconsistency Detected

**Symptoms:** "Column does not exist" errors, missing tables

**Steps:**

1. Check data integrity:
   ```bash
   bash scripts/db-manage.sh
   # Select option 23: Check data integrity
   ```

2. Verify all tables exist:
   ```bash
   bash scripts/db-manage.sh
   # Select option 2: List all tables with row counts
   ```

3. Run VACUUM and ANALYZE:
   ```bash
   bash scripts/db-manage.sh
   # Select option 22: Analyze & vacuum database
   ```

4. If corruption detected, restore from backup:
   ```bash
   bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_LATEST.sql.gz
   ```

---

### Scenario 8: Want to Test Database Changes

**Symptoms:** Need to test queries or data modifications safely

**Steps:**

1. Create temporary test database:
   ```bash
   # Restore latest backup to test_restore
   createdb -h localhost -U postgres test_restore
   gunzip -c backups/database/bot_trade_backup_LATEST.sql.gz | psql -h localhost -U postgres -d test_restore
   ```

2. Run tests on test database:
   ```bash
   psql -h localhost -U postgres -d test_restore
   # Run your test queries
   ```

3. Delete test database:
   ```bash
   dropdb -h localhost -U postgres test_restore
   ```

---

## Database Operations Reference

### Read-Only Operations (Safe)

These don't modify data:

```bash
# View users
psql -h localhost -U postgres -d bot_trade -c "SELECT * FROM users;"

# View API keys
psql -h localhost -U postgres -d bot_trade -c "SELECT * FROM user_api_keys;"

# Check database size
psql -h localhost -U postgres -d bot_trade -c "SELECT pg_size_pretty(pg_database_size('bot_trade'));"

# Find duplicates
psql -h localhost -U postgres -d bot_trade -c "
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
"
```

### Write Operations (Requires Confirmation)

These modify data:

```bash
# Reset password
psql -h localhost -U postgres -d bot_trade -c "
UPDATE users SET password_hash = crypt('newpassword', gen_salt('bf')) 
WHERE email = 'user@example.com';
"

# Change role
psql -h localhost -U postgres -d bot_trade -c "
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
"

# Delete user
psql -h localhost -U postgres -d bot_trade -c "
DELETE FROM users WHERE id = 'USER_ID';
"

# Delete old API keys
psql -h localhost -U postgres -d bot_trade -c "
DELETE FROM user_api_keys WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days';
"
```

---

## Emergency Recovery Procedures

### Complete Database Recovery (from backup)

```bash
# 1. Stop application
pkill -9 node npm tsx

# 2. Kill active connections
psql -h localhost -U postgres -c "
SELECT pg_terminate_backend(pg_stat_activity.pid) 
FROM pg_stat_activity 
WHERE pg_stat_activity.datname = 'bot_trade';
"

# 3. Restore database
bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_LATEST.sql.gz bot_trade

# 4. Verify restore
bash scripts/db-manage.sh
# Select option 1: Database health check

# 5. Restart application
npm run dev
```

### User Data Recovery

If user data was deleted:

```bash
# 1. Restore backup to temporary database
createdb -h localhost -U postgres bot_trade_recovery
gunzip -c backups/database/bot_trade_backup_BEFORE_DELETE.sql.gz | psql -h localhost -U postgres -d bot_trade_recovery

# 2. Export deleted user data
psql -h localhost -U postgres -d bot_trade_recovery -c "
\COPY (SELECT * FROM users WHERE email = 'deleted@example.com') TO STDOUT WITH (FORMAT csv, HEADER true)
"

# 3. Re-import to main database
# ... or manually recreate user

# 4. Cleanup
dropdb -h localhost -U postgres bot_trade_recovery
```

---

## Manual Database Fixes (Advanced)

### Add Missing Column

```bash
psql -h localhost -U postgres -d bot_trade -c "
ALTER TABLE users ADD COLUMN new_column VARCHAR(255) DEFAULT NULL;
"
```

### Rename Column

```bash
psql -h localhost -U postgres -d bot_trade -c "
ALTER TABLE users RENAME COLUMN old_name TO new_name;
"
```

### Rebuild Sequences

```bash
psql -h localhost -U postgres -d bot_trade -c "
SELECT pg_catalog.setval('users_id_seq', (SELECT MAX(id) FROM users));
"
```

### Force Delete Data (Dangerous!)

```bash
# Delete all users and cascade
psql -h localhost -U postgres -d bot_trade -c "
DELETE FROM users CASCADE;
"

# Reset to known-good state
bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_LATEST.sql.gz
```

---

## Prevention & Best Practices

### ✅ Do This

- ✅ Backup before major changes
- ✅ Test changes on test database first
- ✅ Keep detailed change logs
- ✅ Use transactions for multi-step changes
- ✅ Monitor backups are working
- ✅ Review schema changes
- ✅ Use soft deletes (set deleted_at instead of DELETE)

### ❌ Don't Do This

- ❌ Run DELETE without WHERE clause
- ❌ Modify database directly without backup
- ❌ Drop tables without backup
- ❌ Ignore database warnings
- ❌ Skip integrity checks
- ❌ Leave idle connections open
- ❌ Store unencrypted secrets

---

## Useful SQL Queries

### Find Size of Each Table
```sql
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Find Unused Indexes
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelname) DESC;
```

### Find Slow Queries
```sql
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Find Orphaned Records
```sql
-- API keys without users
SELECT ak.* FROM user_api_keys ak
LEFT JOIN users u ON ak.user_id = u.id
WHERE u.id IS NULL;
```

---

## When to Restore from Backup

**Always restore from backup if:**
- ❌ Multiple tables corrupted
- ❌ Critical data deleted by accident
- ❌ Database file corrupted
- ❌ Can't fix with SQL queries
- ❌ Uncertain what went wrong

**Time to restore:** ~5 minutes from backup

---

## Getting Help

If you're stuck:

1. **Check the logs:**
   ```bash
   bash scripts/db-manage.sh
   # Select option 31: View logs
   ```

2. **Run health check:**
   ```bash
   bash scripts/db-manage.sh
   # Select option 1: Database health check
   ```

3. **Export data as backup:**
   ```bash
   bash scripts/db-manage.sh
   # Select option 25: Export user data to CSV
   ```

4. **Restore from latest backup:**
   ```bash
   bash scripts/restore/restore-database.sh backups/database/bot_trade_backup_LATEST.sql.gz
   ```

---

## Emergency Contact Info

**Database Location:** PostgreSQL on localhost  
**Database Name:** bot_trade  
**Backup Location:** `backups/database/`  
**Latest Backup:** `backups/database/bot_trade_backup_LATEST.sql.gz`  
**Database Log:** `/tmp/db-manage-*.log`

**Keep accessible:**
- [ ] Database password
- [ ] Backup location
- [ ] Recovery procedures
- [ ] Contact for database admin
