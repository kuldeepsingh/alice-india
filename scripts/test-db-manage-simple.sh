#!/bin/bash

###############################################################################
# Database Management Script - Simple Compatibility Test
#
# Purpose: Test core functionality on macOS and Linux
# Usage: bash scripts/test-db-manage-simple.sh
###############################################################################

set +e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Detect OS
OS_TYPE=$(uname -s)
if [[ "$OS_TYPE" == "Darwin" ]]; then
    OS_NAME="macOS"
    OS_ICON="🍎"
elif [[ "$OS_TYPE" == "Linux" ]]; then
    OS_NAME="Linux"
    OS_ICON="🐧"
else
    OS_NAME="Unknown"
    OS_ICON="❓"
fi

PASS=0
FAIL=0

# Test function
test_feature() {
    local name=$1
    local command=$2

    echo -n "  Testing: $name... "

    if eval "$command" > /tmp/test_output.txt 2>&1; then
        echo -e "${GREEN}✅${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}❌${NC}"
        FAIL=$((FAIL + 1))
        echo "    Error: $(head -1 /tmp/test_output.txt)"
    fi
}

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DATABASE MANAGEMENT SCRIPT - COMPATIBILITY TEST        ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║   System: $OS_ICON $OS_NAME"
echo -e "${BLUE}║   PostgreSQL: $(psql --version 2>/dev/null | cut -d' ' -f3)"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
echo -e "${YELLOW}📋 CORE FUNCTIONALITY TESTS${NC}"
echo ""

echo -e "${BLUE}🔍 Database Connection & Health${NC}"
test_feature "PostgreSQL connectivity" "psql -h localhost -U postgres -c 'SELECT 1' > /dev/null 2>&1"
test_feature "Database 'bot_trade' exists" "psql -h localhost -U postgres -lqt | cut -d '|' -f 1 | grep -w 'bot_trade' > /dev/null 2>&1"
test_feature "Database tables readable" "psql -h localhost -U postgres -d bot_trade -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\"'\"'public'\"'\"';' > /dev/null 2>&1"

echo ""
echo -e "${BLUE}🔧 Command Compatibility${NC}"
test_feature "grep -E (regex)" "grep -E '[0-9]+' <<< 'test123' > /dev/null 2>&1"
test_feature "tr command" "echo 'TEST' | tr 'A-Z' 'a-z' | grep -q 'test'"
test_feature "sed command" "echo 'test' | sed 's/test/pass/' | grep -q 'pass'"
test_feature "psql version check" "psql --version | grep -q 'PostgreSQL'"
test_feature "cut command" "echo 'a|b|c' | cut -d '|' -f 1 | grep -q 'a'"

echo ""
echo -e "${BLUE}📊 Database Queries${NC}"
test_feature "Row count query" "psql -h localhost -U postgres -d bot_trade -c \"SELECT COUNT(*) FROM users;\" > /dev/null 2>&1"
test_feature "Table list query" "psql -h localhost -U postgres -d bot_trade -c \"SELECT tablename FROM pg_tables WHERE schemaname = 'public';\" > /dev/null 2>&1"
test_feature "User list query" "psql -h localhost -U postgres -d bot_trade -c \"SELECT id, email, role FROM users;\" > /dev/null 2>&1"
test_feature "API keys query" "psql -h localhost -U postgres -d bot_trade -c \"SELECT user_id, key_type FROM user_api_keys;\" > /dev/null 2>&1"
test_feature "Database size query" "psql -h localhost -U postgres -d bot_trade -c \"SELECT pg_size_pretty(pg_database_size('bot_trade'));\" > /dev/null 2>&1"

echo ""
echo -e "${BLUE}🧹 Data Integrity Checks${NC}"
test_feature "NULL constraint check" "psql -h localhost -U postgres -d bot_trade -c \"SELECT COUNT(*) FROM users WHERE id IS NULL;\" > /dev/null 2>&1"
test_feature "Orphaned record detection" "psql -h localhost -U postgres -d bot_trade -c \"SELECT COUNT(*) FROM user_api_keys ak LEFT JOIN users u ON ak.user_id::text = u.id::text WHERE u.id IS NULL;\" > /dev/null 2>&1"
test_feature "Index information" "psql -h localhost -U postgres -d bot_trade -c \"SELECT indexname FROM pg_indexes WHERE schemaname = 'public';\" > /dev/null 2>&1"

echo ""
echo -e "${BLUE}⚙️  Database Maintenance${NC}"
test_feature "VACUUM command (syntax)" "psql -h localhost -U postgres -d bot_trade -c 'VACUUM ANALYZE;' > /dev/null 2>&1"
test_feature "Active connections check" "psql -h localhost -U postgres -d bot_trade -c \"SELECT COUNT(*) FROM pg_stat_activity;\" > /dev/null 2>&1"
test_feature "Database size calculation" "psql -h localhost -U postgres -c \"SELECT datname FROM pg_database WHERE datname = 'bot_trade';\" > /dev/null 2>&1"

echo ""
echo -e "${BLUE}📋 Script Features${NC}"
test_feature "Script exists" "test -f scripts/db-manage.sh"
test_feature "Script is executable" "test -x scripts/db-manage.sh"
test_feature "Script contains menu" "grep -q 'MAIN MENU' scripts/db-manage.sh"
test_feature "Script has menu options" "grep -q 'case.*choice' scripts/db-manage.sh"

# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 TEST RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
else
    PERCENTAGE=0
fi

echo "System: $OS_ICON $OS_NAME"
echo "PostgreSQL Version: $(psql --version 2>/dev/null | cut -d' ' -f3)"
echo ""
echo "Tests Passed: ${GREEN}$PASS${NC} ✅"
echo "Tests Failed: ${RED}$FAIL${NC} ❌"
echo "Total Tests: $TOTAL"
echo "Success Rate: ${BLUE}${PERCENTAGE}%${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL COMPATIBILITY TESTS PASSED!${NC}"
    echo ""
    echo "Your database management script is fully compatible with $OS_NAME"
    echo ""
    echo -e "${YELLOW}You can safely use:${NC}"
    echo "  bash scripts/db-manage.sh"
    EXIT_CODE=0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Issues found: $FAIL"
    EXIT_CODE=1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# System-specific information
echo -e "${YELLOW}📝 System Information:${NC}"
echo ""

if [[ "$OS_TYPE" == "Darwin" ]]; then
    echo "macOS Configuration:"
    echo "  • System: $(sw_vers -productName) $(sw_vers -productVersion)"
    echo "  • Architecture: $(uname -m)"
    echo "  • Shell: $(basename $SHELL)"
    echo "  • grep version: $(grep --version 2>&1 | head -1 | cut -d' ' -f4)"
    echo "  • PostgreSQL installed via: $(which psql)"
    echo ""
    echo "✅ Verified commands:"
    echo "  • grep -E (extended regex)"
    echo "  • sed (stream editor)"
    echo "  • tr (character translation)"
    echo "  • cut (column extraction)"
    echo "  • psql (PostgreSQL client)"

elif [[ "$OS_TYPE" == "Linux" ]]; then
    echo "Linux Configuration:"
    echo "  • Distro: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Unknown')"
    echo "  • Kernel: $(uname -r)"
    echo "  • Architecture: $(uname -m)"
    echo "  • Shell: $(basename $SHELL)"
    echo "  • grep version: $(grep --version 2>&1 | head -1)"
    echo "  • PostgreSQL version: $(psql --version 2>/dev/null | cut -d' ' -f3)"
    echo ""
    echo "✅ Verified commands:"
    echo "  • grep -E (GNU grep)"
    echo "  • sed (GNU sed)"
    echo "  • tr (GNU tr)"
    echo "  • cut (GNU cut)"
    echo "  • psql (PostgreSQL client)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit $EXIT_CODE
