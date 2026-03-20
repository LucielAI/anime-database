# Playbook: Homepage System-Exploration Hub

Use this when changing homepage information architecture, curation logic, or request queue behavior.

## Required Read Order

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/HOMEPAGE_SPEC.md`
4. `docs/HOMEPAGE_DATA_CONTRACT.md`

## Implementation Rules

- Do not hardcode anime-specific homepage branches.
- Update `src/config/homepageContract.js` first, then wire UI.
- Keep homepage section order aligned to `HOMEPAGE_SECTION_ORDER`.
- Featured systems must be deterministic (no randomized rotation).
- Quick-vote request candidates must exclude implemented universes.

## Files Usually Involved

- `src/App.jsx`
- `src/config/homepageContract.js`
- `src/components/CommunityPulse.jsx`
- `src/utils/discovery.js`
- `src/utils/seo.js`

## Validation Commands

```bash
npm run test
npm run build
```

If homepage metadata logic changed, also run:

```bash
npm run validate:catalog
```

## Manual QA Checklist

- [ ] Section order is Hero → Explore → Featured → Continue → Browse → Community → Footer
- [ ] Quick Insights cards render short, screenshot-friendly lines
- [ ] Compare systems entry allows selecting 2 universes and shows quick fields
- [ ] Featured shows stable top 3 across refreshes
- [ ] Quick-vote queue excludes already implemented universes
- [ ] Universe route changes always reset to top/hero state (no stale mid-scroll carryover)
- [ ] Compare systems UI is field-first and readable on mobile/desktop
- [ ] Public-facing copy stays fan-first (no internal/builder wording)
- [ ] Mobile layout has no half-card/awkward featured interaction
- [ ] Home links route correctly to `/universes` and `/universe/:slug`
- [ ] Structured data includes collection + item lists for featured and structure taxonomy

## Docs Parity

When behavior changes, update both:
- `docs/HOMEPAGE_SPEC.md`
- `docs/HOMEPAGE_DATA_CONTRACT.md`
