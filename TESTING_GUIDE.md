# 🧪 Complete Testing Guide

## ✅ System Status

| Component | Status | URL |
|-----------|--------|-----|
| Backend | ✅ Running | `http://localhost:3000` |
| Frontend | ✅ Running | `http://localhost:5173` |
| Database | ✅ Connected | PostgreSQL `bot_trade` |

---

## 🌐 Open Frontend

Visit: **http://localhost:5173**

You should see:
```
🤖 Trading Bot Test
✅ Backend Status: Connected to backend
📊 Create Test Order form
```

---

## 🧪 Test 1: Basic Order Creation

### Steps:
1. Go to http://localhost:5173
2. Fill in the form:
   - Symbol: `RELIANCE`
   - Quantity: `10`
   - Price: `2850`
3. Click **"Create Order"**
4. ✅ Expected: Success popup with order details

### What's Happening:
- Frontend sends POST request to `http://localhost:3000/api/v1/orders`
- Backend creates order in PostgreSQL
- Order is returned with ID and status

---

## 🤖 Test 2: Claude AI Features (Requires API Key)

### Prerequisites:
1. Get Claude API key from https://console.anthropic.com/account/keys
2. Add to `.env` file:
   ```bash
   CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```
3. Restart backend (or it auto-restarts)

### Steps:
1. Fill in symbol, quantity, price
2. Click **"🤖 Test Claude AI"** button
3. ✅ Expected: Analysis result showing:
   - Sentiment (bullish/bearish)
   - Confidence score
   - Recommendations

### What's Happening:
- Claude analyzes market sentiment
- Validates trade risk
- Provides trading recommendations
- Cost: ~$0.001 per request (cached)

---

## 🔍 Detailed Testing Scenarios

### Scenario 1: Multiple Orders
```
Order 1: RELIANCE 10 @ 2850 (BUY)
Order 2: INFY 5 @ 1500 (BUY)  
Order 3: TCS 2 @ 3500 (BUY)
```
✅ All orders should be created successfully
✅ Order list should show all 3 orders

### Scenario 2: Claude Analysis with Different Stocks
```
Test Claude for:
- RELIANCE (large cap)
- INFY (IT sector)
- HDFCBANK (banking)
```
✅ Each should get different sentiment analysis
✅ Should see varying confidence scores

### Scenario 3: Risk Assessment
```
1. Create order with:
   - Large quantity
   - High price
   - Risky symbol
2. Click "Test Claude AI"
```
✅ Claude should warn about risk
✅ Should suggest risk mitigation

---

## 📊 Backend Testing (cURL)

### Health Check
```bash
curl http://localhost:3000/health/live
```
✅ Should return: `{"status":"alive"}`

### Create Order via API
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "quantity": 10,
    "price": 2850,
    "orderType": "LIMIT",
    "transactionType": "BUY",
    "validity": "DAY"
  }'
```
✅ Should return: order object with ID

### Check Orders
```bash
curl http://localhost:3000/api/v1/orders
```
✅ Should return: array of created orders

---

## 🎯 Expected Results

### Without Claude API Key:
- ✅ Orders can be created
- ✅ Backend responds to all requests
- ⚠️ Claude AI tests will fail gracefully
- ⚠️ Error message: "Add Claude API key"

### With Claude API Key:
- ✅ Orders can be created
- ✅ Claude AI analysis works
- ✅ Sentiment analysis displays
- ✅ Risk warnings show up
- ✅ All features enabled

---

## 🐛 Troubleshooting

### Frontend won't connect to backend
- Check backend is running: `lsof -i :3000`
- Check frontend env: `cat .env.local`
- Should show: `VITE_API_URL=http://localhost:3000/api/v1`

### Claude AI not working
- Check API key is set: `grep CLAUDE /Users/kuldeep/projects/openalice-india/.env`
- Check key format: should start with `sk-ant-`
- Verify billing setup at https://console.anthropic.com/account/billing

### Orders not saving
- Check database: `psql bot_trade -c "\d trading_orders"`
- Check backend logs: `tail -f /tmp/backend.log`
- Verify database connection: `psql bot_trade -c "SELECT 1"`

---

## 📈 Performance Metrics to Check

1. **Order Creation Time**: Should be < 500ms
2. **Claude Analysis Time**: Should be < 2 seconds (first time), < 500ms (cached)
3. **API Response Time**: Should be < 200ms for simple endpoints
4. **Error Rate**: Should be 0% for valid requests

---

## 🚀 Next Steps After Testing

1. ✅ Verify backend and frontend connection
2. ✅ Create test orders successfully
3. ✅ Add Claude API key and test AI
4. ✅ Check database has orders stored
5. ⏭️ Deploy to production
6. ⏭️ Launch to users
7. ⏭️ Monitor and optimize

---

## 📞 Need Help?

Backend Logs:
```bash
tail -f /tmp/backend.log
```

Frontend Logs:
```bash
tail -f /tmp/frontend.log
```

Kill and Restart:
```bash
# Backend
kill $(cat /tmp/backend.pid)
npm run dev

# Frontend
kill $(cat /tmp/frontend.pid)
npm run dev
```

---

## ✅ Checklist

- [ ] Backend running at http://localhost:3000
- [ ] Frontend running at http://localhost:5173
- [ ] Can see "Connected to backend" message
- [ ] Created at least 1 test order
- [ ] Orders appear in order list
- [ ] Claude API key obtained
- [ ] Claude AI test completed
- [ ] Claude analysis received

**Once all checked: System is ready for production!** 🚀

