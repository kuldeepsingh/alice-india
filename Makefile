.PHONY: help build build-backend build-frontend build-all dev dev-backend dev-frontend \
        test test-backend test-frontend test-coverage test-watch lint format \
        clean clean-backend clean-frontend clean-all install install-backend install-frontend \
        migrate db-setup docker-build docker-up docker-down production-build production-deploy \
        health-check logs format-fix

# Variables
SHELL := /bin/bash
.DEFAULT_GOAL := help
BACKEND_DIR := .
FRONTEND_DIR := admin-dashboard
NODE_MODULES := node_modules admin-dashboard/node_modules
DIST_DIRS := dist admin-dashboard/dist

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║          Bot-Trade Build System - Makefile Commands             ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Build Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "build|install" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Development Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "dev|format|lint" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Testing Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "test" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Database Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "migrate|db-" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Docker Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "docker|production" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Utility Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "clean|health|logs" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make build-all              # Build both backend and frontend"
	@echo "  make dev                    # Start development servers"
	@echo "  make test                   # Run all tests"
	@echo "  make clean-all              # Clean all build artifacts"
	@echo ""

# ============================================================================
# BUILD TARGETS
# ============================================================================

build: build-all ## Alias for build-all

build-backend: ## Build backend (TypeScript → JavaScript)
	@echo "$(BLUE)🏗️  Building backend...$(NC)"
	@cd $(BACKEND_DIR) && npm run build
	@echo "$(GREEN)✅ Backend build complete$(NC)"

build-frontend: ## Build frontend (React + Vite)
	@echo "$(BLUE)🏗️  Building frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✅ Frontend build complete$(NC)"

build-all: build-backend build-frontend ## Build both backend and frontend
	@echo "$(GREEN)✅ All builds complete!$(NC)"

production-build: clean-all install build-all ## Production build (clean, install, build)
	@echo "$(GREEN)✅ Production build complete$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  • Frontend: admin-dashboard/dist/"
	@echo "  • Backend: Ready for npm start"

# ============================================================================
# INSTALLATION TARGETS
# ============================================================================

install: install-backend install-frontend ## Install dependencies for both

install-backend: ## Install backend dependencies
	@echo "$(BLUE)📦 Installing backend dependencies...$(NC)"
	@cd $(BACKEND_DIR) && npm install
	@echo "$(GREEN)✅ Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(BLUE)📦 Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ Frontend dependencies installed$(NC)"

# ============================================================================
# DEVELOPMENT TARGETS
# ============================================================================

dev: ## Start both backend and frontend in development mode
	@echo "$(YELLOW)⚠️  This will start both servers. Use separate terminals for each.$(NC)"
	@echo "$(BLUE)Starting development servers...$(NC)"
	@echo ""
	@echo "$(YELLOW)Terminal 1 - Backend:$(NC)"
	@echo "  make dev-backend"
	@echo ""
	@echo "$(YELLOW)Terminal 2 - Frontend:$(NC)"
	@echo "  make dev-frontend"
	@echo ""
	@sleep 2
	@make dev-backend &

dev-backend: ## Start backend development server (port 3000)
	@echo "$(BLUE)🚀 Starting backend development server...$(NC)"
	@echo "$(YELLOW)Server running at: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend: ## Start frontend development server (port 5173)
	@echo "$(BLUE)🚀 Starting frontend development server...$(NC)"
	@echo "$(YELLOW)Dashboard: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

# ============================================================================
# TESTING TARGETS
# ============================================================================

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests (if exists)
	@echo "$(BLUE)🧪 Running backend tests...$(NC)"
	@if [ -d "$(BACKEND_DIR)/tests" ]; then \
		cd $(BACKEND_DIR) && npm test; \
	else \
		echo "$(YELLOW)⚠️  No backend tests found$(NC)"; \
	fi

test-frontend: ## Run frontend tests
	@echo "$(BLUE)🧪 Running frontend tests...$(NC)"
	@cd $(FRONTEND_DIR) && npm test
	@echo "$(GREEN)✅ Frontend tests complete$(NC)"

test-watch: ## Run frontend tests in watch mode
	@echo "$(BLUE)🧪 Running tests in watch mode...$(NC)"
	@cd $(FRONTEND_DIR) && npm run test:watch

test-coverage: ## Generate test coverage reports
	@echo "$(BLUE)📊 Generating test coverage...$(NC)"
	@cd $(FRONTEND_DIR) && npm run test:coverage
	@echo "$(GREEN)✅ Coverage report generated$(NC)"
	@echo "$(YELLOW)View report: open admin-dashboard/coverage/index.html$(NC)"

# ============================================================================
# LINTING & FORMATTING
# ============================================================================

lint: ## Lint TypeScript code
	@echo "$(BLUE)🔍 Linting code...$(NC)"
	@cd $(BACKEND_DIR) && npx tsc --noEmit
	@cd $(FRONTEND_DIR) && npx tsc --noEmit
	@echo "$(GREEN)✅ No TypeScript errors$(NC)"

format: ## Format code with Prettier
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	@cd $(BACKEND_DIR) && npx prettier --write src/ || true
	@cd $(FRONTEND_DIR) && npx prettier --write src/ || true
	@echo "$(GREEN)✅ Code formatted$(NC)"

format-fix: lint format ## Run linter and formatter

# ============================================================================
# DATABASE TARGETS
# ============================================================================

migrate: ## Run database migrations
	@echo "$(BLUE)🗄️  Running database migrations...$(NC)"
	@cd $(BACKEND_DIR) && npm run migrate
	@echo "$(GREEN)✅ Migrations complete$(NC)"

db-setup: ## Setup database (create + migrate)
	@echo "$(BLUE)🗄️  Setting up database...$(NC)"
	@echo "$(YELLOW)Make sure PostgreSQL is running$(NC)"
	@createdb bot_trade || true
	@echo "$(GREEN)✅ Database created$(NC)"
	@make migrate

db-reset: ## Reset database (drop + recreate + migrate)
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(NC)"
	@read -p "Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		dropdb bot_trade || true; \
		createdb bot_trade; \
		make migrate; \
		echo "$(GREEN)✅ Database reset complete$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

# ============================================================================
# DOCKER TARGETS
# ============================================================================

docker-build: ## Build Docker image
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	@docker build -t bot-trade:latest .
	@echo "$(GREEN)✅ Docker image built$(NC)"

docker-up: ## Start Docker containers (docker-compose)
	@echo "$(BLUE)🐳 Starting Docker containers...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Containers started$(NC)"
	@make health-check

docker-down: ## Stop Docker containers
	@echo "$(BLUE)🛑 Stopping Docker containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Containers stopped$(NC)"

docker-logs: ## View Docker container logs
	@docker-compose logs -f

docker-clean: ## Remove Docker images and volumes
	@echo "$(BLUE)🗑️  Cleaning Docker resources...$(NC)"
	@docker-compose down -v
	@docker rmi bot-trade:latest || true
	@echo "$(GREEN)✅ Docker cleanup complete$(NC)"

# ============================================================================
# PRODUCTION TARGETS
# ============================================================================

production-deploy: production-build migrate ## Full production deployment
	@echo "$(GREEN)✅ Production deployment package ready!$(NC)"
	@echo ""
	@echo "$(YELLOW)Deployment steps:$(NC)"
	@echo "  1. Copy files to production server"
	@echo "  2. Set environment variables (.env)"
	@echo "  3. Run: pm2 start ecosystem.config.js"
	@echo "  4. Run: npm run migrate"
	@echo "  5. Verify: make health-check"

# ============================================================================
# CLEANUP TARGETS
# ============================================================================

clean: clean-all ## Alias for clean-all

clean-backend: ## Clean backend build artifacts
	@echo "$(BLUE)🗑️  Cleaning backend...$(NC)"
	@cd $(BACKEND_DIR) && rm -rf dist/ .tsbuildinfo
	@echo "$(GREEN)✅ Backend cleaned$(NC)"

clean-frontend: ## Clean frontend build artifacts
	@echo "$(BLUE)🗑️  Cleaning frontend...$(NC)"
	@cd $(FRONTEND_DIR) && rm -rf dist/ .vite
	@echo "$(GREEN)✅ Frontend cleaned$(NC)"

clean-all: clean-backend clean-frontend ## Clean all build artifacts
	@echo "$(GREEN)✅ All cleaned$(NC)"

clean-node-modules: ## Remove node_modules (⚠️ nuclear option)
	@echo "$(RED)⚠️  WARNING: This will remove all node_modules!$(NC)"
	@read -p "Type 'yes' to confirm: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(BLUE)🗑️  Removing node_modules...$(NC)"; \
		rm -rf $(NODE_MODULES); \
		echo "$(GREEN)✅ node_modules removed$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

clean-dist: ## Remove dist directories
	@echo "$(BLUE)🗑️  Removing dist directories...$(NC)"
	@rm -rf $(DIST_DIRS)
	@echo "$(GREEN)✅ Dist directories removed$(NC)"

# ============================================================================
# UTILITY TARGETS
# ============================================================================

health-check: ## Check if services are running
	@echo "$(BLUE)🏥 Health checking services...$(NC)"
	@echo ""
	@echo "Backend API:"
	@curl -s http://localhost:3000/health/live > /dev/null && echo "  $(GREEN)✅ Running$(NC)" || echo "  $(RED)❌ Not running$(NC)"
	@echo ""
	@echo "Frontend:"
	@curl -s http://localhost:5173 > /dev/null && echo "  $(GREEN)✅ Running$(NC)" || echo "  $(RED)❌ Not running$(NC)"
	@echo ""
	@echo "Database:"
	@psql -U postgres -h localhost -c "SELECT 1" > /dev/null 2>&1 && echo "  $(GREEN)✅ Running$(NC)" || echo "  $(RED)❌ Not running$(NC)"
	@echo ""
	@echo "Redis:"
	@redis-cli ping > /dev/null 2>&1 && echo "  $(GREEN)✅ Running$(NC)" || echo "  $(RED)❌ Not running$(NC)"

logs: ## View application logs
	@echo "$(BLUE)📋 Backend logs:$(NC)"
	@ls -lh logs/ 2>/dev/null || echo "No logs found"

logs-backend: ## View backend logs
	@echo "$(BLUE)📋 Backend logs:$(NC)"
	@tail -f logs/out.log 2>/dev/null || echo "No backend logs found"

info: ## Show project information
	@echo "$(BLUE)📊 Project Information$(NC)"
	@echo ""
	@echo "Backend:"
	@echo "  Port: 3000"
	@echo "  Command: npm run dev"
	@echo "  Location: $(BACKEND_DIR)"
	@echo ""
	@echo "Frontend:"
	@echo "  Port: 5173"
	@echo "  Command: npm run dev"
	@echo "  Location: $(FRONTEND_DIR)"
	@echo ""
	@echo "Database:"
	@echo "  Type: PostgreSQL"
	@echo "  Migration: make migrate"
	@echo ""
	@echo "Testing:"
	@echo "  Command: make test"
	@echo "  Coverage: make test-coverage"
	@echo ""

version: ## Show version and dependency info
	@echo "$(BLUE)📦 Version Information$(NC)"
	@echo ""
	@echo "Node.js:"
	@node --version
	@echo ""
	@echo "npm:"
	@npm --version
	@echo ""
	@echo "PostgreSQL:"
	@psql --version 2>/dev/null || echo "Not installed"
	@echo ""
	@echo "Redis:"
	@redis-cli --version 2>/dev/null || echo "Not installed"
	@echo ""

# ============================================================================
# VALIDATION TARGETS
# ============================================================================

validate: lint test ## Validate code quality (lint + test)
	@echo "$(GREEN)✅ All validations passed!$(NC)"

# ============================================================================
# QUICK COMMANDS
# ============================================================================

setup: install db-setup ## Complete project setup
	@echo "$(GREEN)✅ Project setup complete!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Start backend: make dev-backend"
	@echo "  2. Start frontend: make dev-frontend"
	@echo "  3. Open: http://localhost:5173"

# ============================================================================
# PROJECT DOCUMENTATION
# ============================================================================

.PHONY: docs

docs: ## Open documentation
	@echo "$(BLUE)📚 Bot-Trade Documentation$(NC)"
	@echo ""
	@echo "Main docs:"
	@echo "  • README.md - Project overview"
	@echo "  • docs/INDEX.md - Documentation index"
	@echo ""
	@echo "Guides:"
	@echo "  • docs/ARCHITECTURE.md - System design"
	@echo "  • docs/TESTING.md - Testing guide"
	@echo "  • docs/DEPLOYMENT.md - Deployment"
	@echo ""
	@echo "$(YELLOW)View docs: cat README.md$(NC)"

# ============================================================================
# DEFAULT AND FINAL RULES
# ============================================================================

.SILENT: help info version
.IGNORE: docker-logs logs-backend
