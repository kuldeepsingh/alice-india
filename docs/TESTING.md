# 🧪 Testing Guide

## Overview

This project uses **Vitest** as the primary testing framework with comprehensive coverage across unit tests, integration tests, and end-to-end tests.

## Test Commands

### Quick Reference

```bash
# Run all tests once
npm test

# Watch mode (recommended for development)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- tests/unit/components.test.ts
```

## Test Structure

### Unit Tests (`tests/unit/`)
- **Location:** `admin-dashboard/tests/unit/components.test.ts`
- **Purpose:** Test individual components and utility functions
- **Coverage:** Header, Sidebar, Layout, Pages
- **Execution Time:** Fastest (~100ms)

```bash
npm test -- tests/unit/
```

### Integration Tests (`tests/integration/`)
- **Location:** `admin-dashboard/tests/integration/api-integration.test.ts`
- **Purpose:** Test API communication and data flow
- **Coverage:** Login, User API, Account API, Order API
- **Execution Time:** Medium (~150ms)

```bash
npm test -- tests/integration/
```

### E2E Tests (`tests/e2e/`)
- **Location:** `admin-dashboard/tests/e2e/dashboard-flow.test.ts`
- **Purpose:** Test complete user workflows
- **Coverage:** Login flow, Dashboard navigation, Page transitions
- **Execution Time:** Slower (~200ms)

```bash
npm test -- tests/e2e/
```

## Development Workflow

### Best Practice: Watch Mode

During development, use watch mode for immediate feedback:

```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Tests in watch mode
npm run test:watch
```

Benefits:
- Tests re-run automatically on file changes
- Immediate feedback on code changes
- Faster development cycle
- Catch bugs early

### Before Committing

Always run full test suite:

```bash
npm test          # Quick full test run
npm run test:coverage  # Check code quality
```

## Code Coverage

### View Coverage Report

```bash
npm run test:coverage
```

### Coverage Metrics

- **Statements:** % of code lines executed
- **Branches:** % of conditional paths tested
- **Functions:** % of functions with test coverage
- **Lines:** % of source lines executed

### Target Coverage

- **Minimum:** 80% overall coverage
- **Goal:** 90%+ for critical paths
- **Maintained Modules:** 100% coverage

### HTML Coverage Report

```bash
# Generate HTML report
npm run test:coverage -- --reporter=html

# View in browser
open coverage/index.html
```

## Writing Tests

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Feature Name', () => {
  // Setup
  beforeEach(() => {
    // Setup code before each test
  })

  // Cleanup
  afterEach(() => {
    // Cleanup code after each test
  })

  // Test cases
  it('should do something specific', () => {
    // Arrange
    const expected = 'value'
    
    // Act
    const result = performAction()
    
    // Assert
    expect(result).toBe(expected)
  })
})
```

### Common Assertions

```typescript
// Equality
expect(value).toBe(true)
expect(value).toEqual({ name: 'John' })

// Truthiness
expect(value).toBeDefined()
expect(value).toBeNull()
expect(value).toBeTruthy()

// String matching
expect(text).toContain('substring')
expect(text).toMatch(/regex/)

// Array/Object
expect(array).toHaveLength(3)
expect(obj).toHaveProperty('name')
```

## Running Tests Locally

### Step 1: Navigate to Admin Dashboard
```bash
cd admin-dashboard
```

### Step 2: Run Tests
```bash
npm test
```

### Step 3: Interpret Results
- ✓ Test passed
- ✗ Test failed (see error message)
- ⊙ Test skipped

### Example Output

```
✓ tests/unit/components.test.ts (5)
  ✓ should have Header component
  ✓ should have Sidebar navigation
  ✓ should have Layout wrapper
  ✓ should have Dashboard page
  ✓ should have Users page

✓ tests/integration/api-integration.test.ts (5)
  ✓ should login successfully
  ✓ should fetch users
  ✓ should fetch accounts
  ✓ should fetch orders
  ✓ should fetch market data

✓ tests/e2e/dashboard-flow.test.ts (5)
  ✓ should complete login flow
  ✓ should navigate dashboard
  ✓ should view users page
  ✓ should view accounts page
  ✓ should view orders page

Test Files  3 passed (3)
Tests      15 passed (15)
Duration   245ms
```

## Troubleshooting

### Tests Not Running

**Problem:** `Cannot find module`
```bash
# Solution: Install dependencies
npm install
```

**Problem:** `vitest: command not found`
```bash
# Solution: Install Vitest globally (optional)
npm install -g vitest
```

### Tests Failing

**Problem:** Test failures after code changes
```bash
# Solution: Check the error message and fix the code
# Re-run specific test
npm test -- tests/unit/components.test.ts
```

**Problem:** Timeout errors
```bash
# Solution: Increase timeout
it('test name', async () => {
  // test code
}, 10000) // 10 second timeout
```

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Commits to main branch
- Scheduled runs (nightly)

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

## Best Practices

### Do's ✅

- Write tests as you code
- Keep tests focused and simple
- Use descriptive test names
- Test behavior, not implementation
- Mock external dependencies
- Use fixtures for setup

### Don'ts ❌

- Don't write too many assertions per test
- Don't use sleep() in tests
- Don't test internal implementation
- Don't ignore test failures
- Don't commit without running tests
- Don't write tests that are flaky

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Questions?

See [README.md](../README.md) for project overview and setup instructions.
