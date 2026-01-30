const CategorizationConfig = {
  DOMAIN_PATTERNS: [
    { pattern: /^(www\.)?(github|gitlab)\.com/, category: 'work', score: 98, context: 'development' },
    { pattern: /^(www\.)?stackoverflow\.com/, category: 'work', score: 95, context: 'problem-solving' },
    { pattern: /^.*\.stackexchange\.com/, category: 'work', score: 93, context: 'technical-qa' },
    { pattern: /^(developer\.mozilla\.org|docs\.python\.org|docs\.oracle\.com)/, category: 'work', score: 97, context: 'documentation' },
    { pattern: /^(www\.)?(reactjs|vuejs|angular|svelte|nextjs)\.org/, category: 'work', score: 96, context: 'framework-docs' },
    { pattern: /^(www\.)?(npmjs|pypi|packagist|maven|rubygems)\./, category: 'work', score: 94, context: 'package-registry' },
    { pattern: /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/, category: 'work', score: 99, context: 'local-dev' },
    { pattern: /^(www\.)?(codesandbox|codepen|replit|jsfiddle|glitch)\./, category: 'work', score: 92, context: 'online-ide' },
    { pattern: /^(www\.)?(leetcode|hackerrank|codewars|topcoder)\.com/, category: 'work', score: 90, context: 'coding-practice' },
    { pattern: /^(www\.)?(codeforces|atcoder|spoj)\./, category: 'work', score: 89, context: 'competitive-programming' },
    { pattern: /^(www\.)?geeksforgeeks\.org/, category: 'work', score: 87, context: 'tutorials' },
    { pattern: /^(www\.)?notion\.(so|com)/, category: 'work', score: 88, context: 'notes' },
    { pattern: /^docs\.google\.com\/(document|spreadsheets|presentation)/, category: 'work', score: 91, context: 'documentation' },
    { pattern: /^(www\.)?(trello|asana|jira|linear|monday)\./, category: 'work', score: 90, context: 'project-management' },
    { pattern: /^(www\.)?(figma|sketch|invision)\.com/, category: 'work', score: 93, context: 'design' },
    { pattern: /^(www\.)?canva\.com/, category: 'work', score: 75, context: 'design' },
    { pattern: /^(www\.)?overleaf\.com/, category: 'work', score: 96, context: 'academic' },
    { pattern: /^(www\.)?(miro|mural|whimsical)\.com/, category: 'work', score: 85, context: 'collaboration' },
    { pattern: /^chat\.openai\.com/, category: 'work', score: 85, context: 'ai-assistant' },
    { pattern: /^(www\.)?claude\.ai/, category: 'work', score: 85, context: 'ai-assistant' },
    { pattern: /^gemini\.google\.com/, category: 'work', score: 84, context: 'ai-assistant' },
    { pattern: /^copilot\.microsoft\.com/, category: 'work', score: 86, context: 'ai-assistant' },
    { pattern: /^(www\.)?(coursera|edx|udacity)\./, category: 'video', score: 88, context: 'mooc' },
    { pattern: /^(www\.)?(udemy|pluralsight|skillshare|datacamp)\.com/, category: 'video', score: 85, context: 'courses' },
    { pattern: /^(www\.)?khanacademy\.org/, category: 'video', score: 87, context: 'education' },
    { pattern: /^(www\.)?linkedin\.com\/learning/, category: 'video', score: 84, context: 'professional-dev' },
    { pattern: /^(www\.)?(masterclass|skillshare)\.com/, category: 'video', score: 80, context: 'skill-learning' },
    { pattern: /^(www\.)?youtube\.com\/watch/, category: 'video', score: 50, context: 'video-platform' },
    { pattern: /^(www\.)?youtu\.be/, category: 'video', score: 50, context: 'video-platform' },
    { pattern: /^(www\.)?vimeo\.com/, category: 'video', score: 55, context: 'video-platform' },
    { pattern: /^(www\.)?slack\.com/, category: 'neutral', score: 60, context: 'team-chat' },
    { pattern: /^(teams\.microsoft|discord)\.com/, category: 'neutral', score: 55, context: 'communication' },
    { pattern: /^mail\.google\.com/, category: 'neutral', score: 65, context: 'email' },
    { pattern: /^outlook\.(office|live)\.com/, category: 'neutral', score: 65, context: 'email' },
    { pattern: /^(www\.)?(twitter|x)\.com/, category: 'distraction', score: 15, context: 'social-media' },
    { pattern: /^(www\.)?facebook\.com/, category: 'distraction', score: 10, context: 'social-media' },
    { pattern: /^(www\.)?instagram\.com/, category: 'distraction', score: 8, context: 'social-media' },
    { pattern: /^(www\.)?tiktok\.com/, category: 'distraction', score: 5, context: 'short-video' },
    { pattern: /^(www\.)?reddit\.com/, category: 'distraction', score: 20, context: 'forum' },
    { pattern: /^(www\.)?(pinterest|tumblr)\.com/, category: 'distraction', score: 12, context: 'social-media' },
    { pattern: /^(www\.)?(snapchat|whatsapp|telegram)\./, category: 'distraction', score: 18, context: 'messaging' },
    { pattern: /^(www\.)?(netflix|hulu|disneyplus|primevideo|hbomax)\.com/, category: 'distraction', score: 3, context: 'streaming' },
    { pattern: /^(www\.)?twitch\.tv/, category: 'distraction', score: 5, context: 'live-streaming' },
    { pattern: /^(www\.)?spotify\.com/, category: 'distraction', score: 25, context: 'music' },
    { pattern: /^music\.(apple|youtube)\.com/, category: 'distraction', score: 25, context: 'music' },
    { pattern: /^news\.ycombinator\.com/, category: 'distraction', score: 35, context: 'tech-news' },
    { pattern: /^(www\.)?(cnn|bbc|foxnews|nytimes|washingtonpost)\.com/, category: 'distraction', score: 20, context: 'news' },
    { pattern: /^(www\.)?(buzzfeed|9gag|imgur)\.com/, category: 'distraction', score: 8, context: 'entertainment' },
    { pattern: /^(www\.)?espn\.com/, category: 'distraction', score: 10, context: 'sports' },
    { pattern: /^(www\.)?(amazon|ebay|aliexpress|walmart)\.com/, category: 'distraction', score: 20, context: 'shopping' },
    { pattern: /^(www\.)?etsy\.com/, category: 'distraction', score: 18, context: 'shopping' }
  ],
  PATH_RULES: [
    { pattern: /github\.com\/[^\/]+\/[^\/]+\/(issues|pull|discussions|wiki|actions)/, category: 'work', score: 97 },
    { pattern: /github\.com\/explore/, category: 'neutral', score: 60 },
    { pattern: /youtube\.com\/watch.*[?&]v=[^&]*.*(?:tutorial|course|lecture|programming|coding|computer|science|math|physics)/, category: 'video', score: 80 },
    { pattern: /reddit\.com\/r\/(programming|webdev|learnprogramming|cscareerquestions|coding|softwaredevelopment)/, category: 'neutral', score: 65 },
    { pattern: /docs\.google\.com\/.*\/edit/, category: 'work', score: 92 },
    { pattern: /docs\.google\.com\/.*\/preview/, category: 'neutral', score: 70 }
  ],
    THRESHOLDS: {
    WORK_MIN_SCORE: 75,        
    DISTRACTION_MAX_SCORE: 40, 
    CONFIDENCE_HIGH: 0.90, 
    CONFIDENCE_MEDIUM: 0.70   
  }
};

function categorizeURL(url) {
  if (!url) {
    return {
      category: 'neutral',
      score: 50,
      confidence: 1.0,
      context: 'unknown',
      matched_rule: null
    };
  }
  
  try {
    const urlObj = new URL(url.toLowerCase());
    const hostname = urlObj.hostname.replace(/^www\./, '');
    const fullUrl = urlObj.href;
    for (const rule of CategorizationConfig.PATH_RULES) {
      if (rule.pattern.test(fullUrl)) {
        return {
          category: rule.category,
          score: rule.score,
          confidence: 0.95,
          context: rule.context || 'path-match',
          matched_rule: rule.pattern.toString()
        };
      }
    }
    let bestMatch = null;
    let bestScore = 0;
    
    for (const rule of CategorizationConfig.DOMAIN_PATTERNS) {
      if (rule.pattern.test(hostname) || rule.pattern.test(fullUrl)) {
        const patternLength = rule.pattern.toString().length;
        const currentScore = rule.score + (patternLength * 0.01);
        if (currentScore > bestScore) {
          bestScore = currentScore;
          bestMatch = rule;
        }
      }
    }
    
    if (bestMatch) {
      let confidence = 0.90;
      if (bestMatch.pattern.test(hostname)) {
        confidence = 0.95;
      }
      return {
        category: bestMatch.category,
        score: bestMatch.score,
        confidence: confidence,
        context: bestMatch.context,
        matched_rule: bestMatch.pattern.toString()
      };
    }
    return {
      category: 'neutral',
      score: 50,
      confidence: 0.50,
      context: 'unclassified',
      matched_rule: null
    };
    
  } catch (error) {
    return {
      category: 'neutral',
      score: 50,
      confidence: 0.30,
      context: 'parse-error',
      matched_rule: null,
      error: error.message
    };
  }
}

function categorizeURLSimple(url) {
  const result = categorizeURL(url);
  return result.category;
}
function getProductivityScore(url) {
  const result = categorizeURL(url);
  return result.score;
}