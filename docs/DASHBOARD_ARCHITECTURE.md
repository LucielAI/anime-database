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
→ keeps users inside the archive ecosystem via a curated 3-card mix (recent + popular + thematic wildcard)


## Route Data Resolution

- `/universe/:slug` first resolves lightweight slug metadata from `src/data/catalog.js` for immediate route-safe context.
- Full universe JSON is then loaded on demand using `loadUniverseBySlug` (`src/data/index.js`).
- This keeps homepage payload light while preserving static, indexable universe routes.


## Universe Catalog route
- `/universes` is the dedicated browse page for scalable discovery.
- Search/sort run on lightweight catalog metadata only (Latest / Most Viewed / Alphabetical).
- Controlled batch expansion uses Load More (no infinite scroll).
- Universe JSON payloads still load only on `/universe/:slug` route visits.

## Guided first-entry behavior
- Dashboard reads optional discovery metadata (`startTab`, `startLabel`) from `src/data/discoveryMetadata.js`.
- If missing, a renderer-aware fallback picks the first recommended tab.
- Tabs show a subtle `START` marker and a top “Best Entry” cue for first-impression guidance.

## System Questions Panel (Answerability Layer)

Universe routes render a lightweight `SystemQuestionsPanel` directly under the introduction block.

Design goals:
- visible, concise Q&A snippets for long-tail mechanism queries,
- direct jump links into existing tab/section content,
- no hidden content and no heavy runtime additions.

Data source: payload `systemQuestions[]`.
