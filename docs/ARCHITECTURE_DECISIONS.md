# Architecture Decisions

## ADR-001 — Renderer-First Architecture
Decision:
The archive is built around visualization engines, not wiki completeness.

Why:
The project’s value comes from explaining systems through the right lens.

Tradeoff:
Some “important” lore gets omitted if it does not strengthen the renderer.

## ADR-002 — LORE / SYS Dual Narrative
Decision:
Every universe supports both human-readable and system-readable framing.

Why:
This is one of the archive’s strongest differentiators for both product identity and shareability.

Tradeoff:
Requires extra discipline in data writing.

## ADR-003 — Soft Schema Guidance
Decision:
Avoid rigid global count molds.

Why:
Different universes need different structural density.

Tradeoff:
Requires smarter validation and editorial judgment.

## ADR-004 — Research-to-Payload Pipeline
Decision:
Research and payload generation are separate stages.

Why:
Research should stay broad and intelligent; payload generation should stay schema-aware.

Tradeoff:
Two-stage workflow, but much higher reliability.

## ADR-005 — Fallback Rendering
Decision:
Specialized renderer failures degrade gracefully to cards.

Why:
Protects uptime and prevents white-screen failures.

## ADR-006 — Route-Based Universe Pages
Decision:
Each universe lives at /universe/:slug

Why:
Better shareability, OG support, and product structure.

## ADR-007 — Dynamic OG Generation
Decision:
Use dynamic universe-specific OG images.

Why:
Higher social clickthrough and stronger portfolio impression.

## ADR-008 — Product Positioning
Decision:
The archive is intentionally optimized for both portfolio strength and TikTok/shareability.

Why:
Those two goals reinforce each other instead of conflicting.

## ADR-009 — Shared Utility Extraction
Decision:
`deriveBullets` and `getClassificationLabel` are extracted into `src/utils/` and shared across landing page, dashboard, and share surfaces.

Why:
Avoids logic duplication and ensures consistent bullet/label derivation everywhere.

## ADR-010 — Serverless Feedback with Supabase
Decision:
Community feedback and suggestions are stored via narrowly scoped Vercel serverless endpoints (`/api/feedback`, `/api/suggest`) backed by Supabase free tier. Endpoints support lightweight metadata (`source`, optional correction notes/context) while preserving no-login flow. Runtime config accepts `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` plus Vite-compatible `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or anon-key variants), with writes gated by explicit RLS insert policies instead of service-role bypass. No public admin API — data is viewed via Supabase dashboard.

Supabase project: `tszkboujwzyludpzrxxk` (supabase.co)
Key formats (as of June 2025): `sb_publishable_...` (client-safe), `sb_secret_...` (server-only). Legacy anon JWT still works.
Env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY (set in Vercel project settings).

Why:
Lightweight, free, and avoids building a backend. Strict input validation and minimal responses reduce attack surface.

## ADR-011 — GoatCounter Analytics
Decision:
Use GoatCounter for page view tracking. Script is loaded with a placeholder URL in `index.html` that can be swapped for a real instance.

Why:
Privacy-friendly, no cookies, no personal tracking, lightweight (~3.5KB), free tier available.

## ADR-012 — Share Frame Mode
Decision:
A CSS-driven layout toggle that optimizes the universe page for screenshots. No image generation or export pipeline.

Why:
Enables TikTok/social sharing without infrastructure. Users screenshot the optimized layout directly.

## ADR-013 — Layered Universe Data (Core + Extended)
Decision:
Introduce non-breaking support for optional `*.extended.json` datasets and explicit `*.core.json` payloads while preserving legacy `*.json` universes.

Why:
Enables much larger research inputs without forcing renderer complexity or immediate migration.

Tradeoff:
Data management gains a second layer, but runtime stays stable by always rendering from core.



## ADR-014 — Catalog + Route-Level Payload Loading
Decision:
Homepage/archive listing consumes lightweight static metadata (`src/data/catalog.js`), while universe routes lazy-load full core payload JSON at route visit time via `loadUniverseBySlug`.

Why:
Prevents first-load bundle growth as universes scale while preserving repo-native static payload source-of-truth and stable `/universe/:slug` routing for SEO.


## ADR-015 — Dedicated Catalog Browsing Route
Decision:
Introduce `/universes` as the primary scalable browsing surface with metadata-only search/sort and controlled batch expansion.

Why:
Keeps homepage curated and fast while allowing growth to 20/50/100+ universes without clutter.

Tradeoff:
Adds one extra route, but preserves crawlability and avoids infinite-scroll UX debt.


## ADR-016 — Guided Best-Entry Discovery Cue
Decision:
Use lightweight discovery metadata (`startTab`, `startLabel`) with renderer-aware fallback logic to preselect and label the strongest first tab on universe routes.

Why:
Reduces first-impression overwhelm and guides regular fans to the highest-engagement section faster without redesigning dashboard structure.

Tradeoff:
Introduces small metadata maintenance overhead, but defaults remain safe when fields are missing.

## ADR-017 — Homepage Contract-First Guidance Layer
Decision:
Homepage behavior is contract-driven via `src/config/homepageContract.js` and documented in `docs/HOMEPAGE_SPEC.md` + `docs/HOMEPAGE_DATA_CONTRACT.md`, with deterministic section order and curation rules.

Why:
Prevents one-off homepage redesign drift and keeps AI-agent updates reproducible across future iterations.

Tradeoff:
Requires explicit contract/doc updates whenever homepage logic changes, but avoids hidden JSX-only business logic.

## ADR-018 — Keyboard Navigation (2026-03-20)
Decision:
Universe pages support keyboard shortcuts for power-user navigation: `j/k` (prev/next tab), `t` (toggle system mode), `s` (share), `r` (share frame), `h/c/u` (navigate home/compare/universes), `?` (shortcuts overlay).
Why:
Archive users are engaged, analytical viewers who benefit from keyboard navigation. Reduces mouse dependency for repeat visitors.

## ADR-019 — Compare Route (2026-03-20)
Decision:
Dedicated `/compare` route for side-by-side universe comparison. Accepts `?left=` and `?right=` search params. Full comparison table across system type, combat stats, world metrics. Homepage widget links to it.
Why:
Structural comparison is a primary use case. Inline widget is limited — a full page enables more detailed analysis and better SEO (dedicated URL for each pair).

## ADR-020 — llms.txt for AI Crawlers (2026-03-20)
Decision:
`/public/llms.txt` generated at build time via `scripts/generateLlms.js`. Lists all universes, key pages, and archive structure in plain text. Linked in `index.html` via `<link rel="alternate" type="text/plain">`. Vercel headers serve it as `text/plain`.
Why:
AI agents (ChatGPT, Claude, Perplexity) crawl sites and need lightweight text representations. llms.txt is the emerging standard for this. Also improves Perplexity/Claude Search SERP presence.

## ADR-021 — RSS Feed (2026-03-20)
Decision:
Static `/public/feed.xml` with atom link in `index.html` for RSS reader subscribers and SEO.
Why:
RSS feeds signal to search engines that content is updated regularly. Some users still use RSS readers for site updates. Low maintenance cost for a static file.
