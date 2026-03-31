# Anime Architecture Archive — Project Blueprint

Anime Architecture Archive is a structural intelligence platform that analyzes fictional universes as systems rather than lore encyclopedias.

## Core Idea
The archive is not intended to be encyclopedic.
It is intended to reveal the structural mechanics of fictional worlds.

Each universe is treated as a system defined by:
- rules
- power mechanics
- causal events
- faction dynamics
- counterplay structures
- anomalies

## Dual Voice Architecture
Every entity can be interpreted through two layers:

### LORE Mode
Human narrative explanation.

### SYS Mode
System-level explanation framing the universe like an engineered or strategic system.

Example:

LORE:
Eren becomes the catalyst for the Rumbling.

SYS:
A deterministic execution node triggers a global catastrophic cascade.

## Core Product Flow

1. Immediate understanding → SystemSummary
2. Renderer justification → WhyThisRenderer
3. AI readout → AIInsightPanel
4. Visual hook → Wow Graph Moment
5. Exploration → multi-tab dashboard
6. Discovery → curated suggestions + /universes catalog

## Core Systems

### AI Insight System
The `AIInsightPanel` provides high-level automated commentary on the universe.
- **Payload Field**: `aiInsights` (required on every core payload).
- **Modes**: Support for `casual` (fan-friendly) vs `deep` (system-analytical) explanations.
- **Behavior**: Simulates a real-time "system scan" with streaming text animations to enhance the "Control Room" aesthetic.

### WhyThisRenderer
Every universe explains its own visualization choice through the `WhyThisRenderer` component.
- **Payload Field**: `visualizationReason`.
- **Purpose**: Educates the user on *why* a specific lens (Timeline, Node Graph, etc.) was chosen to represent this specific system thesis.

### Share Frame Mode
A specialized UI state optimized for social media capture (TikTok/Reels/X).
- **Function**: Toggles a clean, centered layout with branding, high-level bullets, and the core visualization.
- **Optimization**: Specifically designed for 9:16 vertical video and 1:1 square screenshots.

### ExploreAnotherUniverse
A dynamic navigation system that encourages cross-archive discovery.
- **Architecture**: Reads from the dynamic universe registry in `src/data/index.js`.
- **States**: Handles transitions between existing archives and "pending" classified slots.

## Current Universes
- Attack on Titan
- Jujutsu Kaisen
- Chainsaw Man
- Demon Slayer: Kimetsu no Yaiba
- Hunter x Hunter
- Vinland Saga
- Steins;Gate
- Death Note
- Fullmetal Alchemist: Brotherhood
- Code Geass
- My Hero Academia
- Sousou no Frieren
- Solo Leveling
- Goblin Slayer
- Mushoku Tensei: Jobless Reincarnation
- Naruto
- One Piece
- Dragon Ball Z
- Bleach
- Mob Psycho 100
- Tokyo Ghoul
- Black Clover
- Re:Zero - Starting Life in Another World
- Blue Lock
- Sword Art Online
- Tokyo Revengers
- One Punch Man
- Spy x Family
- Fire Force
- Parasyte

## Product Goals
The archive serves multiple simultaneous goals:
- a real long-term portfolio project
- a TikTok / social-shareable product
- an AI-assisted content and knowledge engine
- a framework for analyzing fictional systems

## Sharing
- **Share Frame Mode**: A screenshot-optimized layout toggle on universe pages. Centers title, classification, 3 structural bullets, and graph with archive branding. Designed for 1:1 and 9:16 screenshot compositions.
- **Share Button**: Uses `navigator.share()` with clipboard fallback. Shares anime title, system label, and route URL.

## Community Feedback
- **Feedback Block**: A compact section on each universe page with quality votes, plus a short correction-report textarea routed as a structured `needs_data` signal.
- **Suggest an Anime**: Input field on universe pages and a quick-vote `Community Pulse` strip on the homepage to surface demand for upcoming universes.
- **Back-end Flow**: Minimal serverless endpoints (`/api/feedback`, `/api/suggest`) handle incoming signals with optional metadata (`source`, correction notes/context).
- **Infrastructure**: Backed by Supabase (optional infrastructure). No login wall and no personal data collection requirements.

## Analytics
- **GoatCounter**: Lightweight, privacy-first page view tracking.
- **Strategy**: No cookies, no personal data, ensuring the archive remains a clean intelligence tool rather than a marketing tracker. Script loaded via dynamic placeholder.

## Long-Term Direction
The project should grow by adding new universes through a stable ingestion pipeline, not by constantly rebuilding the engine.

## Layered Universe Data Foundation

To scale the archive safely, universes can now carry:

- `slug.json` (legacy core, still supported)
- `slug.core.json` (preferred explicit core)
- `slug.extended.json` (optional deep dataset)

The runtime always resolves a universe's **core payload** for rendering. If both legacy and `.core` exist, `.core` takes precedence.

### Discoverability defaults

All universes should ship with a visible `systemQuestions` layer (4-8 concise entries) to improve answerability, AI-crawler readability, and section-level navigation.


## Scope-Fit Density

The archive now uses scope-fit density guidance so universes are modeled proportionally instead of to one fixed template. See `docs/SCOPE_FIT_DENSITY.md` for the audit baseline, classification model (`tight|medium|broad|hybrid`), and anti-bloat inclusion rule.
