# Repo Audit Summary

## Current Universes
- Attack on Titan
- Jujutsu Kaisen
- Hunter x Hunter
- Vinland Saga
- Steins;Gate
- Death Note
- Fullmetal Alchemist: Brotherhood
- Code Geass

## Current Renderers
- TimelineExplorer
- CounterTreeExplorer
- NodeGraphExplorer
- StandardCardsExplorer

## Key UX Layers
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
- `public/robots.txt` — allows all crawlers, points to sitemap
- `public/sitemap.xml` — auto-generated from `src/data/` slugs on every build and `add:universe` run
- Google site verification meta tag in `index.html`
- `meta name="robots" content="index, follow"` in `index.html`
- Generator: `scripts/generateSitemap.js` (`npm run generate:sitemap`)

## Agent Entry Point
- `CLAUDE.md` at repo root — universal system prompt with task routing, live sources of truth, and critical rules
