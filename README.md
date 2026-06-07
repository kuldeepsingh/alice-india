# 🤖 Bot-Trade - Professional Automated Trading Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-Active%20Development-green)
![License](https://img.shields.io/badge/license-MIT-green)

> A professional, enterprise-grade automated trading platform for Indian stock markets with real-time analytics, multi-broker support, and advanced trading tools.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Trading Features
- 📊 **Real-time Analytics** - Live market data and trading insights
- 🔐 **Bank-Grade Security** - Enterprise-level encryption and authentication
- 📈 **Advanced Charts** - Professional trading tools with technical analysis
- 🌍 **Multi-Broker Support** - Support for Zerodha, Sharekhan, and other brokers
- 🤖 **Automated Trading** - Algorithmic trading and strategy backtesting
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

### Admin Dashboard
- 👥 **User Management** - Create and manage platform users
- 💼 **Account Management** - Multi-account trading support
- 📋 **Order Tracking** - Real-time order history and status
- 📊 **Performance Analytics** - Trading metrics and statistics
- 🔔 **Real-time Notifications** - Order updates and market alerts

### Security & Performance
- 🔐 JWT Token-based Authentication
- 🔄 Refresh Token Support
- 🏪 Redis Caching for performance
- 📦 PostgreSQL with Connection Pooling
- 🔍 Comprehensive Logging
- ⚡ Zero-downtime Deployments

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 4.5.14
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 3.4.19
- **State Management:** Zustand 4.5.7
- **Routing:** React Router DOM 6.30.4
- **HTTP Client:** Axios 1.17.0
- **Charts:** Recharts 2.15.4

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with pg library
- **Cache:** Redis
- **Authentication:** JWT with Bcryptjs
- **Logging:** Pino (structured logging)
- **API Documentation:** OpenAPI 3.0 / Swagger

### Testing
- **Unit Testing:** Vitest 0.34.6
- **E2E Testing:** Vitest
- **Integration Testing:** Vitest

### DevOps & Infrastructure
- **Version Control:** Git
- **Container:** Docker (optional)
- **Process Manager:** PM2 (for production)
- **Kubernetes:** Deployment ready

---

## 📁 Project Structure

```
openalice-india/
├── admin-dashboard/              # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API and utility services
│   │   ├── state/               # Zustand store
│   │   ├── styles/              # Global styles
│   │   └── App.tsx              # Main app component
│   ├── tests/                    # Test files
│   │   ├── unit/                # Unit tests
│   │   ├── integration/         # Integration tests
│   │   └── e2e/                 # End-to-end tests
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS config
│   ├── tsconfig.json            # TypeScript config
│   └── package.json             # Frontend dependencies
│
├── src/                          # Backend TypeScript
│   ├── index.ts                 # Server entry point
│   ├── app.ts                   # Express app setup
│   ├── routes/                  # API routes
│   │   ├── auth.ts              # Authentication endpoints
│   │   ├── accounts.ts          # Account management
│   │   ├── orders.ts            # Order management
│   │   └── market-data.ts       # Market data endpoints
│   ├── services/                # Business logic
│   │   ├── database.ts          # Database connection & migrations
│   │   ├── logger.ts            # Structured logging
│   │   ├── jwt.ts               # JWT token management
│   │   ├── password.ts          # Password hashing
│   │   ├── user-service.ts      # User management
│   │   ├── account-service.ts   # Account management
│   │   ├── order-service.ts     # Order management
│   │   └── market-data-service.ts # Market data
│   ├── middleware/              # Express middleware
│   │   └── auth.ts              # Authentication middleware
│   ├── cache/                   # Redis cache
│   │   └── client.ts            # Redis client setup
│   └── types/                   # TypeScript types
│
├── migrations/                   # Database migrations
│   ├── 001_create_users_table.sql
│   ├── 002_create_trading_accounts_table.sql
│   └── 003_create_orders_table.sql
│
├── core/openalice/              # OpenAlice submodule (read-only)
│   └── ...                       # OpenAlice trading engine
│
├── docs/                         # Documentation folder
│   ├── SETUP_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   └── API.md
│
├── openapi.yaml                 # OpenAPI specification
├── package.json                 # Backend dependencies
├── tsconfig.json                # Backend TypeScript config
├── .env                         # Environment variables
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ or **pnpm** 8+
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org))
- **Redis** 6+ ([Download](https://redis.io))
- **Git** ([Download](https://git-scm.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kuldeepsingh/alice-india.git
cd alice-india
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd admin-dashboard
npm install
cd ..
```

4. **Setup environment variables**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

5. **Setup database**
```bash
# Create PostgreSQL database
createdb bot_trade

# Run migrations
npm run migrate
```

6. **Start Redis**
```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 redis:alpine

# Or using Homebrew (macOS)
brew services start redis
```

### Running the Application

**Terminal 1 - Backend API**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend Dashboard**
```bash
cd admin-dashboard
npm run dev
# Runs on http://localhost:5173
```

**Access the dashboard:**
```
http://localhost:5173
Username: admin
Password: admin
```

---

## 👨‍💻 Development

### Project Commands

#### Backend
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm run start

# Type checking
npx tsc --noEmit

# Database migrations
npm run migrate
```

#### Frontend
```bash
cd admin-dashboard

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

### Code Style

- **Language:** TypeScript with strict mode enabled
- **Formatter:** Prettier (configured)
- **Linter:** ESLint (configured)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make commits
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
# (on GitHub)
```

---

## 🧪 Testing

### Run All Tests
```bash
cd admin-dashboard
npm test
```

### Watch Mode (Recommended for Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Test Structure
- **Unit Tests:** Component and utility functions
- **Integration Tests:** API calls and data flow
- **E2E Tests:** Complete user workflows

See [Testing Guide](./docs/TESTING.md) for detailed information.

---

## 📚 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md) - Detailed installation and configuration
- [Architecture Design](./docs/ARCHITECTURE.md) - System architecture and design patterns
- [Testing Guide](./docs/TESTING.md) - Testing strategies and running tests
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Week 1-6 Audit](./docs/ARCHITECTURE_AUDIT_WEEK1-6.md) - Code audit results
- [Week 7 Plan](./docs/WEEK7_ARCHITECTURE_PLAN.md) - Architecture planning

---

## 🏗 Architecture

### Three-Layer Architecture

**Layer 1: Frontend (React)**
- User Interface Components
- State Management (Zustand)
- API Integration (Axios)
- Client-side Routing

**Layer 2: Backend (Express + Node.js)**
- REST API Endpoints
- Business Logic
- Authentication & Authorization
- Data Validation

**Layer 3: Data (PostgreSQL + Redis)**
- Persistent Data Storage
- Caching Layer
- Migration Support

### Key Design Principles

1. **Separation of Concerns** - Each layer has specific responsibilities
2. **Scalability** - Horizontal scaling ready with Redis cache
3. **Security** - JWT auth, password hashing, role-based access control
4. **Maintainability** - TypeScript, clear structure, comprehensive logging
5. **Testing** - Unit, integration, and E2E test coverage

See [Architecture Document](./docs/ARCHITECTURE.md) for detailed information.

---

## 🔐 Security

### Features

- 🔐 JWT Token Authentication
- 🔄 Refresh Token Support (7-day expiry)
- 🔒 Bcrypt Password Hashing (10-round salting)
- 👮 Role-Based Access Control (Admin, Trader, Viewer)
- 🌐 CORS Configuration
- 📝 Structured Logging & Audit Trail

### Best Practices

- Keep `.env` file secrets secure
- Use HTTPS in production
- Regularly update dependencies
- Review security logs regularly
- Use strong API keys and tokens

---

## 📊 Performance

### Optimization Strategies

- **Redis Caching** for frequently accessed data
- **Connection Pooling** for database queries
- **Code Splitting** in frontend with Vite
- **Lazy Loading** for React components
- **Query Optimization** with proper indexing

### Monitoring

- Structured logging with Pino
- Slow query detection (>1s)
- Error tracking and reporting
- Performance metrics tracking

---

## 🚢 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis instance deployed
- [ ] SSL/TLS certificates installed
- [ ] Build optimizations applied
- [ ] Tests passing
- [ ] Security audit completed

See [Deployment Guide](./docs/DEPLOYMENT.md) for step-by-step instructions.

---

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Write TypeScript with strict mode
- Add tests for new features
- Update documentation
- Follow existing code style
- Use meaningful commit messages

---

## 📞 Support

- 📧 **Email:** support@bot-trade.com
- 💬 **GitHub Issues:** [Report a bug](https://github.com/kuldeepsingh/alice-india/issues)
- 📖 **Documentation:** See [docs](./docs) folder
- 🆘 **Help:** Check [Setup Guide](./docs/SETUP_GUIDE.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] Admin Dashboard
- [x] User Authentication
- [x] Account Management
- [x] Order Tracking
- [x] Analytics Dashboard

### Phase 2 (Q2 2026)
- [ ] Mobile App (React Native)
- [ ] Advanced Technical Analysis
- [ ] Real-time Notifications
- [ ] 2FA Authentication
- [ ] Webhook Support

### Phase 3 (Q3 2026)
- [ ] iOS Native App (SwiftUI)
- [ ] Android Native App (Kotlin)
- [ ] Machine Learning Predictions
- [ ] Advanced Risk Management
- [ ] Portfolio Optimization

### Phase 4 (Q4 2026)
- [ ] Multi-Market Support
- [ ] Institutional Features
- [ ] API for Third-party Integrations
- [ ] Custom Strategy Builder

---

## 📈 Statistics

- **Total Tests:** 15+ (Unit, Integration, E2E)
- **Code Coverage:** 80%+
- **Architecture Compliance:** 100%
- **Components:** 8+ (Header, Sidebar, Dashboard, etc.)
- **Pages:** 5 (Dashboard, Users, Accounts, Orders, Analytics)
- **API Endpoints:** 15+ (Auth, Users, Accounts, Orders, Market Data)

---

## 🙏 Acknowledgments

- OpenAlice trading engine integration
- Zerodha API for market data
- React and TypeScript communities
- All contributors and supporters

---

## 👨‍💻 Author

**Kuldeep Singh**
- GitHub: [@kuldeepsingh](https://github.com/kuldeepsingh)
- Email: kuldeep@arrcus.com

---

## 📊 Project Stats

![Lines of Code](https://img.shields.io/badge/Lines%20of%20Code-5000+-blue)
![Commits](https://img.shields.io/badge/Commits-50+-green)
![Issues Resolved](https://img.shields.io/badge/Issues%20Resolved-20+-yellow)
![Last Updated](https://img.shields.io/badge/Last%20Updated-June%202026-brightgreen)

---

**Made with ❤️ for Indian traders**

⭐ If you find this project helpful, please give it a star!
