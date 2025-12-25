# 👁️ Psychic Sight

**See danger before you land.**

AI-powered browser security that knows if a website is dangerous before you even get there.

---

## 🔮 What It Does

Psychic Sight scans every website you visit BEFORE it fully loads, checking for:

- **Phishing attempts** - Sites trying to steal your credentials
- **Typosquatting** - Fake sites impersonating trusted brands (like "g00gle.com")
- **Suspicious domains** - High-risk domain extensions (.tk, .xyz, etc.)
- **Hidden redirects** - URLs that secretly send you somewhere else
- **Deceptive URLs** - Tricks like using @ symbols to hide the real destination
- **Insecure connections** - Sites without HTTPS encryption
- **IP-based sites** - Suspicious sites using raw IP addresses instead of domains

## 🚀 Installation

### Chrome / Edge / Brave (Chromium-based browsers)

1. Unzip `psychic-sight-extension.zip`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `psychic-sight` folder
6. The 👁️ icon should appear in your toolbar!

### Firefox (coming soon)

Firefox version in development.

## 💰 Pricing

- **Free Tier**: 50 scans per day, basic protection
- **Pro Tier**: $3.99/month - Unlimited scans, advanced threat detection, priority support

## 🎯 How It Works

1. **Pre-Navigation Scan**: When you click a link or enter a URL, Psychic Sight analyzes it BEFORE the page loads
2. **Threat Scoring**: Each URL is scored based on multiple risk factors
3. **Instant Protection**: Dangerous sites are blocked with a warning page
4. **User Control**: You can always choose to proceed at your own risk

## 🛡️ Threat Levels

- **✨ Safe** - Clear vision, proceed with confidence
- **👀 Low** - Minor concerns, stay aware
- **🔮 Medium** - Clouded vision, exercise caution
- **⚠️ High** - Dark premonition, threat detected
- **🚨 Critical** - DANGER! Do not proceed

## 🏗️ Technical Details

- Manifest V3 compliant
- No external API calls (all analysis happens locally)
- Minimal permissions required
- Zero impact on browsing speed

## 📁 Files Included

```
psychic-sight/
├── manifest.json      # Extension configuration
├── background.js      # Main threat detection logic
├── content.js         # Page analysis script
├── popup.html         # Extension popup UI
├── popup.js           # Popup functionality
├── blocked.html       # Warning page for dangerous sites
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🤔 The Name

Can you figure out the hidden meaning behind "Psychic Sight"? 

*Hint: Think about what we're protecting you from...*

---

## 📞 Support

Questions? Issues? Contact us at support@psychicsight.com

## 📜 License

Copyright © 2024 Psychic Sight. All rights reserved.

---

**Stay safe out there. Let Psychic Sight be your third eye for the web.** 👁️
