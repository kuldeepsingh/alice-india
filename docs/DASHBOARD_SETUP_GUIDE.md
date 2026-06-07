# Admin Dashboard - Setup & Running Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (or 18+)
- pnpm (recommended) or npm
- Backend running on http://localhost:3000

### 1. Install Dependencies

```bash
cd admin-dashboard

# Using pnpm (recommended)
pnpm install

# OR using npm
npm install
```

### 2. Configure Environment

Create `.env` file from template:
```bash
cp .env.example .env
```

Default configuration (already set):
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Alice India Admin Dashboard
```

### 3. Start Development Server

```bash
pnpm dev
```

Expected output:
```
VITE v4.4.0  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 4. Open in Browser

Navigate to: **http://localhost:5173**

---

## 📄 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with HMR

# Testing
pnpm test             # Run tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build locally

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
```

---

## 🔧 Configuration Files

### `vite.config.ts`
- Port: **5173**
- API Proxy: `/api` → `http://localhost:3000`
- React plugin enabled
- Path aliases: `@/` and `@tests/`

### `tsconfig.json`
- Target: **ES2020**
- Strict mode: **enabled**
- JSX: **react-jsx**
- Module resolution: **bundler**

### `.env.example`
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Alice India Admin Dashboard
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable components
│   ├── Header.tsx    # Top navigation
│   ├── Sidebar.tsx   # Left sidebar menu
│   └── Layout.tsx    # Page wrapper
├── pages/            # Page components
│   ├── Dashboard.tsx # Overview page
│   ├── Users.tsx     # User management
│   ├── Accounts.tsx  # Account management
│   ├── Orders.tsx    # Order history
│   └── Analytics.tsx # Analytics dashboard
├── services/         # API integration
│   └── api.ts       # Axios instance & endpoints
├── state/            # State management
│   └── store.ts     # Zustand auth store
├── styles/           # Global styles
│   └── index.css    # Tailwind CSS
├── App.tsx          # Main app & routing
└── main.tsx         # React entry point
```

---

## 🔄 Development Workflow

### 1. Start Backend
```bash
# Terminal 1
cd ~/projects/openalice-india
npm run dev
# Server listening on port 3000
```

### 2. Start Frontend
```bash
# Terminal 2
cd ~/projects/openalice-india/admin-dashboard
pnpm dev
# Dashboard on http://localhost:5173
```

### 3. Development
- Edit components in `src/`
- Changes auto-reload in browser (HMR)
- API calls proxy to `http://localhost:3000/api/v1`
- State updates via Zustand store

### 4. Testing
```bash
# Terminal 3
cd admin-dashboard
pnpm test:watch     # Watch mode testing
```

---

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Test File
```bash
pnpm test unit/components.test.ts
pnpm test integration/api-integration.test.ts
pnpm test e2e/dashboard-flow.test.ts
```

### Watch Mode
```bash
pnpm test:watch
# Tests re-run on file changes
```

### Coverage Report
```bash
pnpm test:coverage
# Generates coverage report
```

---

## 🏗️ Building for Production

### Build
```bash
pnpm build
# Creates optimized build in dist/
```

### Preview Production Build
```bash
pnpm preview
# Serves production build locally
# Usually on http://localhost:4173
```

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-xxxxx.js    # Main bundle
│   ├── vendor-xxxxx.js   # Vendor bundle
│   └── *.css             # Compiled CSS
└── .htaccess             # Apache config (optional)
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# If port 5173 is in use, specify different port:
pnpm dev -- --port 5174
```

### API Connection Error
```
Error: Cannot connect to http://localhost:3000/api/v1
```

**Solution:**
1. Ensure backend is running: `cd .. && npm run dev`
2. Check backend is on port 3000
3. Verify CORS_ORIGINS in backend .env includes localhost:5173
4. Check if VITE_API_URL in .env is correct

### Module Not Found
```
Error: Cannot find module 'react'
```

**Solution:**
1. Install dependencies: `pnpm install`
2. Clear cache: `rm -rf node_modules && pnpm install`
3. Clear Vite cache: `rm -rf .vite`

### TypeScript Errors
```bash
# Check for type errors:
pnpm type-check

# Fix ESLint issues:
pnpm lint --fix
```

---

## 📚 Technologies Used

| Tech | Purpose | Version |
|------|---------|---------|
| **React** | UI library | 18.2.0 |
| **TypeScript** | Type safety | 5.1.0 |
| **Vite** | Build tool | 4.4.0 |
| **React Router** | Routing | 6.14.0 |
| **Axios** | HTTP client | 1.4.0 |
| **Zustand** | State management | 4.3.9 |
| **Tailwind CSS** | Styling | 3.3.0 |
| **Vitest** | Testing | 0.34.0 |

---

## 🔐 Security Considerations

### API Security
- JWT tokens stored in localStorage
- Automatically added to Authorization headers
- Refresh token support
- Protected routes with auth check

### Environment Variables
- Sensitive values in `.env` (gitignored)
- Template provided in `.env.example`
- CORS properly configured on backend

### CORS Policy
```
Allowed Origins:
- http://localhost:3000    (admin dashboard)
- http://localhost:5173    (Vite dev server)
- 127.0.0.1:5173          (localhost variant)
```

---

## 📖 API Integration

### Making API Calls
```typescript
import { accountsAPI, ordersAPI } from '@/services/api'

// Fetch accounts
const accounts = await accountsAPI.getAll()

// Create order
const order = await ordersAPI.create({
  accountId: '123',
  symbol: 'RELIANCE',
  side: 'BUY',
  quantity: 10,
  price: 2650.50
})
```

### API Endpoints
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /accounts` - List accounts
- `POST /accounts` - Create account
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /market/quote/:symbol` - Get quote

---

## 🎨 Styling

### Tailwind CSS
- Configured in `vite.config.ts`
- Global styles in `src/styles/index.css`
- Component-level classes
- Responsive classes available

### Custom Styles
```css
/* src/styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add custom styles here */
button {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
```

---

## 📊 State Management

### Zustand Store
```typescript
import { useAuthStore } from '@/state/store'

const { user, token, logout } = useAuthStore()

// Set token
useAuthStore.setState({ token: 'new-token' })

// Logout
useAuthStore.getState().logout()
```

### Persisted to localStorage
- `authToken` - JWT access token
- `user` - Current user object

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# Connect GitHub repo to Vercel
# Automatic deployments on push
# Environment variables in Vercel dashboard
```

### Deploy to AWS S3 + CloudFront
```bash
# Build
pnpm build

# Upload dist/ to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id xxx --paths "/*"
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "preview"]
```

---

## 📞 Support

- **Issues?** Check the main project README
- **Backend API?** See backend/API_DOCUMENTATION.md
- **Tests failing?** Run `pnpm test:watch` for details
- **TypeScript errors?** Run `pnpm type-check`

---

**Ready to develop!** 🎉

Start with:
```bash
pnpm dev
```

Then open: **http://localhost:5173**
