# Master Universe Build Prompt (Canonical, One-Pass)

Use this artifact when you want an agent to add or repair a universe end-to-end with minimal steering.

## Intent

Produce a production-ready universe payload from **already uploaded** research in `research/`, using repo-native playbooks/scripts, and finish with validation, integration, docs sync, and verification.

## Mandatory read order

1. `AGENTS.md`
2. `CLAUDE.md`
3. `playbooks/01-add-universe.md`
4. `playbooks/04-verify-universe.md`
5. `playbooks/06-payload-field-reference.md`
6. `docs/RENDERER_CONTRACT.md`
7. `scripts/README.md`

Before writing the new payload, inspect at least:
- one legacy payload: `src/data/aot.json`
- one core payload: `src/data/fmab.core.json`

## Copy/paste prompt

You are working in Anime Architecture Archive.

Task: add universe `{slug}` using pre-supplied research in `research/`.

Hard requirements:
- Follow playbooks and scripts only (no parallel workflow).
- Build `src/data/{slug}.core.json` (preferred; legacy `.json` only if explicitly needed).
- Choose renderer by system thesis, not entity count.
- Preserve dual LORE/SYS voice across all major entities.
- Never fabricate image URLs; run image patch flow.

UI/runtime-critical shape requirements (must use canonical keys):
- `rules[]`: `name`, `loreConsequence`, `systemEquivalent`, `severity`, `loreSubtitle`, `systemSubtitle`
- `counterplay[]`: `attacker`, `defender`, `mechanic`, plus at least one of `loreDesc` or `systemDesc`
- `anomalies[]`: `name`, `ruleViolated`, `loreDesc`, `systemDesc`
- `causalEvents[]`: `name`, `trigger`, `consequence`, `timelinePosition`, `loreDesc`, `systemDesc`

Laws/rules quality requirements:
- Rules must be explicit constraints, not generic trivia.
- `systemEquivalent` must explain mechanism-level impact.
- `severity` must be meaningful and enum-valid (`low|medium|high|fatal`).

Execution checklist:
1. Patch images first:
   - `python scripts/patch_jikan_images.py --file src/data/{slug}.core.json`
2. Validate payload + archive:
   - `npm run validate:payload src/data/{slug}.core.json`
   - `npm run validate:all`
3. Run safety gates:
   - `npm run test`
   - `npm run build`
4. Integrate/sync:
   - update `src/data/index.js` preferred order if new slug
   - update universe lists in `README.md`, `docs/BLUEPRINT.md`, `docs/REPO_AUDIT_SUMMARY.md`
5. Verify routes:
   - `/`
   - `/universe/aot`
   - `/universe/jjk`
   - `/universe/hxh`
   - `/universe/vinlandsaga`
   - `/universe/steinsgate`
   - `/universe/deathnote`
   - `/universe/fmab`
   - `/universe/{slug}`
6. Commit and open PR.

Deliverable format:
- Files created/modified
- Renderer chosen + reason
- Curation summary
- Validation/test/build results
- Route verification summary

## Notes

- Research generation is external by default; implementation agents should transform/integrate/verify.
- `src/utils/validateSchema.js` is the final schema authority.
