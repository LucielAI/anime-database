# Anime Architecture Archive - Utilities Hub

This directory contains standalone utilities for **data generation, validation, and ingestion**.

These utilities are intentionally separated from the React app runtime:
- app/runtime code should stay focused on rendering and interaction,
- scripts should handle archive ingestion operations,
- AI-assisted generation workflows should be explicit, reviewable, and deterministic.

This split is part of the project architecture, not just folder organization.

## Core CLI Workflows

### Validate a core payload
```bash
npm run validate:payload path/to/slug.json
```
Use this for legacy payloads (`slug.json`) and explicit core payloads (`slug.core.json`).

### Validate an extended dataset
```bash
npm run validate:payload path/to/slug.extended.json
# or
npm run validate:payload path/to/any.json --extended
```
Extended validation is intentionally lighter than core validation.

### Audit all integrated payloads
```bash
npm run validate:all
```
Runs `validateCorePayload` across every `src/data/*.json` (excluding `*.extended.json`) and prints a per-universe PASS/WARN/FAILED table. Supports `node scripts/auditPayloads.js --strict-warnings` for stricter CI/local gating when needed.
Use this for archive-wide hardening before PRs.



### Validate indexing + crawlability guardrails
```bash
npm run validate:indexing
```
Confirms sitemap coverage for every catalog universe route, robots sitemap directive, and SEO head wiring for universe pages.

### Add a universe (preferred core format)
```bash
npm run add:universe path/to/slug.core.json [slug]
```
Preferred mode writes `src/data/slug.core.json`.

### Add a universe (legacy-compatible mode)
```bash
npm run add:universe path/to/payload.json [slug]
```
Legacy mode writes `src/data/slug.json`.

### Add a layered universe (core + optional extended)
```bash
npm run add:universe path/to/slug.core.json [slug] [path/to/slug.extended.json]
# or force layered output with
npm run add:universe path/to/payload.json [slug] [path/to/slug.extended.json] --layered
```
Layered mode writes `src/data/slug.core.json` and optionally `src/data/slug.extended.json`.

> `slug.extended.json` is optional. Do not treat it as mandatory for archive integration.

### Generate sitemap
```bash
npm run generate:sitemap
```
Regenerates `public/sitemap.xml` from the universe slugs currently in `src/data/`. Runs automatically before every `vite build` and after every `add:universe`. Run manually if you edit `src/data/` directly without using `add:universe`.

---

## `patch_jikan_images.py` (The Jikan Image Enforcer)

**Reason for existence:**
The Jikan v4 API generic `/characters/{id}` endpoint can return incorrect or spoiler-heavy MAL image records.

**What it does:**
Uses the anime cast endpoint (`/anime/{id}/characters`), correlates characters by name, and injects clean MAL image URLs into a local payload without overwriting handcrafted lore/system fields.

**Usage:**
```bash
python scripts/patch_jikan_images.py --file src/data/new_anime.json
```


## Merge Gate Baseline

Before opening/merging a PR, run:

```bash
npm run validate:all
npm run test
npm run build
```

These commands are mirrored in CI for early failure on schema/runtime drift.
