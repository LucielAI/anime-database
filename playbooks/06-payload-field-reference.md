# Playbook: Payload Field Reference

Precise field-level schema reference for building valid universe payloads.

Grounded in: `src/utils/validateSchema.js` (the source of truth for validation).

---

## Required Top-Level Fields

All of the following cause **hard validation errors** if missing. No exceptions.

```
anime           string   — Display title (e.g. "Steins;Gate")
tagline         string   — One punchy sentence framing the system thesis
malId           number   — MyAnimeList ID (integer)
themeColors     object   — 9 required sub-keys (see below)
visualizationHint string — Renderer key (see valid values below)
visualizationReason string — One sentence explaining the renderer choice
powerSystem     array    — Power system entries
characters      array    — Character entries (12 required fields each)
factions        array    — Faction entries
rules           array    — Rule entries
rankings        object   — Tier/ranking structure (see below)
```

---

## themeColors (9 required sub-keys, all hard errors)

```json
{
  "themeColors": {
    "primary":      "#22d3ee",                    — Main accent color (hex or rgb)
    "secondary":    "#8b5cf6",                    — Secondary accent
    "accent":       "#f59e0b",                    — Highlight color
    "glow":         "rgba(34,211,238,0.3)",        — Glow shadow value
    "tabActive":    "#22d3ee",                    — Active tab indicator color
    "badgeBg":      "rgba(139,92,246,0.1)",        — Badge background
    "badgeText":    "#8b5cf6",                    — Badge text color
    "modeGlow":     "rgba(34,211,238,0.2)",        — SYS mode glow
    "heroGradient": "rgba(5,5,20,0.9)"            — Hero section overlay gradient
  }
}
```

All 9 keys are enforced as hard errors by `validateCorePayload`. No defaults are provided.

---

## visualizationHint — Valid Values

```
timeline          — Causal/temporal systems
node-graph        — Relational networks
counter-tree      — Combat economy / counterplay systems
affinity-matrix   — Affinity/compatibility structures
standard-cards    — Fallback when no specific renderer fits
```

Invalid hint values cause a hard error. `cards` alone is not valid — use `standard-cards`.

---

## characters — 12 Required Fields Per Entry (all hard errors)

```json
{
  "name":            "Okabe Rintarou",     — Must match source/target in relationships exactly
  "title":           "The Mad Scientist",  — Role or archetype label
  "rank":            "Lab Member 001",     — In-universe rank or classification
  "dangerLevel":     9,                    — Integer 0–10
  "loreBio":         "...",                — Narrative, human-readable biography
  "systemBio":       "...",                — System-analytical interpretation of the character
  "gradientFrom":    "slate-900",          — Tailwind color class (not hex) for card gradient start
  "gradientTo":      "cyan-800",           — Tailwind color class for card gradient end
  "accentColor":     "cyan-400",           — Tailwind color class for character accent
  "icon":            "Eye",                — Lucide icon name (e.g. Eye, Brain, Zap, Heart, Globe)
  "signatureMoment": "...",                — Most structurally important moment for this character
  "imageUrl":        null                  — MAL CDN URL or null (must have _fetchFailed: true if null)
}
```

**Note:** `gradientFrom`, `gradientTo`, `accentColor` use **Tailwind class names**, not hex values.
Common Lucide icon names: `Eye`, `Brain`, `Heart`, `Zap`, `Globe`, `Shield`, `Sword`, `Crown`, `Circle`, `Star`, `Flame`, `Lock`, `Key`, `Target`, `AlertTriangle`.

---

## The Dual-Voice Pattern (lore + system on every entity)

The entire LORE/SYS toggle in the UI depends on this. Every entity type has two description variants. Getting this wrong means half the product is blank or broken.

| Entity | Lore field | System field |
|---|---|---|
| characters | `loreBio` | `systemBio` |
| powerSystem | `loreDesc` + `loreSubtitle` | `systemDesc` + `systemSubtitle` |
| factions | `loreDesc` | `systemDesc` |
| rules | `loreSubtitle` | `systemSubtitle` |
| relationships | `loreDesc` | `systemDesc` |
| anomalies | `loreDesc` | `systemDesc` |
| causalEvents | `loreDesc` | `systemDesc` |

**Lore voice:** Narrative, human-readable, character-grounded. Written as if describing the world to a fan.

**System voice:** Analytical, mechanism-focused. Written as if the universe is an engineered system — use terms like "constraint", "node", "convergence", "protocol", "threshold".

Missing `loreSubtitle` or `systemSubtitle` on powerSystem/rules generates **warnings**.

---


## UI-Critical Collection Shapes (Prevents Blank Runtime Cards)

These fields are required by current tab components. If you rename keys (e.g. `law` instead of `name`), cards may render as blanks/placeholders even if schema validation mostly passes.

### `rules[]`
```json
{
  "name": "Rule Name",
  "subtitle": "Short label",
  "loreConsequence": "Displayed in LORE mode body",
  "systemEquivalent": "Displayed in SYS mode body",
  "severity": "low|medium|high|fatal",
  "loreSubtitle": "LORE badge line",
  "systemSubtitle": "SYS badge line"
}
```

### `counterplay[]`
```json
{
  "attacker": "Technique / side A",
  "defender": "Counter / side B",
  "mechanic": "How the interaction works",
  "loreDesc": "Expanded explanation"
}
```

### `anomalies[]`
```json
{
  "name": "Anomaly title",
  "ruleViolated": "Rule being broken",
  "loreDesc": "LORE-mode explanation",
  "systemDesc": "SYS-mode explanation"
}
```

### `causalEvents[]`
```json
{
  "name": "Event name",
  "trigger": "What started it",
  "consequence": "System impact",
  "timelinePosition": "Pre-Narrative | Mid-Narrative | Final Arc",
  "loreDesc": "LORE-mode detail",
  "systemDesc": "SYS-mode detail"
}
```

## relationships — Enum Constraint on `type` (hard error)

Valid relationship types:
```
ally      enemy      rival      mentor
betrayal  mirror     dependent  successor  counter
```

Any other value causes a hard error. `conflict`, `friend`, `opposition` are NOT valid.

Additional required fields per relationship:
```json
{
  "source": "Character Name A",   — Must exactly match a character name
  "target": "Character Name B",   — Must exactly match a character name
  "type":   "ally",               — From enum above
  "weight": 7,                    — Integer, used for edge ranking in selection
  "loreDesc":   "...",
  "systemDesc": "..."
}
```

Off-graph edges (source or target not in characters array) produce **warnings**.

---

## factions — Enum Constraint on `role` (hard error)

Valid faction roles:
```
protagonist   antagonist   neutral   chaotic   systemic
```

---

## rules — Enum Constraint on `severity` (hard error)

Valid rule severities:
```
low   medium   high   fatal
```

---

## rankings — Required Object Structure

`rankings` is required at the top level. An empty object `{}` passes validation. The expected structure (used by `PowerEngineTab`):

```json
{
  "systemName": "Power System Name",
  "loreName":   "Human Name for the Hierarchy",
  "topTierName": "Top Tier Label",
  "topTierLore": "Narrative description of the top tier.",
  "topTierSystem": "Analytical description of the top tier.",
  "tiers": [
    {
      "name": "Tier Name",
      "loreDesc": "...",
      "systemDesc": "..."
    }
  ]
}
```

For universes without a natural power ranking (e.g. historical/social systems), provide a structural hierarchy instead (faction dominance, causal priority, etc.).

---

## Presentation Fields (optional, but use correct key values)

Keys must exist in `src/config/universePresentation.js` or they silently fall back to defaults.

**`backgroundMotif`** valid keys: `jagged`, `noise`, `circles`, `paper`, `temporal`

**`revealOverlay`** valid keys: `hatch-red`, `pulse-purple`, `glow-border`, `glow-border-soft`, `gradient-top`

**`headerFlavor.sysWarningColor`** valid keys: `red`, `blue`, `green`, `amber`, `cyan`, `purple`

---

## Image Fields

- `animeImageUrl` — top-level, the anime poster. Must be from `cdn.myanimelist.net`, `images.myanimelist.net`, or `myanimelist.net`. Hard error if invalid host.
- `characters[i].imageUrl` — per character. Same host constraint. If null, must have `_fetchFailed: true` on the same character object. Hard error otherwise.

Do not fabricate URLs. Run `scripts/patch_jikan_images.py` to fill real images. See [03-image-patch.md](./03-image-patch.md).

---

## Quick Self-Check Before Validating

- [ ] `tagline` set?
- [ ] `themeColors` has all 9 keys?
- [ ] `rankings` present (even if `{}`)?
- [ ] Every character has all 12 fields?
- [ ] `gradientFrom`/`gradientTo`/`accentColor` use Tailwind class names, not hex?
- [ ] All relationship `type` values are from the valid enum?
- [ ] All faction `role` values are from the valid enum?
- [ ] All rule `severity` values are from the valid enum?
- [ ] Every character with `imageUrl: null` also has `_fetchFailed: true`?
- [ ] Both lore and system descriptions present on every entity?
- [ ] `rules[]` use `name/loreConsequence/systemEquivalent` (not custom keys)?
- [ ] `counterplay[]` use `attacker/defender/mechanic` (no placeholder text in UI)?
- [ ] `anomalies[]` use `name/ruleViolated`?
- [ ] `causalEvents[]` use `name/trigger/consequence/timelinePosition`?
- [ ] `aiInsights.casual` and `aiInsights.deep` both non-empty?
