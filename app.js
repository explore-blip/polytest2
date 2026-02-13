// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    backendUrl: localStorage.getItem('backendUrl') || '',
    currentAnalysis: null,
    isAnalyzing: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Config notice
    configNotice: document.getElementById('configNotice'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    
    // Settings modal
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    backendUrlInput: document.getElementById('backendUrl'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    connectionStatus: document.getElementById('connectionStatus'),
    
    // Markets browser
    browseMarketsBtn: document.getElementById('browseMarketsBtn'),
    marketsModal: document.getElementById('marketsModal'),
    closeMarketsModalBtn: document.getElementById('closeMarketsModalBtn'),
    marketsLoading: document.getElementById('marketsLoading'),
    marketsList: document.getElementById('marketsList'),
    marketsError: document.getElementById('marketsError'),
    
    // Form
    analyzeForm: document.getElementById('analyzeForm'),
    marketIdInput: document.getElementById('marketId'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    
    // Options
    filterHoldersCheckbox: document.getElementById('filterHolders'),
    analyzeSentimentCheckbox: document.getElementById('analyzeSentiment'),
    detectDivergenceCheckbox: document.getElementById('detectDivergence'),
    findInsidersCheckbox: document.getElementById('findInsiders'),
    
    // Sections
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),
    
    // Loading
    loadingTitle: document.getElementById('loadingTitle'),
    loadingMessage: document.getElementById('loadingMessage'),
    
    // Results
    summaryGrid: document.getElementById('summaryGrid'),
    insightsCard: document.getElementById('insightsCard'),
    alertsCard: document.getElementById('alertsCard'),
    commentsCard: document.getElementById('commentsCard'),
    insidersCard: document.getElementById('insidersCard'),
    resetBtn: document.getElementById('resetBtn')
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
});

function initializeApp() {
    // Load saved backend URL
    if (state.backendUrl) {
        elements.backendUrlInput.value = state.backendUrl;
        elements.configNotice.classList.add('hidden');
    }
    
    console.log('✨ Polymarket Analyzer initialized');
    console.log('Backend URL:', state.backendUrl || 'Not configured');
}

function attachEventListeners() {
    // Settings modal
    elements.settingsBtn.addEventListener('click', openSettingsModal);
    elements.openSettingsBtn.addEventListener('click', openSettingsModal);
    elements.closeModalBtn.addEventListener('click', closeSettingsModal);
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
    elements.testConnectionBtn.addEventListener('click', testConnection);
    
    // Close modal when clicking outside
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            closeSettingsModal();
        }
    });
    
    // Markets browser
    elements.browseMarketsBtn.addEventListener('click', openMarketsModal);
    elements.closeMarketsModalBtn.addEventListener('click', closeMarketsModal);
    elements.marketsModal.addEventListener('click', (e) => {
        if (e.target === elements.marketsModal) {
            closeMarketsModal();
        }
    });
    
    // Form submission
    elements.analyzeForm.addEventListener('submit', handleAnalyze);
    
    // Reset button
    elements.resetBtn.addEventListener('click', resetAnalysis);
}

// ============================================
// SETTINGS MODAL
// ============================================
function openSettingsModal() {
    elements.settingsModal.classList.add('show');
    elements.connectionStatus.style.display = 'none';
}

function closeSettingsModal() {
    elements.settingsModal.classList.remove('show');
}

function saveSettings() {
    const backendUrl = elements.backendUrlInput.value.trim();
    
    if (!backendUrl) {
        showConnectionStatus('Please enter a backend URL', 'error');
        return;
    }
    
    // Remove trailing slash
    state.backendUrl = backendUrl.replace(/\/$/, '');
    localStorage.setItem('backendUrl', state.backendUrl);
    
    elements.configNotice.classList.add('hidden');
    showConnectionStatus('✅ Configuration saved successfully!', 'success');
    
    console.log('Backend URL saved:', state.backendUrl);
}

async function testConnection() {
    if (!state.backendUrl) {
        showConnectionStatus('Please enter and save a backend URL first', 'error');
        return;
    }
    
    showConnectionStatus('Testing connection...', 'success');
    
    try {
        const response = await fetch(`${state.backendUrl}/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            showConnectionStatus(`✅ Connection successful! Server is ${data.status}`, 'success');
        } else {
            showConnectionStatus(`❌ Connection failed (${response.status})`, 'error');
        }
    } catch (error) {
        showConnectionStatus(`❌ Connection failed: ${error.message}`, 'error');
        console.error('Connection test error:', error);
    }
}

function showConnectionStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `connection-status ${type}`;
    elements.connectionStatus.style.display = 'block';
}

// ============================================
// MARKETS BROWSER
// ============================================
async function openMarketsModal() {
    if (!state.backendUrl) {
        alert('⚠️ Please configure your backend URL in Settings first!');
        openSettingsModal();
        return;
    }
    
    elements.marketsModal.classList.add('show');
    elements.marketsLoading.style.display = 'block';
    elements.marketsList.style.display = 'none';
    elements.marketsError.style.display = 'none';
    
    await loadMarkets();
}

function closeMarketsModal() {
    elements.marketsModal.classList.remove('show');
}

async function loadMarkets() {
    try {
        const response = await fetch(`${state.backendUrl}/api/polymarket/markets?limit=50`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch markets');
        }
        
        displayMarkets(data.data);
        
    } catch (error) {
        console.error('Markets loading error:', error);
        elements.marketsLoading.style.display = 'none';
        elements.marketsError.style.display = 'block';
        elements.marketsError.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Failed to load markets: ${error.message}</p>
            <button onclick="loadMarkets()" class="secondary-btn" style="margin-top: 16px;">
                <i class="fas fa-redo"></i> Try Again
            </button>
        `;
    }
}

function displayMarkets(markets) {
    elements.marketsLoading.style.display = 'none';
    elements.marketsList.style.display = 'block';
    
    if (!markets || markets.length === 0) {
        elements.marketsList.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-muted);">No active markets found.</p>';
        return;
    }
    
    elements.marketsList.innerHTML = markets.map(market => {
        const volume = market.volume ? `$${(parseFloat(market.volume) / 1000000).toFixed(1)}M` : 'N/A';
        const endDate = market.endDate ? new Date(market.endDate).toLocaleDateString() : 'TBD';
        const commentCount = market.commentCount || 0;
        
        return `
            <div class="market-item" data-market-id="${market.conditionId}" data-market-slug="${market.slug || market.conditionId}">
                <div class="market-item-header">
                    <div class="market-item-title">${market.question || market.title || 'Untitled Market'}</div>
                    <div class="market-item-volume">${volume}</div>
                </div>
                <div class="market-item-meta">
                    <span><i class="fas fa-comments"></i> ${commentCount} comments</span>
                    <span><i class="fas fa-calendar"></i> Ends ${endDate}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.market-item').forEach(item => {
        item.addEventListener('click', () => {
            const marketSlug = item.dataset.marketSlug;
            selectMarket(marketSlug);
        });
    });
}

function selectMarket(marketSlug) {
    elements.marketIdInput.value = marketSlug;
    closeMarketsModal();
    elements.marketIdInput.focus();
}

// ============================================
// ANALYSIS WORKFLOW
// ============================================
async function handleAnalyze(e) {
    e.preventDefault();
    
    if (!state.backendUrl) {
        alert('⚠️ Please configure your backend URL in Settings first!');
        openSettingsModal();
        return;
    }
    
    if (state.isAnalyzing) return;
    
    const marketId = elements.marketIdInput.value.trim();
    if (!marketId) {
        alert('Please enter a market ID or slug');
        return;
    }
    
    const options = {
        filterHolders: elements.filterHoldersCheckbox.checked,
        analyzeSentiment: elements.analyzeSentimentCheckbox.checked,
        detectDivergence: elements.detectDivergenceCheckbox.checked,
        findInsiders: elements.findInsidersCheckbox.checked
    };
    
    await runAnalysis(marketId, options);
}

async function runAnalysis(marketId, options) {
    state.isAnalyzing = true;
    showLoading();
    
    try {
        // Step 1: Fetch comments
        updateLoadingStep(1, 'Fetching Comments', 'Connecting to Polymarket API...');
        const comments = await fetchComments(marketId);
        console.log(`✅ Fetched ${comments.length} comments`);
        
        await sleep(500);
        
        // Step 2: Filter data
        updateLoadingStep(2, 'Filtering Data', `Processing ${comments.length} comments...`);
        const filteredComments = options.filterHolders 
            ? comments.filter(c => c.profile?.positions?.length > 0)
            : comments;
        console.log(`✅ Filtered to ${filteredComments.length} comments`);
        
        await sleep(500);
        
        // Step 3: AI Analysis
        updateLoadingStep(3, 'AI Analysis', 'Analyzing sentiment with Claude AI...');
        const analysis = await analyzeComments(filteredComments, options);
        console.log('✅ Analysis complete');
        
        await sleep(500);
        
        // Step 4: Generate insights
        updateLoadingStep(4, 'Generating Insights', 'Creating visualizations...');
        await sleep(500);
        
        // Step 5: Complete
        updateLoadingStep(5, 'Complete', 'Analysis ready!');
        await sleep(500);
        
        // Show results
        state.currentAnalysis = analysis;
        displayResults(analysis);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert(`❌ Analysis failed: ${error.message}`);
        hideLoading();
    } finally {
        state.isAnalyzing = false;
    }
}

// ============================================
// API CALLS
// ============================================
async function fetchComments(marketId) {
    const url = `${state.backendUrl}/api/polymarket/comments/${marketId}?limit=1000`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch comments' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch comments');
    }
    
    return data.data;
}

async function analyzeComments(comments, options) {
    const url = `${state.backendUrl}/api/analyze/comments`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ comments, options })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to analyze comments' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
    }
    
    return data.data;
}

// ============================================
// LOADING UI
// ============================================
function showLoading() {
    elements.loadingSection.style.display = 'block';
    elements.resultsSection.style.display = 'none';
    elements.analyzeBtn.disabled = true;
    
    // Reset all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
}

function hideLoading() {
    elements.loadingSection.style.display = 'none';
    elements.analyzeBtn.disabled = false;
}

function updateLoadingStep(stepNumber, title, message) {
    elements.loadingTitle.textContent = title;
    elements.loadingMessage.textContent = message;
    
    // Mark previous steps as completed
    for (let i = 1; i < stepNumber; i++) {
        const step = document.querySelector(`.step[data-step="${i}"]`);
        if (step) {
            step.classList.remove('active');
            step.classList.add('completed');
        }
    }
    
    // Mark current step as active
    const currentStep = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
}

// ============================================
// RESULTS DISPLAY
// ============================================
function displayResults(analysis) {
    hideLoading();
    elements.resultsSection.style.display = 'block';
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Display summary cards
    displaySummaryCards(analysis.summary);
    
    // Display chart
    displaySentimentChart(analysis.summary.sentimentDistribution);
    
    // Display insights
    displayInsights(analysis.insights);
    
    // Display divergence alerts
    displayAlerts(analysis.divergenceAlerts);
    
    // Display top comments
    displayComments(analysis.topComments);
    
    // Display insider mentions
    displayInsiderMentions(analysis.insiderMentions);
}

function displaySummaryCards(summary) {
    const cards = [
        {
            icon: '💬',
            iconBg: 'linear-gradient(135deg, #667eea, #764ba2)',
            title: 'Total Comments',
            value: summary.totalComments,
            subtitle: 'Analyzed'
        },
        {
            icon: '👥',
            iconBg: 'linear-gradient(135deg, #f093fb, #f5576c)',
            title: 'Position Holders',
            value: summary.holdersCount,
            subtitle: 'With active positions'
        },
        {
            icon: getSentimentIcon(summary.overallSentiment),
            iconBg: getSentimentGradient(summary.overallSentiment),
            title: 'Overall Sentiment',
            value: summary.overallSentiment.toUpperCase(),
            subtitle: 'Market mood'
        },
        {
            icon: '🚨',
            iconBg: 'linear-gradient(135deg, #fa709a, #fee140)',
            title: 'Alerts',
            value: (analysis.divergenceAlerts || []).length,
            subtitle: 'Divergence detected'
        }
    ];
    
    elements.summaryGrid.innerHTML = cards.map(card => `
        <div class="summary-card">
            <div class="summary-card-header">
                <div class="summary-card-icon" style="background: ${card.iconBg}">
                    ${card.icon}
                </div>
                <div class="summary-card-title">${card.title}</div>
            </div>
            <div class="summary-card-value">${card.value}</div>
            <div class="summary-card-subtitle">${card.subtitle}</div>
        </div>
    `).join('');
}

function displaySentimentChart(distribution) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    // Destroy existing chart if any
    if (window.sentimentChartInstance) {
        window.sentimentChartInstance.destroy();
    }
    
    window.sentimentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Bullish', 'Bearish', 'Neutral'],
            datasets: [{
                data: [distribution.bullish, distribution.bearish, distribution.neutral],
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(255, 77, 77, 0.8)',
                    'rgba(160, 174, 192, 0.8)'
                ],
                borderColor: [
                    '#00ff88',
                    '#ff4d4d',
                    '#a0aec0'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            family: 'Inter'
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

function displayInsights(insights) {
    if (!insights || insights.length === 0) {
        elements.insightsCard.style.display = 'none';
        return;
    }
    
    elements.insightsCard.style.display = 'block';
    elements.insightsCard.innerHTML = `
        <h3><i class="fas fa-lightbulb"></i> Key Insights</h3>
        ${insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-arrow-right" style="color: var(--accent-green); margin-right: 10px;"></i>
                ${insight}
            </div>
        `).join('')}
    `;
}

function displayAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
        elements.alertsCard.style.display = 'none';
        return;
    }
    
    elements.alertsCard.style.display = 'block';
    elements.alertsCard.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> Divergence Alerts</h3>
        ${alerts.map(alert => `
            <div class="alert-item">
                <span class="alert-badge ${alert.severity}">${alert.severity}</span>
                <div class="alert-content">${alert.description}</div>
            </div>
        `).join('')}
    `;
}

function displayComments(comments) {
    if (!comments || comments.length === 0) {
        elements.commentsCard.style.display = 'none';
        return;
    }
    
    elements.commentsCard.style.display = 'block';
    elements.commentsCard.innerHTML = `
        <h3><i class="fas fa-fire"></i> Top Alpha Comments</h3>
        ${comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-user">
                        <i class="fas fa-user-circle"></i>
                        ${comment.username || 'Anonymous'}
                    </div>
                    <div class="alpha-score">Alpha: ${comment.alphaScore}/10</div>
                </div>
                <div class="comment-body">${comment.reasoning}</div>
                <div class="comment-meta">
                    <span class="meta-tag sentiment-${comment.sentiment}">
                        <i class="fas fa-${getSentimentIconName(comment.sentiment)}"></i>
                        ${comment.sentiment}
                    </span>
                    ${comment.positionSize && comment.positionSize !== '0' ? `
                        <span class="meta-tag">
                            <i class="fas fa-wallet"></i>
                            $${parseFloat(comment.positionSize).toLocaleString()}
                        </span>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    `;
}

function displayInsiderMentions(mentions) {
    if (!mentions || mentions.length === 0) {
        elements.insidersCard.style.display = 'none';
        return;
    }
    
    elements.insidersCard.style.display = 'block';
    elements.insidersCard.innerHTML = `
        <h3><i class="fas fa-user-secret"></i> Potential Alpha Signals</h3>
        ${mentions.map(mention => `
            <div class="insider-item">
                <div class="insider-comment">"${mention.comment}"</div>
                <div class="insider-significance">
                    <strong>Significance:</strong> ${mention.significance}
                </div>
            </div>
        `).join('')}
    `;
}

// ============================================
// RESET
// ============================================
function resetAnalysis() {
    elements.resultsSection.style.display = 'none';
    elements.analyzeForm.scrollIntoView({ behavior: 'smooth' });
    state.currentAnalysis = null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getSentimentIcon(sentiment) {
    const icons = {
        bullish: '📈',
        bearish: '📉',
        neutral: '➡️'
    };
    return icons[sentiment.toLowerCase()] || '➡️';
}

function getSentimentGradient(sentiment) {
    const gradients = {
        bullish: 'linear-gradient(135deg, #00ff88, #00ccff)',
        bearish: 'linear-gradient(135deg, #ff4d4d, #ff6b6b)',
        neutral: 'linear-gradient(135deg, #a0aec0, #cbd5e0)'
    };
    return gradients[sentiment.toLowerCase()] || gradients.neutral;
}

function getSentimentIconName(sentiment) {
    const icons = {
        bullish: 'arrow-up',
        bearish: 'arrow-down',
        neutral: 'minus'
    };
    return icons[sentiment.toLowerCase()] || 'minus';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('✨ App.js loaded successfully');
