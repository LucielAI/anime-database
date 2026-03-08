# Data Principles

The archive prioritizes structural density over completeness.

## Rules

Do NOT attempt to document everything.

Instead focus on:
- systems
- structural rules
- causal events
- strategic relationships

## Character Selection

Characters must justify their inclusion by supporting multiple structural relationships.

Ideal criteria:

- 3+ meaningful edges
- strategic system relevance
- faction influence

Avoid:

- minor characters
- fan favorites with little systemic impact

## Relationships

Edges must represent:

- alliances
- conflicts
- mentorship
- dependency
- ideological mirrors

Avoid meaningless links.

## Systems

Each universe must clearly express:

- how actors exploit or counter it

The goal is structural clarity, not lore completeness.

## Images and Graceful Fallbacks

The archive relies on fetching image data from official CDNs (e.g., `cdn.myanimelist.net`).
Under NO circumstances should an agent hallucinate or fabricate a fake image URL. 

If a legitimate, high-quality image URL cannot be found for a character:
1. Set their `imageUrl` strictly to `null`.
2. Explicitly flag the entity with `"_fetchFailed": true`.

The AI models and ingestion validators are programmed to enforce this contract. When the UI code encounters this combination, it will seamlessly fall back to a high-quality, theme-colored CSS gradient and SVG icon to preserve the structural aesthetic.