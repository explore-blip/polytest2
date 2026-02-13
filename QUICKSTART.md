# 🚀 Quick Start Guide - 5 Minutes to Your First Analysis

Get your Polymarket Comment Analyzer up and running in just 5 minutes!

---

## ⚡ Prerequisites (1 minute)

You need:
- ✅ Web browser (Chrome, Firefox, Safari, Edge)
- ✅ ONE API key: [Claude](https://console.anthropic.com/) OR [OpenAI](https://platform.openai.com/)
- ✅ [Railway](https://railway.app/) account (free, login with GitHub)
- ✅ [GitHub](https://github.com/) account (free)

---

## 📝 Step 1: Get API Key (1 minute)

### Option A: Claude (Recommended - 3x Cheaper)

1. Go to https://console.anthropic.com/
2. Sign up with email or Google
3. Click **"API Keys"** (left sidebar)
4. Click **"Create Key"**
5. Name it: `Polymarket Analyzer`
6. **Copy the key** - starts with `sk-ant-api03-`
7. **SAVE IT** somewhere safe (you won't see it again!)

**Cost**: ~$0.003 per analysis

### Option B: OpenAI GPT-4 (Backup)

1. Go to https://platform.openai.com/signup
2. Create account and verify email
3. Go to https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Name it: `Polymarket Analyzer`
6. **Copy the key** - starts with `sk-proj-`
7. **SAVE IT** somewhere safe!

**Cost**: ~$0.01 per analysis

---

## 🚀 Step 2: Deploy Backend (2 minutes)

### A. Fork Repository

1. Go to https://github.com/YOUR_USERNAME/polymarket-analyzer (replace with your repo)
2. Click **"Fork"** (top right)
3. You now have your own copy!

### B. Deploy to Railway

1. Go to https://railway.app/
2. Click **"New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select **"Configure GitHub App"** (if first time)
5. Select your `polymarket-analyzer` repository
6. Railway will auto-detect Node.js app ✅

### C. Set Root Directory

1. Click **"Settings"** tab
2. Find **"Root Directory"**
3. Set to: `backend`
4. Click **"Update"**

### D. Add Environment Variables

1. Click **"Variables"** tab
2. Click **"New Variable"** and add each:

```
NODE_ENV = production
PORT = 3000
FRONTEND_URL = *
ANTHROPIC_API_KEY = [your key from Step 1]
```

**OR** if using OpenAI:

```
NODE_ENV = production
PORT = 3000
FRONTEND_URL = *
OPENAI_API_KEY = [your key from Step 1]
```

3. Click **"Deploy"** (Railway auto-deploys)

### E. Get Backend URL

1. Wait 2 minutes for deployment (watch logs)
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. **COPY YOUR URL**: `https://polymarket-analyzer-production-xxxx.up.railway.app`

### F. Test Backend

Open in browser: `https://your-url.railway.app/health`

You should see:
```json
{"status":"healthy","timestamp":"..."}
```

✅ **Backend is live!**

---

## 🎨 Step 3: Deploy Frontend (1 minute)

### A. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **"Settings"** (top menu)
3. Click **"Pages"** (left sidebar)
4. Under **"Source"**: select **"main"** branch
5. Click **"Save"**

### B. Access Frontend

Wait 1 minute, then open:

```
https://YOUR_USERNAME.github.io/polymarket-analyzer/
```

You should see the dark UI with:
> "Read 18,000 comments in 10 seconds"

✅ **Frontend is live!**

---

## ⚙️ Step 4: Connect Frontend to Backend (30 seconds)

1. On your frontend page, click **Settings** ⚙️ (top right)
2. Paste your Railway backend URL from Step 2E
3. Remove trailing slash if present
4. Click **"Save Configuration"**
5. Click **"Test Connection"**

You should see:
> ✅ Connection successful! Server is healthy

✅ **Connected!**

---

## 🎯 Step 5: Run Your First Analysis (30 seconds)

### A. Find a Market

1. Go to https://polymarket.com/
2. Browse active markets
3. Click any market (e.g., "Will Trump win 2024?")
4. Copy the market slug from URL:

```
https://polymarket.com/event/will-trump-win-2024
                              └────────┬────────┘
                                   Copy this
```

### B. Analyze

1. Paste market slug in your analyzer
2. Keep all checkboxes checked:
   - ✅ Filter Position Holders
   - ✅ Sentiment Analysis  
   - ✅ Divergence Detection
   - ✅ Find Alpha Signals
3. Click **"Analyze Comments"** 🚀
4. Wait 5-10 seconds

### C. Review Results

You'll see:
- 📊 Summary cards (comments, holders, sentiment)
- 🥧 Interactive sentiment chart
- 💡 Key AI insights
- 🚨 Divergence alerts (if detected)
- 🔥 Top alpha comments (scored 1-10)
- 🕵️ Insider mentions (if found)

✅ **You're analyzing markets like a pro!**

---

## 🎉 Success! What's Next?

### Try Different Markets

- Presidential elections
- Cryptocurrency price predictions
- Sports outcomes
- Tech company decisions
- Economic forecasts

### Experiment with Options

- **Disable "Filter Holders"** - See all comments
- **Disable "Divergence Detection"** - Faster analysis
- **Try large markets** - 500+ comments

### Share Your Insights

- Tweet your findings with #Polymarket
- Share divergence alerts with trader friends
- Use insights to inform your own positions

---

## 💰 Cost Tracking

### Your Monthly Budget

**Free Tier Limits**:
- Railway: 500 hours/month + $5 credit = **$0/month**
- GitHub Pages: Unlimited = **$0/month**

**AI API Costs**:
- Claude: ~$0.003 per analysis
- OpenAI: ~$0.01 per analysis

**Example**:
- 100 analyses/month with Claude = **$0.30/month**
- 1000 analyses/month with Claude = **$3/month**

**Set up billing alerts**:
- [Anthropic Console](https://console.anthropic.com/settings/billing)
- [OpenAI Billing](https://platform.openai.com/account/billing/limits)

---

## 🐛 Quick Troubleshooting

### "Backend connection failed"

**Fix**: Double-check backend URL in Settings
- Should start with `https://`
- No trailing slash
- Test health endpoint in browser

### "Failed to fetch comments"

**Fix**: Verify market ID
- Copy directly from Polymarket.com URL
- Try a different market
- Check market has comments

### "Failed to analyze comments"

**Fix**: Check API key
- Go to Railway → Variables
- Verify key is correct
- Ensure key has credits
- Check Railway logs for errors

**Need more help?** See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) for detailed troubleshooting.

---

## 📚 Learn More

- **[README.md](README.md)** - Full project documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment guide
- **[backend/README.md](backend/README.md)** - API documentation

---

## 🎮 Pro Tips

### 1. Focus on Large Markets
Markets with 500+ comments yield better insights.

### 2. Look for Divergence
High-severity alerts often signal important disagreements.

### 3. Check Alpha Scores
Comments scored 8-10 typically contain unique information.

### 4. Verify Insider Mentions
Always independently verify claims of insider knowledge.

### 5. Track Sentiment Trends
Run analysis multiple times to see sentiment evolution.

---

## ⭐ You're All Set!

You now have a fully functional Polymarket Comment Analyzer that can:
- ✅ Analyze 1000s of comments in seconds
- ✅ Detect sentiment and divergence
- ✅ Extract alpha signals
- ✅ Generate AI-powered insights
- ✅ Display beautiful visualizations

**Total setup time**: ~5 minutes  
**Total cost**: $0-3/month (depending on usage)

---

**Happy analyzing! May you find all the alpha! 🚀📊💚**

---

## 🤝 Questions or Issues?

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions or share insights
- **Documentation**: Check [README.md](README.md) for more details

**Built by traders, for traders** 💚
