# Universe Ingestion Pipeline

The archive includes a structured pipeline for adding new universes.

## Actual Workflow

### Stage 1 — Research
Input:
- anime name
- MASTER_RESEARCH_PROMPT.md
- optionally RESEARCH_GUIDE.md

Output:
- structured research file

### Stage 2 — Payload Generation
Input:
- full docs zip
- research file

Output:
- archive-compatible JSON payload

### Stage 3 — Validation
Run:
```bash
npm run validate:payload path/to/payload.json
```
This step ensures the payload meets all structural and security requirements before integration.

### Stage 4 — Integration
Run:
```bash
npm run add:universe path/to/payload.json
```

### Stage 5 — Registry Update & Deployment
The `add:universe` script automatically registers the new universe in `src/data/index.js`. Once committed and pushed:
1. **GitHub PR**: Review the generated JSON and registration.
2. **Vercel Deployment**: `git push` triggers an automatic build and live deployment.

## What the validation script enforces
`src/utils/validateSchema.js` is the source of truth for payload integrity. It enforces:
- **Required Fields**: Baseline data needed for every universe.
- **Image Security**: Host allowlist (`cdn.myanimelist.net`, `images.myanimelist.net`).
- **Structural Density**: Renderer-specific "Profiles" that flag if an archive is too thin or bloated for its chosen visualization.
- **Enum Integrity**: Validates relationship types, faction roles, and rule severities.
- **AI Schema**: Ensures `aiInsights` (casual + deep) is present and correctly formatted.

## Important Distinction
Do NOT confuse research with payload generation.

Research should be broad and system-aware.
Payload generation should be schema-aware and renderer-aware.
