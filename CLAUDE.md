# Anime Architecture Archive — Agent System Prompt

Structural intelligence platform treating anime universes as engineered systems.
Payloads live in `src/data/`. UI renders from JSON only — no universe logic in components.

---

## Task Routing

| Task | Go here first |
|---|---|
| Add a new universe (end-to-end) | `playbooks/01-add-universe.md` |
| Research → JSON payload conversion | `playbooks/02-research-to-payload.md` |
| Fix missing or broken character images | `playbooks/03-image-patch.md` |
| Validate / QA before integration | `playbooks/04-verify-universe.md` |
| Sync docs after adding a universe | `playbooks/05-docs-sync.md` |
| Field schema, enums, themeColors shape | `playbooks/06-payload-field-reference.md` |
| Renderer selection logic | `docs/RENDERER_CONTRACT.md` |
| Pipeline stages reference | `docs/UNIVERSE_PIPELINE.md` |
| Image policy, aiInsights rules | `docs/DATA_PRINCIPLES.md` |
| All CLI commands | `scripts/README.md` |

---

## Source of Truth — Live Dynamic State

| What | Where |
|---|---|
| Current registered universes (slugs) | `src/data/index.js` — auto-glob, no hardcoded list |
| Homepage display order | `preferredOrder` array in `src/data/index.js` |
| Supported renderers + structural profiles | `docs/RENDERER_CONTRACT.md` |
| Presentation config keys (motifs, overlays, colors) | `src/config/universePresentation.js` |
| Validation rules (enforced schema) | `src/utils/validateSchema.js` |

---

## Critical Rules

- Renderer is chosen by **system thesis**, not entity count. Read `docs/RENDERER_CONTRACT.md`.
- Never fabricate image URLs. Run the patcher or set `imageUrl: null, _fetchFailed: true`.
- `aiInsights` (`casual` + `deep`) is required on every universe. Not optional.
- `visualizationReason` is required — it surfaces in the `WhyThisRenderer` component.
- `themeColors` requires all 9 sub-keys. Missing any one is a hard validation error.
- Every character requires exactly 12 fields. `gradientFrom/To/accentColor` are Tailwind class names, not hex.
- Relationship `type` must be one of: `ally enemy rival mentor betrayal mirror dependent successor counter`
- Fallback renderer hint is `standard-cards`, not `cards`.
- Extended datasets (`slug.extended.json`) are NOT the primary arg to `add:universe`.
- After integration, update **both** `docs/BLUEPRINT.md` and `docs/REPO_AUDIT_SUMMARY.md` — each has its own universe list.
- Every entity needs both lore and system voice fields. Missing one silently breaks the LORE/SYS toggle.

---

## CLI Cheatsheet

```bash
npm run validate:payload path/to/slug.core.json                       # validate core payload
npm run validate:payload path/to/slug.extended.json -- --extended     # validate extended dataset
npm run add:universe path/to/slug.core.json [slug]                    # integrate universe
python scripts/patch_jikan_images.py --file path/to/slug.json         # inject MAL images
```
