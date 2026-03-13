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
Community feedback and suggestions are stored via narrowly scoped Vercel serverless endpoints (`/api/feedback`, `/api/suggest`) backed by Supabase free tier. Endpoints support lightweight metadata (`source`, optional correction notes/context) while preserving no-login flow. Credentials are server-side only (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). No public admin API — data is viewed via Supabase dashboard.

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
