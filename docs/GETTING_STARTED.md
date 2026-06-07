# 🚀 Getting Started - Developer Setup Guide

Welcome to **Bot-Trade**! This guide will walk you through setting up your development environment step-by-step.

**Estimated Setup Time:** 15-20 minutes

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Running the Application](#running-the-application)
5. [Verify Setup](#verify-setup)
6. [First Steps](#first-steps)
7. [Useful Commands](#useful-commands)
8. [Troubleshooting](#troubleshooting)
9. [Resources](#resources)

---

## 🔧 Prerequisites

Before you start, make sure you have the following installed:

### Required
- **Node.js** (v18 or higher)
  ```bash
  node --version
  # Should be v18.0.0 or higher
  ```

- **npm or pnpm**
  ```bash
  npm --version
  # or
  pnpm --version
  ```

- **Git**
  ```bash
  git --version
  ```

### Required Services
- **PostgreSQL** (v13 or higher)
  ```bash
  psql --version
  ```

- **Redis** (v6 or higher)
  ```bash
  redis-cli --version
  ```

### Optional but Recommended
- **Make** (for using Makefile commands)
  ```bash
  make --version
  ```

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/kuldeepsingh/alice-india.git
cd alice-india
```

### Step 2: Install Dependencies

Using **pnpm** (recommended):
```bash
pnpm install
```

Or using **npm**:
```bash
npm install
```

This will install:
- **Backend dependencies** (~500 packages)
- **Frontend dependencies** (~360 packages)

⏱️ **This takes 2-3 minutes**

### Step 3: Verify Installation

```bash
# Check Node packages
ls node_modules | wc -l

# Check frontend packages
ls admin-dashboard/node_modules | wc -l

# Both should show large numbers (500+, 360+)
```

---

## 🔐 Environment Setup

### Step 1: Create .env File

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
# Node Environment
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgres://localhost/bot_trade
DATABASE_POOL_MAX=20
DATABASE_POOL_IDLE_TIMEOUT=30000

# Redis/Cache
REDIS_URL=redis://localhost:6379
CACHE_DEFAULT_TTL=3600

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=24h
JWT_REFRESH_TOKEN_EXPIRY=7d

# API
API_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=10

# Feature Flags
ENABLE_TWO_FACTOR=false
ENABLE_WEBHOOKS=false
ENABLE_REAL_TIME_NOTIFICATIONS=false
EOF
```

### Step 2: Ensure Services Are Running

#### Start PostgreSQL

**macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start postgresql
```

**Verify:**
```bash
psql -U postgres -c "SELECT version();"
```

#### Start Redis

**macOS (Homebrew):**
```bash
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start redis-server
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 3: Setup Database

Create the database and run migrations:

```bash
make db-setup
```

This will:
- ✅ Create `bot_trade` database
- ✅ Run all migrations
- ✅ Create tables: users, trading_accounts, orders
- ✅ Set up indexes

**Verify:**
```bash
psql -d bot_trade -c "\dt"
# Should list: users, trading_accounts, orders
```

---

## 🚀 Running the Application

### Quick Start (Recommended)

In **3 separate terminals**:

**Terminal 1 - Backend Server:**
```bash
make dev-backend
```
- Starts on `http://localhost:3000`
- Auto-recompiles on file changes
- Hot module replacement enabled

**Terminal 2 - Frontend Server:**
```bash
make dev-frontend
```
- Starts on `http://localhost:5173`
- Opens dashboard in browser
- Hot reload on file changes

**Terminal 3 - Run Tests (Optional):**
```bash
make test-watch
```
- Auto-runs tests on file changes
- Shows coverage reports

### Alternative: Using npm/pnpm Directly

If you don't have `make` installed:

**Backend:**
```bash
npm run dev
# or
pnpm dev
```

**Frontend:**
```bash
cd admin-dashboard
npm run dev
# or
pnpm dev
```

---

## ✅ Verify Setup

### Step 1: Check Services

```bash
make health-check
```

Expected output:
```
Backend API:
  ✅ Running

Frontend:
  ✅ Running

Database:
  ✅ Running

Redis:
  ✅ Running
```

### Step 2: Login to Dashboard

1. Open browser: http://localhost:5173
2. Use credentials:
   - **Email:** admin@example.com
   - **Password:** Password123
3. You should see the dashboard

### Step 3: Check API Health

```bash
curl http://localhost:3000/health/live
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-06-08T..."
}
```

---

## 🎯 First Steps as a Developer

### 1. Read the Documentation

Start with these files (in order):
1. **README.md** - Project overview
2. **docs/ARCHITECTURE.md** - System design
3. **docs/CONFIG.md** - Configuration system
4. **docs/TESTING.md** - Testing framework

### 2. Explore the Codebase

```bash
# Backend structure
ls -la src/

# Frontend structure
ls -la admin-dashboard/src/

# Configuration
ls -la config/

# Documentation
ls -la docs/
```

### 3. Create Your First Feature

**Backend Example - Add a new endpoint:**
```bash
# Create service
touch src/services/your-service.ts

# Create route
touch src/routes/your-route.ts

# Add migration (if needed)
touch migrations/004_your_table.sql

# Test it
npm run dev
```

**Frontend Example - Add a new page:**
```bash
# Create component
touch admin-dashboard/src/pages/YourPage.tsx

# Create component file
touch admin-dashboard/src/components/YourComponent.tsx

# Add to routing in App.tsx
```

### 4. Run Tests

```bash
# Run all tests
make test

# Run in watch mode
make test-watch

# Check coverage
make test-coverage
```

### 5. Validate Code Quality

Before committing:
```bash
make validate
```

This will:
- ✅ Lint code
- ✅ Format code
- ✅ Run tests

---

## 🛠️ Useful Commands

### Build Commands
```bash
make build              # Build both backend and frontend
make build-backend      # Build backend only
make build-frontend     # Build frontend only
make production-build   # Build for production
```

### Development Commands
```bash
make dev-backend        # Start backend server
make dev-frontend       # Start frontend server
make dev                # Show dev setup info
```

### Testing Commands
```bash
make test               # Compile & run all tests
make test-watch         # Watch mode
make test-coverage      # Coverage report
make test-compile       # Check TypeScript only
```

### Database Commands
```bash
make db-setup           # Create database + migrate
make db-reset           # Reset database (⚠️ deletes data)
make migrate            # Run migrations
```

### Utility Commands
```bash
make help               # Show all commands
make lint               # Check TypeScript
make format             # Format code
make validate           # Lint + format + test
make clean-all          # Clean build artifacts
make health-check       # Check service status
```

---

## 🆘 Troubleshooting

### Issue: "PostgreSQL is not running"

**Solution:**
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Verify
psql -c "SELECT 1"
```

### Issue: "Redis connection failed"

**Solution:**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Verify
redis-cli ping
```

### Issue: "Port 3000/5173 already in use"

**Solution:**

Change the port in `.env`:
```bash
PORT=3001  # Backend on 3001 instead
```

Or kill the existing process:
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Issue: "Module not found errors"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules admin-dashboard/node_modules
pnpm install
```

### Issue: "TypeScript compilation errors"

**Solution:**
```bash
# Check TypeScript
make test-compile

# or manually
npx tsc --noEmit
```

### Issue: "Database migration failed"

**Solution:**
```bash
# Check database connection
psql -d bot_trade -c "SELECT 1"

# Reset database
make db-reset

# Re-run migrations
make migrate
```

### Issue: "Hot reload not working"

**Solution:**
```bash
# Restart the dev server
# Terminal 1: Press Ctrl+C
make dev-backend

# Terminal 2: Press Ctrl+C
make dev-frontend
```

---

## 📚 Resources

### Key Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview and features |
| **docs/ARCHITECTURE.md** | System design and patterns |
| **docs/CONFIG.md** | Configuration system |
| **docs/TESTING.md** | Testing framework |
| **docs/DEPLOYMENT.md** | Production deployment |
| **docs/MAKEFILE.md** | Build system reference |
| **docs/INDEX.md** | Documentation navigation |

### External Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Vitest Documentation](https://vitest.dev)

### Team Communication

- **Issues:** Report bugs in GitHub issues
- **Discussions:** Use GitHub discussions for questions
- **PRs:** Create pull requests for code changes
- **Documentation:** Update docs when adding features

---

## 🎓 Development Workflow

### Making a Change

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code
   - Add tests
   - Update documentation

3. **Validate:**
   ```bash
   make validate
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create PR on GitHub**

### Code Quality Standards

- ✅ All code must pass TypeScript strict mode
- ✅ All new features must have tests
- ✅ All code must be formatted (make format)
- ✅ All tests must pass (make test)
- ✅ Documentation must be updated

---

## 📋 Checklist for New Developers

- [ ] Clone repository
- [ ] Install Node.js v18+
- [ ] Install PostgreSQL
- [ ] Install Redis
- [ ] Run `pnpm install`
- [ ] Create `.env` file
- [ ] Start PostgreSQL
- [ ] Start Redis
- [ ] Run `make db-setup`
- [ ] Run `make dev-backend` (Terminal 1)
- [ ] Run `make dev-frontend` (Terminal 2)
- [ ] Verify dashboard at http://localhost:5173
- [ ] Login with admin@example.com / Password123
- [ ] Read docs/ARCHITECTURE.md
- [ ] Read docs/CONFIG.md
- [ ] Make your first commit

---

## 🤝 Getting Help

### Common Questions

**Q: How do I add a new API endpoint?**
A: See docs/ARCHITECTURE.md → API Design section

**Q: How do I add a new component?**
A: See docs/ARCHITECTURE.md → Frontend Architecture section

**Q: How do I add a database migration?**
A: See migrations/ folder for examples

**Q: How do I run tests?**
A: See docs/TESTING.md for comprehensive guide

**Q: How do I deploy to production?**
A: See docs/DEPLOYMENT.md for deployment instructions

### Need Help?

1. **Check documentation first** - Most answers are in docs/
2. **Search GitHub issues** - Your question might already be answered
3. **Create a GitHub issue** - Include error messages and steps to reproduce
4. **Ask on Discussions** - Good for questions about architecture or approach

---

## 🎉 You're All Set!

You now have a fully functional development environment!

### Next Steps:

1. ✅ Read the architecture guide
2. ✅ Explore the codebase
3. ✅ Write your first feature
4. ✅ Run tests
5. ✅ Make your first commit

### Commands to Remember:

```bash
# Start development
make dev-backend       # Terminal 1
make dev-frontend      # Terminal 2

# Run tests
make test-watch

# Validate before committing
make validate

# View all commands
make help
```

---

## 📞 Support

- **Stuck?** Check docs/INDEX.md for navigation
- **Found a bug?** Create a GitHub issue
- **Have a question?** Use GitHub discussions
- **Documentation unclear?** Suggest improvements

---

**Happy coding! 🚀**

Last updated: June 8, 2026
