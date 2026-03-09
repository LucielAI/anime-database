# Research Inputs

Raw or normalized research files for future archive universes live here.

These are **NOT** final archive payloads. They are pre-implementation inputs — character lists, power system breakdowns, faction notes, causal event outlines, and structural observations gathered during research.

## Naming Convention

```
{slug}_research.txt
```

Examples:
- `steinsgate_research.txt`
- `deathnote_research.txt`
- `codegeass_research.txt`
- `fmab_research.txt`

Use the same slug you intend for the archive route (e.g., `/universe/steinsgate`).

## Workflow

1. Add research file to `research/`
2. Read `docs/` (especially `DATA_PRINCIPLES.md`, `RESEARCH_GUIDE.md`, `UNIVERSE_PIPELINE.md`)
3. Transform research into archive-ready payload(s) using `src/generation/` or manually
4. Validate with `npm run validate:payload`
5. Add universe with `npm run add:universe`
6. Deploy
