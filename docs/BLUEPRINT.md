# Anime Architecture Archive — Project Blueprint

Anime Architecture Archive is a structural intelligence platform that analyzes fictional universes as systems rather than lore encyclopedias.

## Core Idea
The archive is not intended to be encyclopedic.
It is intended to reveal the structural mechanics of fictional worlds.

Each universe is treated as a system defined by:
- rules
- power mechanics
- causal events
- faction dynamics
- counterplay structures
- anomalies

## Dual Voice Architecture
Every entity can be interpreted through two layers:

### LORE Mode
Human narrative explanation.

### SYS Mode
System-level explanation framing the universe like an engineered or strategic system.

Example:

LORE:
Eren becomes the catalyst for the Rumbling.

SYS:
A deterministic execution node triggers a global catastrophic cascade.

## Core Product Flow

1. Immediate understanding → SystemSummary
2. Renderer justification → WhyThisRenderer
3. Visual hook → Wow Graph Moment
4. Exploration → multi-tab dashboard
5. Discovery → ExploreAnotherUniverse

## Current Universes
- Attack on Titan
- Jujutsu Kaisen
- Hunter x Hunter
- Vinland Saga

## Product Goals
The archive serves multiple simultaneous goals:
- a real long-term portfolio project
- a TikTok / social-shareable product
- an AI-assisted content and knowledge engine
- a framework for analyzing fictional systems

## Sharing
- **Share Frame Mode**: A screenshot-optimized layout toggle on universe pages. Centers title, classification, 3 structural bullets, and graph with archive branding. Designed for 1:1 and 9:16 screenshot compositions.
- **Share Button**: Uses `navigator.share()` with clipboard fallback. Shares anime title, system label, and route URL.

## Community Feedback
- **Feedback Block**: A compact section on each universe page asking "Was this archive helpful?" with vote buttons and a "Needs More Data" flag.
- **Suggest an Anime**: Input field for users to suggest new universes for the archive.
- **Storage**: Minimal serverless endpoints (`/api/feedback`, `/api/suggest`) backed by Supabase. No personal data collected.

## Analytics
- **GoatCounter**: Lightweight, privacy-friendly page view tracking. No cookies, no personal data. Script loaded via placeholder URL in `index.html`.

## Long-Term Direction
The project should grow by adding new universes through a stable ingestion pipeline, not by constantly rebuilding the engine.
