# 🚀 Polymarket Comment Analyzer - Complete Deployment Guide

## 📋 Table of Contents
1. [Quick Start (5 Minutes)](#quick-start)
2. [Backend Deployment to Railway](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [API Keys Setup](#api-keys-setup)
5. [Testing & Verification](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start (5 Minutes)

### What You'll Need:
- ✅ GitHub account (free)
- ✅ Railway account (free - no credit card required)
- ✅ Anthropic Claude API key OR OpenAI API key (at least one required)
- ✅ 5 minutes

### Cost Breakdown:
- **Railway Hosting**: $0 (free tier: 500 hours/month, $5 credit)
- **Claude API**: ~$0.003 per analysis (~300 analyses for $1)
- **OpenAI API** (optional): ~$0.01 per analysis (~100 analyses for $1)

---

## 🔧 Backend Deployment to Railway

### Step 1: Get Your API Keys

#### Option A: Anthropic Claude (Recommended - 3x Cheaper)

1. Go to https://console.anthropic.com/
2. Click **"Sign Up"** (or login if you have an account)
3. Navigate to **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Give it a name like "Polymarket Analyzer"
6. Copy the key - it looks like: `sk-ant-api03-...`
7. **IMPORTANT**: Save this key somewhere safe - you won't see it again!

**Cost**: $3 per 1M input tokens, $15 per 1M output tokens
**Average**: ~$0.003 per market analysis

#### Option B: OpenAI GPT-4 (Backup)

1. Go to https://platform.openai.com/signup
2. Create an account and verify your email
3. Go to https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Name it "Polymarket Analyzer"
6. Copy the key - it looks like: `sk-proj-...`
7. **IMPORTANT**: Save this key securely!

**Cost**: $10 per 1M input tokens, $30 per 1M output tokens
**Average**: ~$0.01 per market analysis

---

### Step 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app/
   - Click **"Login with GitHub"**
   - Authorize Railway to access your GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - If this is your first time, click **"Configure GitHub App"**

3. **Push Backend Code to GitHub**
   
   Open terminal/command prompt and run:
   
   ```bash
   # Navigate to your project folder
   cd path/to/your/project

   # Initialize git (if not already done)
   git init

   # Create .gitignore (important!)
   echo "node_modules/" > backend/.gitignore
   echo ".env" >> backend/.gitignore

   # Add and commit backend files
   git add backend/
   git commit -m "Add backend server"

   # Create GitHub repository
   # Go to https://github.com/new
   # Create a new repository named "polymarket-analyzer"
   # Don't initialize with README

   # Connect and push
   git remote add origin https://github.com/YOUR_USERNAME/polymarket-analyzer.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Railway**
   - Back in Railway, click **"Deploy from GitHub repo"**
   - Select your `polymarket-analyzer` repository
   - Railway will detect it's a Node.js app automatically
   - Click **"Add variables"** or go to **"Variables"** tab

5. **Add Environment Variables**
   
   Click **"New Variable"** and add these one by one:
   
   ```
   Variable Name: NODE_ENV
   Value: production
   
   Variable Name: PORT
   Value: 3000
   
   Variable Name: FRONTEND_URL
   Value: *
   
   Variable Name: ANTHROPIC_API_KEY
   Value: [Your Claude API key from Step 1]
   
   Variable Name: OPENAI_API_KEY
   Value: [Your OpenAI API key from Step 1 - Optional]
   ```

6. **Configure Build Settings**
   - Go to **"Settings"** tab
   - Scroll to **"Build"** section
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `npm start`

7. **Deploy!**
   - Railway will automatically start deploying
   - Wait 2-3 minutes for the build to complete
   - You'll see logs scrolling - this is normal

8. **Get Your Backend URL**
   - Once deployed, click **"Settings"**
   - Scroll to **"Domains"**
   - Click **"Generate Domain"**
   - Copy your URL - it looks like: `https://polymarket-analyzer-production.up.railway.app`
   - **SAVE THIS URL** - you'll need it for the frontend!

9. **Test Your Backend**
   - Open: `https://your-backend-url.railway.app/health`
   - You should see: `{"status":"healthy","timestamp":"...","environment":"production"}`
   - ✅ If you see this, your backend is live!

---

## 🎨 Frontend Deployment

### Option A: GitHub Pages (Recommended - Free & Fast)

1. **Prepare Frontend Files**
   
   Make sure your project structure looks like:
   ```
   /
   ├── index.html
   ├── css/
   │   └── style.css
   └── js/
       └── app.js
   ```

2. **Push Frontend to GitHub**
   
   ```bash
   # Add frontend files
   git add index.html css/ js/
   git commit -m "Add frontend"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to your GitHub repository
   - Click **"Settings"** (top right)
   - Scroll down to **"Pages"** (left sidebar)
   - Under **"Source"**, select **"main"** branch
   - Click **"Save"**
   - Wait 1-2 minutes

4. **Access Your Frontend**
   - Your site will be at: `https://YOUR_USERNAME.github.io/polymarket-analyzer/`
   - Open it in your browser
   - You should see the dark UI with "Read 18,000 comments in 10 seconds"

5. **Configure Backend URL in Frontend**
   - Click the **Settings ⚙️** icon (top right)
   - Paste your Railway backend URL (from Step 2.8)
   - Click **"Save Configuration"**
   - Click **"Test Connection"**
   - You should see: ✅ Connection successful!

---

### Option B: Netlify (Alternative - Also Free)

1. **Create Netlify Account**
   - Go to https://www.netlify.com/
   - Click **"Sign up with GitHub"**

2. **Deploy**
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **"GitHub"**
   - Choose your `polymarket-analyzer` repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `/`
   - Click **"Deploy site"**

3. **Get Your URL**
   - Netlify gives you a URL like: `https://random-name-123.netlify.app`
   - Configure backend URL in Settings modal

---

### Option C: Vercel (Alternative)

1. **Create Vercel Account**
   - Go to https://vercel.com/
   - Click **"Sign up with GitHub"**

2. **Deploy**
   - Click **"Add New"** → **"Project"**
   - Select your repository
   - Click **"Deploy"**

3. **Configure**
   - Use Settings modal to add backend URL

---

## 🔑 API Keys Setup

### Anthropic Claude API

1. **Sign up**: https://console.anthropic.com/
2. **Pricing**: Pay-as-you-go (no monthly fee)
3. **Free trial**: $5 credit for new accounts
4. **Cost**: ~$0.003 per market analysis
5. **Recommended for**: Cost efficiency

### OpenAI API

1. **Sign up**: https://platform.openai.com/
2. **Pricing**: Pay-as-you-go
3. **Free trial**: $5 credit (expires after 3 months)
4. **Cost**: ~$0.01 per market analysis
5. **Recommended for**: Backup / failover

### Security Best Practices

✅ **DO**:
- Store API keys in environment variables (Railway)
- Never commit .env files to git
- Use .gitignore to exclude sensitive files
- Rotate keys periodically

❌ **DON'T**:
- Hardcode keys in your code
- Share keys in public repositories
- Commit .env to GitHub
- Reuse keys across multiple projects

---

## ✅ Testing & Verification

### 1. Test Backend Endpoints

```bash
# Health check
curl https://your-backend-url.railway.app/health

# Should return:
# {"status":"healthy","timestamp":"...","environment":"production"}

# Test Polymarket API proxy
curl "https://your-backend-url.railway.app/api/polymarket/comments/test-market-id"

# Should return Polymarket data or error message
```

### 2. Test Frontend Connection

1. Open your frontend URL
2. Click **Settings** (⚙️ icon)
3. Enter backend URL
4. Click **"Test Connection"**
5. Should show: ✅ Connection successful!

### 3. Run Full Analysis

1. Go to Polymarket.com
2. Find any market (e.g., "Will Trump win 2024?")
3. Copy the market slug from URL (e.g., `will-trump-win-2024`)
4. Paste it in your analyzer
5. Check all analysis options
6. Click **"Analyze Comments"**
7. Wait 5-10 seconds
8. You should see:
   - Summary cards
   - Sentiment chart
   - Key insights
   - Top comments
   - Divergence alerts (if any)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Railway deployment fails

**Solution**:
- Check that `backend/` folder contains all files
- Verify `package.json` exists with correct dependencies
- Check Railway logs for specific errors
- Ensure root directory is set to `backend` in Railway settings

---

**Problem**: "API key not configured" error

**Solution**:
- Go to Railway project → **Variables** tab
- Verify `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set
- Check for typos in variable names (case-sensitive!)
- Redeploy after adding variables

---

**Problem**: Backend URL returns 404

**Solution**:
- Ensure Railway generated a domain (Settings → Domains)
- Wait 1-2 minutes after deployment completes
- Try health endpoint: `/health`
- Check Railway deployment logs for errors

---

### Frontend Issues

**Problem**: "Failed to fetch" or CORS error

**Solution**:
- Verify backend URL in Settings (no trailing slash!)
- Check backend has `FRONTEND_URL=*` in environment variables
- Test backend health endpoint directly in browser
- Clear browser cache and try again

---

**Problem**: Settings modal won't save

**Solution**:
- Check browser console for errors (F12)
- Ensure backend URL is valid (starts with https://)
- Try a different browser
- Check localStorage isn't disabled

---

**Problem**: Analysis fails with "Failed to analyze comments"

**Solution**:
- Verify AI API keys are correct in Railway
- Check Railway logs for specific error
- Try a different market ID
- Ensure market ID is valid (check Polymarket.com)

---

### API Issues

**Problem**: "Polymarket API rate limit exceeded"

**Solution**:
- Polymarket limits requests per IP
- Wait 1-2 minutes before trying again
- Use a smaller market with fewer comments
- Contact Polymarket for higher rate limits

---

**Problem**: "Claude API authentication failed"

**Solution**:
- Verify API key starts with `sk-ant-api03-`
- Check key is active in Anthropic console
- Ensure you have remaining credits
- Try regenerating the key

---

**Problem**: "OpenAI API authentication failed"

**Solution**:
- Verify API key starts with `sk-proj-`
- Check billing is set up in OpenAI account
- Ensure you have remaining credits
- Try regenerating the key

---

## 📊 Monitoring & Maintenance

### Railway Monitoring

1. **View Logs**
   - Go to Railway project
   - Click **"Deployments"**
   - Click latest deployment
   - View real-time logs

2. **Check Resource Usage**
   - Dashboard shows CPU/memory usage
   - Free tier: 500 hours/month, $5 credit
   - Monitor to avoid overages

3. **Metrics**
   - Railway provides request count
   - Response time metrics
   - Error rate tracking

### Cost Management

**Railway**: Free tier is generous
- 500 execution hours/month
- $5 credit included
- Upgrade only if you exceed limits

**Claude API**: Most cost-effective
- ~$0.003 per analysis
- $1 = ~300 analyses
- Set up billing alerts in Anthropic console

**OpenAI API**: Backup option
- ~$0.01 per analysis  
- $1 = ~100 analyses
- Set up usage limits in OpenAI dashboard

---

## 🎉 Success Checklist

✅ Backend deployed to Railway  
✅ Environment variables configured  
✅ Backend health endpoint responding  
✅ Frontend deployed (GitHub Pages/Netlify/Vercel)  
✅ Frontend can connect to backend  
✅ At least one AI API key configured  
✅ Full analysis test completed successfully  
✅ Results display correctly with charts  

**If all checked**: Congratulations! Your Polymarket Comment Analyzer is live! 🚀

---

## 🆘 Still Need Help?

1. **Check Railway Logs**
   - Most errors show up here
   - Look for red error messages

2. **Browser Console**
   - Press F12 → Console tab
   - Look for error messages

3. **Test Endpoints Individually**
   - Health: `/health`
   - Comments: `/api/polymarket/comments/test-id`
   - Analyze: Use Postman or curl

4. **Common Issues**
   - 90% of problems are API key configuration
   - Check spelling and format of keys
   - Ensure no extra spaces in environment variables

---

**Built with 💚 by the Polymarket community**  
**Version 1.0.0 | Last Updated: 2026-02-13**
