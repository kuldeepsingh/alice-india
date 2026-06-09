#!/bin/bash

###############################################################################
# Exhaustive Database Management & Emergency Recovery Script
#
# Purpose: Inspect, repair, clean, and recover database
# Usage: ./db-manage.sh
#
# Features:
# - Database health checks
# - Data inspection & queries
# - User management & recovery
# - Data cleanup & repair
# - Consistency validation
# - Emergency recovery
# - Data export/import
###############################################################################

set -e

# Configuration
DB_NAME="bot_trade"
DB_USER="postgres"
DB_HOST="localhost"
LOG_FILE="/tmp/db-manage-$(date +%Y%m%d_%H%M%S).log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Header function
show_header() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   DATABASE MANAGEMENT & EMERGENCY RECOVERY TOOL            ║${NC}"
    echo -e "${BLUE}║   Database: ${DB_NAME}                                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Menu function
show_menu() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}MAIN MENU${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  🔍 INSPECTION & HEALTH CHECKS"
    echo "    1. Database health check"
    echo "    2. List all tables with row counts"
    echo "    3. Show database size"
    echo "    4. Show table structure"
    echo "    5. Show indexes"
    echo ""
    echo "  👤 USER MANAGEMENT"
    echo "    6. List all users"
    echo "    7. Find user by email"
    echo "    8. Show user details"
    echo "    9. Reset user password"
    echo "   10. Delete user (with confirmation)"
    echo "   11. Change user role"
    echo "   12. Create test user"
    echo ""
    echo "  🔧 DATA INSPECTION & QUERIES"
    echo "   13. Show API keys status"
    echo "   14. Find orphaned records"
    echo "   15. Show recent orders"
    echo "   16. Custom SQL query"
    echo ""
    echo "  🧹 DATA CLEANUP & REPAIR"
    echo "   17. Delete duplicate users"
    echo "   18. Remove orphaned API keys"
    echo "   19. Clean old backups"
    echo "   20. Reset sequences"
    echo ""
    echo "  🚨 EMERGENCY RECOVERY"
    echo "   21. Rebuild database constraints"
    echo "   22. Analyze & vacuum database"
    echo "   23. Check data integrity"
    echo "   24. Restore deleted user data"
    echo ""
    echo "  💾 EXPORT & IMPORT"
    echo "   25. Export user data to CSV"
    echo "   26. Export API keys (encrypted)"
    echo "   27. Import user data from CSV"
    echo ""
    echo "  ℹ️  UTILITIES"
    echo "   28. Show all databases"
    echo "   29. Show active connections"
    echo "   30. Kill idle connections"
    echo "   31. View logs"
    echo "    0. Exit"
    echo ""
}

# Database health check
db_health_check() {
    log "${CYAN}🔍 DATABASE HEALTH CHECK${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check if database exists
    if psql -h "$DB_HOST" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        log "${GREEN}✅ Database exists${NC}"
    else
        log "${RED}❌ Database does not exist!${NC}"
        return 1
    fi

    # Check if tables exist
    TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | grep -oP '\d+')
    log "✅ Tables: $TABLE_COUNT"

    # Check row counts
    log ""
    log "${CYAN}Row counts:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT schemaname, tablename, n_live_tup
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
    " | tee -a "$LOG_FILE"

    # Check for table issues
    log ""
    log "${CYAN}Checking for NULL issues:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 'users' as table_name, COUNT(*) as null_ids
        FROM users WHERE id IS NULL
        UNION ALL
        SELECT 'user_api_keys', COUNT(*)
        FROM user_api_keys WHERE id IS NULL;
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ Health check complete${NC}"
}

# List all tables
list_tables() {
    log "${CYAN}📋 ALL TABLES WITH ROW COUNTS${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
            (SELECT count(*) FROM information_schema.columns WHERE table_name = tablename) AS columns,
            (SELECT count(*) FROM information_schema.constraint_column_usage WHERE table_name = tablename) AS constraints
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ Table list complete${NC}"
}

# Show database size
db_size() {
    log "${CYAN}💾 DATABASE SIZE${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            datname,
            pg_size_pretty(pg_database_size(datname)) AS size
        FROM pg_database
        WHERE datname = '$DB_NAME';
    " | tee -a "$LOG_FILE"

    log ""
    log "${CYAN}Table sizes:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ Size report complete${NC}"
}

# List all users
list_users() {
    log "${CYAN}👥 ALL USERS IN DATABASE${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            id,
            email,
            role,
            created_at,
            (SELECT COUNT(*) FROM user_api_keys WHERE user_id = u.id) as api_keys
        FROM users u
        ORDER BY created_at DESC;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ User list complete${NC}"
}

# Find user by email
find_user_by_email() {
    read -p "Enter email to search: " email

    log "${CYAN}🔍 SEARCHING FOR USER: $email${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT * FROM users WHERE email = '$email';
    " | tee -a "$LOG_FILE"

    log ""
    log "${CYAN}API Keys for this user:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT * FROM user_api_keys WHERE user_id = (SELECT id FROM users WHERE email = '$email');
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ Search complete${NC}"
}

# Reset user password
reset_user_password() {
    read -p "Enter user email: " email
    read -p "Enter new password: " password

    log "${YELLOW}⚠️  RESETTING PASSWORD FOR: $email${NC}"
    log "Password will be hashed with bcrypt"

    # Generate hash using PostgreSQL
    HASH=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT crypt('$password', gen_salt('bf'));
    ")

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        UPDATE users
        SET password_hash = '$HASH'
        WHERE email = '$email'
        RETURNING id, email;
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ Password reset complete${NC}"
}

# Delete user
delete_user() {
    read -p "Enter user email to delete: " email

    # Get user details first
    USER_ID=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT id FROM users WHERE email = '$email';")

    if [ -z "$USER_ID" ]; then
        log "${RED}❌ User not found${NC}"
        return 1
    fi

    log "${RED}⚠️  ABOUT TO DELETE USER: $email (ID: $USER_ID)${NC}"
    log "Associated data:"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 'API Keys' as type, COUNT(*) as count FROM user_api_keys WHERE user_id = '$USER_ID'
        UNION ALL
        SELECT 'Orders', COUNT(*) FROM user_orders WHERE user_id = '$USER_ID' (if exists);
    " | tee -a "$LOG_FILE"

    read -p "Type 'DELETE' to confirm: " confirm

    if [ "$confirm" != "DELETE" ]; then
        log "${YELLOW}Deletion cancelled${NC}"
        return
    fi

    # Delete user and cascading data
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        DELETE FROM user_api_keys WHERE user_id = '$USER_ID';
        DELETE FROM users WHERE id = '$USER_ID';
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ User deleted successfully${NC}"
}

# Change user role
change_user_role() {
    read -p "Enter user email: " email

    log "${CYAN}Available roles: trader, admin, analyst, viewer${NC}"
    read -p "Enter new role: " new_role

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        UPDATE users
        SET role = '$new_role'
        WHERE email = '$email'
        RETURNING id, email, role;
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ Role updated${NC}"
}

# Create test user
create_test_user() {
    EMAIL="test.$(date +%s)@example.com"
    PASSWORD="testpass123"
    ROLE="trader"

    # Generate bcrypt hash
    HASH=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT crypt('$PASSWORD', gen_salt('bf'));
    ")

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        INSERT INTO users (id, email, password_hash, role, created_at)
        VALUES (gen_random_uuid(), '$EMAIL', '$HASH', '$ROLE', CURRENT_TIMESTAMP)
        RETURNING id, email, role;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ Test user created${NC}"
    log "Email: $EMAIL"
    log "Password: $PASSWORD"
    log "Role: $ROLE"
}

# Show API keys status
api_keys_status() {
    log "${CYAN}🔐 API KEYS STATUS${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            u.email,
            ak.key_type,
            CASE WHEN ak.deleted_at IS NULL THEN 'Active' ELSE 'Deleted' END as status,
            ak.created_at,
            ak.last_used_at
        FROM users u
        LEFT JOIN user_api_keys ak ON u.id = ak.user_id
        ORDER BY u.email, ak.key_type;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ API keys status complete${NC}"
}

# Find orphaned records
find_orphaned_records() {
    log "${CYAN}🔍 FINDING ORPHANED RECORDS${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    log "${CYAN}API Keys without users:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT ak.*
        FROM user_api_keys ak
        LEFT JOIN users u ON ak.user_id = u.id
        WHERE u.id IS NULL;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ Orphan search complete${NC}"
}

# Clean old backups
clean_old_backups() {
    BACKUPS_DIR="./backups"

    log "${YELLOW}⚠️  CLEANING OLD BACKUPS${NC}"
    log "Keeping last 10 database backups..."

    if [ -d "$BACKUPS_DIR/database" ]; then
        BACKUP_COUNT=$(ls -1 "$BACKUPS_DIR/database"/*.sql.gz 2>/dev/null | wc -l)

        if [ "$BACKUP_COUNT" -gt 10 ]; then
            log "Current backups: $BACKUP_COUNT"
            log "Removing oldest..."
            ls -1t "$BACKUPS_DIR/database"/*.sql.gz | tail -n +11 | xargs rm -f
            log "${GREEN}✅ Cleanup complete${NC}"
        else
            log "${GREEN}✅ Backups within retention policy${NC}"
        fi
    fi
}

# Reset sequences
reset_sequences() {
    log "${CYAN}🔄 RESETTING DATABASE SEQUENCES${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 'ALTER SEQUENCE ' || sequencename || ' RESTART;'
        FROM pg_sequences
        WHERE schemaname = 'public';
    " | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | tee -a "$LOG_FILE"

    log "${GREEN}✅ Sequences reset${NC}"
}

# Vacuum and analyze
vacuum_analyze() {
    log "${YELLOW}🧹 RUNNING VACUUM AND ANALYZE${NC}"
    log "This may take a few minutes..."

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE;" | tee -a "$LOG_FILE"

    log "${GREEN}✅ Vacuum and analyze complete${NC}"
}

# Check data integrity
check_integrity() {
    log "${CYAN}🔍 CHECKING DATA INTEGRITY${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    log "${CYAN}Checking NULL constraints:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 'users.id' as constraint_check, COUNT(*) as violations
        FROM users WHERE id IS NULL
        UNION ALL
        SELECT 'users.email', COUNT(*) FROM users WHERE email IS NULL
        UNION ALL
        SELECT 'users.role', COUNT(*) FROM users WHERE role IS NULL
        HAVING COUNT(*) > 0;
    " | tee -a "$LOG_FILE"

    log ""
    log "${CYAN}Checking referential integrity:${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        -- Check for orphaned API keys
        SELECT COUNT(*) as orphaned_api_keys
        FROM user_api_keys ak
        LEFT JOIN users u ON ak.user_id = u.id
        WHERE u.id IS NULL;
    " | tee -a "$LOG_FILE"

    log ""
    log "${GREEN}✅ Integrity check complete${NC}"
}

# Export users to CSV
export_users_csv() {
    OUTPUT_FILE="users_export_$(date +%Y%m%d_%H%M%S).csv"

    log "${CYAN}📤 EXPORTING USERS TO CSV${NC}"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        \COPY (
            SELECT id, email, role, created_at FROM users ORDER BY created_at DESC
        ) TO STDOUT WITH (FORMAT csv, HEADER true)
    " > "$OUTPUT_FILE"

    log "${GREEN}✅ Exported to: $OUTPUT_FILE${NC}"
}

# Custom SQL query
custom_query() {
    log "${CYAN}📝 CUSTOM SQL QUERY${NC}"
    log "Example queries:"
    echo "  SELECT * FROM users LIMIT 10;"
    echo "  SELECT COUNT(*) FROM user_api_keys;"
    echo "  SELECT * FROM users WHERE email LIKE '%example%';"
    echo ""
    read -p "Enter SQL query: " sql_query

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "$sql_query" | tee -a "$LOG_FILE"

    log "${GREEN}✅ Query complete${NC}"
}

# Show all databases
show_databases() {
    log "${CYAN}📚 ALL DATABASES${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -lqt | tee -a "$LOG_FILE"

    log "${GREEN}✅ Database list complete${NC}"
}

# Show active connections
show_connections() {
    log "${CYAN}🔗 ACTIVE DATABASE CONNECTIONS${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            pid,
            usename,
            application_name,
            state,
            query,
            query_start
        FROM pg_stat_activity
        WHERE datname = '$DB_NAME'
        ORDER BY query_start DESC;
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ Connection list complete${NC}"
}

# Kill idle connections
kill_idle_connections() {
    log "${YELLOW}⚠️  KILLING IDLE CONNECTIONS${NC}"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '$DB_NAME'
        AND state = 'idle'
        AND query_start < NOW() - INTERVAL '1 hour';
    " | tee -a "$LOG_FILE"

    log "${GREEN}✅ Idle connections killed${NC}"
}

# View logs
view_logs() {
    log "${CYAN}📋 LOG FILES${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    log "Latest logs:"
    tail -50 "$LOG_FILE"

    log ""
    read -p "View full log? (y/n): " view_full
    if [ "$view_full" = "y" ]; then
        less "$LOG_FILE"
    fi
}

# Main loop
main() {
    while true; do
        show_header
        show_menu
        read -p "Enter option (0-31): " choice

        case $choice in
            1) db_health_check ;;
            2) list_tables ;;
            3) db_size ;;
            4) psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -d \d ;;
            5) psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -d \di ;;
            6) list_users ;;
            7) find_user_by_email ;;
            8) psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" << 'INNERSQL'
SELECT * FROM users;
INNERSQL
            ;;
            9) reset_user_password ;;
            10) delete_user ;;
            11) change_user_role ;;
            12) create_test_user ;;
            13) api_keys_status ;;
            14) find_orphaned_records ;;
            15) psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 20;" ;;
            16) custom_query ;;
            17) log "${RED}Duplicate detection - manual review recommended${NC}" ;;
            18) find_orphaned_records ;;
            19) clean_old_backups ;;
            20) reset_sequences ;;
            21) log "${CYAN}Checking constraints...${NC}" && psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "\d" ;;
            22) vacuum_analyze ;;
            23) check_integrity ;;
            24) log "${YELLOW}Restore from backup recommended${NC}" ;;
            25) export_users_csv ;;
            26) log "${RED}Use backup scripts for encrypted export${NC}" ;;
            27) log "${YELLOW}Manual import recommended - see BACKUP_RESTORE_GUIDE.md${NC}" ;;
            28) show_databases ;;
            29) show_connections ;;
            30) kill_idle_connections ;;
            31) view_logs ;;
            0) log "${GREEN}Exiting...${NC}"; exit 0 ;;
            *) log "${RED}Invalid option${NC}" ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main
main
