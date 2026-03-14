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
FeedbackBlock (votes + suggestion + correction report)
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


## Route Data Resolution

- `/universe/:slug` first resolves lightweight slug metadata from `src/data/catalog.js` for immediate route-safe context.
- Full universe JSON is then loaded on demand using `loadUniverseBySlug` (`src/data/index.js`).
- This keeps homepage payload light while preserving static, indexable universe routes.


## Universe Catalog route
- `/universes` is the dedicated browse page for scalable discovery.
- Search/sort run on lightweight catalog metadata only.
- Universe JSON payloads still load only on `/universe/:slug` route visits.
