# Homepage Spec — System Exploration Hub

This document defines the canonical homepage behavior for Anime Architecture Archive.

## Section Order (Required)

Homepage sections must render in this exact order:

1. Hero
2. Explore by System Structure
3. Top Featured Systems
4. Quick Insights
5. Continue / Recommended Next Paths
6. Browse Universes
7. Community Pulse / Request Queue
8. Footer / Support / Follow

Source of truth: `src/config/homepageContract.js` (`HOMEPAGE_SECTION_ORDER`).

## Product Thesis on Home

The homepage is the archive's guided entry layer.
It should prioritize **system exploration** over title-first browsing.

Required outcomes:
- users can enter from structure taxonomy,
- users can follow deterministic featured curation,
- users can continue from last viewed context,
- users can browse full catalog without loading universe payloads.

## Featured Systems Contract

Top featured systems are deterministic and stable:

- Display exactly top 3 (or fewer if catalog has fewer).
- Ranking source:
  1) `DISCOVERY_METADATA[slug].featuredRank` ascending
  2) `popularityBaseline` descending
  3) `preferredOrder` index in `src/data/catalog.js`
  4) `anime` alphabetical
- No daily/random rotation on homepage featured cards.

Implementation sources:
- `src/utils/discovery.js`
- `src/config/homepageContract.js`
- `src/data/discoveryMetadata.js`

## Explore by System Structure Contract

The top exploration section is taxonomy-driven and must not contain anime-specific hardcoded branches.

Taxonomy source of truth:
- `src/config/homepageContract.js` (`SYSTEM_STRUCTURE_TAXONOMY`)

Required taxonomy labels:
- Relational Systems
- Counterplay Systems
- Timeline Systems
- Control Systems
- Closed-Loop Systems
- Power Economy Systems

Counts are derived from live catalog + discovery metadata (classification/clusterTags/systemProfile).

## Continue / Next Paths Contract

The continuation section must expose:

- Continue path: last viewed universe (from local storage)
- Next comparisons: related universes + relation reason
- Editor picks: deterministic fallback picks from featured set
- Compare entry: lightweight 2-title compare surface for power type, combat style, complexity, and strategy-vs-power

Data sources:
- `incrementUniverseLocalView()` writes last viewed id
- `getHomepageContinuation()` resolves continue + next comparisons

## Request Queue Contract

Homepage quick-vote candidates must be derived using set subtraction:

`requestable pool - implemented universes`

Requirements:
- never include already implemented universes,
- no duplicates,
- exclude archived candidates (`isArchived: true`),
- deterministic priority ordering (no random shuffle).

Source of truth:
- `src/config/homepageContract.js` (`REQUESTABLE_UNIVERSE_POOL`, `getHomepageRequestCandidates`)

## SEO / Indexing Expectations

Homepage should include:

- semantic heading hierarchy (`h1` then section `h2`s),
- explicit internal links to `/universes` and `/universe/:slug`,
- structured data for website + collection + featured item list + structure item list,
- plain-language explanatory copy for retrieval systems.
- screenshot-friendly quick insight blocks with short factual lines.

## Navigation Consistency Contract

- Route changes must reset viewport to top-level landing context.
- Opening `/universe/:slug` should always land at the universe top/hero state.
- Swapping universe routes (homepage cards, compare links, related links, catalog links) must not preserve stale mid-page scroll.
- Universe route loading state should reset between slug transitions to prevent carrying old-page context.

Primary implementation:
- `RouteScrollReset` in `src/App.jsx`
- `UniverseRoute` top reset and loading reset behavior in `src/App.jsx`

## Copy Tone Guardrail

- Public-facing homepage copy must stay fan-first and non-technical.
- Avoid internal-builder language (e.g., “machine-readable”, “routing structures”, “system intelligence index”).
- Keep helper copy concise and action-oriented.

Primary implementation:
- `src/App.jsx`
- `src/utils/seo.js`

## DO / DO NOT for Future Agents

DO:
- update `homepageContract` first when changing homepage logic,
- keep featured and request rules deterministic,
- keep section order aligned with this spec,
- update this doc + `docs/HOMEPAGE_DATA_CONTRACT.md` when behavior changes.

DO NOT:
- add random featured rotation,
- hardcode implemented universes into quick-vote list,
- add anime-specific runtime UI conditionals,
- drift section order without docs update.
