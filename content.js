// Psychic Sight Content Script
// Analyzes page content for security threats

(function() {
  'use strict';
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', analyzePage);
  } else {
    analyzePage();
  }
  
  function analyzePage() {
    const pageContent = {
      isHTTPS: window.location.protocol === 'https:',
      hasForms: document.forms.length > 0,
      formActions: [],
      hasPasswordField: false,
      externalScripts: [],
      suspiciousElements: []
    };
    
    // Analyze forms
    for (const form of document.forms) {
      pageContent.formActions.push(form.action);
      const passwordFields = form.querySelectorAll('input[type="password"]');
      if (passwordFields.length > 0) {
        pageContent.hasPasswordField = true;
      }
    }
    
    if (!pageContent.hasPasswordField) {
      pageContent.hasPasswordField = document.querySelectorAll('input[type="password"]').length > 0;
    }
    
    // Collect external scripts
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        pageContent.externalScripts.push(src);
      }
    }
    
    // Check for hidden iframes
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      const style = window.getComputedStyle(iframe);
      if (style.opacity === '0' || style.visibility === 'hidden' || 
          parseInt(style.width) < 10 || parseInt(style.height) < 10) {
        pageContent.suspiciousElements.push({
          type: 'hidden_iframe',
          src: iframe.src
        });
      }
    }
    
    // Send to background for analysis
    chrome.runtime.sendMessage({
      action: 'analyzePageContent',
      content: pageContent
    }, (threats) => {
      if (threats && threats.length > 0) {
        showWarningBanner(threats);
      }
    });
  }
  
  function showWarningBanner(threats) {
    const hasSignificantThreat = threats.some(t => 
      t.severity === 'high' || t.severity === 'critical' || t.severity === 'medium'
    );
    
    if (!hasSignificantThreat) return;
    
    const banner = document.createElement('div');
    banner.id = 'psychic-sight-warning';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #6B46C1 0%, #9F7AEA 50%, #E9D8FD 100%);
        color: white;
        padding: 14px 20px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 20px rgba(107, 70, 193, 0.4);
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">👁️</span>
          <span><strong>Psychic Sight:</strong> ${threats.length} warning${threats.length > 1 ? 's' : ''} detected on this page</span>
        </div>
        <button id="psychic-sight-dismiss" style="
          background: rgba(255,255,255,0.25);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.2s;
        ">Dismiss</button>
      </div>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    document.getElementById('psychic-sight-dismiss').addEventListener('click', () => {
      banner.remove();
    });
    
    setTimeout(() => {
      if (banner.parentNode) {
        banner.style.transition = 'opacity 0.5s';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 500);
      }
    }, 10000);
  }
})();
