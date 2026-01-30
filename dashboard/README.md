# FlowSense Dashboard

A cognitive pattern visualization dashboard for FlowSense Chrome extension. This is a **reflection layer only** — it visualizes backend-generated cognitive data without computing scores or enforcing productivity.

## 🎯 Philosophy

FlowSense Dashboard is a **cognitive mirror**, not a performance tracker. It answers one question:

> "What patterns do I see when I look at my cognition over time?"

### Core Principles

✅ Shows patterns, not scores  
✅ Favors timelines over totals  
✅ Exposes causality, not rankings  
✅ Never shames, ranks, or judges cognition  

❌ No leaderboards  
❌ No streaks  
❌ No dopamine UI  
❌ No notifications  

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **Recharts** - Data visualization
- **CSS Modules** - Component styling

### Component Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── SessionTimeline.jsx       # 1️⃣ Primary cognitive state timeline
│   │   ├── AlignmentCurve.jsx        # 2️⃣ Attention coherence graph
│   │   ├── DriftReplay.jsx           # 3️⃣ Causal analysis of drift events
│   │   ├── FatigueMap.jsx            # 4️⃣ Engagement density visualization
│   │   ├── CognitiveFingerprint.jsx  # 5️⃣6️⃣ Long-term pattern profile
│   │   ├── InsightPanel.jsx          # 7️⃣ GenAI reflection display
│   │   ├── ComparativeView.jsx       # 8️⃣ Self vs past self (ethical)
│   │   └── Header.jsx
│   ├── context/
│   │   └── ThemeContext.jsx          # Light/dark mode system
│   ├── services/
│   │   └── api.js                    # Backend integration layer
│   ├── data/
│   │   └── sampleData.js             # Mock data matching backend format
│   ├── styles/
│   │   └── globals.css               # Calm, low-saturation design system
│   ├── App.jsx                       # Main dashboard orchestration
│   └── main.jsx
```

## 🎨 Design System

### Color Philosophy
- **Calm, low-saturation palette** — no bright colors
- **Descriptive state encoding** — not red/green success/failure
- **Light + dark mode** — respects system preferences

### Cognitive State Colors
- 🟢 **Aligned** (Teal) - Working in intended context
- 🟡 **Drift** (Amber) - Attention shifted away
- 🔵 **Fatigue** (Soft Blue) - Cognitive load accumulating
- ⚪ **Idle** (Gray) - Natural pause
- 🟣 **Recovery** (Purple) - Re-engaging

## 📊 Dashboard Sections

### 1. Session Timeline (Primary View)
Horizontal segmented timeline showing cognitive states over session duration. Replaces "focus scores" with state narratives.

### 2. Alignment Curve
Line graph (0-100) showing attention coherence over time. Visualizes volatility, decay, and recovery slope.

### 3. Drift Replay (Causal Layer)
For each drift event:
- Trigger context
- Alignment drop point
- Recovery latency
- Insight: "What broke alignment here?"

### 4. Fatigue Map
Visualizes engagement density and fatigue onset without judgment. Shows interaction patterns revealing cognitive load.

### 5 & 6. Cognitive Fingerprint
Non-clinical descriptive profile across sessions:
- **Alignment Ramp-Up** - Speed of entering focus
- **Endurance Span** - Sustained attention capacity
- **Drift Sensitivity** - Context-switching susceptibility
- **Recovery Resilience** - Re-engagement speed
- **Task Affinity** - Performance by task type

### 7. Insight Panel
Displays AI-generated reflections from backend. Preserves tone, never adds commands or guilt language.

### 8. Comparative Views (Ethical)
**Allowed:** Self vs past self, task-type comparisons  
**Forbidden:** Social ranking, public metrics, leaderboards

## 🔌 Data Contract

The dashboard consumes **only** backend-generated JSON:

```javascript
{
  "session_id": "fs_726b15e38603",
  "analysis": {
    "analytics_metadata": {
      "avg_recovery_time": 45.0,
      "distraction_percentage": 22.5,
      "interaction_trend": "decreasing",
      "lowest_window": "Window 12 (score: 28)",
      "peak_window": "Window 3 (score: 89)",
      "tab_switch_pattern": "moderate",
      "volatility": 18.42
    },
    "insights": "AI-generated markdown text...",
    "timestamp": "2026-01-27T21:35:05.562109"
  },
  "session": { /* session metadata */ },
  "windows": [ /* 30-second window data */ ]
}
```

### Forbidden Inputs
❌ Raw keystrokes  
❌ Raw URLs  
❌ Content data  
❌ Private browsing data  

## 🚀 Getting Started

### Installation
```bash
cd dashboard
npm install
```

### Development
```bash
npm run dev
```
Dashboard runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Mock Data Mode
By default, the dashboard uses sample data. To connect to backend:

In `src/App.jsx`, change:
```javascript
const [useMockData] = useState(false);
```

Or set environment variable:
```bash
VITE_API_URL=http://localhost:5000/api npm run dev
```

## 🛡️ Ethical Safeguards

### What the UI Does NOT Do
- ❌ Compute analytics (backend only)
- ❌ Score users
- ❌ Gamify behavior
- ❌ Enforce productivity
- ❌ Rank against others
- ❌ Use guilt language
- ❌ Show notifications

### Privacy Guarantees
- All data is user-private
- No social comparison features
- No public metrics
- No data sharing
- Patterns shown, not judged

## 📱 Accessibility

- Keyboard navigation support
- Proper ARIA labels
- Color-blind safe palette
- Respects `prefers-reduced-motion`
- Mobile-responsive layout

## 🎯 Development Guidelines

### When Adding Features
1. Ask: "Does this judge or reflect?"
2. Avoid celebratory language
3. Use descriptive labels, not scores
4. No red/green success/failure semantics
5. Maintain calm visual language

### Component Rules
- All visualizations must be **descriptive**, not prescriptive
- Preserve backend insights verbatim (no rewriting)
- Empty states should be calm, not motivational
- No countdown timers or urgency signals

## 🔄 Backend Integration

Expected Flask endpoints:
```
GET /api/sessions/latest
GET /api/sessions/:sessionId/analysis
GET /api/sessions?user_id=:userId
GET /api/users/:userId/fingerprint
```

See `src/services/api.js` for integration details.

## 📄 License

Part of FlowSense project — cognitive awareness system.

---

**Remember:** This UI should feel like focus, not analytics. 🧘‍♂️
