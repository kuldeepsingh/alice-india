# 🛠️ Makefile Build System Guide

## Overview

The **Makefile** provides a professional build system for Bot-Trade with automated tasks for building, testing, deploying, and maintaining the project.

## Quick Start

### View all available commands:
```bash
make help
```

### Common tasks:
```bash
# Build everything
make build-all

# Start development servers
make dev-backend      # Terminal 1: Backend
make dev-frontend     # Terminal 2: Frontend

# Run tests
make test

# Complete setup
make setup
```

## Build Commands

### Building

| Command | Description |
|---------|-------------|
| `make build` | Alias for `build-all` |
| `make build-backend` | Build backend (TypeScript → JavaScript) |
| `make build-frontend` | Build frontend (React + Vite) |
| `make build-all` | Build both backend and frontend |
| `make production-build` | Clean, install, and build for production |

### Examples

```bash
# Build only backend
make build-backend
# Output: ✅ Backend build complete

# Build only frontend
make build-frontend
# Output: ✅ Frontend build complete

# Build everything
make build-all
# Output: ✅ All builds complete!

# Production build (recommended before deployment)
make production-build
```

## Installation Commands

### Installing Dependencies

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies for both |
| `make install-backend` | Install backend dependencies |
| `make install-frontend` | Install frontend dependencies |

### Examples

```bash
# Initial project setup
make install

# Update only backend dependencies
make install-backend

# Fresh install after removing node_modules
make clean-node-modules && make install
```

## Development Commands

### Running Development Servers

| Command | Description |
|---------|-------------|
| `make dev` | Start both servers (info only) |
| `make dev-backend` | Start backend on port 3000 |
| `make dev-frontend` | Start frontend on port 5173 |

### Recommended Development Workflow

**Terminal 1:**
```bash
make dev-backend
```
Output:
```
🚀 Starting backend development server...
Server running at: http://localhost:3000
Press Ctrl+C to stop
```

**Terminal 2:**
```bash
make dev-frontend
```
Output:
```
🚀 Starting frontend development server...
Dashboard: http://localhost:5173
Press Ctrl+C to stop
```

Then open http://localhost:5173 in your browser!

## Testing Commands

### Running Tests

| Command | Description |
|---------|-------------|
| `make test` | Run all tests |
| `make test-backend` | Run backend tests |
| `make test-frontend` | Run frontend tests |
| `make test-watch` | Run tests in watch mode |
| `make test-coverage` | Generate coverage reports |

### Examples

```bash
# Quick test run
make test

# Continuous testing during development
make test-watch

# Generate coverage report
make test-coverage
# Opens: admin-dashboard/coverage/index.html

# Test specific layer
make test-frontend
```

## Code Quality Commands

### Linting & Formatting

| Command | Description |
|---------|-------------|
| `make lint` | Lint TypeScript code |
| `make format` | Format code with Prettier |
| `make format-fix` | Run linter and formatter |
| `make validate` | Validate code (lint + test) |

### Examples

```bash
# Check for TypeScript errors
make lint

# Auto-format all code
make format

# Full validation before commit
make validate
```

## Database Commands

### Database Management

| Command | Description |
|---------|-------------|
| `make migrate` | Run database migrations |
| `make db-setup` | Create database and run migrations |
| `make db-reset` | Drop, recreate, and migrate database |

### Examples

```bash
# Initial database setup
make db-setup
# Creates 'bot_trade' database and runs migrations

# Update schema after adding migrations
make migrate

# Start fresh with clean database
make db-reset
# ⚠️ Deletes all data!
```

## Docker Commands

### Container Management

| Command | Description |
|---------|-------------|
| `make docker-build` | Build Docker image |
| `make docker-up` | Start Docker containers |
| `make docker-down` | Stop Docker containers |
| `make docker-logs` | View container logs |
| `make docker-clean` | Remove images and volumes |

### Examples

```bash
# Build and start containers
make docker-build
make docker-up

# View logs
make docker-logs

# Stop and cleanup
make docker-down
make docker-clean
```

## Cleanup Commands

### Cleaning Build Artifacts

| Command | Description |
|---------|-------------|
| `make clean` | Alias for `clean-all` |
| `make clean-backend` | Remove backend build artifacts |
| `make clean-frontend` | Remove frontend build artifacts |
| `make clean-all` | Remove all build artifacts |
| `make clean-node-modules` | Remove all node_modules (⚠️) |
| `make clean-dist` | Remove dist directories |

### Examples

```bash
# Clean everything before fresh build
make clean-all

# Rebuild from scratch
make clean-all && make build-all

# Nuclear option (removes all dependencies)
make clean-node-modules
make install
```

## Deployment Commands

### Production Deployment

| Command | Description |
|---------|-------------|
| `make production-build` | Build for production |
| `make production-deploy` | Full production deployment package |

### Examples

```bash
# Prepare for production
make production-build
# Creates optimized builds ready for deployment

# Full deployment prep
make production-deploy
# Runs: clean, install, build, migrate
```

## Utility Commands

### System Information & Monitoring

| Command | Description |
|---------|-------------|
| `make health-check` | Check if all services are running |
| `make info` | Show project information |
| `make version` | Show version info |
| `make logs` | View application logs |
| `make logs-backend` | View backend logs |
| `make docs` | Show documentation info |

### Examples

```bash
# Health check
make health-check
# Output:
# Backend API:
#   ✅ Running
# Frontend:
#   ✅ Running
# Database:
#   ✅ Running
# Redis:
#   ✅ Running

# Project info
make info
# Shows port numbers, locations, commands

# Check installed versions
make version
```

## Complete Workflows

### Initial Setup

```bash
# Complete project setup
make setup

# Or step by step:
make install          # Install dependencies
make db-setup         # Setup database
```

### Development Workflow

```bash
# Terminal 1: Backend
make dev-backend

# Terminal 2: Frontend
make dev-frontend

# Terminal 3: Tests (optional)
make test-watch

# Make changes and save
# Tests auto-run, servers hot-reload
```

### Before Committing

```bash
# Validate code quality
make validate

# Or individually:
make lint             # Check syntax
make format           # Format code
make test             # Run tests
```

### Production Deployment

```bash
# Prepare production build
make production-build

# Run migrations on production
make migrate

# Health check
make health-check
```

### Fresh Start

```bash
# Nuclear reset
make clean-all
make clean-node-modules

# Rebuild everything
make install
make db-setup
make build-all
```

## Environment Setup

### Prerequisites

Before using the Makefile, ensure you have:

```bash
# Required
node --version        # v18+
npm --version         # v9+
psql --version        # PostgreSQL 13+

# Optional but recommended
redis-cli --version   # Redis 6+
docker --version      # Docker 20+
```

### First Time Setup

```bash
# 1. Install dependencies
make install

# 2. Setup database
make db-setup

# 3. Start development
make dev-backend      # Terminal 1
make dev-frontend     # Terminal 2

# 4. Open browser
# http://localhost:5173
```

## Tips & Tricks

### Parallel Development

```bash
# Use tmux or separate terminal windows
# Terminal 1
make dev-backend

# Terminal 2
make dev-frontend

# Terminal 3 (optional)
make test-watch
```

### Quick Rebuilds

```bash
# If only source changed
make build-backend    # Backend only
make build-frontend   # Frontend only

# For dependencies changed
make clean-all && make install && make build-all
```

### Debugging

```bash
# Check what's running
make health-check

# View logs
make logs-backend

# Get system info
make info
make version
```

### Performance Monitoring

```bash
# During development
make test-watch       # Auto-run tests

# Before deployment
make test-coverage    # Check coverage
make validate         # Full validation
```

## Troubleshooting

### Command not found: make

**Solution:** Install GNU Make
```bash
# macOS
brew install make

# Ubuntu/Debian
sudo apt-get install build-essential

# Windows (via Chocolatey)
choco install make
```

### Port already in use

```bash
# If 3000 is taken
# Change PORT in .env
PORT=3001 make dev-backend

# If 5173 is taken
# Change in admin-dashboard/vite.config.ts
```

### Database connection failed

```bash
# Ensure PostgreSQL is running
psql -U postgres -c "SELECT 1"

# If not running, start it:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Node modules issues

```bash
# Clean reinstall
make clean-node-modules
make install

# Or just frontend
cd admin-dashboard
rm -rf node_modules
npm install
```

## Advanced Usage

### Custom Make Targets

Add your own targets to Makefile:

```makefile
my-task: ## My custom task
	@echo "Running my task"
	npm run my-script
```

Then run:
```bash
make my-task
```

### Environment Variables

```bash
# Override defaults
PORT=3001 make dev-backend
NODE_ENV=production make build-backend
```

### Combining Commands

```bash
# Chain commands
make clean-all && make install && make validate && make build-all

# Or in Make (create alias)
make validate-and-build
```

## File Locations

Important directories referenced by Makefile:

```
.
├── Makefile                    # This file
├── src/                        # Backend source
├── dist/                       # Backend build output
├── admin-dashboard/
│   ├── src/                   # Frontend source
│   ├── dist/                  # Frontend build output
│   └── node_modules/
├── node_modules/               # Backend dependencies
└── logs/                        # Application logs
```

## Performance Tips

1. **Use `make build-backend` when only backend changes**
2. **Use watch mode for development: `make test-watch`**
3. **Clean only when necessary: `make clean-all`**
4. **Cache node_modules when possible**
5. **Use `make validate` before pushing code**

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Install
  run: make install

- name: Validate
  run: make validate

- name: Build
  run: make build-all

- name: Deploy
  run: make production-build
```

## Conclusion

The Makefile provides a professional, standardized way to manage the Bot-Trade project. Use it for:

- ✅ Consistent development workflow
- ✅ Automated testing and validation
- ✅ Easy deployment preparation
- ✅ Team collaboration
- ✅ CI/CD integration

For more help: `make help`
