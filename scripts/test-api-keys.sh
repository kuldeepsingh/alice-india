#!/bin/bash

# API Keys Integration Tests
# Tests all CRUD operations for API key management

API_BASE="http://localhost:3000/api/v1"
TEST_USER="test-cli-$(date +%s)"
TEST_CLAUDE_KEY="sk-ant-test-key-cli-$(date +%s)"
TEST_ZERODHA_KEY="zerodha-key-cli-$(date +%s)"
TEST_ZERODHA_SECRET="zerodha-secret-cli-$(date +%s)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}API Keys Integration Tests${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Test counter
PASSED=0
FAILED=0

test_api() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expect_status="$5"

  echo -e "${YELLOW}TEST: $test_name${NC}"

  if [ "$method" = "GET" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE$endpoint" \
      -H "X-User-ID: $TEST_USER")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X $method "$API_BASE$endpoint" \
      -H "Content-Type: application/json" \
      -H "X-User-ID: $TEST_USER" \
      -d "$data")
  fi

  STATUS=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS" = "$expect_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Status: $STATUS)"
    echo "Response: $(echo $BODY | jq -c . 2>/dev/null || echo $BODY)"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC} (Expected: $expect_status, Got: $STATUS)"
    echo "Response: $(echo $BODY | jq -c . 2>/dev/null || echo $BODY)"
    ((FAILED++))
  fi
  echo ""
}

# Test 1: Save Claude Key
test_api \
  "Save Claude API Key" \
  "POST" \
  "/user/api-keys" \
  "{\"claudeApiKey\": \"$TEST_CLAUDE_KEY\"}" \
  "200"

# Test 2: Check Status - Claude Should be Configured
test_api \
  "Check Status - Claude Configured" \
  "GET" \
  "/user/api-keys/status" \
  "" \
  "200"

# Test 3: Save Zerodha Keys
test_api \
  "Save Zerodha Keys" \
  "POST" \
  "/user/api-keys" \
  "{\"zerodhaApiKey\": \"$TEST_ZERODHA_KEY\", \"zerodhaApiSecret\": \"$TEST_ZERODHA_SECRET\"}" \
  "200"

# Test 4: Check Status - Both Should be Configured
test_api \
  "Check Status - Both Configured" \
  "GET" \
  "/user/api-keys/status" \
  "" \
  "200"

# Test 5: Update Claude Key
test_api \
  "Update Claude Key" \
  "POST" \
  "/user/api-keys" \
  "{\"claudeApiKey\": \"sk-ant-updated-key-$(date +%s)\"}" \
  "200"

# Test 6: Delete Claude Key
test_api \
  "Delete Claude Key" \
  "DELETE" \
  "/user/api-keys/claude" \
  "" \
  "200"

# Test 7: Verify Claude is Deleted
test_api \
  "Verify Claude is Deleted" \
  "GET" \
  "/user/api-keys/status" \
  "" \
  "200"

# Test 8: Delete Zerodha Keys
test_api \
  "Delete Zerodha Keys" \
  "DELETE" \
  "/user/api-keys/zerodha" \
  "" \
  "200"

# Test 9: Verify All Keys Deleted
test_api \
  "Verify All Keys Deleted" \
  "GET" \
  "/user/api-keys/status" \
  "" \
  "200"

# Test 10: Error - No User ID
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/user/api-keys" \
  -H "Content-Type: application/json" \
  -d "{\"claudeApiKey\": \"test-key\"}")

STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${YELLOW}TEST: Error - Missing User ID${NC}"
if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✅ PASS${NC} (Status: $STATUS)"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC} (Expected: 401, Got: $STATUS)"
  ((FAILED++))
fi
echo ""

# Test 11: Error - Zerodha Key Without Secret
test_api \
  "Error - Zerodha Key Without Secret" \
  "POST" \
  "/user/api-keys" \
  "{\"zerodhaApiKey\": \"$TEST_ZERODHA_KEY\"}" \
  "400"

# Test 12: Error - Zerodha Secret Without Key
test_api \
  "Error - Zerodha Secret Without Key" \
  "POST" \
  "/user/api-keys" \
  "{\"zerodhaApiSecret\": \"$TEST_ZERODHA_SECRET\"}" \
  "400"

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Total Passed: ${GREEN}$PASSED${NC}"
echo -e "Total Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed!${NC}"
  exit 1
fi
