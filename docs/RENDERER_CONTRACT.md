# Renderer Contract

The archive uses specialized visualizers depending on the universe system structure.

## Supported Renderers

### TimelineExplorer
Used for causal systems.

Examples:
- Attack on Titan
- Steins;Gate

Requirements:
- causalEvents array
- chronological ordering
- event dependencies

### CounterTreeExplorer
Used for rule-based combat or counterplay systems.

Examples:
- Jujutsu Kaisen
- Death Note

Requirements:
- counterplay nodes
- power interactions
- escalation chains

### NodeGraphExplorer
Used for relational ecosystems.

Examples:
- Hunter x Hunter
- Code Geass

Requirements:
- characters
- relationships
- faction dynamics

### StandardCardsExplorer
Fallback renderer when no specific visualization fits.

## Entity Image Contract

All renderers are designed to handle missing images elegantly.

For any character or entity where an image asset is unavailable from allowed hosts:
- Ensure `imageUrl` is `null`.
- Add the `"_fetchFailed": true` flag to the object.

Every renderer automatically defaults to a `<ImageWithFallback />` component that will read this flag and provide a graceful UI degradation, ensuring the layout does not break with 404 image errors.

## Visualization Hint

Payloads may include:

visualizationHint

Possible values:

- timeline
- counter-tree
- node-graph
- cards