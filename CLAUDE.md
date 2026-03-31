# Anime Architecture Archive — Agent System Prompt

> **Hashi (co-founder agent):** Read `HASHI.md` first, then return here for task routing and critical rules.

Structural intelligence platform treating anime universes as engineered systems.
Payloads live in `src/data/`. UI renders from JSON only — no universe logic in components.

---

## Task Routing

| Task | Go here first |
|---|---|
| Add a new universe (end-to-end) | `playbooks/01-add-universe.md` |
| Research → JSON payload conversion | `playbooks/02-research-to-payload.md` |
| Fix missing or broken character images | `playbooks/03-image-patch.md` |
| Validate / QA before integration | `playbooks/04-verify-universe.md` |
| Sync docs after adding a universe | `playbooks/05-docs-sync.md` |
| Field schema, enums, themeColors shape | `playbooks/06-payload-field-reference.md` |
| Homepage architecture/data-contract updates | `playbooks/07-homepage-system-hub.md` |
| Keyboard shortcuts, Compare route, llms.txt, RSS | `docs/ARCHITECTURE_DECISIONS.md` (ADR-018–021) |
| Blog hub, homepage blog entry | `docs/ARCHITECTURE_DECISIONS.md` (ADR-022–023) |
| SPA routing, meta/OG delivery, static HTML (rejected) | `docs/ARCHITECTURE_DECISIONS.md` (ADR-024) |
| Renderer selection logic | `docs/RENDERER_CONTRACT.md` |
| Pipeline stages reference | `docs/UNIVERSE_PIPELINE.md` |
| Repo-native universe build prompt | `docs/MASTER_UNIVERSE_BUILD_PROMPT.md` |
| External research prompt | `docs/MASTER_RESEARCH_PROMPT.md` |
| Image policy, aiInsights rules | `docs/DATA_PRINCIPLES.md` |
| All CLI commands | `scripts/README.md` |

---

## Source of Truth — Live Dynamic State

| What | Where |
|---|---|
| Current registered universes (slugs) | `src/data/index.js` — auto-glob, no hardcoded list |
| Homepage display order | `preferredOrder` array in `src/data/index.js` |
| Supported renderers + structural profiles | `docs/RENDERER_CONTRACT.md` |
| Presentation config keys (motifs, overlays, colors) | `src/config/universePresentation.js` |
| Homepage architecture contract | `src/config/homepageContract.js` + `docs/HOMEPAGE_SPEC.md` |
| Validation rules (enforced schema) | `src/utils/validateSchema.js` |

---

## Critical Rules

- Renderer is chosen by **system thesis**, not entity count. Read `docs/RENDERER_CONTRACT.md`.
- Never fabricate image URLs. Run the patcher or set `imageUrl: null, _fetchFailed: true`.
- `aiInsights` (`casual` + `deep`) is required on every universe. Not optional.
- `visualizationReason` is required — it surfaces in the `WhyThisRenderer` component.
- `themeColors` requires all 9 sub-keys. Missing any one is a hard validation error.
- Every character requires exactly 12 fields. `gradientFrom/To/accentColor` are Tailwind class names, not hex.
- Relationship `type` must be one of: `ally enemy rival mentor betrayal mirror dependent successor counter`
- Faction `role` must be one of: `protagonist antagonist neutral chaotic systemic`
- Rule `severity` must be one of: `low medium high fatal`
- Fallback renderer hint is `standard-cards`, not `cards`.
- Extended datasets (`slug.extended.json`) are NOT the primary arg to `add:universe`.
- After integration, update **both** `docs/BLUEPRINT.md` and `docs/REPO_AUDIT_SUMMARY.md` — each has its own universe list. Also update the `README.md` Current Universes list.
- Universe pages support keyboard shortcuts (`j/k` prev/next tab, `t` system mode, `s` share, `r` share frame, `h/c/u` nav, `?` overlay) — see ADR-018.
- Compare route at `/compare` accepts `?left=` and `?right=` params — see ADR-019.
- Community feedback at `/api/feedback` and suggestions at `/api/suggest` — Supabase-backed, no login required — see ADR-010.
- Blog posts live in `content/blog/*.json` and render at `/blog/:slug`. Homepage "Latest Analysis" section auto-surfaces 3 latest posts. Author new posts in `content/blog/` directory following existing schema.
- Every entity needs both lore and system voice fields. Missing one silently breaks the LORE/SYS toggle.

---

## REJECTED APPROACHES — DO NOT REIMPLEMENT

These were tried, broke things, and were deliberately removed. If you find yourself proposing any of these, stop and flag it to the founder instead.

| Approach | Why it was rejected | What to do instead |
|---|---|---|
| Pre-rendered static HTML for universe/blog routes (`public/universe/*/index.html`) | Vercel serves the static file first; React hydrates on top → visible flash/content swap on hard refresh. Attempted twice (PRs ~#133–139, then again ~#144–148), broke production both times. | react-helmet-async handles all meta client-side. Dynamic OG images via `api/og-universes.js`. This is the correct architecture. |
| `/universe/:slug` rewrite in `vercel.json` pointing to a static file | Same root cause as above — breaks SPA routing. | The existing catch-all rewrite in `vercel.json` sends everything to `index.html`. Do not add universe-specific rewrites. |
| A Vercel serverless function at `api/universe.js` serving pre-rendered HTML | Functionally dead — the HTML it tries to serve doesn't exist. Was removed in this repo's cleanup. | Not needed. SPA + dynamic OG is the correct stack. |
| Hardcoding universe counts in any string (`"30 anime universes"`, `"Compare 30 anime worlds"`) | Silently drifts as the catalog grows. Was found in `seo.js`, `index.html`, and `SearchResults`. | Use `catalog.length` dynamically, or write copy that doesn't embed the count. |

**The regression guard is active:** `scripts/generateStaticHtml.js` runs at every build and will exit with code 1 if any pre-rendered HTML files are found under SPA-owned routes. Do not remove or bypass this check. See ADR-024.

---

## REQUIRES FOUNDER DECISION — DO NOT PROCEED AUTONOMOUSLY

Changes in these areas must be flagged and confirmed before implementation:

- Any change to `vercel.json` routes or rewrites
- Any change to `middleware.js`
- Any change to the CI pipeline (`.github/workflows/ci.yml`)
- Any new Vercel serverless function in `api/`
- Any change to how universe data is loaded at runtime (`src/data/index.js`)
- Any architectural change that affects how meta/OG/SEO tags are delivered
- Deleting or restructuring `public/` static assets
- Any database schema change (`supabase/migrations/`)

---



```bash
npm run validate:all                                              # full audit: payloads + catalog + indexing
npm run validate:indexing                                        # verify all universes are indexed correctly
npm run validate:payload src/data/<slug>.core.json                 # validate core payload
npm run validate:payload src/data/<slug>.extended.json -- --extended  # validate extended dataset
npm run add:universe src/data/<slug>.core.json [slug]              # integrate universe (auto-regenerates sitemap)
npm run generate:sitemap                                          # regenerate public/sitemap.xml manually
npm run build                                                     # production build (regenerates sitemap + llms.txt)
npm run test                                                      # run Vitest test suite
npm run lint                                                      # ESLint check
python scripts/patch_jikan_images.py --file src/data/<slug>.json   # inject MAL images
```

### Manual Integration (alternative to `add:universe`)

Placing a `slug.core.json` file directly in `src/data/` is sufficient for registration — `index.js` auto-globs all JSON files. The `add:universe` script adds validation + cleanup but is not strictly required if you validate and place the file yourself.
