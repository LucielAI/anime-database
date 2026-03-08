# SYSTEM BLUEPRINT

This application is an **interactive intelligence archive** for anime universes.
It extracts structural mechanics and visualizes them using specialized D3/React renderers.

## Architecture Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Visualization**: SVG + d3-force (performance optimized with `requestAnimationFrame`)
- **Hosting**: Vercel Edge 
- **OG System**: Dynamic `@vercel/og` generation using local `Roboto Mono` TTF buffers.

## Generation Pipeline & Routing
1. **Research Pass**: External LLM research yields unstructured or semi-structured structural analysis text.
2. **Pipeline Generator**: `src/generation/generateUniversePayload.js` converts the text explicitly into valid Anime Archive Schema JSON without hallucinating or employing static molds.
3. **Validation CLI**: `npm run validate:payload` strictly checks compliance and renderer densities.
4. **App Routing**: `react-router-dom` serves `/universe/:id`.

## Core Loop
Dashboards toggle between `LORE MODE` (human readable) and `SYS MODE` (abstract, cyber, thesis-driven terminal outputs).
