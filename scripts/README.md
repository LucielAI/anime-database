# Anime Architecture Archive - Utilities Hub

This directory contains standalone utilities for data generation and ingestion.

## Core CLI Workflows

### Validate a core payload
```bash
npm run validate:payload path/to/slug.json
```

### Validate an extended dataset
```bash
npm run validate:payload path/to/slug.extended.json
# or
npm run validate:payload path/to/any.json --extended
```

### Add a universe (backward-compatible default)
```bash
npm run add:universe path/to/payload.json [slug]
```
Default mode writes `src/data/slug.json` (legacy behavior).

### Add a layered universe (core + optional extended)
```bash
npm run add:universe path/to/slug.core.json [slug] [path/to/slug.extended.json]
# or force layered output with
npm run add:universe path/to/payload.json [slug] [path/to/slug.extended.json] --layered
```
Layered mode writes `src/data/slug.core.json` and optionally `src/data/slug.extended.json`.

---

## `patch_jikan_images.py` (The Jikan Image Enforcer)

**Reason for Existence:**
The Jikan v4 API's generic `/characters/{id}` endpoint is vulnerable to incorrect or spoiler-heavy MAL image records.

**What it does:**
Uses the anime cast endpoint (`/anime/{id}/characters`), correlates characters by name, and injects clean MAL image URLs into a local payload without overwriting lore fields.

**Usage:**
```bash
python scripts/patch_jikan_images.py --file src/data/new_anime.json
```
