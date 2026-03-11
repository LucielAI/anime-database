# Prompt Templates (Agent-Native, Repo-Native)

Reusable prompt snippets for fast starts.
All templates defer to shared playbooks/scripts (no duplicate pipeline).

Research is externally supplied by default (separate research agent + manual upload), unless explicitly requested otherwise.

---

## Template: `add-universe`

Use prompt template `add-universe` for anime `{slug}` using **already-uploaded** research in `research/`.

Expanded meaning:
- Follow `docs/MASTER_RESEARCH_PROMPT.md` exactly.
- Read `AGENTS.md`, `CLAUDE.md`, and playbooks `01`→`06` first.
- Implement `src/data/{slug}.core.json` from research.
- Run image patch, payload validation, archive-wide audit, tests, and build.
- Sync docs/order if new universe is added.
- Route smoke-check existing universes + new route.
- Commit and create PR.

---

## Template: `repair-universe`

Use prompt template `repair-universe` for `{slug}`.

Expanded meaning:
- Read `AGENTS.md`, `CLAUDE.md`, `playbooks/04-verify-universe.md`, `playbooks/06-payload-field-reference.md`.
- Audit runtime-shape fields (`rules`, `counterplay`, `anomalies`, `causalEvents`, `factions`, `powerSystem`).
- Patch payload and/or UI only where needed.
- Run:
  - `npm run validate:payload src/data/{slug}.core.json` (or `.json`)
  - `npm run validate:all`
  - `npm run test`
  - `npm run build`
- Perform route and visual verification.
- Commit and create PR.

---

## Template: `hardening-pass`

Use prompt template `hardening-pass`.

Expanded meaning:
- Run archive-wide payload audit and patch real regressions.
- Tighten validator only for real runtime risks (low-noise checks).
- Update only the docs/playbook sections required to prevent recurrence.
- Keep workflows agent-neutral; no duplicate Codex-only business logic.
- Validate with `validate:all`, `test`, and `build`.

---

## Suggested super-short command style

- "Use prompt template `add-universe`, anime `{slug}`."
- "Use prompt template `repair-universe`, slug `{slug}`."
- "Use prompt template `hardening-pass`."
