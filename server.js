const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// POLYMARKET API PROXY ENDPOINTS
// ============================================

/**
 * GET /api/polymarket/comments/:marketId
 * Fetch comments for a specific Polymarket market
 */
app.get('/api/polymarket/comments/:marketId', async (req, res) => {
    try {
        let { marketId } = req.params;
        const { limit = 100, offset = 0 } = req.query;

        console.log(`Fetching comments for market: ${marketId}`);

        // If marketId is a slug (not hex), fetch market details first to get condition ID
        if (!marketId.startsWith('0x')) {
            console.log(`Converting slug to condition ID: ${marketId}`);
            
            try {
                // Search for market by slug using query parameter
                const marketResponse = await axios.get(`https://gamma-api.polymarket.com/markets`, {
                    params: {
                        slug: marketId
                    },
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'PolymarketAnalyzer/1.0'
                    },
                    timeout: 10000
                });

                console.log(`Market search response:`, marketResponse.data ? `Found ${marketResponse.data.length || 0} markets` : 'No data');

                if (marketResponse.data && marketResponse.data.length > 0) {
                    const market = marketResponse.data[0];
                    
                    marketId = market.conditionId;
                    console.log(`Resolved to condition ID: ${marketId}`);
                } else {
                    throw new Error('Market not found - no results returned');
                }
            } catch (lookupError) {
                console.error('Market lookup failed:', lookupError.message);
                console.error('Full error:', lookupError.response?.data || lookupError);
                return res.status(404).json({
                    success: false,
                    error: 'Market not found',
                    message: `Could not find market "${req.params.marketId}". Please check the market slug or try the Browse Markets button.`,
                    originalSlug: req.params.marketId,
                    suggestion: 'Use the Browse Markets button to see available markets with comments.'
                });
            }
        }

        // Polymarket Comments API endpoint
        const response = await axios.get(`https://gamma-api.polymarket.com/comments`, {
            params: {
                _market: marketId,
                _limit: limit,
                _offset: offset
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'PolymarketAnalyzer/1.0'
            },
            timeout: 10000
        });

        console.log(`Successfully fetched ${response.data.length} comments`);

        if (response.data.length === 0) {
            return res.json({
                success: false,
                error: 'No comments found',
                message: 'This market exists but has no comments yet. Try a more active market with discussions.',
                count: 0,
                marketId: marketId
            });
        }

        res.json({
            success: true,
            data: response.data,
            count: response.data.length,
            marketId: marketId
        });

    } catch (error) {
        console.error('Polymarket API Error:', error.message);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            marketId: marketId
        });
        
        // Better error message for 422
        if (error.response?.status === 422) {
            return res.status(422).json({
                success: false,
                error: 'Cannot fetch comments',
                message: 'This market may not have comments, or the market ID format is incorrect. Try browsing markets with the Browse button.',
                marketId: marketId
            });
        }
        
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch comments from Polymarket',
            message: error.message,
            details: error.response?.data || null
        });
    }
});

/**
 * GET /api/polymarket/markets
 * Fetch list of active markets
 */
app.get('/api/polymarket/markets', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        console.log(`Fetching markets list (limit: ${limit})`);

        const response = await axios.get('https://gamma-api.polymarket.com/markets', {
            params: {
                limit: 100, // Fetch more to filter from
                offset: offset,
                closed: false,
                active: true
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'PolymarketAnalyzer/1.0'
            },
            timeout: 10000
        });

        console.log(`Fetched ${response.data.length} total markets`);

        // Sort by volume (higher volume = more likely to have comments)
        const sortedMarkets = response.data
            .filter(market => {
                // Filter for recent, active markets
                const volume = parseFloat(market.volume || 0);
                const isActive = market.active === true;
                const isClosed = market.closed === true;
                const endDate = market.endDate ? new Date(market.endDate) : null;
                const isNotExpired = !endDate || endDate > new Date();
                
                return isActive && !isClosed && isNotExpired && volume > 1000; // At least $1k volume
            })
            .sort((a, b) => {
                // Sort by volume descending
                return parseFloat(b.volume || 0) - parseFloat(a.volume || 0);
            })
            .slice(0, parseInt(limit));

        console.log(`Filtered to ${sortedMarkets.length} active markets with volume`);

        res.json({
            success: true,
            data: sortedMarkets,
            count: sortedMarkets.length
        });

    } catch (error) {
        console.error('Polymarket Markets API Error:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch markets',
            message: error.message
        });
    }
});

/**
 * GET /api/polymarket/market/:marketId
 * Fetch market metadata
 */
app.get('/api/polymarket/market/:marketId', async (req, res) => {
    try {
        const { marketId } = req.params;

        console.log(`Fetching market data for: ${marketId}`);

        const response = await axios.get(`https://gamma-api.polymarket.com/markets/${marketId}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'PolymarketAnalyzer/1.0'
            },
            timeout: 10000
        });

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Polymarket Market API Error:', error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: 'Failed to fetch market data',
            message: error.message
        });
    }
});

// ============================================
// AI ANALYSIS ENDPOINTS
// ============================================

/**
 * POST /api/analyze/comments
 * Analyze comments using Claude AI (primary) with OpenAI fallback
 */
app.post('/api/analyze/comments', async (req, res) => {
    try {
        const { comments, options = {} } = req.body;

        if (!comments || !Array.isArray(comments)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: comments array is required'
            });
        }

        console.log(`Analyzing ${comments.length} comments with options:`, options);

        // Try Claude first
        let analysisResult;
        let aiProvider = 'claude';

        try {
            analysisResult = await analyzeWithClaude(comments, options);
        } catch (claudeError) {
            console.warn('Claude API failed, falling back to OpenAI:', claudeError.message);
            
            // Fallback to OpenAI
            if (process.env.OPENAI_API_KEY) {
                aiProvider = 'openai';
                analysisResult = await analyzeWithOpenAI(comments, options);
            } else {
                throw new Error('Both Claude and OpenAI APIs unavailable');
            }
        }

        res.json({
            success: true,
            data: analysisResult,
            metadata: {
                commentsAnalyzed: comments.length,
                aiProvider: aiProvider,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Analysis Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze comments',
            message: error.message
        });
    }
});

/**
 * Analyze comments using Claude AI
 */
async function analyzeWithClaude(comments, options) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const prompt = buildAnalysisPrompt(comments, options);

    const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            temperature: 0.7,
            messages: [{
                role: 'user',
                content: prompt
            }]
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            timeout: 60000
        }
    );

    const content = response.data.content[0].text;
    return parseAIResponse(content);
}

/**
 * Analyze comments using OpenAI GPT-4
 */
async function analyzeWithOpenAI(comments, options) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const prompt = buildAnalysisPrompt(comments, options);

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-4-turbo-preview',
            messages: [{
                role: 'system',
                content: 'You are an expert financial analyst specializing in prediction markets and sentiment analysis. Provide structured, actionable insights.'
            }, {
                role: 'user',
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 4096
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            timeout: 60000
        }
    );

    const content = response.data.choices[0].message.content;
    return parseAIResponse(content);
}

/**
 * Build analysis prompt based on comments and options
 */
function buildAnalysisPrompt(comments, options) {
    const { 
        analyzeSentiment = true, 
        detectDivergence = true, 
        findInsiders = true,
        filterHolders = false 
    } = options;

    // Filter holders if requested
    const targetComments = filterHolders 
        ? comments.filter(c => c.profile?.positions?.length > 0)
        : comments;

    const commentsText = targetComments.map((comment, idx) => {
        const username = comment.profile?.pseudonym || comment.profile?.name || 'Anonymous';
        const position = comment.profile?.positions?.[0]?.positionSize || '0';
        const hasPosition = parseFloat(position) > 0;
        
        return `[${idx + 1}] ${username} ${hasPosition ? `(Position: $${position})` : '(No position)'}: ${comment.body}`;
    }).join('\n\n');

    return `You are analyzing ${targetComments.length} comments from a Polymarket prediction market. 

COMMENTS:
${commentsText}

ANALYSIS REQUIREMENTS:
${analyzeSentiment ? '- Perform sentiment analysis (bullish/bearish/neutral) for each comment' : ''}
${detectDivergence ? '- Detect divergence between large position holders and smaller traders' : ''}
${findInsiders ? '- Identify potential insider information or unique alpha signals' : ''}
- Assign an "alpha score" (1-10) to each comment based on information value
- Extract key insights and trading implications

OUTPUT FORMAT (MUST BE VALID JSON):
{
  "summary": {
    "totalComments": ${targetComments.length},
    "holdersCount": <number>,
    "overallSentiment": "<bullish|bearish|neutral>",
    "sentimentDistribution": {
      "bullish": <number>,
      "bearish": <number>,
      "neutral": <number>
    }
  },
  "insights": [
    "Key insight 1",
    "Key insight 2",
    ...
  ],
  "divergenceAlerts": [
    {
      "severity": "<high|medium|low>",
      "description": "Alert description"
    }
  ],
  "topComments": [
    {
      "commentIndex": <number>,
      "username": "<string>",
      "sentiment": "<bullish|bearish|neutral>",
      "alphaScore": <1-10>,
      "positionSize": "<string>",
      "reasoning": "Why this comment is valuable"
    }
  ],
  "insiderMentions": [
    {
      "comment": "Relevant excerpt",
      "significance": "Why this might be insider info"
    }
  ]
}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations outside the JSON.`;
}

/**
 * Parse AI response and ensure valid JSON
 */
function parseAIResponse(content) {
    try {
        // Remove markdown code blocks if present
        let cleaned = content.trim();
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```\n?/g, '');
        }
        
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Failed to parse AI response:', error.message);
        console.error('Raw content:', content);
        
        // Return a fallback structure
        return {
            summary: {
                totalComments: 0,
                holdersCount: 0,
                overallSentiment: 'neutral',
                sentimentDistribution: { bullish: 0, bearish: 0, neutral: 0 }
            },
            insights: ['AI response could not be parsed. Please try again.'],
            divergenceAlerts: [],
            topComments: [],
            insiderMentions: []
        };
    }
}

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'GET /api/polymarket/markets',
            'GET /api/polymarket/comments/:marketId',
            'GET /api/polymarket/market/:marketId',
            'POST /api/analyze/comments'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Polymarket Analyzer Backend Server`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Claude API: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log('='.repeat(50));
    console.log(`\n✨ Server ready at http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
