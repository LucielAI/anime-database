# Repo Audit Summary

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
- Sousou no Frieren

## Current Renderers
- TimelineExplorer
- CounterTreeExplorer
- NodeGraphExplorer
- StandardCardsExplorer

## Key UX Layers
- Dedicated `/universes` catalog route (search, sort, load-more)
- React Router navigation
- Dynamic OG images
- SystemSummary component
- WhyThisRenderer component
- Wow Graph Moment
- ExploreAnotherUniverse component

## Core Pipeline
Research → Payload → Validation → Integration

This structure allows the archive to scale to new universes without rebuilding the architecture each time.

## SEO & Crawling Infrastructure
- Crawlable catalog route: `/universes`
- `public/robots.txt` — allows all crawlers, points to sitemap
- `public/sitemap.xml` — auto-generated from `src/data/` slugs on every build and `add:universe` run
- Google site verification meta tag in `index.html`
- `meta name="robots" content="index, follow"` in `index.html`
- Generator: `scripts/generateSitemap.js` (`npm run generate:sitemap`)

## Agent Entry Point
- `CLAUDE.md` at repo root — universal system prompt with task routing, live sources of truth, and critical rules
