# Universe Ingestion Pipeline

The archive includes a structured pipeline for adding new universes.

## Layered Universe Data (Non-Breaking)

A universe may now use any of these files in `src/data/`:

- `slug.json` (legacy core payload, still supported)
- `slug.core.json` (preferred explicit core payload)
- `slug.extended.json` (optional extended research dataset)

Runtime behavior is unchanged: UI/renderers always use the core layer.

## Actual Workflow

### Stage 1 — Research
Input:
- anime name
- MASTER_UNIVERSE_BUILD_PROMPT.md (canonical) + MASTER_RESEARCH_PROMPT.md (companion)
- optionally RESEARCH_GUIDE.md

Output:
- structured research file → save to `research/{slug}_research.txt`

### Stage 2 — Extended Dataset (optional but recommended)
Output:
- `slug.extended.json` with deep collections for retention and future analysis

### Stage 3 — Core Generation
Flow:
- extended dataset
- deterministic core selector (`src/generation/selectCoreFromExtended.js`)
- renderer-ready core payload

Output:
- `slug.core.json` (or legacy `slug.json`)

### Stage 4 — Validation
Run:
```bash
npm run validate:payload path/to/slug.core.json
```

Archive-wide hardening pass before PR:
```bash
npm run validate:all
```

For extended datasets:
```bash
npm run validate:payload path/to/slug.extended.json
```
(or add `--extended`)

### Stage 5 — Integration
Run:
```bash
npm run add:universe path/to/payload.json [slug] [path/to/slug.extended.json]
# default: writes slug.json (legacy mode)
# add --layered or pass a .core.json input to write slug.core.json
```
`add:universe` automatically regenerates `public/sitemap.xml` after integration. No manual sitemap update needed.

### Stage 6 — Deployment
Once committed and pushed:
1. **Docs sync**: Update `docs/BLUEPRINT.md` and `docs/REPO_AUDIT_SUMMARY.md` universe lists. See `playbooks/05-docs-sync.md`.
2. **GitHub PR**: Review payloads and docs.
3. **Vercel Deployment**: `git push` triggers automatic build/deploy. The build step regenerates the sitemap from `src/data/` before bundling.

## Validation split
`src/utils/validateSchema.js` now exposes:
- `validateCorePayload` (strict renderer-safe validation)
- `validateExtendedDataset` (light structural validation)

Current `validateAnimePayload` remains as a compatibility alias.

## What core validation enforces
`validateCorePayload` protects renderer and archive quality by enforcing:
- required fields for renderer-safe payloads,
- image host allowlist safety constraints,
- renderer-specific structural profile warnings (thin vs bloated),
- enum integrity for relationships/factions/rules,
- graph-level sanity checks and AI insight field quality.

## Important Distinctions
Do NOT confuse research with core payload generation.

- Research should be broad and system-aware.
- Core payload generation should be schema-aware and renderer-aware.
- Renderer choice should follow the **system thesis**, not just volume of entities.
- Layered support exists to scale depth safely, not to force complexity on every universe.
