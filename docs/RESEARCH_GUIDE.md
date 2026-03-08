# RESEARCH GUIDE

This document outlines the workflow for expanding the Anime Architecture Archive with a brand new universe.

## 1. The Research AI Pass
Before touching the codebase, an external AI context window (e.g., Claude 3.5 Sonnet / GPT-4) must be utilized to scrape and synthesize the chosen universe. 

*The AI is not tasked with writing UI code.* It is tasked with generating highly compressed structural text mappings.
- **Identify the structural thesis** (Is it a timeline causality trap? Is it a counterplay economy?).
- **Map factions** strictly to systemic roles (Protag, Antag, Systemic, Chaotic, Neutral).
- **Extract rules** separating Lore vs. System logic.

## 2. Payload Generation Pipeline
Supply the output text or JSON from Step 1 directly into `src/generation/generateUniversePayload.js`.

The generator acts as a **Transformer**, mapping the semi-structured insights into the rigid `validateSchema.js` bounds. It will autonomously select the optimal `visualizationHint` based on the thesis (not just node counts).

## 3. Terminal Verification
Run:
`npm run validate:payload scripts/targetFile.json`

If the payload hits soft limits or validation failures, adjust the JSON manually using strict constraints, or let the `ErrorBoundary` trigger a `standard-cards` fallback gracefully on deployment.
