# Codex Quickstart (Repo-Native)

This guide helps Codex (or any agent) execute the existing archive workflow reliably without creating parallel tooling.

## 1) Read order
1. `AGENTS.md`
2. `CLAUDE.md`
3. Task playbook(s) from `playbooks/`

## 2) Preflight commands (no custom pipeline)
```bash
npm run validate:all
npm run test
```

If working on a single payload, also run:
```bash
npm run validate:payload src/data/<slug>.core.json
```

## 3) If payload fields changed
- Run image patch if character images changed:
```bash
python scripts/patch_jikan_images.py --file src/data/<slug>.core.json
```
- Re-run:
```bash
npm run validate:payload src/data/<slug>.core.json
npm run validate:all
```

## 4) Merge-gate checklist
- `npm run validate:all` has **0 errors**
- `npm run test` passes
- `npm run build` passes
- Mobile spot-check on affected tabs (especially card headings)
- Docs/playbooks updated if schema/runtime contract expectations changed

## 5) Source of truth
Do not fork workflow logic. Keep using:
- `scripts/validatePayload.js`
- `src/utils/validateSchema.js`
- playbooks in `playbooks/`

This file is a launcher/checklist only.
