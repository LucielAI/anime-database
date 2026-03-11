# Dashboard Architecture

Each universe page is mounted at:

/universe/:slug

Examples:
- /universe/aot
- /universe/jjk
- /universe/hxh
- /universe/vinlandsaga

## Dashboard Layout

Header
↓
SystemSummary
↓
WhyThisRenderer
↓
Action Buttons (Share Button, Share Frame, Reveal The System)
↓
AI Insight Panel
↓
Tabs Navigation
↓
Visualizers
↓
ExploreAnotherUniverse
↓
FeedbackBlock (Votes + Suggestions + Correction Reports)
↓
Footer

## Share Frame Mode
When activated, an overlay displays a screenshot-optimized layout: centered title, classification label, 3 structural bullets, WhyThisRenderer, and "animearchive.app" branding. All other UI (tabs, footer, AI panel, etc.) is hidden via CSS class `share-frame-hide`.

## Tabs
Typical tabs include:
- Power Engine
- Entity Database
- Core Laws
- Counterplay
- Timeline / causal structures where applicable

## Responsibility Boundaries

SystemSummary
→ immediate comprehension

WhyThisRenderer
→ explains the visualization choice

Visualizers
→ deliver the “wow moment” and deeper understanding

ExploreAnotherUniverse
→ keeps users inside the archive ecosystem
