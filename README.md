# Anime Architecture Archive

**Live:** https://animearchive.app/

A dark, cyberpunk-styled interactive archive that deconstructs fictional universes through two interpretive lenses: **LORE** (narrative) and **SYS** (strategic/systemic). Each universe page is intended to function as a standalone reference landing page, not just a visual dashboard.

This is not an encyclopedic wiki. It is a structural analysis tool designed to reveal the hidden mechanics of fictional worlds — energy economies, permission hierarchies, counterplay graphs, and causal chains.

Every universe is treated as a deterministic system. The archive renders these systems via specialized visualization engines rather than static text pages.

The archive itself is a connected analysis graph: universes are linked by shared structural thesis (causality, control networks, counter-economies, affinity systems), lightweight system clusters (combat/causal/faction/hierarchy/inheritance/anomaly), and related-universe sections that surface comparable entries through consistent metadata rules.

## Core Experience

- **Universe Catalog (`/universes`)** — Searchable and sortable browse surface (Latest / Most Viewed / Alphabetical) with crawlable cluster routes (`/universes?cluster=...`) backed by lightweight catalog metadata and controlled load-more expansion (no infinite scroll).

Each universe page exposes four tabs:

- **Power Engine** — Abilities, techniques, and the mechanics that define combat.
- **Entity Database** — Key figures, threat levels, and how they connect.
- **Factions** — Organizations, alliances, and the groups that shape the world.
- **Core Laws** — The unbreakable rules that govern the universe.

Every description field supports dual framing:

Universe pages now also include a lightweight **Start Here** cue that points to the most useful first tab (metadata-driven with renderer-based fallback).
- **LORE Mode** — Human-readable, narrative-focused.
- **SYS Mode** — Root-access system-level analogy (e.g. treating a spell as "Proprietary Software" or an assassin as a "System Exploit").

## Renderer System

Each universe payload declares its rendering engine via `visualizationHint`. The registry dynamically loads the correct explorer:

| Renderer | Hint | Use Case |
|---|---|---|
| Timeline | `timeline` | Linear causality, escalating stakes, event cascades |
| Node Graph | `node-graph` | Conditional alliances, betrayal webs, shifting interdependence |
| Counter Tree | `counter-tree` | Technical combat matchups, counter-abilities, power mechanics |
| Affinity Matrix | `affinity-matrix` | Faction alignment, character chemistry, compatibility scores |
| Standard Cards | `standard-cards` | Fallback grid layout |

## Architecture

```
src/
├── App.jsx                    # Landing page + universe selector
├── Dashboard.jsx              # Universe detail view with tabs
├── data/
│   ├── index.js               # Import, validate, export all payloads
│   └── *.json                 # Hand-curated JSON universe schemas
├── config/
│   ├── universePresentation.js # Background motifs, reveal overlays, SYS warning colors
│   └── relationshipColors.js  # Canonical edge colors shared across renderers
├── hooks/
│   ├── useAutoHighlight.js    # Shared wow-graph-moment auto-highlight
│   ├── useSystemReveal.js     # Reveal sequence state machine
│   └── useShareFrame.js       # Share frame capture logic
├── components/
│   ├── ImageWithFallback.jsx  # Portrait with gradient fallback
│   ├── DangerBar.jsx          # Animated threat level bar
│   ├── SeverityBadge.jsx      # Rule severity indicator
│   ├── Toggle.jsx             # LORE / SYS mode switch
│   ├── Timeline.jsx           # Causality tree visualization
│   ├── NodeGraph.jsx          # Relationship graph (SVG)
│   ├── AffinityMatrix.jsx     # Faction/Character chemistry grid
│   ├── CounterTree.jsx        # Sub-system matchup/counterplay tree
│   ├── TabContent.jsx         # Tab router
│   └── tabs/                  # Logical tab sections
├── visualizations/
│   ├── registry.js            # Maps visualizationHint → explorer
│   ├── TimelineExplorer.jsx
│   ├── NodeGraphExplorer.jsx
│   ├── CounterTreeExplorer.jsx
│   ├── AffinityMatrixExplorer.jsx
│   └── StandardCardsExplorer.jsx
├── utils/
│   ├── validateSchema.js      # Strict runtime payload validation
│   ├── resolveColor.js        # Tailwind color name → hex
│   ├── deriveBullets.js       # Shared bullet derivation from payload
│   └── radialLayout.js        # Circular node positioning utility
└── __tests__/                 # Vitest test suite
    ├── validateSchema.test.js
    ├── utils.test.js
    ├── universePresentation.test.js
    └── dataIntegrity.test.js
```

## Data Schema

Every universe payload is built via a two-stage workflow: broad system research followed by strict schema validation. The engine enforces structural density over completeness.

Payloads should follow **scope-fit density**: tight universes remain compact, while broad/hybrid systems carry proportionally more core nodes (characters, factions, relationships, causal pivots) where structurally necessary.

- **Top-level:** `anime`, `tagline`, `malId`, `themeColors` (9 fields), `visualizationHint`, `visualizationReason`, `rankings`, `aiInsights`
- **Characters:** Strategically selected "hub" actors.
- **Power Systems:** Raw energy architectures and hardware/software analogies.
- **Rules:** The unyielding constraints governing the system.
- **Factions:** Organizations competing for system control.
- **Relationships:** Directed edges defining alliances, dependency, or betrayal.
- **Anomalies:** Instances where the system breaks or is hacked.
- **Counterplay:** Exact mechanical breakdowns of how abilities nullify or exploit each other.

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

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** (PostCSS, strictly utility classes)
- **Lucide React** for UI iconography
- **D3** for force-directed SVG layouts
- Deployed on **Vercel** with Edge-function dynamic Open Graph imagery

## Discovery & Scale Defaults

- Homepage is a guided system-exploration hub (structure taxonomy → featured systems → continuation paths → browse → community).
- Homepage shows selected universe slices (not full-list rendering) to stay fast as the archive grows.
- Universe pages show a small related-universe set + clear path to `/universes`.
- Catalog browsing uses metadata-only sorting/search; full payload JSON remains route-lazy.

Homepage implementation contract:
- `docs/HOMEPAGE_SPEC.md`
- `docs/HOMEPAGE_DATA_CONTRACT.md`

## Development

```bash
npm install
npm run dev               # Dev server
npm run build             # Production build
npm run preview           # Preview production build
npm run test              # Run test suite (Vitest)
npm run validate:payload  # Custom CLI tool for JSON structure checking
npm run validate:all      # Audit all integrated universe payloads in src/data/
```

## Adding a New Universe

1. Produce/obtain upstream research using `docs/MASTER_RESEARCH_PROMPT.md` (research-only artifact).
2. Implement in-repo using `docs/MASTER_UNIVERSE_BUILD_PROMPT.md` + playbooks `01`→`06`.
3. Build a core payload (`src/data/<slug>.core.json` preferred) and run image patch first.
4. Validate payload and archive:
   - `npm run validate:payload src/data/<slug>.core.json`
   - `npm run validate:all`
5. Integrate via `npm run add:universe <path-to-core-payload> <slug>` (or manual placement in `src/data/` after validation).
6. Run merge-gate checks: `npm run test` and `npm run build`.
7. Sync required docs: `README.md`, `docs/BLUEPRINT.md`, `docs/REPO_AUDIT_SUMMARY.md`, and `src/data/catalog.js` (`preferredOrder` + lightweight homepage metadata).

For agent execution hygiene, see `docs/CODEX_QUICKSTART.md` and `CLAUDE.md`.

## License

MIT



## Security Headers (Vercel)

Production responses are hardened in `vercel.json` with a low-regression profile:

- Enforced CSP tailored to this app's actual runtime sources (`self`, GoatCounter, MAL image hosts, Vercel analytics endpoints).
- Clickjacking protection via `frame-ancestors 'none'` (CSP) plus `X-Frame-Options: DENY` for legacy support.
- `Strict-Transport-Security` is enabled in staged mode (`max-age=15552000`) without `includeSubDomains` or `preload` to avoid unsafe domain-wide assumptions.
- Additional low-risk defaults: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, and a restrictive `Permissions-Policy`.

If new third-party scripts, analytics providers, or image hosts are introduced, update CSP directives in `vercel.json` accordingly before deploying.

## Runtime Payload Delivery

- Homepage/archive listing reads from `src/data/catalog.js` (lightweight static metadata + counts).
- Universe detail routes lazy-load full validated payloads via `loadUniverseBySlug` in `src/data/index.js` when `/universe/:id` is visited.
- Core payload source-of-truth remains repo JSON files in `src/data/` (`.core.json` preferred, legacy `.json` supported).
- Sitemap generation is unchanged and still derives routes from files in `src/data/`.
