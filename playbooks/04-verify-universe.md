# Playbook: Verify a Universe

How to QA a universe payload before or after integration.

## Read First

- `docs/RENDERER_CONTRACT.md` — structural profiles and pass criteria
- `docs/DATA_PRINCIPLES.md` — image policy, aiInsights requirements
- `scripts/README.md` — validate:payload CLI usage

## Inputs Required

- Path to a core payload (`{slug}.json` or `{slug}.core.json`)
- Optionally, path to an extended dataset (`{slug}.extended.json`)

---

## Step 1 — Run the Validator

**Core payload:**
```bash
npm run validate:payload path/to/{slug}.core.json
```

**Archive-wide integrated payload audit (recommended before PR):**
```bash
npm run validate:all
```

**Extended dataset:**
```bash
npm run validate:payload path/to/{slug}.extended.json --extended
```

---

## Reading Validator Output

The validator (`src/utils/validateSchema.js`) runs two functions:

- `validateCorePayload` — strict renderer-safe validation
- `validateExtendedDataset` — lighter structural validation

**Result states:**

| Output | Meaning | Action |
|---|---|---|
| `CLEAN PASS` | No errors, no warnings | Ready for integration |
| `PASSED WITH WARNINGS` | Errors: 0, Warnings: N | Review warnings; proceed if acceptable |
| `FAILED` | One or more hard errors | Fix errors before proceeding |

**Hard errors block integration.** `add:universe` will abort on validation failure.

---

## Step 2 — Review Warnings

Warnings are not blockers but indicate structural thinness or missing recommended fields.

Common warnings:
- Renderer structural profile mismatch (e.g., too few `counterplay` entries for `counter-tree`)
- Missing fields that can reduce content quality even if schema passes
- Array lengths outside the soft target range for the chosen renderer

Check the structural profile table in `docs/RENDERER_CONTRACT.md` for per-renderer targets.

---

## Step 3 — Manual QA Checklist

After the validator passes, do a quick manual review:

**Schema integrity:**
- [ ] `visualizationHint` matches the intended renderer (`timeline`, `node-graph`, `counter-tree`, `affinity-matrix`, `standard-cards`)
- [ ] `visualizationReason` is present and explains the renderer choice (not a plot summary)
- [ ] `aiInsights.casual` and `aiInsights.deep` are present and non-empty
- [ ] `headerFlavor`, `backgroundMotif`, `revealOverlay` keys are valid if set

**Image policy:**
- [ ] All `imageUrl` values are either from `cdn.myanimelist.net` / `images.myanimelist.net` or are `null`
- [ ] Any character with `imageUrl: null` also has `_fetchFailed: true`
- [ ] No fabricated or non-MAL image URLs exist
- [ ] No duplicate `characters[].imageUrl` or duplicate `characters[].malId` values for different names (unless intentionally documented)
- [ ] For ambiguous one-token names (e.g. Doma/Douma), manually verify MAL character page/API mapping
- [ ] `animeImageUrl` is set (not null) unless unavailable from MAL

**Data quality:**

**Discoverability checks:**
- [ ] Universe route resolves at `/universe/{slug}` and redirects any casing variants to canonical lowercase
- [ ] Universe has unique title + meta description via SEO utilities
- [ ] Universe has canonical URL and OG/Twitter image metadata
- [ ] `npm run validate:indexing` passes after sitemap regeneration
- [ ] Characters justify inclusion (3+ relationships or clear system relevance)
- [ ] **Core Laws tab renders real content**: rule heading/body are not blank (`name`, `loreConsequence`, `systemEquivalent` present)
- [ ] **Combat Matchups render real labels**: no `[ATTACK]`/`[COUNTER]` placeholders (`attacker`, `defender`, `mechanic` present)
- [ ] **Rule Breakers anomalies render titles**: anomaly cards show `name` + `ruleViolated`
- [ ] **Causal matrix rows render all columns**: each event has `name`, `trigger`, `consequence`, `timelinePosition`
- [ ] **Mobile typography sanity** (≈390–430px width): primary card headings (Power Engine/Factions/Core Laws) are readable and not forced into `...` truncation
- [ ] **Homepage featured rail sanity** (≈390–430px width): featured cards horizontal snap/slide works, hero image foreground remains legible over background glow, and no cropped artifacting appears
- [ ] Relationships represent meaningful structural edges (alliances, conflicts, dependencies) — not filler
- [ ] `causalEvents` have ordering logic (required for `timeline` renderer)
- [ ] `counterplay` entries exist and form a combat economy (required for `counter-tree`)

**Presentation fields:**
- [ ] `sysWarningColor` key exists in `src/config/universePresentation.js` → `SYS_WARNING_COLORS`
- [ ] `backgroundMotif` key exists in `src/config/universePresentation.js` → `BACKGROUND_MOTIFS`
- [ ] `revealOverlay` key exists in `src/config/universePresentation.js` → `REVEAL_OVERLAYS`

---

## Done When

- [ ] `npm run validate:payload` returns `CLEAN PASS` or `PASSED WITH WARNINGS`
- [ ] No hard errors in validator output
- [ ] Manual checklist complete — no fabricated URLs, all required fields present

## Common Mistakes

**Stopping at the validator output without reviewing warnings.** A `PASSED WITH WARNINGS` result still needs review — renderer profile gaps can cause thin visualizations at runtime.

**Not checking presentation config keys.** Invalid `backgroundMotif` or `revealOverlay` keys silently fall back to defaults. Use valid keys from `src/config/universePresentation.js`.

**Mistaking extended validation for core validation.** Extended validation is lighter and will pass things that core validation rejects. Always validate the core payload with the default command (no `--extended` flag) before integration.

**Treating validator output as the only QA.** The validator checks schema shape and structural profiles, not content quality. Manual review of `aiInsights.deep` content and relationship meaningfulness is still needed.

## Tone & Language checks

- [ ] Archive copy sounds natural for anime fans and avoids internal ranking, recommendation, or growth-system language.
- [ ] UI labels read like a curated anime archive (e.g., "Related Universes", "Where to Go Next"), not a recommendation engine.

## Discoverability / Answerability checks

- [ ] `systemQuestions` exists with 4-8 entries.
- [ ] Q&A entries are visible on-page (not hidden metadata).
- [ ] Questions are universe-specific and mechanism-focused.
- [ ] Answers are concise, accurate, and linked to relevant tabs/sections.
- [ ] No FAQ spam, no repetitive filler, no keyword stuffing.
- [ ] Graph/image-adjacent text and alt labels are descriptive and useful.


## Related universe checks

Before merge, verify the new universe is surfaced naturally in archive navigation:
- Appears in at least one `/universes?cluster=...` route.
- Shows up as a related suggestion on at least one other universe page.
- Bottom-of-page related universe cards render with crawlable links (`/universe/:slug`).
