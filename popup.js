// Psychic Sight Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  // Load stats
  const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
  
  // Update stats display
  document.getElementById('totalScans').textContent = formatNumber(stats.totalScans || 0);
  document.getElementById('threatsBlocked').textContent = formatNumber(stats.threatsBlocked || 0);
  
  // Update status
  updateStatus(stats.enabled !== false);
  
  // Get current tab scan
  const tabScan = await chrome.runtime.sendMessage({ action: 'getCurrentTabScan' });
  
  if (tabScan && !tabScan.error) {
    document.getElementById('currentUrl').textContent = truncateUrl(tabScan.url);
    updateScanResult(tabScan);
  } else {
    document.getElementById('currentUrl').textContent = 'Unable to scan this page';
    document.getElementById('predictionText').textContent = 'Extension pages cannot be scanned';
  }
  
  // Load recent threats
  displayRecentThreats(stats.threatLog || []);
  
  // Toggle button handler
  document.getElementById('toggleBtn').addEventListener('click', async () => {
    const result = await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
    updateStatus(result.enabled);
  });
  
  // Upgrade button handler
  document.getElementById('upgradeBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://psychicsight.com/upgrade' });
  });
});

function updateStatus(enabled) {
  const indicator = document.getElementById('statusIndicator');
  const text = document.getElementById('statusText');
  const btn = document.getElementById('toggleBtn');
  
  if (enabled) {
    indicator.classList.remove('disabled');
    text.textContent = 'Protection Active';
    btn.textContent = 'Disable';
    btn.classList.remove('disabled');
  } else {
    indicator.classList.add('disabled');
    text.textContent = 'Protection Disabled';
    btn.textContent = 'Enable';
    btn.classList.add('disabled');
  }
}

function updateScanResult(scan) {
  const resultDiv = document.getElementById('scanResult');
  const predictionText = document.getElementById('predictionText');
  
  // Remove all level classes
  resultDiv.classList.remove('safe', 'low', 'medium', 'high', 'critical');
  
  // Add appropriate class
  resultDiv.classList.add(scan.threatLevel || 'safe');
  
  // Update prediction text
  predictionText.textContent = scan.prediction || '👁️ Clear vision';
}

function displayRecentThreats(threats) {
  const container = document.getElementById('recentThreats');
  
  if (!threats || threats.length === 0) {
    container.innerHTML = '<div class="no-threats">No threats detected yet - your browsing is protected</div>';
    return;
  }
  
  // Show last 5 threats
  const recentThreats = threats.slice(0, 5);
  
  container.innerHTML = recentThreats.map(threat => `
    <div class="threat-item">
      <span>🚨</span>
      <span class="threat-url" title="${escapeHtml(threat.url)}">${truncateUrl(threat.url)}</span>
      <span class="threat-time">${formatTime(threat.timestamp)}</span>
    </div>
  `).join('');
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function truncateUrl(url) {
  try {
    const urlObj = new URL(url);
    const display = urlObj.hostname + urlObj.pathname;
    return display.length > 35 ? display.substring(0, 35) + '...' : display;
  } catch {
    return url.length > 35 ? url.substring(0, 35) + '...' : url;
  }
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
