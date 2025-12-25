// Psychic Sight Background Service Worker
// "See danger before you land"

// Threat patterns database
const THREAT_PATTERNS = {
  suspiciousPatterns: [
    /phishing/i,
    /malware/i,
    /hack/i,
    /crack/i,
    /warez/i,
    /free-?money/i,
    /you-?won/i,
    /claim-?prize/i,
    /urgent-?action/i,
    /account-?suspended/i,
    /verify-?immediately/i
  ],
  
  suspiciousTLDs: [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.link'
  ],
  
  typosquatPatterns: [
    /g[o0]{2}gle/i,
    /fac[e3]b[o0]{2}k/i,
    /amaz[o0]n/i,
    /micr[o0]s[o0]ft/i,
    /app[l1]e/i,
    /paypa[l1]/i,
    /netf[l1]ix/i
  ],
  
  suspiciousSubdomains: [
    'login', 'signin', 'secure', 'account', 'verify', 'update', 'confirm',
    'banking', 'wallet', 'payment'
  ]
};

// Known safe domains
const SAFE_DOMAINS = new Set([
  'google.com', 'youtube.com', 'facebook.com', 'amazon.com', 'microsoft.com',
  'apple.com', 'github.com', 'stackoverflow.com', 'wikipedia.org', 'twitter.com',
  'linkedin.com', 'instagram.com', 'netflix.com', 'paypal.com', 'stripe.com',
  'cloudflare.com', 'anthropic.com', 'openai.com', 'provideo.services',
  'psychicsight.com', 'videgrow.org', 'claude.ai', 'x.com', 'reddit.com'
]);

// Cache for scan results
const scanCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('👁️ Psychic Sight activated - Your third eye for the web');
  chrome.storage.local.set({
    enabled: true,
    threatLog: [],
    totalScans: 0,
    threatsBlocked: 0,
    dailyScans: 0,
    lastResetDate: new Date().toDateString()
  });
});

// Reset daily scans at midnight
chrome.alarms.create('resetDaily', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'resetDaily') {
    const storage = await chrome.storage.local.get(['lastResetDate']);
    const today = new Date().toDateString();
    if (storage.lastResetDate !== today) {
      await chrome.storage.local.set({ dailyScans: 0, lastResetDate: today });
    }
  }
});

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  
  const settings = await chrome.storage.local.get(['enabled']);
  if (!settings.enabled) return;
  
  const url = new URL(details.url);
  
  if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  const scanResult = await analyzeURL(url);
  
  if (scanResult.threatLevel === 'high' || scanResult.threatLevel === 'critical') {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(details.url)}&threats=${encodeURIComponent(JSON.stringify(scanResult.threats))}&level=${scanResult.threatLevel}&prediction=${encodeURIComponent(scanResult.prediction)}`)
    });
    
    logThreat(url.href, scanResult);
  }
  
  incrementScanCount();
});

// The Vision - Main URL analysis
async function analyzeURL(url) {
  const urlString = url.href;
  
  const cached = scanCache.get(urlString);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  
  const threats = [];
  let threatScore = 0;
  
  const domain = extractRootDomain(url.hostname);
  if (SAFE_DOMAINS.has(domain)) {
    const result = { threatLevel: 'safe', threats: [], score: 0, prediction: '👁️ Clear vision - safe passage ahead' };
    scanCache.set(urlString, { result, timestamp: Date.now() });
    return result;
  }
  
  // Pattern analysis
  for (const pattern of THREAT_PATTERNS.suspiciousPatterns) {
    if (pattern.test(urlString)) {
      threats.push({
        type: 'suspicious_pattern',
        description: `I sense darkness in this URL`,
        severity: 'medium'
      });
      threatScore += 25;
    }
  }
  
  // TLD analysis
  for (const tld of THREAT_PATTERNS.suspiciousTLDs) {
    if (url.hostname.endsWith(tld)) {
      threats.push({
        type: 'suspicious_tld',
        description: `Risky domain territory: ${tld}`,
        severity: 'low'
      });
      threatScore += 15;
    }
  }
  
  // Typosquatting detection
  for (const pattern of THREAT_PATTERNS.typosquatPatterns) {
    if (pattern.test(url.hostname)) {
      threats.push({
        type: 'typosquatting',
        description: 'A shapeshifter! This site impersonates a trusted brand',
        severity: 'high'
      });
      threatScore += 50;
    }
  }
  
  // Subdomain analysis
  const subdomains = url.hostname.split('.');
  for (const subdomain of subdomains) {
    if (THREAT_PATTERNS.suspiciousSubdomains.includes(subdomain.toLowerCase())) {
      if (subdomain !== subdomains[subdomains.length - 2]) {
        threats.push({
          type: 'suspicious_subdomain',
          description: `Deceptive subdomain "${subdomain}" detected`,
          severity: 'medium'
        });
        threatScore += 20;
      }
    }
  }
  
  // Long URL check
  if (urlString.length > 200) {
    threats.push({
      type: 'long_url',
      description: 'Unusually long URL - something may be hidden',
      severity: 'low'
    });
    threatScore += 10;
  }
  
  // IP address check
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(url.hostname)) {
    threats.push({
      type: 'ip_address',
      description: 'Raw IP address - legitimate sites use domain names',
      severity: 'medium'
    });
    threatScore += 30;
  }
  
  // Dangerous protocol check
  if (url.protocol === 'data:' || url.protocol === 'javascript:') {
    threats.push({
      type: 'dangerous_protocol',
      description: `Dangerous protocol: ${url.protocol}`,
      severity: 'high'
    });
    threatScore += 60;
  }
  
  // Embedded redirect check
  if ((urlString.match(/http/gi) || []).length > 1) {
    threats.push({
      type: 'embedded_url',
      description: 'Hidden redirect - deception detected',
      severity: 'medium'
    });
    threatScore += 25;
  }
  
  // @ symbol check
  if (url.href.includes('@') && !url.href.startsWith('mailto:')) {
    threats.push({
      type: 'deceptive_url',
      description: 'URL trickery with @ symbol detected',
      severity: 'high'
    });
    threatScore += 40;
  }
  
  // Encoded domain check
  if (/%[0-9a-f]{2}/i.test(url.hostname)) {
    threats.push({
      type: 'encoded_domain',
      description: 'Encoded characters hiding true identity',
      severity: 'medium'
    });
    threatScore += 25;
  }
  
  // Non-HTTPS check
  if (url.protocol === 'http:') {
    threats.push({
      type: 'no_https',
      description: 'Unencrypted connection - data exposed',
      severity: 'low'
    });
    threatScore += 10;
  }
  
  // Determine threat level and prediction
  let threatLevel = 'safe';
  let prediction = '👁️ Clear vision - safe to proceed';
  
  if (threatScore >= 75) {
    threatLevel = 'critical';
    prediction = '🚨 VISION OF DANGER - Do not proceed!';
  } else if (threatScore >= 50) {
    threatLevel = 'high';
    prediction = '⚠️ Dark premonition - threat detected';
  } else if (threatScore >= 25) {
    threatLevel = 'medium';
    prediction = '🔮 Clouded vision - exercise caution';
  } else if (threatScore > 0) {
    threatLevel = 'low';
    prediction = '👀 Minor disturbance - stay aware';
  }
  
  const result = { threatLevel, threats, score: threatScore, prediction };
  scanCache.set(urlString, { result, timestamp: Date.now() });
  
  return result;
}

function extractRootDomain(hostname) {
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname;
}

async function logThreat(url, scanResult) {
  const storage = await chrome.storage.local.get(['threatLog', 'threatsBlocked']);
  const log = storage.threatLog || [];
  
  log.unshift({
    url,
    threats: scanResult.threats,
    threatLevel: scanResult.threatLevel,
    prediction: scanResult.prediction,
    timestamp: Date.now()
  });
  
  if (log.length > 100) log.pop();
  
  await chrome.storage.local.set({
    threatLog: log,
    threatsBlocked: (storage.threatsBlocked || 0) + 1
  });
}

async function incrementScanCount() {
  const storage = await chrome.storage.local.get(['totalScans', 'dailyScans']);
  await chrome.storage.local.set({
    totalScans: (storage.totalScans || 0) + 1,
    dailyScans: (storage.dailyScans || 0) + 1
  });
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStats') {
    chrome.storage.local.get(['totalScans', 'threatsBlocked', 'threatLog', 'enabled', 'dailyScans']).then(sendResponse);
    return true;
  }
  
  if (message.action === 'scanURL') {
    analyzeURL(new URL(message.url)).then(sendResponse);
    return true;
  }
  
  if (message.action === 'toggleEnabled') {
    chrome.storage.local.get(['enabled']).then(async (storage) => {
      const newState = !storage.enabled;
      await chrome.storage.local.set({ enabled: newState });
      sendResponse({ enabled: newState });
    });
    return true;
  }
  
  if (message.action === 'getCurrentTabScan') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
      if (tabs[0]?.url) {
        const result = await analyzeURL(new URL(tabs[0].url));
        sendResponse({ url: tabs[0].url, ...result });
      } else {
        sendResponse({ error: 'No active tab' });
      }
    });
    return true;
  }
});

console.log('👁️ Psychic Sight background service loaded');
