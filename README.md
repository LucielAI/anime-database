# Anime Architecture Archive

**Live:** https://animearchive.app/

A dark, cyberpunk-styled interactive archive that deconstructs fictional universes through two interpretive lenses: **LORE** (narrative) and **SYS** (strategic/systemic).

This is not an encyclopedic wiki. It is a structural analysis tool designed to reveal the hidden mechanics of fictional worlds — energy economies, permission hierarchies, counterplay graphs, and causal chains.

Every universe is treated as a deterministic system. The archive renders these systems via specialized visualization engines rather than static text pages.

## Core Experience

Each universe page exposes four tabs:

- **Power Engine** — Abilities, techniques, and the mechanics that define combat.
- **Entity Database** — Key figures, threat levels, and how they connect.
- **Factions** — Organizations, alliances, and the groups that shape the world.
- **Core Laws** — The unbreakable rules that govern the universe.

Every description field supports dual framing:
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
│   └── *.json                 # Hand-curated JSON intelligence schemas
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
- Demon Slayer: Kimetsu no Yaiba
- Hunter x Hunter
- Vinland Saga
- Steins;Gate
- Death Note
- Fullmetal Alchemist: Brotherhood
- Code Geass
- My Hero Academia

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 4** (PostCSS, strictly utility classes)
- **Lucide React** for UI iconography
- **D3** for force-directed SVG layouts
- Deployed on **Vercel** with Edge-function dynamic Open Graph imagery

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


## Runtime Payload Delivery

- Homepage/archive listing reads from `src/data/catalog.js` (lightweight static metadata + counts).
- Universe detail routes lazy-load full validated payloads via `loadUniverseBySlug` in `src/data/index.js` when `/universe/:id` is visited.
- Core payload source-of-truth remains repo JSON files in `src/data/` (`.core.json` preferred, legacy `.json` supported).
- Sitemap generation is unchanged and still derives routes from files in `src/data/`.
