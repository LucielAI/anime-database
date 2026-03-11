# MASTER_UNIVERSE_BUILD_PROMPT.md

Use this prompt with Claude Code, Codex, or another repo-aware implementation agent **after** the research file has already been added to the repo.

Replace the research path and slug where needed.

---

## Canonical Prompt

You are working inside the **Anime Architecture Archive** repo.

Your task is to fully implement a new archive universe from an existing research file already committed or added to the repo.

**Research file to use:**  
`research/<REPLACE_WITH_RESEARCH_FILE>.txt`

**Expected slug:**  
`<REPLACE_WITH_SLUG>`

---

## IMPORTANT

Read the repo docs, playbooks, scripts, and current source-of-truth files **before changing anything**.

Do **not**:
- build from assumptions
- skip the playbooks
- treat the research file as final JSON
- turn the archive into a wiki dump
- hardcode anime-specific logic into core UI components
- fabricate image URLs
- weaken current repo standards

Treat the research file as **strong source material**, not the final payload.

---

## PRIMARY GOAL

Create a complete, archive-quality universe implementation that is fully integrated into the current system and aligned with the latest repo standards.

The final implementation must support the full current product:

- landing page card
- featured system / hero compatibility
- universe route
- renderer selection
- SystemSummary
- WhyThisRenderer
- AIInsightPanel
- Share Frame
- image workflow / fallback rules
- validation
- docs / sitemap / registry expectations

---

## READ FIRST

### Agent entry + live rules
Read these first:

- `CLAUDE.md`
- `playbooks/README.md`

### Core docs
Then read:

- `README.md`
- `docs/BLUEPRINT.md`
- `docs/DASHBOARD_ARCHITECTURE.md`
- `docs/DATA_PRINCIPLES.md`
- `docs/RENDERER_CONTRACT.md`
- `docs/UNIVERSE_PIPELINE.md`
- `docs/REPO_AUDIT_SUMMARY.md`

### Workflow / scripts
Then read:

- `playbooks/01-add-universe.md`
- `playbooks/02-research-to-payload.md`
- `playbooks/03-image-patch.md`
- `playbooks/04-verify-universe.md`
- `playbooks/05-docs-sync.md`
- `playbooks/06-payload-field-reference.md`
- `scripts/README.md`
- `research/README.md`

### Source-of-truth implementation files
Inspect these before building:

- `src/data/index.js`
- `src/config/universePresentation.js`
- `src/utils/validateSchema.js`

---

## REFERENCE PAYLOADS TO STUDY FIRST

Before writing the new payload, inspect:

### Legacy payload reference
Inspect **at least one** of the older legacy universes to understand the original archive voice and structure:
- `src/data/aot.json`
- `src/data/jjk.json`
- `src/data/hxh.json`

### Newer core payload reference
Inspect **at least one** of the newer `.core.json` universes to understand the current expected standard:
- `src/data/deathnote.core.json`
- `src/data/fmab.core.json`

### Additional useful reference
Also inspect:
- `src/data/steinsgate.json` or `src/data/steinsgate.core.json` if present, for timeline-oriented structure and recent surface quality expectations

Your job is to understand the **full arc** of the archive:
- original payload style
- newer core payload conventions
- current standards for quality, field completeness, and integration

---

## RESEARCH INTERPRETATION RULES

Treat the research file as:

- strong source material
- not final payload
- not final canon truth in every sentence
- something to normalize, curate, and transform

Preserve the strongest structural parts of the research.

Cut, compress, or de-prioritize anything that would make the universe:

- bloated
- too wiki-like
- too repetitive
- too lore-dump-heavy
- too weak on thesis clarity
- too broad for the chosen renderer

The archive is **curated**, not encyclopedic.

---

## RENDERER SELECTION RULE

Choose the renderer based on **system thesis**, not vibes and not entity count alone.

Supported renderer hints:

- `timeline`
- `node-graph`
- `counter-tree`
- `affinity-matrix`
- `standard-cards`

Your renderer choice must align with:
- the research thesis
- the actual relationship/counterplay/causal structure
- `docs/RENDERER_CONTRACT.md`

You must provide a strong `visualizationReason`.

---

## IMPLEMENTATION REQUIREMENTS

Build the universe cleanly and in a repo-native way.

You must account for the current required/expected fields and standards, including:

- `anime`
- `tagline`
- `malId`
- `themeColors`
- `visualizationHint`
- `visualizationReason`
- `characters`
- `relationships`
- `factions`
- `rules`
- `rankings`
- `aiInsights`
- `powerSystem` if structurally appropriate
- `counterplay` if structurally appropriate
- `causalEvents` if structurally appropriate
- `anomalies` if structurally appropriate
- current presentation/config fields expected by the repo

Important current rules from `CLAUDE.md` and repo standards:

- `aiInsights` (`casual` + `deep`) is required on every universe
- `visualizationReason` is required
- `themeColors` must include all 9 keys
- every character requires the full schema
- relationship `type` must use a valid enum
- faction `role` must use a valid enum
- rule `severity` must use a valid enum
- fallback renderer hint is `standard-cards`, not `cards`

---

## FILE FORMAT / INTEGRATION MODE

Use the current repo-preferred format unless there is a strong reason not to.

Preferred modern pattern:
- `src/data/<slug>.core.json`

If an extended dataset is genuinely useful and justified:
- use layered/core workflow correctly
- do **not** make extended mode mandatory unless the universe truly needs it

Prefer the **simplest correct implementation**.

---

## IMAGE WORKFLOW

Follow the repo-native image workflow exactly.

Rules:

- do not fabricate image URLs
- do not use unapproved hosts
- use the approved image patch workflow / script
- if an image cannot be safely resolved, preserve proper fallback behavior
- use `null` + `_fetchFailed: true` when required
- do not leave sloppy or inconsistent image handling

Use:
- `python scripts/patch_jikan_images.py --file <path-to-payload>`

Only approved image hosts are allowed by repo policy.

---

## DO NOT REINTRODUCE OLD PROBLEMS

Do **not**:

- hardcode anime-specific behavior into core components
- bypass the new data/config-driven presentation pattern
- duplicate utility logic that already has a shared home
- ignore playbooks
- skip validation
- skip build verification
- skip docs/sitemap/registry expectations
- leave a root-level staging payload lying around after integration unless explicitly required

If the universe needs custom presentation identity, express it through the current data/config-driven mechanism, not scattered `if` branches in UI components.

---

## IMPLEMENTATION FLOW

Follow this order:

1. Read docs/playbooks/scripts/source-of-truth files
2. Inspect legacy + modern reference payloads
3. Curate the research into archive-safe payload structure
4. Create the payload in the correct format
5. Run image patch workflow
6. Run payload validation
7. Integrate the universe
8. Update registry order if appropriate
9. Update docs
10. Regenerate / verify sitemap
11. Run build
12. Verify routes and key surfaces
13. Provide a structured final report

---

## INTEGRATION / CLI EXPECTATIONS

Use the repo’s actual commands where appropriate:

```bash
npm run validate:payload path/to/<slug>.core.json
npm run validate:payload path/to/<slug>.extended.json -- --extended
npm run add:universe path/to/<slug>.core.json [slug]
npm run generate:sitemap
npm run build
npm run test
python scripts/patch_jikan_images.py --file path/to/<slug>.json
```

Manual integration is allowed only if you still preserve:
- validation
- proper placement in `src/data/`
- sitemap correctness
- docs/registry correctness

---

## DOCS / REGISTRY / SITEMAP EXPECTATIONS

After integration, update what is actually required.

At minimum, verify and update if needed:

- `src/data/index.js`
  - ensure slug is registered correctly
  - update `preferredOrder` if the archive currently uses it for homepage order
- `docs/BLUEPRINT.md`
- `docs/REPO_AUDIT_SUMMARY.md`
- `README.md` current universes list
- `public/sitemap.xml` (or allow the script/build to regenerate it correctly)

Do not assume docs are self-updating.

---

## VISUAL / PRODUCT VERIFICATION

After integration, verify the universe is not merely valid, but actually good.

Check at least:

- homepage card presence/quality
- featured/hero compatibility if surfaced there
- universe route
- title/header quality
- LORE / SYS toggle compatibility
- SystemSummary quality
- WhyThisRenderer quality
- AIInsightPanel quality
- Share Frame quality
- visualization area present and not blank
- no blank state / no fatal error / no 404-style state

Also verify no regressions for existing universes.

Minimum route set to check:

- `/`
- `/universe/aot`
- `/universe/jjk`
- `/universe/hxh`
- `/universe/vinlandsaga`
- `/universe/steinsgate`
- `/universe/deathnote`
- `/universe/fmab`
- `/universe/<new-slug>`

Adapt the list as the archive grows.

---

## QUALITY BAR

A strong universe implementation should feel:

- thesis-clear
- archive-native
- curated
- visually coherent with the archive
- distinct from existing universes
- understandable to casual viewers
- deeper than a generic fandom page

It should **not** feel:

- bloated
- like a plot recap
- like a lore encyclopedia
- like a wiki export
- technically valid but emotionally flat

---

## REQUIRED FINAL OUTPUT

Return a structured final report with:

1. what docs/playbooks/scripts/files you read first
2. which reference payloads you inspected
3. whether you used legacy, core, or layered mode, and why
4. files created
5. files modified
6. chosen renderer and why
7. how the research was curated into archive form
8. image workflow result
9. validation result
10. build result
11. route verification result
12. docs / sitemap / registry updates performed
13. final judgment on whether the universe is ready to merge/deploy

---

## FINAL RULE

Do not overengineer.

Ship the universe **correctly**, using the current repo standards, playbooks, image workflow, and validation process.

The goal is a strong new archive universe — not a new framework, not a new abstraction layer, and not a wiki dump.
