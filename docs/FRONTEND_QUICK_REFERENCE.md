# 🎨 Frontend Integration Quick Reference

**Complete React/TypeScript integration examples for Claude AI trading features**

---

## 📦 What You Get

✅ 6 Production-Ready React Components  
✅ API Client with Full Type Support  
✅ Custom Hooks for State Management  
✅ Error Boundary for Exception Handling  
✅ Complete Dashboard Example  
✅ 2,000+ Lines of Code with Comments  

---

## 🚀 Quick Start (5 Minutes)

### 1. Copy Components
```bash
cp src/components/* your-project/src/components/
cp src/services/api-client.ts your-project/src/services/
cp src/hooks/useClaudeFeatures.ts your-project/src/hooks/
```

### 2. Install Dependencies
```bash
npm install axios react-query recharts
```

### 3. Set Environment
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Use in Your App
```tsx
import { TradingDashboard } from './pages/TradingDashboard'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <TradingDashboard />
    </ErrorBoundary>
  )
}
```

---

## 📊 Component Overview

| Component | Purpose | Features |
|-----------|---------|----------|
| **OrderCreator** | Create orders with Claude validation | Signal validation, confidence scoring, risk assessment |
| **SentimentAnalyzer** | Analyze market mood | Market sentiment, trends, caution points |
| **RiskAssessor** | Validate trade appropriateness | Margin safety, concentration check, adjustments |
| **StrategyReviewer** | Review strategy performance | Strengths, weaknesses, improvements, metrics |
| **OptimizationDashboard** | Get improvement recommendations | Optimization score, prioritized suggestions |
| **UsageTracker** | Track API usage and costs | Monthly usage, remaining credits, cost breakdown |
| **TradingDashboard** | Complete dashboard | All features in one place with tab navigation |

---

## 🔌 API Endpoints Quick Reference

### Trading
```typescript
// Create order with Claude
POST /orders/create-with-claude
  → claudeAnalysis: { isValid, confidence, reasoning, riskLevel }

// Create standard order
POST /orders
```

### Market Analysis
```typescript
// Analyze sentiment
POST /market-analysis/sentiment
  → sentimentAnalysis: { sentiment, trend, confidence, caution_points }

// Assess risk
POST /market-analysis/risk
  → riskAnalysis: { riskScore, recommendation, marginSafety }

// Get usage stats
GET /market-analysis/usage
  → { monthlyUsage, creditsRemaining, currentCostUSD }

// Get costs
GET /market-analysis/costs
  → { costPerAnalysis, monthlyEstimates }
```

### Analytics
```typescript
// Review strategy
POST /analytics/strategy-review
  → { strengths, weaknesses, improvements, assessment }

// Detect anomalies
POST /analytics/detect-anomaly
  → { isAnomaly, severity, recommendation, suggestedActions }

// Get recommendations
POST /analytics/recommendations
  → { recommendations, optimizationScore }

// Get optimization score
POST /analytics/optimization-score
  → { optimizationScore, interpretation }
```

---

## 🪝 Custom Hook Usage

```typescript
import { useClaudeFeatures } from './hooks/useClaudeFeatures'

function MyComponent() {
  const { 
    createOrderWithClaude,
    analyzeSentiment,
    reviewStrategy,
    loading,
    error 
  } = useClaudeFeatures()

  // Use hook methods...
  const handleTrade = async () => {
    try {
      const result = await createOrderWithClaude({
        accountId: 'acc-123',
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 100,
        price: 2850,
      })
      console.log('Claude analysis:', result.claudeAnalysis)
    } catch (err) {
      console.error(error)
    }
  }
}
```

---

## 🎨 Component Examples

### Minimal Order Creator
```tsx
<OrderCreator />
```

### Sentiment Analysis
```tsx
<SentimentAnalyzer />
```

### Risk Check
```tsx
<RiskAssessor />
```

### Full Dashboard
```tsx
<TradingDashboard />
```

---

## 🔐 Authentication

Token automatically added to all requests:
```typescript
// Stored in localStorage
localStorage.setItem('authToken', 'your_jwt_token')

// Automatically sent in Authorization header
Authorization: Bearer <your_jwt_token>
```

---

## 📊 Data Flow

```
User Input
    ↓
React Component
    ↓
API Client (axios)
    ↓
Backend API
    ↓
Claude AI / Database
    ↓
API Response
    ↓
Component State Update
    ↓
UI Render
```

---

## 🚨 Error Handling

All components handle errors gracefully:

```typescript
try {
  const result = await tradingAPI.createOrderWithClaude(data)
} catch (error) {
  if (error.response?.status === 403) {
    // Show "Upgrade to premium" message
  } else if (error.response?.status === 400) {
    // Show validation error
  } else {
    // Show generic error
  }
}
```

---

## 📈 Performance Tips

1. **Cache API responses** - Use React Query for automatic caching
2. **Lazy load components** - Code split dashboard tabs
3. **Debounce inputs** - Delay API calls while typing
4. **Error boundaries** - Catch component errors gracefully
5. **Loading states** - Show skeleton screens while fetching

---

## 🧪 Testing with cURL

```bash
# Order with Claude
curl -X POST http://localhost:3000/api/v1/orders/create-with-claude \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"acc-123","symbol":"RELIANCE","side":"BUY","quantity":100,"price":2850}'

# Sentiment analysis
curl -X POST http://localhost:3000/api/v1/market-analysis/sentiment \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"marketData":{"index_level":78000,"breadth":{"advances":1850,"declines":850}}}'

# Get usage
curl -X GET http://localhost:3000/api/v1/market-analysis/usage \
  -H "Authorization: Bearer TOKEN"
```

---

## 📚 File Locations

```
your-project/
├── src/
│   ├── components/
│   │   ├── OrderCreator.tsx
│   │   ├── SentimentAnalyzer.tsx
│   │   ├── RiskAssessor.tsx
│   │   ├── StrategyReviewer.tsx
│   │   ├── OptimizationDashboard.tsx
│   │   ├── UsageTracker.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── OrderCreator.css (+ other CSS)
│   ├── services/
│   │   └── api-client.ts
│   ├── hooks/
│   │   └── useClaudeFeatures.ts
│   ├── pages/
│   │   └── TradingDashboard.tsx
│   └── styles/
│       └── variables.css
└── .env
```

---

## ✨ Key Features

### OrderCreator
- ✅ Real-time validation
- ✅ Claude analysis display
- ✅ Position adjustments
- ✅ Success/error messages

### SentimentAnalyzer
- ✅ Market mood gauge
- ✅ Trend identification
- ✅ Preferred trades
- ✅ Caution points

### RiskAssessor
- ✅ Risk scoring
- ✅ Margin safety check
- ✅ Concentration analysis
- ✅ Specific adjustments

### StrategyReviewer
- ✅ Performance metrics
- ✅ Strengths/weaknesses
- ✅ Improvement suggestions
- ✅ Chart visualization

### OptimizationDashboard
- ✅ Optimization score (0-100)
- ✅ Priority-based recommendations
- ✅ Implementation details
- ✅ Expected improvements

### UsageTracker
- ✅ Monthly usage display
- ✅ Credits remaining
- ✅ Cost breakdown
- ✅ Feature pricing

---

## 🎯 Real-World Workflow

### Morning: Review Market
```
1. Open TradingDashboard
2. Click "Sentiment" tab
3. View market mood and preferred trades
4. Check "Usage" tab for remaining credits
```

### Pre-Trade: Validate Signal
```
1. Click "Trading" tab
2. Enter order details (symbol, price, quantity)
3. Set confidence level
4. Click "Create Order"
5. Review Claude analysis
6. Confirm trade
```

### Weekly: Optimize Strategy
```
1. Click "Strategy" tab
2. Enter your strategy metrics
3. Get strengths/weaknesses
4. Click "Optimize" tab
5. Review recommendations
6. Plan improvements
```

---

## 🚀 Deployment Checklist

- [ ] Copy all component files
- [ ] Install dependencies
- [ ] Set environment variables
- [ ] Wrap app with ErrorBoundary
- [ ] Test API connectivity
- [ ] Configure authentication
- [ ] Test all components
- [ ] Add custom styling (optional)
- [ ] Deploy to production

---

## 📞 Support

- Full code in `frontend-integration-guide.md`
- 2,000+ lines of documented examples
- TypeScript throughout
- Production-ready code
- Best practices included

---

## 📋 Summary

You have:
✅ 6 complete React components  
✅ Full API integration  
✅ State management hooks  
✅ Error handling  
✅ Type-safe TypeScript  
✅ Production-ready code  

**Ready to deploy immediately!** 🚀

