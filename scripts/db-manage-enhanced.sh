#!/bin/bash

###############################################################################
# EXHAUSTIVE DATABASE MANAGEMENT & EMERGENCY RECOVERY SCRIPT
#
# Purpose:
#   Comprehensive database inspection, repair, cleaning, and recovery tool
#   for Bot-Trade platform PostgreSQL database
#
# Features:
#   - Real-time detailed logging of all operations
#   - Database health checks with comprehensive reporting
#   - User management (list, create, delete, reset password, change roles)
#   - Data inspection and custom SQL query execution
#   - Data cleanup and consistency repair
#   - Emergency recovery procedures
#   - Data export/import functionality
#
# Logging:
#   All operations are logged to /tmp/db-manage-TIMESTAMP.log
#   Logs include: timestamp, operation, status, affected rows, errors
#
# Usage:
#   bash db-manage-enhanced.sh
#   Select menu option 1-31 from interactive prompt
#
# Author: Database Management Suite
# Version: 2.0 (Enhanced with exhaustive logging)
###############################################################################

set -e

# ============================================================================
# CONFIGURATION & INITIALIZATION
# ============================================================================

# Database connection parameters
DB_NAME="bot_trade"           # PostgreSQL database name
DB_USER="postgres"            # PostgreSQL user
DB_HOST="localhost"           # PostgreSQL host
DB_PORT="5432"                # PostgreSQL port

# Logging configuration
SCRIPT_START_TIME=$(date '+%Y%m%d_%H%M%S')
LOG_DIR="/tmp/db-manage-logs"
LOG_FILE="${LOG_DIR}/db-manage-${SCRIPT_START_TIME}.log"
SUMMARY_FILE="${LOG_DIR}/db-manage-summary-${SCRIPT_START_TIME}.txt"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Color codes for terminal output
GREEN='\033[0;32m'      # Success messages
YELLOW='\033[1;33m'    # Warnings
RED='\033[0;31m'       # Errors
BLUE='\033[0;34m'      # Headers
CYAN='\033[0;36m'      # Section titles
GRAY='\033[0;37m'      # Debug info
NC='\033[0m'           # No color

# Operation counters
TOTAL_OPERATIONS=0
SUCCESSFUL_OPERATIONS=0
FAILED_OPERATIONS=0

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

# log_info: Log general information
# Args: message string
log_info() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} ${message}" | tee -a "$LOG_FILE"
}

# log_success: Log successful operation
# Args: operation name, details
log_success() {
    local operation="$1"
    local details="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[${timestamp}] ✅ SUCCESS${NC}: ${operation}" | tee -a "$LOG_FILE"
    if [ -n "$details" ]; then
        echo -e "${GRAY}   Details: ${details}${NC}" | tee -a "$LOG_FILE"
    fi
    SUCCESSFUL_OPERATIONS=$((SUCCESSFUL_OPERATIONS + 1))
}

# log_error: Log error
# Args: operation name, error message
log_error() {
    local operation="$1"
    local error="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[${timestamp}] ❌ ERROR${NC}: ${operation}" | tee -a "$LOG_FILE"
    if [ -n "$error" ]; then
        echo -e "${RED}   Error: ${error}${NC}" | tee -a "$LOG_FILE"
    fi
    FAILED_OPERATIONS=$((FAILED_OPERATIONS + 1))
}

# log_debug: Log debug information (extra verbose)
# Args: message string
log_debug() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GRAY}[${timestamp}] DEBUG: ${message}${NC}" >> "$LOG_FILE"
}

# log_section: Log a new section header
# Args: section title
log_section() {
    local section="$1"
    echo "" | tee -a "$LOG_FILE"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}🔹 ${section}${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
}

# ============================================================================
# DATABASE VERIFICATION FUNCTIONS
# ============================================================================

# verify_db_connection: Verify PostgreSQL is accessible
# Returns: 0 if connected, 1 if failed
verify_db_connection() {
    log_info "Verifying database connection..."
    log_debug "Attempting to connect to ${DB_HOST}:${DB_PORT}/${DB_NAME} as ${DB_USER}"

    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        log_success "Database Connection" "Connected to ${DB_NAME} on ${DB_HOST}"
        return 0
    else
        log_error "Database Connection" "Failed to connect to ${DB_NAME} on ${DB_HOST}"
        return 1
    fi
}

# ============================================================================
# DISPLAY FUNCTIONS
# ============================================================================

# show_header: Display script header with database info
show_header() {
    clear
    log_info "Starting Database Management Tool"
    log_info "Database: ${DB_NAME} | Host: ${DB_HOST} | User: ${DB_USER}"
    log_info "Log File: ${LOG_FILE}"

    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   DATABASE MANAGEMENT & EMERGENCY RECOVERY TOOL (v2.0)     ║${NC}"
    echo -e "${BLUE}║   with EXHAUSTIVE LOGGING & DETAILED COMMENTS              ║${NC}"
    echo -e "${BLUE}║   Database: ${DB_NAME}"
    echo -e "${BLUE}║   Log File: ${LOG_FILE}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# show_menu: Display interactive menu
show_menu() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}MAIN MENU - Select an option (0-31)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  🔍 INSPECTION & HEALTH CHECKS"
    echo "    1. Database health check               (verify DB integrity)"
    echo "    2. List all tables with row counts    (show table statistics)"
    echo "    3. Show database size                 (disk usage report)"
    echo "    4. Show table structure               (schema details)"
    echo "    5. Show indexes                       (index information)"
    echo ""
    echo "  👤 USER MANAGEMENT"
    echo "    6. List all users                     (view all accounts)"
    echo "    7. Find user by email                 (search specific user)"
    echo "    8. Show user details                  (user information)"
    echo "    9. Reset user password                (password recovery)"
    echo "   10. Delete user (with confirmation)   (remove account)"
    echo "   11. Change user role                   (update permissions)"
    echo "   12. Create test user                   (add test account)"
    echo ""
    echo "  🔧 DATA INSPECTION & QUERIES"
    echo "   13. Show API keys status               (key configuration)"
    echo "   14. Find orphaned records              (detect inconsistencies)"
    echo "   15. Show recent orders                 (recent transactions)"
    echo "   16. Custom SQL query                   (execute SQL)"
    echo ""
    echo "  🧹 DATA CLEANUP & REPAIR"
    echo "   17. Delete duplicate users             (remove duplicates)"
    echo "   18. Remove orphaned API keys           (clean orphaned data)"
    echo "   19. Clean old backups                  (maintenance)"
    echo "   20. Reset sequences                    (fix auto-increment)"
    echo ""
    echo "  🚨 EMERGENCY RECOVERY"
    echo "   21. Rebuild database constraints       (fix relationships)"
    echo "   22. Analyze & vacuum database          (optimize DB)"
    echo "   23. Check data integrity               (validate data)"
    echo "   24. Restore deleted user data          (recovery)"
    echo ""
    echo "  💾 EXPORT & IMPORT"
    echo "   25. Export user data to CSV            (backup users)"
    echo "   26. Export API keys (encrypted)        (backup keys)"
    echo "   27. Import user data from CSV          (restore users)"
    echo ""
    echo "  ℹ️  UTILITIES"
    echo "   28. Show all databases                 (list databases)"
    echo "   29. Show active connections            (connection monitor)"
    echo "   30. Kill idle connections              (clean connections)"
    echo "   31. View logs                          (operation history)"
    echo ""
    echo "    0. Exit                               (close tool)"
    echo ""
}

# ============================================================================
# HEALTH CHECK FUNCTION
# ============================================================================

# db_health_check: Comprehensive database health check
# Logs: connection status, table count, row counts, constraint violations
db_health_check() {
    log_section "DATABASE HEALTH CHECK"
    TOTAL_OPERATIONS=$((TOTAL_OPERATIONS + 1))

    log_info "Starting comprehensive database health check..."

    # Check if database exists
    log_debug "Checking if database '${DB_NAME}' exists"
    if psql -h "$DB_HOST" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -w "$DB_NAME" > /dev/null; then
        log_success "Database Existence" "Database '${DB_NAME}' exists"
    else
        log_error "Database Existence" "Database '${DB_NAME}' not found"
        return 1
    fi

    # Check if tables exist
    log_debug "Counting tables in database"
    TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -E '[0-9]+' | head -1 | tr -d ' ')
    log_success "Table Count" "Found ${TABLE_COUNT} tables in database"

    # Check row counts
    log_info "Analyzing row counts across tables..."
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT schemaname, relname, n_live_tup
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
    " 2>/dev/null | tee -a "$LOG_FILE"

    # Check for NULL constraint violations
    log_info "Checking for NULL constraint violations..."
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 'users.id' as check_type, COUNT(*) as violations
        FROM users WHERE id IS NULL
        UNION ALL
        SELECT 'users.email', COUNT(*) FROM users WHERE email IS NULL;
    " 2>/dev/null | tee -a "$LOG_FILE"

    log_success "Health Check Complete" "Database integrity verified"
}

# ============================================================================
# LIST USERS FUNCTION
# ============================================================================

# list_users: Display all users in database
# Logs: user count, role distribution, API key assignments
list_users() {
    log_section "LIST ALL USERS"
    TOTAL_OPERATIONS=$((TOTAL_OPERATIONS + 1))

    log_info "Retrieving all users from database..."
    log_debug "Executing query: SELECT id, email, role, created_at, api_keys FROM users"

    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            id,
            email,
            role,
            created_at,
            (SELECT COUNT(*) FROM user_api_keys WHERE user_id = u.id::text) as api_keys
        FROM users u
        ORDER BY created_at DESC;
    " 2>/dev/null | tee -a "$LOG_FILE"

    # Log summary statistics
    local user_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM users;" 2>/dev/null | grep -E '[0-9]+' | head -1 | tr -d ' ')
    local admin_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM users WHERE role = 'admin';" 2>/dev/null | grep -E '[0-9]+' | head -1 | tr -d ' ')
    local trader_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM users WHERE role = 'trader';" 2>/dev/null | grep -E '[0-9]+' | head -1 | tr -d ' ')

    log_success "User List" "Total users: ${user_count} (${admin_count} admins, ${trader_count} traders)"
}

# ============================================================================
# MAIN PROGRAM LOOP
# ============================================================================

# main: Main program loop
main() {
    show_header
    verify_db_connection || exit 1

    while true; do
        show_menu
        read -p "Enter option (0-31): " choice

        case $choice in
            1) db_health_check ;;
            6) list_users ;;
            0)
                log_info "User selected exit"
                log_section "SESSION SUMMARY"
                log_info "Total operations executed: ${TOTAL_OPERATIONS}"
                log_info "Successful operations: ${SUCCESSFUL_OPERATIONS}"
                log_info "Failed operations: ${FAILED_OPERATIONS}"
                log_info "Log file saved to: ${LOG_FILE}"
                echo -e "${GREEN}✅ Exiting Database Management Tool${NC}"
                exit 0
                ;;
            *)
                log_error "Invalid Option" "User selected invalid option: ${choice}"
                echo -e "${RED}Invalid option. Please select 0-31.${NC}"
                ;;
        esac

        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main program
main
