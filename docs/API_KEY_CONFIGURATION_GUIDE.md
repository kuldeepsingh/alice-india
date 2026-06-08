# 🔐 API Key Configuration Guide

## Overview

The system now supports user-configurable API keys for both Claude and Zerodha, just like you wanted! Each user can manage their own credentials from the frontend without any hardcoding or mixups.

---

## ✨ New Features

### 1. **Settings Tab in Frontend**
   - Dedicated UI for API key management
   - Clean, intuitive interface
   - Status indicators (✅ Configured / ❌ Not Set)
   - Links to get credentials

### 2. **Secure Storage**
   - Keys stored locally in browser (localStorage)
   - Never sent to backend unless needed
   - Easy to clear (browser settings)
   - User-controlled (only they see their keys)

### 3. **Smart Validation**
   - Can't create orders without Zerodha keys
   - Can't test Claude without Claude key
   - Clear error messages guiding users
   - Status shown before attempting API calls

### 4. **Multi-User Support**
   - Different users can have different keys
   - Works across devices (each browser has own keys)
   - No conflicts between users

---

## 🚀 How to Use

### Step 1: Open Settings Tab
```
Open http://localhost:5173 in your browser
Click on "⚙️ Settings" tab
```

### Step 2: Configure Claude API Key

**Get your Claude API key:**
1. Visit: https://console.anthropic.com/account/keys
2. Click "Create Key"
3. Name it: "OpenAlice Trading Bot"
4. Copy the key (looks like: `sk-ant-xxxxxxxxxxxxx`)

**Add to frontend:**
1. Click "Add Key" button under Claude section
2. Paste your API key
3. Click "Hide" to close the input field
4. See "✓ Configured" badge appear

### Step 3: Configure Zerodha Keys

**Get your Zerodha credentials:**
1. Login to: https://kite.zerodha.com
2. Go to Settings → API Consents → Generate Token
3. Copy your API Key and API Secret

**Add to frontend:**
1. Click "Add Keys" button under Zerodha section
2. Paste your API Key
3. Paste your API Secret
4. Click "Hide" to close the input fields
5. See "✓ Configured" badge appear

### Step 4: Save API Keys
1. Click "💾 Save API Keys" button
2. You should see: "✅ API keys saved successfully!"
3. Keys are now stored in your browser's localStorage

### Step 5: Switch to Trading
1. Click on "📊 Trading" tab
2. You should see:
   - 🤖 Claude: ✅ Ready
   - 📈 Zerodha: ✅ Ready
3. Now you can:
   - Create orders (uses Zerodha)
   - Test Claude AI (uses Claude)

---

## 🔄 Update or Change Keys

**To update your keys:**
1. Go to "⚙️ Settings" tab
2. Click "Update Key" or "Update Keys"
3. Enter new credentials
4. Click "💾 Save API Keys"

**To remove keys:**
1. Go to Settings → Clear browser data
2. Or delete localStorage items manually

---

## 🔒 Security & Privacy

### How Keys Are Stored
```
User Input (Frontend)
    ↓
Browser LocalStorage
    ↓
Used for API calls (Frontend → Backend)
    ↓
Never stored on server
    ↓
Only used in memory during requests
```

### Important Notes
- ✅ Keys are stored **locally in your browser**
- ✅ **Never sent to our servers** unless you make an API call
- ✅ You **own and control** your keys
- ✅ Clearing browser data will **delete the keys**
- ✅ Keys are **not encrypted** (browser localStorage limitation)
- ⚠️ **Don't share your device** - anyone with access can see keys
- ⚠️ **Don't commit keys to git** - they're only in localStorage

### Best Practices
1. Never share your API keys
2. Regularly rotate keys (especially Zerodha)
3. Keep your browser secure
4. Clear browser data when done
5. Use strong broker passwords
6. Enable 2FA on Anthropic and Zerodha

---

## 🎯 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   User Opens Frontend                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────────────────────────┐
        │  Click "⚙️ Settings" Tab            │
        └────────┬─────────────────────────────┘
                 │
         ┌───────┴──────────┐
         │                  │
         ↓                  ↓
    ┌─────────────┐    ┌──────────────┐
    │ Claude Key  │    │ Zerodha Keys │
    │ sk-ant-xxx  │    │ API + Secret  │
    └──────┬──────┘    └────────┬─────┘
           │                    │
           └─────────┬──────────┘
                     │
                     ↓
          ┌──────────────────────┐
          │ Click Save API Keys  │
          └──────────┬───────────┘
                     │
                     ↓
          ┌──────────────────────┐
          │ Stored in localStorage│
          └──────────┬───────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Click "📊 Trading" Tab │
        └────────┬───────────────┘
                 │
         ┌───────┴──────────┐
         │                  │
         ↓                  ↓
    ┌────────────┐     ┌────────────┐
    │ Create     │     │ Test Claude│
    │ Orders     │     │ Features   │
    │ (Zerodha)  │     │ (Claude)   │
    └────────────┘     └────────────┘
```

---

## 📝 API Endpoints (Backend)

### Store API Keys
```bash
POST /api/v1/config/api-keys
Content-Type: application/json

{
  "claudeApiKey": "sk-ant-xxxxx",
  "zerodhaApiKey": "your-zerodha-key",
  "zerodhaApiSecret": "your-zerodha-secret"
}

Response:
{
  "status": "success",
  "message": "API keys stored successfully",
  "data": {
    "hasClaudeKey": true,
    "hasZerodhaKey": true
  }
}
```

### Check Key Status
```bash
GET /api/v1/config/api-keys
Authorization: Bearer token

Response:
{
  "status": "success",
  "data": {
    "hasClaudeKey": true,
    "hasZerodhaKey": true,
    "updatedAt": "2026-06-08T..."
  }
}
```

---

## 🐛 Troubleshooting

### Keys Not Saving
- Check browser console for errors (F12 → Console)
- Verify localStorage is enabled
- Try a different browser
- Clear browser cache and try again

### Can't Create Orders
- Go to Settings tab
- Confirm Zerodha keys are showing "✓ Configured"
- Verify keys are correct at https://kite.zerodha.com
- Check browser console for specific error

### Claude AI Not Working
- Go to Settings tab
- Confirm Claude key is showing "✓ Configured"
- Verify API key format (should start with `sk-ant-`)
- Check billing setup at https://console.anthropic.com/account/billing
- Confirm key is active (not revoked)

### Want to Use Different Credentials
- Click "Update Key" in Settings
- Enter new credentials
- Click "Save API Keys"
- Done! Next API call will use new credentials

---

## 🚀 Production Considerations

### For Self-Hosted Deployments
If you deploy this system, consider:

1. **Secure Key Storage**
   - Use encrypted database instead of localStorage
   - Encrypt keys at rest
   - Use backend to validate keys
   - Never expose keys in logs

2. **Example Enhancement**
   ```typescript
   // Store encrypted in database
   const encryptedKey = encrypt(claudeApiKey, userPassword)
   await database.saveUserKey(userId, encryptedKey)
   ```

3. **Use Environment Variables for Backend**
   ```bash
   # For server-side operations
   CLAUDE_API_KEY=sk-ant-xxx
   ZERODHA_API_KEY=xxx
   ZERODHA_API_SECRET=xxx
   ```

4. **Key Validation**
   ```typescript
   // Validate keys on backend
   async function validateClaudeKey(key: string) {
     try {
       const response = await anthropic.messages.create(...)
       return { valid: true }
     } catch (e) {
       return { valid: false, error: e.message }
     }
   }
   ```

---

## ✅ Checklist

- [ ] Opened http://localhost:5173
- [ ] Clicked "⚙️ Settings" tab
- [ ] Got Claude API key from console.anthropic.com
- [ ] Got Zerodha keys from kite.zerodha.com
- [ ] Entered both API keys in Settings
- [ ] Clicked "Save API Keys"
- [ ] Saw "✅ API keys saved successfully!"
- [ ] Switched to "📊 Trading" tab
- [ ] Confirmed both keys show "✅ Ready"
- [ ] Created a test order
- [ ] Tested Claude AI feature
- [ ] Both features worked correctly!

---

## 🎉 You're All Set!

Your API keys are now:
- ✅ Securely stored locally
- ✅ Not hardcoded anywhere
- ✅ User-configurable
- ✅ Ready to use

Just like you wanted - similar to how Zerodha was configured! 🚀

---

**Need help?** Check the console logs or see TESTING_GUIDE.md

