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
3. AI readout → AIInsightPanel
4. Visual hook → Wow Graph Moment
5. Exploration → multi-tab dashboard
6. Discovery → ExploreAnotherUniverse

## Core Systems

### AI Insight System
The `AIInsightPanel` provides high-level automated commentary on the universe.
- **Payload Field**: `aiInsights` (required for new universes).
- **Modes**: Support for `casual` (fan-friendly) vs `deep` (system-analytical) explanations.
- **Behavior**: Simulates a real-time "system scan" with streaming text animations to enhance the "Control Room" aesthetic.

### WhyThisRenderer
Every universe explains its own visualization choice through the `WhyThisRenderer` component.
- **Payload Field**: `visualizationReason`.
- **Purpose**: Educates the user on *why* a specific lens (Timeline, Node Graph, etc.) was chosen to represent this specific system thesis.

### Share Frame Mode
A specialized UI state optimized for social media capture (TikTok/Reels/X).
- **Function**: Toggles a clean, centered layout with branding, high-level bullets, and the core visualization.
- **Optimization**: Specifically designed for 9:16 vertical video and 1:1 square screenshots.

### ExploreAnotherUniverse
A dynamic navigation system that encourages cross-archive discovery.
- **Architecture**: Reads from the dynamic universe registry in `src/data/index.js`.
- **States**: Handles transitions between existing archives and "pending" classified slots.

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
- **Back-end Flow**: Minimal serverless endpoints (`/api/feedback`, `/api/suggest`) handle incoming signals.
- **Infrastructure**: Backed by Supabase (optional infrastructure). No personal data collected.

## Analytics
- **GoatCounter**: Lightweight, privacy-first page view tracking.
- **Strategy**: No cookies, no personal data, ensuring the archive remains a clean intelligence tool rather than a marketing tracker. Script loaded via dynamic placeholder.

## Long-Term Direction
The project should grow by adding new universes through a stable ingestion pipeline, not by constantly rebuilding the engine.
