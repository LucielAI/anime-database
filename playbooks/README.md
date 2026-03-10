# Agent Playbooks

> **Agent entry point:** `CLAUDE.md` at repo root — read that first for task routing, live sources of truth, and critical rules. This README is the playbook index.

Repo-native operational guides for recurring work in Anime Architecture Archive.

These are not a framework. They are practical checklists written for agents (Claude Code, Codex, Cursor, etc.) and human contributors who need to get work done without reading every doc first.

## Quick-Pick

| Task | Playbook |
|---|---|
| Add a new anime to the archive | [01-add-universe.md](./01-add-universe.md) |
| Turn raw research into a valid JSON payload | [02-research-to-payload.md](./02-research-to-payload.md) |
| Patch missing or broken character/anime images | [03-image-patch.md](./03-image-patch.md) |
| Validate and QA a universe before integration | [04-verify-universe.md](./04-verify-universe.md) |
| Keep docs aligned after adding a universe | [05-docs-sync.md](./05-docs-sync.md) |
| Look up required fields, enums, themeColors, character schema | [06-payload-field-reference.md](./06-payload-field-reference.md) |

## How These Were Written

Each playbook was written from the actual scripts and docs in this repo — no invented workflows. If a script or doc changes, update the relevant playbook too.

## Key Docs to Know

Before touching anything significant, read these:

- `docs/UNIVERSE_PIPELINE.md` — the authoritative 6-stage pipeline
- `docs/DATA_PRINCIPLES.md` — image policy, schema rules, aiInsights requirements
- `docs/RENDERER_CONTRACT.md` — how to choose and justify a renderer
- `docs/MASTER_RESEARCH_PROMPT.md` — how to generate research correctly
- `scripts/README.md` — CLI commands reference
