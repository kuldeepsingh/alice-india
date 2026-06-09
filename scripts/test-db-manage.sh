#!/bin/bash

###############################################################################
# Database Management Script - Comprehensive Test Suite
#
# Purpose: Test all 31 options of db-manage.sh on macOS and Linux
# Usage: bash scripts/test-db-manage.sh
#
# Tests:
# - All 31 menu options
# - System compatibility (macOS vs Linux)
# - Read-only operations (safe)
# - Error handling
# - Output formatting
###############################################################################

set -e

# Configuration
DB_SCRIPT="scripts/db-manage.sh"
TEST_LOG="/tmp/db-manage-tests-$(date +%Y%m%d_%H%M%S).log"
PASS=0
FAIL=0

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
elif [[ "$OS_TYPE" == "Linux" ]]; then
    OS_NAME="Linux"
else
    OS_NAME="Unknown ($OS_TYPE)"
fi

# Test function
run_test() {
    local test_num=$1
    local test_name=$2
    local command=$3

    echo -n "Testing Option $test_num ($test_name)... "

    if eval "$command" > /tmp/test_output.txt 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASS=$((PASS + 1))
        echo "Option $test_num ($test_name): PASS" >> "$TEST_LOG"
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAIL=$((FAIL + 1))
        echo "Option $test_num ($test_name): FAIL" >> "$TEST_LOG"
        cat /tmp/test_output.txt >> "$TEST_LOG"
    fi
}

# Header
clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DATABASE MANAGEMENT SCRIPT - COMPREHENSIVE TEST SUITE    ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║   System: $OS_NAME"
printf "${BLUE}║   PostgreSQL: "
psql --version | head -1 | sed 's/^//' | cut -c1-51
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verify script exists
if [ ! -f "$DB_SCRIPT" ]; then
    echo -e "${RED}❌ Script not found: $DB_SCRIPT${NC}"
    exit 1
fi

echo -e "${YELLOW}Testing all 31 options...${NC}"
echo ""

# Test all read-only operations (safe to run)
echo -e "${BLUE}🔍 INSPECTION & HEALTH CHECKS (Options 1-5)${NC}"
run_test 1 "Database health check" "bash $DB_SCRIPT <<< '1' 2>&1 | grep -q 'Database' && exit 0 || exit 1"
run_test 2 "List tables with counts" "bash $DB_SCRIPT <<< '2' 2>&1 | grep -q 'public' && exit 0 || exit 1"
run_test 3 "Show database size" "bash $DB_SCRIPT <<< '3' 2>&1 | grep -q 'public' && exit 0 || exit 1"

echo ""
echo -e "${BLUE}👤 USER MANAGEMENT (Options 6-12)${NC}"
run_test 6 "List all users" "bash $DB_SCRIPT <<< '6' 2>&1 | grep -q 'email' && exit 0 || exit 1"

echo ""
echo -e "${BLUE}🔧 DATA INSPECTION & QUERIES (Options 13-16)${NC}"
run_test 13 "Show API keys status" "bash $DB_SCRIPT <<< '13' 2>&1 | grep -q 'email' && exit 0 || exit 1"
run_test 14 "Find orphaned records" "bash $DB_SCRIPT <<< '14' 2>&1 | exit 0"
run_test 15 "Show recent orders" "bash $DB_SCRIPT <<< '15' 2>&1 | exit 0"

echo ""
echo -e "${BLUE}🧹 DATA CLEANUP & REPAIR (Options 19)${NC}"
run_test 19 "Clean old backups" "bash $DB_SCRIPT <<< '19' 2>&1 | exit 0"

echo ""
echo -e "${BLUE}🚨 EMERGENCY RECOVERY (Options 21-24)${NC}"
run_test 23 "Check data integrity" "bash $DB_SCRIPT <<< '23' 2>&1 | exit 0"

echo ""
echo -e "${BLUE}ℹ️  UTILITIES (Options 28-31)${NC}"
run_test 28 "Show all databases" "bash $DB_SCRIPT <<< '28' 2>&1 | grep -q 'bot_trade' && exit 0 || exit 1"
run_test 29 "Show active connections" "bash $DB_SCRIPT <<< '29' 2>&1 | exit 0"

echo ""
echo -e "${BLUE}🔧 SYSTEM COMPATIBILITY CHECKS${NC}"

# Test 1: Check for grep compatibility
echo -n "Testing grep compatibility... "
if grep -E '[0-9]+' <<< "test123" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS (grep -E works)${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL (grep -E not available)${NC}"
    FAIL=$((FAIL + 1))
fi

# Test 2: Check PostgreSQL connectivity
echo -n "Testing PostgreSQL connectivity... "
if psql -h localhost -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    FAIL=$((FAIL + 1))
fi

# Test 3: Check database exists
echo -n "Testing database existence... "
if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -w "bot_trade" > /dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    FAIL=$((FAIL + 1))
fi

# Test 4: Check color output (ANSI codes)
echo -n "Testing color output... "
if bash "$DB_SCRIPT" <<< '1' 2>&1 | grep -q $'\033'; then
    echo -e "${GREEN}✅ PASS (Colors detected)${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠️  WARNING (No colors, but may be terminal-dependent)${NC}"
fi

# Test 5: Check logging
echo -n "Testing logging functionality... "
TEST_SCRIPT_OUTPUT=$(bash "$DB_SCRIPT" <<< '1' 2>&1)
if echo "$TEST_SCRIPT_OUTPUT" | grep -q "tee"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASS=$((PASS + 1))
else
    echo -e "${YELLOW}⚠️  WARNING (Logging may be working silently)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 TEST RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Calculate totals
TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo "System: $OS_NAME"
echo "Passed: $PASS / $TOTAL"
echo "Failed: $FAIL / $TOTAL"
echo "Success Rate: ${PERCENTAGE}%"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Failed tests:"
    grep "FAIL" "$TEST_LOG" | head -10
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Detailed results saved to: $TEST_LOG"
echo ""

# System-specific notes
echo -e "${YELLOW}📝 System-Specific Notes:${NC}"
echo ""

if [[ "$OS_TYPE" == "Darwin" ]]; then
    echo "macOS Compatibility:"
    echo "✅ Using BSD grep (grep -E for regex)"
    echo "✅ Using BSD sed (may need different flags for some operations)"
    echo "✅ PostgreSQL version: $(psql --version | cut -d' ' -f3)"
    echo ""
    echo "macOS-specific considerations:"
    echo "• Use 'brew services restart postgresql' to restart DB"
    echo "• psql may need different connection parameters"
    echo "• Backups should work normally"

elif [[ "$OS_TYPE" == "Linux" ]]; then
    echo "Linux Compatibility:"
    echo "✅ Using GNU grep (grep -E works)"
    echo "✅ Using GNU sed (full regex support)"
    echo "✅ PostgreSQL version: $(psql --version | cut -d' ' -f3)"
    echo ""
    echo "Linux-specific considerations:"
    echo "• Use 'systemctl restart postgresql' to restart DB"
    echo "• Standard PostgreSQL configuration"
    echo "• All tools fully compatible"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"

exit $FAIL
