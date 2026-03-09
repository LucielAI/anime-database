# Research Guide

Research should focus on extracting system mechanics rather than plot summaries.

## What to Identify

1. Structural thesis
2. Power systems or equivalent social/system mechanics
3. System rules
4. Factions
5. Counterplay logic
6. Causal events
7. Structural anomalies
8. Key relationships
9. Strategic character hubs

## What to Avoid

Avoid:
- episode summaries
- character trivia
- fan speculation
- minor worldbuilding details
- filler facts that do not strengthen a renderer

## Goal

Produce research that can later be translated into a structured payload for the archive system.

## Output Shape Recommendation

Research agents should return sections that map directly to the `validateSchema.js` requirements:

- **System Thesis**: The overarching "big idea" that determines the visualization strategy.
- **visualizationReason**: A one-sentence justification for the chosen renderer.
- **aiInsights**:
  - `casual`: High-level fan-friendly summary.
  - `deep`: Analytical system readout.
- **Core Characters**: With threat levels and signature moments.
- **Rules**: Immutable laws of the universe.
- **Factions**: Influential groups and their roles.
- **Counterplay**: Combat logic and exploit vectors.
- **Causal Events**: Key triggers for system change (required for Timeline).
- **Anomalies**: Elements that break or bypass the standard rules.
- **Key Relationships**: Edges for the relational web.

This makes payload generation dramatically easier and more reliable.
