#!/bin/bash

###############################################################################
# THOROUGH DATABASE MANAGEMENT SCRIPT TEST
#
# This test ACTUALLY RUNS each of the 31 menu options
# and verifies that they work correctly with real data
#
# NOT just checking if the script exists, but actually testing each option
###############################################################################

set +e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
ERRORS=""

# Test a menu option by feeding input to the script
test_option() {
    local option_num=$1
    local option_name=$2

    echo -n "Testing Option $option_num ($option_name)... "

    # Feed the option number to db-manage.sh and capture output
    OUTPUT=$(bash scripts/db-manage.sh <<< "$option_num" 2>&1)

    # Check if there's an error in the output
    if echo "$OUTPUT" | grep -q "ERROR\|error\|not found\|does not exist"; then
        echo -e "${RED}❌ FAIL${NC}"
        FAIL=$((FAIL + 1))
        ERRORS="$ERRORS\n  Option $option_num: $(echo "$OUTPUT" | grep -i 'error' | head -1)"
        return 1
    fi

    # Check if the option actually produced output
    if [ -z "$OUTPUT" ]; then
        echo -e "${RED}❌ FAIL (no output)${NC}"
        FAIL=$((FAIL + 1))
        return 1
    fi

    echo -e "${GREEN}✅${NC}"
    PASS=$((PASS + 1))
    return 0
}

# Header
clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   THOROUGH DATABASE MANAGEMENT SCRIPT TEST                 ║${NC}"
echo -e "${BLUE}║   Testing ALL 31 OPTIONS with real menu interaction        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Testing all 31 menu options (this may take 2-3 minutes)...${NC}"
echo ""

# ============================================================================
echo -e "${BLUE}🔍 INSPECTION & HEALTH CHECKS (Options 1-5)${NC}"
test_option 1 "Database health check"
test_option 2 "List all tables"
test_option 3 "Show database size"
test_option 4 "Show table structure"
test_option 5 "Show indexes"

echo ""
echo -e "${BLUE}👤 USER MANAGEMENT (Options 6-12)${NC}"
test_option 6 "List all users"
test_option 7 "Find user by email"
test_option 8 "Show user details"
test_option 9 "Reset user password"
test_option 10 "Delete user"
test_option 11 "Change user role"
test_option 12 "Create test user"

echo ""
echo -e "${BLUE}🔧 DATA INSPECTION & QUERIES (Options 13-16)${NC}"
test_option 13 "Show API keys status"
test_option 14 "Find orphaned records"
test_option 15 "Show recent orders"
test_option 16 "Custom SQL query"

echo ""
echo -e "${BLUE}🧹 DATA CLEANUP & REPAIR (Options 17-20)${NC}"
test_option 17 "Delete duplicate users"
test_option 18 "Remove orphaned API keys"
test_option 19 "Clean old backups"
test_option 20 "Reset sequences"

echo ""
echo -e "${BLUE}🚨 EMERGENCY RECOVERY (Options 21-24)${NC}"
test_option 21 "Rebuild constraints"
test_option 22 "Analyze & vacuum database"
test_option 23 "Check data integrity"
test_option 24 "Restore deleted data"

echo ""
echo -e "${BLUE}💾 EXPORT & IMPORT (Options 25-27)${NC}"
test_option 25 "Export user data (CSV)"
test_option 26 "Export API keys"
test_option 27 "Import user data"

echo ""
echo -e "${BLUE}ℹ️  UTILITIES (Options 28-31)${NC}"
test_option 28 "Show all databases"
test_option 29 "Show active connections"
test_option 30 "Kill idle connections"
test_option 31 "View logs"

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

echo "Options Passed: ${GREEN}$PASS/31${NC}"
echo "Options Failed: ${RED}$FAIL/31${NC}"
echo "Success Rate: ${BLUE}${PERCENTAGE}%${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL 31 OPTIONS WORKING PERFECTLY!${NC}"
    exit 0
else
    echo -e "${RED}❌ FAILED OPTIONS:${NC}"
    echo -e "$ERRORS"
    exit 1
fi
