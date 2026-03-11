# Codex Quickstart (Repo-Native)

This guide helps Codex (or any agent) execute the existing archive workflow reliably without creating parallel tooling.

## 1) Read order
1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/MASTER_RESEARCH_PROMPT.md` (one-pass direction)
4. `docs/PROMPT_TEMPLATES.md` (short trigger aliases)
5. Task playbook(s) from `playbooks/`

## 2) Scope note
By default, research is expected to be already present in `research/` (provided externally).
Use Codex for implementation + integration + verification.

## 3) Preflight commands (no custom pipeline)
```bash
npm run validate:all
npm run test
```

If working on a single payload, also run:
```bash
npm run validate:payload src/data/<slug>.core.json
```

## 4) If payload fields changed
- Run image patch if character images changed:
```bash
python scripts/patch_jikan_images.py --file src/data/<slug>.core.json
```
- Re-run:
```bash
npm run validate:payload src/data/<slug>.core.json
npm run validate:all
```

## 5) Merge-gate checklist
- `npm run validate:all` has **0 errors**
- `npm run test` passes
- `npm run build` passes
- Mobile spot-check on affected tabs (especially card headings)
- Docs/playbooks updated if schema/runtime contract expectations changed

## 6) Source of truth
Do not fork workflow logic. Keep using:
- `scripts/validatePayload.js`
- `src/utils/validateSchema.js`
- playbooks in `playbooks/`

This file is a launcher/checklist only.
