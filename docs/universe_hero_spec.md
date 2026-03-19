# Universe Hero Spec (Shared Template Contract)

Defines the required data → UI mapping for the first viewport on every universe page.

This is the canonical agent-facing contract for above-the-fold hero generation.

---

## Required Hero Contract Fields

Add a top-level `hero` object to each core payload:

```json
"hero": {
  "systemType": "counterplay|relational|timeline|affinity|general|hybrid|causal",
  "microHook": "One intrigue line for system readers.",
  "thesis": "Short system thesis (1-2 lines).",
  "primarySystemType": "power_engine|entity_db|factions|core_laws"
}
```

### Field Definitions

- `systemType`: Human-readable system lens label shown in hero eyebrow.
- `microHook`: Short, intrigue-first line placed above thesis.
- `thesis`: The compressed core claim for this universe’s mechanics.
- `primarySystemType`: Maps primary CTA destination tab.

---

## Data → Hero UI Mapping

- **Title** → `anime`
- **System line** → `hero.systemType` (fallback: derive from `visualizationHint`)
- **Micro-hook** → `hero.microHook` (fallback: hint-based default)
- **Thesis** → `hero.thesis` (fallback: shortened `visualizationReason`/`tagline`)
- **Proof strip**:
  - mechanics count → `powerSystem.length`
  - links count → `relationships.length`
  - laws count → `rules.length`
- **Primary CTA target** → `hero.primarySystemType`
  - `power_engine` → tab `POWER ENGINE`
  - `entity_db` → tab `ENTITY DATABASE`
  - `factions` → tab `FACTIONS`
  - `core_laws` → tab `CORE LAWS`

---

## Constraints (Enforced as Validation Warnings + Runtime Fallback)

- `hero.microHook`: target `<=95` characters.
- `hero.thesis`: target `<=140` characters.
- Primary CTA label is standardized to **Open System**.
- Hero should expose one decisive primary CTA only.

---

## Visual Hierarchy Rules

1. Eyebrow/status line
2. Dominant readable title
3. Micro-hook
4. Thesis (short)
5. Proof strip
6. Primary CTA

Everything else belongs below the fold.

---

## DO / DO NOT

### DO
- Keep hero text concise and system-specific.
- Preserve archive identity (dark, technical, premium).
- Keep CTA path deterministic for agent-generated payloads.

### DO NOT
- Add extra hero cards/panels.
- Use long plot summary as thesis.
- Add multiple competing primary actions.
- Hide the title as low-opacity decorative text.
