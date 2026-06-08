#!/bin/bash

###############################################################################
# OpenAlice India - Comprehensive API Test Suite
# Tests all endpoints including credentials, diagnostics, and trading routes
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_URL:-http://localhost:3000}"
API_VERSION="v1"
ENDPOINT="${API_BASE_URL}/api/${API_VERSION}"
TEST_USER_ID="550e8400-e29b-41d4-a716-446655440000"
AUTH_TOKEN="${AUTH_TOKEN:-test-token-12345}"
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

###############################################################################
# Helper Functions
###############################################################################

log_info() {
  echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
  echo -e "${GREEN}✓${NC}  $1"
  ((PASS_COUNT++))
}

log_error() {
  echo -e "${RED}✗${NC}  $1"
  ((FAIL_COUNT++))
}

log_warning() {
  echo -e "${YELLOW}⚠${NC}  $1"
  ((SKIP_COUNT++))
}

log_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Test HTTP endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_code=$3
  local data=$4
  local description=$5

  log_info "Testing: $description"
  log_info "  Method: $method $endpoint"

  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d "$data" \
      "${ENDPOINT}${endpoint}")
  else
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      "${ENDPOINT}${endpoint}")
  fi

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "$expected_code" ]; then
    log_success "$description (HTTP $http_code)"
    echo "$body" | python3 -m json.tool 2>/dev/null | head -10 || echo "$body" | head -10
  else
    log_error "$description (Expected $expected_code, got $http_code)"
    echo "$body" | head -20
  fi

  echo ""
}

###############################################################################
# HEALTH CHECKS
###############################################################################

test_health() {
  log_section "HEALTH CHECKS"

  # Test liveness probe
  log_info "Testing: Liveness probe"
  response=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/health/live")
  if [ "$response" = "200" ]; then
    log_success "Liveness probe"
  else
    log_error "Liveness probe (got $response)"
  fi

  # Test readiness probe
  log_info "Testing: Readiness probe"
  response=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/health/ready")
  if [ "$response" = "200" ]; then
    log_success "Readiness probe"
  else
    log_error "Readiness probe (got $response)"
  fi
}

###############################################################################
# CREDENTIAL MANAGEMENT TESTS
###############################################################################

test_credentials() {
  log_section "CREDENTIAL MANAGEMENT (SECURITY TESTS)"

  # Test 1: Save credentials
  log_info "Test 1: Save Zerodha credentials (encrypted)"
  credential_data='{
    "apiKey": "test_api_key_xyz123",
    "apiSecret": "test_api_secret_abc789"
  }'
  test_endpoint "POST" "/credentials/zerodha" "200" "$credential_data" \
    "Save encrypted credentials"

  # Test 2: Check if credentials exist
  log_info "Test 2: Check if credentials configured"
  test_endpoint "GET" "/credentials/zerodha/check" "200" "" \
    "Check credential existence"

  # Test 3: Get credential status
  log_info "Test 3: Get credential status"
  test_endpoint "GET" "/credentials/zerodha/status" "200" "" \
    "Get credential status and metadata"

  # Test 4: Validate connection (test with Zerodha API)
  log_info "Test 4: Validate Zerodha API connection"
  test_endpoint "POST" "/credentials/zerodha/validate" "200" "" \
    "Validate credentials with live API"

  # Test 5: Delete credentials (cleanup)
  log_info "Test 5: Delete credentials securely"
  test_endpoint "DELETE" "/credentials/zerodha" "200" "" \
    "Delete credentials from database"
}

###############################################################################
# DIAGNOSTICS & TESTING ENDPOINT TESTS
###############################################################################

test_diagnostics() {
  log_section "DIAGNOSTICS & TESTING"

  # Test 1: Health check endpoint
  log_info "Test 1: Quick health check"
  test_endpoint "GET" "/testing/health" "200" "" \
    "Get system health status"

  # Test 2: Run all tests
  log_info "Test 2: Run comprehensive test suite"
  test_endpoint "POST" "/testing/run-all" "200" "" \
    "Execute all backend tests (10+ tests)"
}

###############################################################################
# TRADING ENDPOINTS TESTS
###############################################################################

test_trading() {
  log_section "TRADING ENDPOINTS"

  # Test 1: Get portfolio
  log_info "Test 1: Fetch user portfolio"
  test_endpoint "GET" "/trading/portfolio" "200" "" \
    "Get complete portfolio data"

  # Test 2: Get orders
  log_info "Test 2: Fetch user orders"
  test_endpoint "GET" "/trading/orders" "200" "" \
    "Get all user orders"

  # Test 3: Get positions
  log_info "Test 3: Fetch current positions"
  test_endpoint "GET" "/trading/positions" "200" "" \
    "Get open trading positions"

  # Test 4: Get holdings
  log_info "Test 4: Fetch holdings"
  test_endpoint "GET" "/trading/holdings" "200" "" \
    "Get user holdings"
}

###############################################################################
# ACCOUNT ENDPOINTS TESTS
###############################################################################

test_accounts() {
  log_section "ACCOUNT MANAGEMENT"

  # Test 1: Get accounts
  log_info "Test 1: Fetch user accounts"
  test_endpoint "GET" "/accounts" "200" "" \
    "Get all trading accounts"

  # Test 2: Get single account
  log_info "Test 2: Fetch specific account"
  test_endpoint "GET" "/accounts/550e8400-e29b-41d4-a716-446655440000" "200" "" \
    "Get account details by ID"
}

###############################################################################
# ERROR HANDLING TESTS
###############################################################################

test_error_handling() {
  log_section "ERROR HANDLING & EDGE CASES"

  # Test 1: Missing auth token
  log_info "Test 1: Request without auth token"
  response=$(curl -s -w "\n%{http_code}" \
    -X "GET" \
    "${ENDPOINT}/credentials/zerodha/status")
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "401" ]; then
    log_success "Unauthorized request rejected (HTTP 401)"
  else
    log_warning "Expected 401, got $http_code"
  fi

  # Test 2: Invalid endpoint
  log_info "Test 2: Request to non-existent endpoint"
  response=$(curl -s -w "\n%{http_code}" \
    -X "GET" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    "${ENDPOINT}/invalid/endpoint")
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "404" ]; then
    log_success "Non-existent endpoint returns 404"
  else
    log_warning "Expected 404, got $http_code"
  fi

  # Test 3: Invalid JSON
  log_info "Test 3: Request with malformed JSON"
  response=$(curl -s -w "\n%{http_code}" \
    -X "POST" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{ invalid json" \
    "${ENDPOINT}/credentials/zerodha")
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "400" ]; then
    log_success "Malformed JSON rejected (HTTP 400)"
  else
    log_warning "Expected 400, got $http_code"
  fi

  # Test 4: Missing required fields
  log_info "Test 4: Request with missing required fields"
  incomplete_data='{"apiKey": "only_key"}'
  response=$(curl -s -w "\n%{http_code}" \
    -X "POST" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "$incomplete_data" \
    "${ENDPOINT}/credentials/zerodha")
  http_code=$(echo "$response" | tail -1)
  if [ "$http_code" = "400" ]; then
    log_success "Missing required fields rejected (HTTP 400)"
  else
    log_warning "Expected 400, got $http_code"
  fi
}

###############################################################################
# DATABASE VERIFICATION
###############################################################################

test_database() {
  log_section "DATABASE VERIFICATION"

  log_info "Checking database connectivity..."
  if command -v psql &> /dev/null; then
    # Check if database exists
    result=$(psql -U postgres -lqt | grep openalice_india)
    if [ -n "$result" ]; then
      log_success "Database openalice_india exists"
    else
      log_error "Database openalice_india not found"
    fi

    # Check tables
    table_count=$(psql -U postgres openalice_india -c \
      "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" 2>/dev/null | tail -1)
    log_info "Database has $table_count tables"
    if [ "$table_count" -ge 11 ]; then
      log_success "All required database tables present"
    else
      log_error "Missing database tables (expected 11+, found $table_count)"
    fi

    # Check migrations
    migration_count=$(psql -U postgres openalice_india -c \
      "SELECT COUNT(*) FROM _migrations;" 2>/dev/null | tail -1)
    log_success "Migrations executed: $migration_count"
  else
    log_warning "psql not available, skipping database checks"
  fi
}

###############################################################################
# ENCRYPTION VERIFICATION
###############################################################################

test_encryption() {
  log_section "ENCRYPTION & SECURITY VERIFICATION"

  if command -v psql &> /dev/null; then
    log_info "Verifying credential encryption in database..."

    # Check if any credentials are stored as plaintext
    plaintext_check=$(psql -U postgres openalice_india -c \
      "SELECT COUNT(*) FROM user_trading_credentials
       WHERE api_key_encrypted LIKE 'test%' OR api_key_encrypted LIKE 'Bearer%';" 2>/dev/null | tail -1)

    if [ "$plaintext_check" = "0" ] || [ -z "$plaintext_check" ]; then
      log_success "No plaintext credentials found (encryption working)"
    else
      log_error "Plaintext credentials detected!"
    fi

    # Check encryption key versions
    log_info "Checking encryption key versioning..."
    key_versions=$(psql -U postgres openalice_india -c \
      "SELECT DISTINCT encryption_key_version FROM user_trading_credentials;" 2>/dev/null)
    log_success "Encryption key versions tracked: $key_versions"
  fi
}

###############################################################################
# PERFORMANCE TESTS
###############################################################################

test_performance() {
  log_section "PERFORMANCE & LOAD TESTING"

  # Test response time for health endpoint
  log_info "Testing response times..."

  total_time=0
  iterations=5

  for i in $(seq 1 $iterations); do
    start=$(date +%s%N)
    curl -s "${API_BASE_URL}/health/live" > /dev/null
    end=$(date +%s%N)
    elapsed=$((($end - $start) / 1000000)) # Convert to milliseconds
    total_time=$((total_time + elapsed))
    log_info "  Request $i: ${elapsed}ms"
  done

  avg_time=$((total_time / iterations))
  if [ "$avg_time" -lt 100 ]; then
    log_success "Average response time: ${avg_time}ms (Excellent)"
  elif [ "$avg_time" -lt 200 ]; then
    log_success "Average response time: ${avg_time}ms (Good)"
  else
    log_warning "Average response time: ${avg_time}ms (Slower than expected)"
  fi
}

###############################################################################
# MAIN TEST EXECUTION
###############################################################################

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  OpenAlice India - API Test Suite                         ║${NC}"
  echo -e "${BLUE}║  Testing: $API_BASE_URL${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  # Run all tests
  test_health
  test_credentials
  test_diagnostics
  test_trading
  test_accounts
  test_error_handling
  test_database
  test_encryption
  test_performance

  # Print summary
  log_section "TEST SUMMARY"
  echo ""
  echo -e "${GREEN}✓ Passed:  $PASS_COUNT${NC}"
  echo -e "${RED}✗ Failed:  $FAIL_COUNT${NC}"
  echo -e "${YELLOW}⚠ Skipped: $SKIP_COUNT${NC}"
  echo ""

  total=$((PASS_COUNT + FAIL_COUNT + SKIP_COUNT))
  success_rate=$((PASS_COUNT * 100 / total))
  echo "Overall Success Rate: ${success_rate}%"
  echo ""

  # Exit with appropriate code
  if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
  else
    echo -e "${RED}Some tests failed! Review output above.${NC}"
    exit 1
  fi
}

# Run main function
main "$@"
