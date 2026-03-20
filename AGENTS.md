# Anime Architecture Archive — Agent Guide

Universal operational reference for any AI agent working on this repo.
For Claude-specific system prompt, see `CLAUDE.md`.

---

## Quick Start

1. Read `CLAUDE.md` for task routing and critical rules
2. Follow the playbook for your task (see table below)
3. Run validation before integration: `npm run validate:payload path/to/file.json`
4. Run tests before pushing: `npm run test`

---

## Playbook Index

| Task | Playbook |
|---|---|
| Add a new universe (end-to-end) | `playbooks/01-add-universe.md` |
| Convert research → JSON payload | `playbooks/02-research-to-payload.md` |
| Fix missing or broken images | `playbooks/03-image-patch.md` |
| QA / verify a payload | `playbooks/04-verify-universe.md` |
| Sync docs after changes | `playbooks/05-docs-sync.md` |
| Field schema + enum reference | `playbooks/06-payload-field-reference.md` |
| Homepage architecture + data contract updates | `playbooks/07-homepage-system-hub.md` |

---

## CLI Commands

```bash
# Validation
npm run validate:all                                              # full audit: payloads + catalog + indexing
npm run validate:indexing                                        # verify all universes indexed correctly
npm run validate:payload path/to/slug.core.json              # core (strict)
npm run validate:payload path/to/slug.extended.json -- --extended # extended (lighter)

# Integration
npm run add:universe path/to/slug.core.json [slug]           # copies to src/data/, regenerates sitemap
npm run add:universe path/to/slug.core.json [slug] path/to/slug.extended.json  # with extended

# Image patching (run BEFORE validation)
python scripts/patch_jikan_images.py --file path/to/slug.json

# Build & test
npm run build                                                   # production build (regenerates sitemap + llms.txt)
npm run test                                                    # Vitest suite
npm run lint                                                    # ESLint check
npm run generate:sitemap                                        # manual sitemap regen
```

### Manual Integration

Placing a `.core.json` file directly in `src/data/` works — `src/data/index.js` auto-globs all JSON files (excluding `*.extended.json`). The `add:universe` script adds an extra validation pass and cleanup, but is not strictly required.

---

## Pipeline Stages

```
1. Research      → research/{slug}_research.txt
2. Extended      → {slug}.extended.json (optional, for retention)
3. Core Payload  → {slug}.core.json (what the UI renders)
4. Image Patch   → python scripts/patch_jikan_images.py --file ...
5. Validation    → npm run validate:payload ...
6. Integration   → place in src/data/ or run add:universe
7. Docs Sync     → update BLUEPRINT.md, REPO_AUDIT_SUMMARY.md, README.md
```

---

## Generation Utilities

| Script | Purpose |
|---|---|
| `src/generation/generateUniversePayload.js` | Research → starter payload scaffold (manual hardening required) |
| `src/generation/selectCoreFromExtended.js` | Ranks and caps extended data into core-sized arrays |
| `src/generation/starterProfiles.js` | System type detection + editorial defaults per renderer |

These are optional. Agents can build payloads manually using `playbooks/06-payload-field-reference.md` as the schema reference.

---

## Required Top-Level Fields

All cause hard validation errors if missing:

```
anime             string    Display title
tagline           string    One punchy sentence
malId             number    MyAnimeList ID
themeColors       object    9 required sub-keys (see below)
visualizationHint string    timeline | node-graph | counter-tree | affinity-matrix | standard-cards
visualizationReason string  One sentence explaining renderer choice
powerSystem       array     Power system entries
characters        array     12 required fields per entry
factions          array     Faction entries
rules             array     Rule entries
rankings          object    Tier/ranking structure (empty {} passes)
aiInsights        object    { casual: string, deep: string }
```

---

## Enum Constraints (hard errors)

| Field | Valid Values |
|---|---|
| `visualizationHint` | `timeline` `node-graph` `counter-tree` `affinity-matrix` `standard-cards` |
| `relationships[].type` | `ally` `enemy` `rival` `mentor` `betrayal` `mirror` `dependent` `successor` `counter` |
| `factions[].role` | `protagonist` `antagonist` `neutral` `chaotic` `systemic` |
| `rules[].severity` | `low` `medium` `high` `fatal` |

---

## themeColors (all 9 required)

```
primary, secondary, accent, glow, tabActive, badgeBg, badgeText, modeGlow, heroGradient
```

---

## Character Fields (all 12 required)

```
name, title, rank, dangerLevel, loreBio, systemBio,
gradientFrom, gradientTo, accentColor, icon, signatureMoment, imageUrl
```

- `gradientFrom`, `gradientTo`, `accentColor` → Tailwind class names (e.g. `slate-900`), NOT hex
- `imageUrl` → MAL CDN URL or `null` (if null, must also set `_fetchFailed: true`)
- `icon` → Lucide icon name (e.g. `Eye`, `Brain`, `Zap`, `Flame`, `Shield`, `Crown`, `Star`, `Target`, `Globe`, `Heart`, `Sword`, `Lock`, `Key`)

---

## Dual-Voice Pattern

Every entity requires both lore and system descriptions. Missing one breaks the LORE/SYS toggle.

| Entity | Lore field | System field |
|---|---|---|
| characters | `loreBio` | `systemBio` |
| powerSystem | `loreDesc` + `loreSubtitle` | `systemDesc` + `systemSubtitle` |
| factions | `loreDesc` | `systemDesc` |
| rules | `loreSubtitle` | `systemSubtitle` |
| relationships | `loreDesc` | `systemDesc` |
| anomalies | `loreDesc` | `systemDesc` |
| causalEvents | `loreDesc` | `systemDesc` |

---

## Renderer Selection

Choose by **system thesis**, not entity count:

| Thesis | Renderer | Key requirement |
|---|---|---|
| How A leads to B (causality) | `timeline` | ≥4 causalEvents |
| Who controls/knows whom (networks) | `node-graph` | ≥8 relationships |
| How X defeats Y (combat economy) | `counter-tree` | ≥5 counterplay |
| Affinity / compatibility structures | `affinity-matrix` | ≥4 relationships |
| No strong thesis fit | `standard-cards` | Fallback |

See `docs/RENDERER_CONTRACT.md` for full structural profile ranges per renderer.

---

## Presentation Config Keys

Must match keys in `src/config/universePresentation.js`:

| Field | Valid keys |
|---|---|
| `backgroundMotif` | `jagged` `noise` `circles` `paper` `temporal` |
| `revealOverlay` | `hatch-red` `pulse-purple` `glow-border` `glow-border-soft` `gradient-top` |
| `headerFlavor.sysWarningColor` | `red` `blue` `green` `amber` `cyan` `purple` |

---

## Image Policy

- **Allowed hosts**: `cdn.myanimelist.net`, `images.myanimelist.net`, `myanimelist.net`
- **Never fabricate URLs** — run `scripts/patch_jikan_images.py` or set `imageUrl: null, _fetchFailed: true`
- The UI renders a gradient fallback for null images via `ImageWithFallback.jsx`

---

## Docs to Update After Adding a Universe

1. `docs/BLUEPRINT.md` — Current Universes list
2. `docs/REPO_AUDIT_SUMMARY.md` — Current Universes list
3. `README.md` — Current Universes list
4. `src/data/index.js` — `preferredOrder` array (for homepage sort order)

Sitemap is auto-regenerated by `add:universe` and `npm run build`.

---

## Common Agent Mistakes

1. **Missing `tagline`, `themeColors`, or `rankings`** — most commonly omitted required fields
2. **Incomplete characters** — all 12 fields required per entry, missing any one is a hard error
3. **Wrong enum values** — `"conflict"` instead of `"enemy"`, `"cards"` instead of `"standard-cards"`
4. **Fabricating image URLs** — use the patcher or null + `_fetchFailed`
5. **Missing `aiInsights`** — both `casual` and `deep` must be non-empty strings
6. **`aiInsights.deep` as plot summary** — must reference mechanics, constraints, causal structures
7. **Missing lore/system voice** — silently breaks LORE/SYS toggle in UI
8. **Off-graph relationships** — `source`/`target` must exactly match a character `name`
9. **Hex values in gradient fields** — use Tailwind class names (`amber-400`), not hex (`#fbbf24`)
10. **Skipping image patch before validation** — image host errors will fail validation

---

## Key Reference Files

| What | Where |
|---|---|
| Agent system prompt | `CLAUDE.md` |
| Validation source of truth | `src/utils/validateSchema.js` |
| Universe auto-discovery | `src/data/index.js` |
| Presentation config | `src/config/universePresentation.js` |
| Homepage contract source | `src/config/homepageContract.js` |
| Homepage behavior spec | `docs/HOMEPAGE_SPEC.md` |
| Renderer contract | `docs/RENDERER_CONTRACT.md` |
| Data principles | `docs/DATA_PRINCIPLES.md` |
| Pipeline reference | `docs/UNIVERSE_PIPELINE.md` |
| Repo-native universe build prompt | `docs/MASTER_UNIVERSE_BUILD_PROMPT.md` |
| External research prompt | `docs/MASTER_RESEARCH_PROMPT.md` |
| Research prompt template | `docs/MASTER_RESEARCH_PROMPT.md` |
| Research shape guide | `docs/RESEARCH_GUIDE.md` |
| Architecture decisions | `docs/ARCHITECTURE_DECISIONS.md` |

## Sprint-2 Features (2026-03-20)

- **Keyboard shortcuts** (`?` to open overlay, `j/k/t/s/r/h/c/u` for navigation) — ADR-018
- **Compare route** (`/compare?left=jjk&right=aot`) — ADR-019
- **llms.txt** — AI crawler text sitemap, generated at build time — ADR-020
- **RSS feed** (`/feed.xml`) — ADR-021
- **GoatCounter analytics** — privacy-first, no cookies — ADR-011
- **Supabase feedback/suggest API** (`/api/feedback`, `/api/suggest`) — ADR-010
