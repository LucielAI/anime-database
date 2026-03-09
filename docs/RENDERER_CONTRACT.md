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
- chronological or attractor-field ordering
- event dependencies
- renderer-worthy causality

### CounterTreeExplorer
Used for rule-based combat or counterplay systems.

Examples:
- Jujutsu Kaisen
- Death Note

Requirements:
- counterplay nodes
- power interactions
- escalation chains
- system-vs-anti-system dynamics

### NodeGraphExplorer
Used for relational ecosystems.

Examples:
- Hunter x Hunter
- Vinland Saga
- Code Geass

Requirements:
- characters
- relationships
- faction dynamics
- strong strategic or ideological network value

### StandardCardsExplorer
Fallback renderer when no specific visualization fits or when a specialized renderer fails safely. Use this for archives that lack a strong system thesis or causal/relational/combat density.

## Selection Logic
Renderer choice is **NOT** based on data volume, but on the **System Thesis**.
- If the system is defined by how A leads to B (Causality) → **TimelineExplorer**.
- If the system is defined by who knows/allies with whom (Relations) → **NodeGraphExplorer**.
- If the system is defined by how X beats Y (Combat Economy) → **CounterTreeExplorer**.

## visualizationReason
Every payload **MUST** include a `visualizationReason` field.
- **Purpose**: Explains to the user why this specific renderer was chosen as the most accurate lens for the universe.
- **Placement**: Displayed in the `WhyThisRenderer` component.

## Structural Profiles
The `validateSchema.js` utility enforces "Structural Profiles" to ensure each renderer has the necessary data density to function effectively.

| Component | Timeline | Node Graph | Counter Tree | Affinity |
|---|---|---|---|---|
| characters | 4-12 | 5-12 | 4-12 | 4-12 |
| relationships | 6-20 | 8-25 | 6-20 | 4-20 |
| causalEvents | 4-10 | 2-8 | 2-8 | 1-8 |
| counterplay | 2-8 | 2-8 | 5-12 | 1-8 |
| anomalies | 2-8 | 2-8 | 2-8 | 1-8 |
| factions | 3-8 | 3-8 | 3-8 | 2-8 |
| powerSystem | 3-6 | 3-6 | 3-6 | 3-6 |
| rules | 2-6 | 2-6 | 2-6 | 2-6 |

## visualizationHint
Payloads may include:

- timeline
- counter-tree
- node-graph
- cards

## Image Handling Contract
If a character image cannot be reliably fetched:
- imageUrl may be null
- _fetchFailed: true must be set

Future agents must not fabricate image URLs to satisfy schema shape.
