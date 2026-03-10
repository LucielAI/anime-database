# Playbook: Image Patch

How to resolve missing or broken character/anime images using the Jikan patcher.

## Read First

- `docs/WORKFLOW_IMAGE_PATCH.md` — full context and rationale
- `docs/DATA_PRINCIPLES.md` — Image Policy section
- `scripts/README.md` — usage reference

## Pipeline Position

This is **Stage 3.5** — between payload generation (Stage 3) and validation (Stage 4).

Run image patch → then validate → then integrate.

## Inputs Required

- A payload JSON file with `malId` set (e.g. `src/data/{slug}.json` or a staging file)
- Python 3 with `requests` installed

## What the Script Does

`scripts/patch_jikan_images.py` calls two Jikan v4 endpoints:

1. `/anime/{malId}` — fetches the official anime poster → patches `animeImageUrl`
2. `/anime/{malId}/characters` — fetches the official cast list → matches by name → patches `imageUrl` and `malId` per character

Name matching uses set intersection (handles `LastName, FirstName` vs `FirstName LastName` formatting). It removes `_fetchFailed` flags when a valid image is found.

---

## Usage

```bash
python scripts/patch_jikan_images.py --file path/to/payload.json
```

The script reads from and writes to the same file in place.

**Examples:**
```bash
python scripts/patch_jikan_images.py --file src/data/deathnote.json
python scripts/patch_jikan_images.py --file staging/codegeass.core.json
```

---

## Reading the Output

```
// ARCHIVE INITIATED: Patching Jikan images for src/data/deathnote.json
// Fetching official anime info for Death Note (ID: 1535)
// Success: Patched primary anime image: https://cdn.myanimelist.net/...
// Fetching official cast list for Death Note (ID: 1535)
// Success: Retrieved 48 cast members.
  [+] Match found for 'Light Yagami' -> 'Yagami, Light': ID 816
  [+] Match found for 'L' -> 'Lawliet, L': ID 85
  [-] No match found for 'Watari'. Left intact.
// Patched 14 out of 16 characters.
// PATCH COMPLETE. Payload saved.
```

- `[+]` — character matched and patched
- `[-]` — no match found, left intact (this is expected for some characters)

---

## After the Patch

Validate immediately:
```bash
npm run validate:payload path/to/payload.json
```

The validator checks that all `imageUrl` values are from the allowed host list (`cdn.myanimelist.net`, `images.myanimelist.net`, `myanimelist.net`).

---

## Done When

- [ ] `animeImageUrl` is a real `cdn.myanimelist.net` URL (not null)
- [ ] Matched characters have `imageUrl` from MAL and no `_fetchFailed` flag
- [ ] Unmatched characters have `imageUrl: null` and `_fetchFailed: true`
- [ ] `npm run validate:payload` passes with no image host errors

## Common Mistakes

**Running the patcher without `malId` set.** The script will exit with an error. Set the correct MAL ID in the payload before running.

**Fabricating image URLs to fill gaps.** Do not do this. Unmatched characters should have `imageUrl: null, _fetchFailed: true`. The `ImageWithFallback.jsx` component renders a premium gradient fallback — this is correct behavior.

**Panicking at `[-]` lines.** Some characters won't match due to name differences or missing MAL entries. This is normal. Leave them as `null`.

**Running after integration.** Run the patcher on the staging file before running `add:universe`, not on `src/data/` after. (Running on `src/data/` post-integration also works, but patch before validate.)

**Not having `requests` installed.** Run `pip install requests` if the script errors on import.
