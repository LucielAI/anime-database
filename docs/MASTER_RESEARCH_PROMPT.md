# Universe Master Prompt (One-Pass Agent Direction)

Use this as the **single source prompt** when you want an agent to add a new universe from research in one pass.

> Canonical artifact: `docs/MASTER_UNIVERSE_BUILD_PROMPT.md`. Keep both docs aligned.

---

## Copy/Paste Prompt (Full)

You are working in Anime Architecture Archive.

Task: Add universe `{slug}` using **pre-supplied research** already uploaded in `research/` (typically `research/{slug}_research.txt` or closest matching file).

Important: treat research generation as external. Do not spend this task producing new research unless explicitly asked.

Non-negotiable workflow:
1. Read `AGENTS.md`, `CLAUDE.md`, and playbooks `01`→`06` before editing.
2. Build a **core payload** at `src/data/{slug}.core.json` (optional extended layer only if truly useful).
3. Follow schema and UI contract from:
   - `src/utils/validateSchema.js`
   - `playbooks/06-payload-field-reference.md`
4. Choose renderer by system thesis (`docs/RENDERER_CONTRACT.md`), not entity count.
5. Run image workflow (no fabricated URLs):
   - `python scripts/patch_jikan_images.py --file src/data/{slug}.core.json`
6. Run validation and QA commands:
   - `npm run validate:payload src/data/{slug}.core.json`
   - `npm run validate:all`
   - `npm run test`
   - `npm run build`
7. Integrate docs/sorting if adding a new universe:
   - `README.md`
   - `docs/BLUEPRINT.md`
   - `docs/REPO_AUDIT_SUMMARY.md`
   - `src/data/index.js` (`preferredOrder`)
8. Route smoke-check:
   - `/`
   - `/universe/aot`
   - `/universe/jjk`
   - `/universe/hxh`
   - `/universe/vinlandsaga`
   - `/universe/steinsgate`
   - `/universe/deathnote`
   - `/universe/fmab`
   - `/universe/{slug}`

Content quality constraints:
- Not a wiki dump. Focus on structural thesis, rules, incentives, causal machinery, and counterplay.
- Preserve dual LORE/SYS voice fields across all entities.
- Fill UI-critical keys exactly (avoid custom key drift):
  - `rules[]`: `name`, `loreConsequence`, `systemEquivalent`, `severity`, `loreSubtitle`, `systemSubtitle`
  - `counterplay[]`: `attacker`, `defender`, `mechanic`, `loreDesc`
  - `anomalies[]`: `name`, `ruleViolated`, `loreDesc`, `systemDesc`
  - `causalEvents[]`: `name`, `trigger`, `consequence`, `timelinePosition`, `loreDesc`, `systemDesc`

Final output requirements:
- Summarize files created/modified.
- Report renderer choice + why.
- Report curation choices from research.
- Report validation/test/build/route results.
- Include screenshots for visual changes.
- Commit changes and open PR.

---

## Short Trigger Prompt (Minimal)

Use this when you want the same behavior with less typing:

> Read `docs/MASTER_RESEARCH_PROMPT.md` and execute one-pass universe add for `{slug}` from `research/`, following playbooks `01`→`06`, image patch, `validate:payload`, `validate:all`, `test`, `build`, docs sync, route smoke checks, commit, PR.

---

## Why this exists

This prompt is intentionally aligned to existing repo scripts/playbooks.
It is a launcher, not a parallel workflow.


## Research ownership model

By default, this repo assumes research files are provided by a separate research agent and manually uploaded. Implementation agents should focus on transformation/integration/verification, not re-research.
