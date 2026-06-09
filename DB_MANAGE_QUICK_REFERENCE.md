# Database Management Script - Quick Reference

## Launch the Interactive Tool

```bash
bash scripts/db-manage.sh
```

An interactive menu appears with 31 database operations.

---

## Menu Options Quick Lookup

### 🔍 **INSPECTION & HEALTH CHECKS** (Options 1-5)

| Option | Command | Use Case |
|--------|---------|----------|
| **1** | Database health check | Check if DB is OK |
| **2** | List tables with counts | See all tables and row counts |
| **3** | Show database size | Check disk usage |
| **4** | Show table structure | View schema |
| **5** | Show indexes | See database indexes |

**Example:** User reports slow performance
→ Use options 2-3 to check size and 22 (vacuum)

---

### 👤 **USER MANAGEMENT** (Options 6-12)

| Option | Command | Use Case |
|--------|---------|----------|
| **6** | List all users | View all accounts |
| **7** | Find user by email | Search for specific user |
| **8** | Show user details | View complete user info |
| **9** | Reset user password | Fix login issues |
| **10** | Delete user | Remove account |
| **11** | Change user role | Make admin/trader/etc |
| **12** | Create test user | Generate test account |

**Example:** User forgot password
→ Use option 9 (Reset password)

**Example:** Admin deleted accidentally
→ Use option 12 (Create test user) + option 11 (Make admin)

---

### 🔧 **DATA INSPECTION & QUERIES** (Options 13-16)

| Option | Command | Use Case |
|--------|---------|----------|
| **13** | Show API keys status | Check Claude/Zerodha setup |
| **14** | Find orphaned records | Detect data corruption |
| **15** | Show recent orders | View latest transactions |
| **16** | Custom SQL query | Run any SQL command |

**Example:** Claude AI not working
→ Use option 13 (Check API keys)

**Example:** Need specific data
→ Use option 16 (Custom query)

---

### 🧹 **DATA CLEANUP & REPAIR** (Options 17-20)

| Option | Command | Use Case |
|--------|---------|----------|
| **17** | Delete duplicate users | Remove duplicate accounts |
| **18** | Remove orphaned keys | Clean up deleted users' keys |
| **19** | Clean old backups | Free disk space |
| **20** | Reset sequences | Fix auto-increment issues |

**Example:** Disk space low
→ Use option 19 (Clean backups) + 22 (Vacuum)

---

### 🚨 **EMERGENCY RECOVERY** (Options 21-24)

| Option | Command | Use Case |
|--------|---------|----------|
| **21** | Rebuild constraints | Fix data relationships |
| **22** | Analyze & vacuum | Optimize & reclaim space |
| **23** | Check integrity | Find data problems |
| **24** | Restore deleted data | Recover lost data |

**Example:** Database corrupted
→ Use option 23 first, then restore from backup

---

### 💾 **EXPORT & IMPORT** (Options 25-27)

| Option | Command | Use Case |
|--------|---------|----------|
| **25** | Export user data (CSV) | Backup user list |
| **26** | Export API keys | Backup credentials |
| **27** | Import user data | Restore from CSV |

**Example:** Need data export for analysis
→ Use option 25

---

### ℹ️ **UTILITIES** (Options 28-31)

| Option | Command | Use Case |
|--------|---------|----------|
| **28** | Show all databases | List PostgreSQL databases |
| **29** | Show connections | See who's connected |
| **30** | Kill idle connections | Free up connections |
| **31** | View logs | Review operation history |

**Example:** "Too many connections" error
→ Use option 30 (Kill idle connections)

---

## Emergency Procedures

### User Can't Login

```
1. Run db-manage.sh
2. Select 7: Find user by email
3. If password_hash is empty:
   - Select 9: Reset user password
4. User tries logging in again
```

### API Keys Not Working

```
1. Run db-manage.sh
2. Select 13: Show API keys status
3. Verify key exists and is active
4. If missing/deleted:
   - User reconfigures in Settings
```

### Database Slow/Large

```
1. Run db-manage.sh
2. Select 3: Show database size
3. Select 19: Clean old backups (if needed)
4. Select 22: Analyze & vacuum database
5. Wait 5-10 minutes
```

### Duplicate Users

```
1. Run db-manage.sh
2. Select 6: List all users
3. Select 7: Find user by email (search for duplicates)
4. Select 10: Delete user (remove duplicate)
5. Keep oldest account
```

### Database Integrity Issues

```
1. Run db-manage.sh
2. Select 23: Check data integrity
3. Review output for violations
4. If critical: Restore from backup (see BACKUP_RESTORE_GUIDE.md)
```

---

## Common SQL Patterns

You can use option 16 (Custom SQL query) with these:

### Find all users
```sql
SELECT id, email, role, created_at FROM users;
```

### Find specific user
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Count records
```sql
SELECT COUNT(*) FROM users;
```

### Find duplicates
```sql
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
```

### Show API keys for user
```sql
SELECT * FROM user_api_keys WHERE user_id = 'USER_ID_HERE';
```

### Delete all API keys for user (careful!)
```sql
DELETE FROM user_api_keys WHERE user_id = 'USER_ID_HERE';
```

---

## Safety Tips

✅ **Safe Operations:**
- Options 1-8: Read-only, no changes
- Option 13-15: Read-only, no changes
- Option 29: Read-only, no changes

⚠️ **Caution Operations:**
- Option 9: Changes password
- Option 11: Changes role
- Option 17-20: May delete data

❌ **Dangerous Operations:**
- Option 10: Permanently deletes user
- Option 16: Any SQL query you write

---

## When Each Option is Most Useful

| Situation | Use Option |
|-----------|-----------|
| Check if database OK | 1 |
| See what's in database | 2, 6 |
| User can't login | 7, 9 |
| Need admin account | 12, 11 |
| API keys not working | 13 |
| Data seems corrupted | 14, 23 |
| Database too large | 3, 19, 22 |
| Duplicate accounts | 6, 17 |
| Need to see connections | 29 |
| Running custom query | 16 |

---

## Full Documentation

For complete procedures and scenarios, see:
- **DATABASE_EMERGENCY_GUIDE.md** - Full emergency procedures
- **BACKUP_RESTORE_GUIDE.md** - How to restore from backup

---

## Example Session

```
$ bash scripts/db-manage.sh

[Menu appears]

> 6          # List all users
[Shows 5 users]

> 7          # Find user by email
Email: admin@bot-trade.com
[Shows admin user details]

> 13         # Check API keys
[Shows Claude key is active]

> 31         # View logs
[Shows operation history]

> 0          # Exit
```

---

## Keyboard Shortcuts

- **Ctrl+C** - Exit menu at any time
- **Tab** - Auto-complete in SQL queries
- **↑ ↓** - Navigate menu options

---

## Getting Help

Each option shows:
1. What it does
2. The result
3. Any issues found

If you're unsure:
- Select option 1 (Health check)
- Read the output
- Reference DATABASE_EMERGENCY_GUIDE.md

---

**All operations are logged to:** `/tmp/db-manage-*.log`

Check the log if you need to review what was done!
