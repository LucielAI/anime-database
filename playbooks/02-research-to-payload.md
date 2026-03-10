# Playbook: Research → Payload

How to transform raw research into a valid archive JSON payload.

## Read First

- `docs/MASTER_RESEARCH_PROMPT.md` — the canonical research prompt
- `docs/RESEARCH_GUIDE.md` — what sections to produce and why
- `docs/RENDERER_CONTRACT.md` — how to pick a renderer from research output
- `docs/DATA_PRINCIPLES.md` — schema rules, image policy, aiInsights spec
- `src/generation/selectCoreFromExtended.js` — deterministic core selection
- `src/generation/generateUniversePayload.js` — higher-level research → payload transformer
- `playbooks/06-payload-field-reference.md` — complete field schema with required keys and enums

## Inputs Required

- Raw research in `research/{slug}_research.txt`
- Anime MAL ID (`malId`) — look it up on myanimelist.net
- Chosen renderer (determined during research by system thesis)

## Outputs Expected

- `{slug}.extended.json` — full structured dataset (optional but recommended)
- `{slug}.core.json` — renderer-ready payload for the archive

---

## Step 1 — Determine the System Thesis

Before touching JSON, identify the structural thesis from research:

- Is the system defined by **causality** (A leads to B)? → `timeline`
- Is the system defined by **who knows/controls whom** (networks)? → `node-graph`
- Is the system defined by **how X defeats Y** (combat economy)? → `counter-tree`
- Is the system defined by **affinity/compatibility structures**? → `affinity-matrix`
- None fit cleanly? → `standard-cards`

`generateUniversePayload.js` auto-detects thesis from keywords (`time`/`causal` → timeline, `counter`/`economy` → counter-tree, `network`/`alliance` → node-graph). Review and override its choice if the auto-detection misses the actual system thesis.

This determines `visualizationHint` and drives all structural profile targets.

See `docs/RENDERER_CONTRACT.md` — Structural Profiles table for the expected array lengths per renderer.

## Step 2 — Build the Extended Dataset (recommended)

Produce `{slug}.extended.json` with all collected data. No caps on array length here — retain everything useful.

Required top-level fields (same as core, see Step 3 below).

Validate:
```bash
npm run validate:payload path/to/{slug}.extended.json --extended
```

Extended validation is lighter than core validation. A few warnings here are acceptable.

## Step 3 — Generate the Core Payload

The core payload is what the archive renders. Every field must serve a renderer.

**Option A — Use the generation pipeline (recommended):**

`src/generation/generateUniversePayload.js` takes structured research and returns a formatted core payload:
```js
import { generateUniversePayload } from './src/generation/generateUniversePayload.js'

// From extended dataset (recommended):
const core = generateUniversePayload(animeName, extendedResearch, { sourceLayer: 'extended' })

// From structured research directly:
const core = generateUniversePayload(animeName, structuredResearch)
```

When `sourceLayer: 'extended'`, it calls `selectCoreFromExtended` first, then formats the result. Non-breaking defaults fill in missing fields (gradients, icons, etc.) but you should populate them explicitly for quality.

**Option B — Manual construction:**

Write the core payload directly. Follow the structural profile targets in `docs/RENDERER_CONTRACT.md` and use `playbooks/06-payload-field-reference.md` for the exact field schema.

### Required Fields (hard validation errors if missing)

```json
{
  "anime": "Anime Title",
  "tagline": "Short thematic hook — one punchy sentence.",
  "malId": 9253,
  "themeColors": { "primary": "...", "secondary": "...", ... },
  "visualizationHint": "timeline|node-graph|counter-tree|affinity-matrix|standard-cards",
  "visualizationReason": "One sentence: why this renderer fits this system.",
  "powerSystem": [...],
  "characters": [...],
  "factions": [...],
  "rules": [...],
  "rankings": { ... },
  "aiInsights": {
    "casual": "Fan-friendly summary.",
    "deep": "Analytical readout referencing mechanics and constraints."
  }
}
```

**See `playbooks/06-payload-field-reference.md` for all required sub-fields**, including the 9 `themeColors` keys, 12 character fields, enum constraints, and `rankings` structure.

For `sysWarningColor`, `backgroundMotif`, and `revealOverlay` valid keys, check `src/config/universePresentation.js`.

### Image Fields

Set all image fields to `null` + `_fetchFailed: true` at this stage. The image patch step (Stage 3.5) fills them in:
```json
{ "name": "Character Name", "imageUrl": null, "_fetchFailed": true }
```

Do NOT fabricate MAL URLs. See [03-image-patch.md](./03-image-patch.md).

### aiInsights Quality Bar

- `casual`: Short. Intuitive. No jargon. Fan-readable in one pass.
- `deep`: Analytical. Must reference actual mechanics, constraints, or causal structures. Not a plot summary.

---

## Done When

- [ ] `{slug}.extended.json` validates with `--extended` flag (if using layered workflow)
- [ ] `{slug}.core.json` validates cleanly with `npm run validate:payload`
- [ ] All image fields are either real MAL URLs or `null` + `_fetchFailed: true`
- [ ] `visualizationReason` and both `aiInsights` strings are present
- [ ] Structural profile targets for the chosen renderer are met

## Common Mistakes

**Missing `tagline`, `themeColors`, or `rankings`.** All three are in `REQUIRED_TOP_LEVEL`. They cause hard errors. They are the most commonly omitted fields by agents building payloads from scratch.

**Using research sections as array items directly.** Research is prose. Payload arrays need structured objects with specific keys (`name`, `description`, `weight`, `type`, etc.). Transform, don't paste.

**Incomplete character objects.** Every character requires 12 specific fields. Missing any causes a hard error per character. See `playbooks/06-payload-field-reference.md` for the full list.

**Wrong enum values.** Relationship `type`, faction `role`, and rule `severity` must match exact enum strings. Using `"conflict"` instead of `"enemy"` causes a hard error. See the field reference.

**Relationship source/target doesn't match character names.** The validator checks that every `source` and `target` in `relationships` exactly matches a character `name`. Off-graph edges produce warnings. Make relationship names identical to character names.

**Skipping `aiInsights`.** Hard schema requirement for new universes. Both `casual` and `deep` must be non-empty strings.

**Oversizing the core payload.** Core is capped for renderer performance. Put extra data in extended. `selectCoreFromExtended` handles capping automatically.

**Writing `aiInsights.deep` as a plot summary.** Must read like a system analysis. Reference rules, constraints, and causal mechanics — not episode events.
