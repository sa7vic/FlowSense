class CategorizationManager {
  constructor() {
    this.customRules = [];
    this.excludedDomains = [];
    this.scoreAdjustments = {};
  }
  addCustomRule(rule) {
    if (!rule.pattern || !rule.category || rule.score === undefined) {
      throw new Error('Invalid rule: must have pattern, category, and score');
    }
    this.customRules.push(rule);
  }
  adjustDomainScore(domain, adjustment) {
    this.scoreAdjustments[domain] = adjustment;
  }
  excludeDomain(domain) {
    if (!this.excludedDomains.includes(domain)) {
      this.excludedDomains.push(domain);
    }
  }
  isExcluded(url) {
    try {
      const hostname = new URL(url.toLowerCase()).hostname;
      return this.excludedDomains.some(domain => 
        hostname.includes(domain.toLowerCase())
      );
    } catch {
      return false;
    }
  }

  applyCustomizations(url, baseResult) {
    let result = { ...baseResult };
    if (this.isExcluded(url)) {
      return {
        category: 'neutral',
        score: 50,
        confidence: 1.0,
        context: 'excluded',
        matched_rule: 'user-exclusion'
      };
    }
    for (const rule of this.customRules) {
      if (rule.pattern.test(url.toLowerCase())) {
        return {
          category: rule.category,
          score: rule.score,
          confidence: 0.95,
          context: rule.context || 'custom-rule',
          matched_rule: rule.pattern.toString()
        };
      }
    }
    try {
      const hostname = new URL(url.toLowerCase()).hostname;
      for (const [domain, adjustment] of Object.entries(this.scoreAdjustments)) {
        if (hostname.includes(domain.toLowerCase())) {
          result.score = Math.max(0, Math.min(100, result.score + adjustment));
          break;
        }
      }
    } catch {}

    return result;
  }
  async loadFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['categorizationConfig'], (data) => {
        if (data.categorizationConfig) {
          const config = data.categorizationConfig;
          this.customRules = (config.customRules || []).map(r => ({
            ...r,
            pattern: new RegExp(r.pattern)
          }));
          this.excludedDomains = config.excludedDomains || [];
          this.scoreAdjustments = config.scoreAdjustments || {};
        }
        resolve();
      });
    });
  }
  async saveToStorage() {
    const config = {
      customRules: this.customRules.map(r => ({
        ...r,
        pattern: r.pattern.source
      })),
      excludedDomains: this.excludedDomains,
      scoreAdjustments: this.scoreAdjustments
    };
    return new Promise((resolve) => {
      chrome.storage.sync.set({ categorizationConfig: config }, resolve);
    });
  }
  reset() {
    this.customRules = [];
    this.excludedDomains = [];
    this.scoreAdjustments = {};
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CategorizationManager };
}
