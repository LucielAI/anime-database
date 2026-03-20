# Homepage Data Contract

This file documents the reusable data/control contract for homepage behavior.

## Contract Module

`src/config/homepageContract.js`

## Exports

### `HOMEPAGE_SECTION_ORDER`
Ordered section key array used as documentation anchor for homepage IA.

### `getSystemStructureGroups(catalog, limit)`
Returns derived structure taxonomy cards:
- `key`
- `label`
- `description`
- `count`
- `leadUniverseId`

Driven by catalog preview + discovery metadata (classification + cluster tags + power structure).

### `getHomepageFeaturedUniverses(catalog, count)`
Returns deterministic top featured universes from `featuredRank` ordering.

### `getHomepageContinuation(catalog)`
Returns:
- `continueEntry` (last viewed universe or `null`)
- `nextComparisons[]` (related universes + reason)
- `editorPicks[]` (stable featured fallbacks)

### `getHomepageClusterLinks(catalog, limit)`
Returns cluster shortcuts (`/universes?cluster=*`) with counts.

### `getHomepageBrowsePreview(catalog, sortMode, size)`
Returns sorted browse preview slice for homepage grid.

### `getHomepageQuickInsights(catalog, count)`
Returns short, screenshot-friendly insight lines for featured/popular universes.

### `buildUniverseComparison(left, right)`
Builds lightweight two-title comparison fields:
- power system type
- combat style
- complexity
- strategy vs raw power

UI expectation:
- render field-first rows (label + left/right values) for scannable side-by-side reading on mobile and desktop.

### `getHomepageHighlightLeaders(catalog)`
Returns IDs for engagement highlights (`mostComplexId`, `mostStrategicId`).

### `REQUESTABLE_UNIVERSE_POOL`
Deterministic quick-vote candidate source. Optional `isArchived` support.

### `getHomepageRequestCandidates(catalog, count)`
Applies request queue filtering:
1) Remove implemented universes
2) Remove archived candidates
3) Sort by priority desc + title asc
4) Return unique top N

## Upstream Dependencies

- `src/data/catalog.js` (implemented universe catalog + preferred order)
- `src/data/discoveryMetadata.js` (featuredRank, classification, cluster tags)
- `src/utils/discovery.js` (sorting + related recommendation + last-view state)

## Downstream Consumers

- `src/App.jsx` homepage sections
- `src/components/CommunityPulse.jsx` quick-vote UI
- `src/utils/seo.js` homepage structured data lists

## Navigation + Scroll Safety

- Homepage/universe route transitions should reset scroll to top on pathname change.
- Universe route swaps should reset loading/data state before resolving next payload.

## Change Management Checklist

When editing homepage contract logic:

1. Update this file.
2. Update `docs/HOMEPAGE_SPEC.md` if behavior/ordering changes.
3. Run:
   - `npm run test`
   - `npm run build`
4. Verify quick-vote excludes implemented universes.
5. Verify featured cards are deterministic across refreshes.
