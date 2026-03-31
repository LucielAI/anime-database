# Repo Audit Summary

## Current Universes
- Attack on Titan
- Jujutsu Kaisen
- Chainsaw Man
- Demon Slayer: Kimetsu no Yaiba
- Hunter x Hunter
- Vinland Saga
- Steins;Gate
- Death Note
- Fullmetal Alchemist: Brotherhood
- Code Geass
- My Hero Academia
- Sousou no Frieren
- Solo Leveling
- Goblin Slayer
- Mushoku Tensei: Jobless Reincarnation
- Naruto
- One Piece
- Dragon Ball Z
- Bleach
- Mob Psycho 100
- Tokyo Ghoul
- Black Clover
- Re:Zero - Starting Life in Another World
- Blue Lock
- Sword Art Online
- Tokyo Revengers
- One Punch Man
- Spy x Family
- Fire Force
- Parasyte

## Current Renderers
- TimelineExplorer
- CounterTreeExplorer
- NodeGraphExplorer
- AffinityMatrixExplorer
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


## Scope-Fit Density

The archive now uses scope-fit density guidance so universes are modeled proportionally instead of to one fixed template. See `docs/SCOPE_FIT_DENSITY.md` for the audit baseline, classification model (`tight|medium|broad|hybrid`), and anti-bloat inclusion rule.
