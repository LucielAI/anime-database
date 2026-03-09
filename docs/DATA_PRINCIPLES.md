# Data Principles

The archive prioritizes structural density over completeness.

## Rules

Do NOT attempt to document everything.

Instead focus on:

- systems
- structural rules
- causal events
- strategic relationships
- anomalies
- counterplay

## Character Selection

Characters must justify inclusion by supporting multiple structural relationships or system relevance.

Ideal criteria:

- 3+ meaningful edges
- strategic system relevance
- faction influence
- anomaly significance

Avoid:

- minor characters
- fan favorites with little systemic impact
- purely decorative additions

## Relationships

Edges must represent things like:

- alliances
- conflicts
- mentorship
- dependency
- ideological mirrors
- betrayal
- strategic leverage

Avoid meaningless links.

## Systems

Each universe must clearly express:

- how power works
- what rules constrain it
- how actors exploit or counter it
- what breaks the system

The goal is structural clarity, not lore completeness.

## AI Insights (Pregenerated Intelligence)

All newly added universes **MUST** include an `aiInsights` object containing pregenerated analysis of the system.

The schema requires:
```json
{
  "casual": "string",
  "deep": "string"
}
```
- **casual**: A short, intuitive, jargon-light explanation of the core system for normal anime fans.
- **deep**: A sharp, analytical, systems-focused interpretation (referencing mechanics, constraints, causality, etc.) that serves as an intelligent readout.

Do NOT generate fake ChatGPT-style dialogue. Deliver deterministic, thesis-driven archive interpretations.

## Shared Utilities

`deriveBullets(data)` is extracted into `src/utils/deriveBullets.js` and reused by SystemSummary, landing page snapshot cards, hero card, and Share Frame mode. No schema changes are required — bullets are derived from existing payload fields.

`getClassificationLabel(hint)` is extracted into `src/utils/getClassificationLabel.js` and maps visualization hints to human-readable system labels.

## Community Signals

Community feedback (votes, "needs more data" flags, suggestions) can help identify:
- weak archives that need structural improvement
- pages missing important data or relationships
- candidate universes for future expansion

This data is stored minimally via serverless endpoints and does not influence the payload schema.

## Image Policy

### Safety & Hosting Constraints
To ensure performance and security, the archive enforces an `ALLOWED_IMAGE_HOSTS` policy in `validateSchema.js`. All images must be hosted on:
- `cdn.myanimelist.net`
- `images.myanimelist.net`

### Image Fallback Contract
If an image cannot be reliably fetched or is missing from Mal, the payload must follow the fallback contract to prevent UI breakage:
- `imageUrl`: Set to `null`.
- `_fetchFailed`: Set to `true`.

The UI component `ImageWithFallback.jsx` will detect this state and render a theme-appropriate gradient with a character icon. Do NOT fabricate image URLs.
