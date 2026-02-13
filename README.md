# 🔧 Backend API Documentation

## Overview

Node.js/Express backend server that proxies Polymarket API requests and provides AI-powered comment analysis using Claude and OpenAI.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Run

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Server will start on `http://localhost:3000`

---

## 🔌 API Endpoints

### Health Check

**GET** `/health`

Check if the server is running.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T10:30:00.000Z",
  "environment": "production"
}
```

---

### Fetch Comments

**GET** `/api/polymarket/comments/:marketId`

Fetch comments for a specific Polymarket market.

**Parameters**:
- `marketId` (path) - Market ID or slug
- `limit` (query, optional) - Max comments to fetch (default: 100)
- `offset` (query, optional) - Pagination offset (default: 0)

**Example**:
```bash
GET /api/polymarket/comments/will-trump-win-2024?limit=500
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "comment-123",
      "body": "Based on recent polling...",
      "profile": {
        "pseudonym": "TraderJoe",
        "positions": [
          {
            "tokenId": "abc123",
            "positionSize": "1250.50"
          }
        ]
      },
      "createdAt": "2026-01-15T12:00:00Z"
    }
  ],
  "count": 237,
  "marketId": "will-trump-win-2024"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to fetch comments from Polymarket",
  "message": "Market not found"
}
```

---

### Fetch Market Data

**GET** `/api/polymarket/market/:marketId`

Fetch metadata for a specific market.

**Parameters**:
- `marketId` (path) - Market ID or slug

**Example**:
```bash
GET /api/polymarket/market/will-trump-win-2024
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "market-123",
    "question": "Will Trump win 2024?",
    "description": "Resolves YES if...",
    "endDate": "2024-11-05T00:00:00Z",
    "volume": "15000000"
  }
}
```

---

### Analyze Comments

**POST** `/api/analyze/comments`

Analyze comments using AI (Claude primary, OpenAI backup).

**Request Body**:
```json
{
  "comments": [
    {
      "id": "comment-123",
      "body": "Comment text...",
      "profile": {
        "pseudonym": "TraderJoe",
        "positions": [{ "positionSize": "1000" }]
      }
    }
  ],
  "options": {
    "filterHolders": true,
    "analyzeSentiment": true,
    "detectDivergence": true,
    "findInsiders": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalComments": 237,
      "holdersCount": 89,
      "overallSentiment": "bullish",
      "sentimentDistribution": {
        "bullish": 120,
        "bearish": 67,
        "neutral": 50
      }
    },
    "insights": [
      "Large holders are 60% bullish while crowd is 40% bullish",
      "Recent polling data mentioned frequently",
      "Divergence detected in key swing states"
    ],
    "divergenceAlerts": [
      {
        "severity": "high",
        "description": "Holders with >$1000 positions are 70% bearish while crowd is 65% bullish"
      }
    ],
    "topComments": [
      {
        "commentIndex": 5,
        "username": "TraderJoe",
        "sentiment": "bullish",
        "alphaScore": 9,
        "positionSize": "5000",
        "reasoning": "Provides detailed polling analysis with sources"
      }
    ],
    "insiderMentions": [
      {
        "comment": "I have connections in...",
        "significance": "Claims insider knowledge of campaign strategy"
      }
    ]
  },
  "metadata": {
    "commentsAnalyzed": 237,
    "aiProvider": "claude",
    "timestamp": "2026-02-13T10:30:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Failed to analyze comments",
  "message": "ANTHROPIC_API_KEY not configured"
}
```

---

## 🔑 Environment Variables

Create a `.env` file with:

```env
# Server
NODE_ENV=production
PORT=3000

# CORS
FRONTEND_URL=*

# AI APIs (at least one required)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
```

### Required Variables

- `ANTHROPIC_API_KEY` OR `OPENAI_API_KEY` - At least one AI API key

### Optional Variables

- `NODE_ENV` - Environment (default: development)
- `PORT` - Server port (default: 3000)
- `FRONTEND_URL` - CORS allowed origin (default: *)

---

## 🤖 AI Integration

### Primary: Claude 3.5 Sonnet

- **Model**: `claude-3-5-sonnet-20241022`
- **Provider**: Anthropic
- **Cost**: ~$0.003 per analysis
- **Max tokens**: 4096 output
- **Temperature**: 0.7

### Backup: OpenAI GPT-4 Turbo

- **Model**: `gpt-4-turbo-preview`
- **Provider**: OpenAI
- **Cost**: ~$0.01 per analysis
- **Max tokens**: 4096 output
- **Temperature**: 0.7

### Automatic Failover

If Claude fails (API error, rate limit, etc.), the system automatically falls back to OpenAI.

**Flow**:
```
Request → Try Claude → Success ✅
                    → Fail → Try OpenAI → Success ✅
                                       → Fail → Error ❌
```

---

## 📊 AI Analysis Process

### 1. Prompt Construction

The system builds a structured prompt with:
- All comments with usernames and positions
- Analysis requirements based on options
- JSON output format specification

### 2. AI Request

Sends prompt to Claude (or OpenAI if Claude fails)

### 3. Response Parsing

Parses AI response as JSON with:
- Summary statistics
- Sentiment distribution
- Key insights
- Divergence alerts
- Top comments with alpha scores
- Insider mentions

### 4. Error Handling

If parsing fails:
- Returns fallback structure
- Logs error for debugging
- Ensures app doesn't crash

---

## 🔒 Security

### CORS Configuration

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
```

**Production**: Set `FRONTEND_URL` to your frontend domain

### API Keys

- Stored in environment variables
- Never exposed to frontend
- Validated before use
- Errors logged without exposing keys

### Rate Limiting

**Not implemented yet** - Coming in v1.1

Recommended: Use Railway's built-in rate limiting or add `express-rate-limit`

---

## 📈 Monitoring

### Logging

All requests are logged with:
- Endpoint accessed
- Response status
- Error messages (if any)
- Timestamp

**View logs**:
```bash
# Local
npm start

# Railway
Check Deployments → Logs
```

### Health Monitoring

**Endpoint**: `/health`

Use for:
- Uptime monitoring (UptimeRobot, Pingdom)
- Load balancer health checks
- CI/CD deployment verification

---

## 🐛 Error Handling

### Error Format

```json
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error message",
  "details": { /* Additional error data */ }
}
```

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid request | Missing/invalid parameters |
| 401 | Authentication failed | Invalid API key |
| 404 | Not found | Invalid endpoint |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Internal server error | Server/API failure |

---

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Fetch comments
curl "http://localhost:3000/api/polymarket/comments/test-market?limit=10"

# Analyze comments
curl -X POST http://localhost:3000/api/analyze/comments \
  -H "Content-Type: application/json" \
  -d '{
    "comments": [...],
    "options": {
      "analyzeSentiment": true,
      "detectDivergence": true
    }
  }'
```

### Automated Testing

**Not implemented yet** - Coming in v1.1

Planned:
- Jest for unit tests
- Supertest for API tests
- 90%+ code coverage

---

## 🚀 Deployment

### Railway

1. Push code to GitHub
2. Connect Railway to repo
3. Set environment variables
4. Deploy automatically

**See**: [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed guide

### Alternative Platforms

- **Heroku**: Add `Procfile`
- **Vercel**: Add `vercel.json`
- **Render**: Works out of the box
- **DigitalOcean App Platform**: Add app spec

---

## 📦 Dependencies

### Production

```json
{
  "express": "^4.18.2",      // Web framework
  "cors": "^2.8.5",          // CORS middleware
  "axios": "^1.6.2",         // HTTP client
  "dotenv": "^16.3.1"        // Environment config
}
```

### Development

```json
{
  "nodemon": "^3.0.2"        // Auto-reload
}
```

**Total size**: ~2.5 MB (node_modules)

---

## 🔧 Configuration

### Port

```javascript
const PORT = process.env.PORT || 3000;
```

Railway automatically assigns a port via `process.env.PORT`

### Timeout

```javascript
axios.get(url, { timeout: 10000 }) // 10 seconds
```

Prevents hanging requests

### Max Comments

```javascript
const { limit = 100, offset = 0 } = req.query;
```

Default: 100 comments per request  
Max: 1000 (Polymarket API limit)

---

## 📚 Further Reading

- [Express.js Docs](https://expressjs.com/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Polymarket API Docs](https://docs.polymarket.com/)

---

**Built with 💚 by the Polymarket community**  
**Version 1.0.0**
