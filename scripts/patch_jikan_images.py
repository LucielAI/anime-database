import argparse
import json
import os
import re
import time

import requests


def normalize_name(name):
    """Normalize names for deterministic matching.

    - lowercase
    - strip punctuation
    - collapse spaces
    """
    clean = re.sub(r"[^a-z0-9\s]", " ", (name or "").lower())
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def tokenize(name):
    return set(normalize_name(name).split())


def choose_best_match(char_name, cast_list):
    """Select the highest-confidence cast match for a payload character name."""
    normalized = normalize_name(char_name)
    tokens = tokenize(char_name)

    # 1) Exact normalized name match first.
    exact = [c for c in cast_list if c["normalized_name"] == normalized]
    if len(exact) == 1:
        return exact[0], "exact-normalized"

    # 2) Exact token-set match.
    token_exact = [c for c in cast_list if c["name_set"] == tokens]
    if len(token_exact) == 1:
        return token_exact[0], "exact-token-set"

    # 3) Conservative subset match with strongest overlap.
    # Avoid one-token weak matches that can mis-map similar names.
    candidates = []
    for c in cast_list:
        overlap = len(tokens & c["name_set"])
        if overlap < 2:
            continue
        if tokens.issubset(c["name_set"]) or c["name_set"].issubset(tokens):
            candidates.append((overlap, c))

    if candidates:
        candidates.sort(key=lambda x: x[0], reverse=True)
        if len(candidates) == 1 or candidates[0][0] > candidates[1][0]:
            return candidates[0][1], "subset-overlap"

    return None, "none"


def patch_images(filepath):
    print(f"// ARCHIVE INITIATED: Patching Jikan images for {filepath}")

    if not os.path.exists(filepath):
        print(f"Error: File {filepath} not found.")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        payload = json.load(f)

    anime_id = payload.get("malId")
    anime_name = payload.get("anime")

    if not anime_id:
        print(f"Error: No malId found in {filepath}. Cannot fetch cast.")
        return

    print(f"// Fetching official anime info for {anime_name} (ID: {anime_id})")
    try:
        url = f"https://api.jikan.moe/v4/anime/{anime_id}"
        res = requests.get(url)
        res.raise_for_status()
        anime_data = res.json().get("data", {})

        anime_image = anime_data.get("images", {}).get("jpg", {}).get("large_image_url")
        if anime_image:
            payload["animeImageUrl"] = anime_image
            if "_fetchFailed" in payload:
                del payload["_fetchFailed"]
            print(f"// Success: Patched primary anime image: {anime_image}")
        else:
            print("// Warning: Could not find primary image in Jikan response.")
    except Exception as e:
        print(f"// API Failure for Anime Info: {e}")
        return

    time.sleep(0.5)

    print(f"// Fetching official cast list for {anime_name} (ID: {anime_id})")
    try:
        url = f"https://api.jikan.moe/v4/anime/{anime_id}/characters"
        res = requests.get(url)
        res.raise_for_status()
        cast_data = res.json().get("data", [])
        print(f"// Success: Retrieved {len(cast_data)} cast members.")
    except Exception as e:
        print(f"// API Failure for Cast List: {e}")
        return

    cast_list = []
    for member in cast_data:
        person = member.get("character", {})
        mal_id = person.get("mal_id")
        name = person.get("name", "")
        image = person.get("images", {}).get("jpg", {}).get("image_url")

        if mal_id and image:
            cast_list.append(
                {
                    "id": mal_id,
                    "image": image,
                    "name_set": tokenize(name),
                    "normalized_name": normalize_name(name),
                    "raw_name": name,
                }
            )

    characters = payload.get("characters", [])
    patched_count = 0

    for char in characters:
        char_name = char.get("name", "")
        match, reason = choose_best_match(char_name, cast_list)

        if match:
            print(
                f"  [+] Match found ({reason}) for '{char_name}' -> '{match['raw_name']}': ID {match['id']}"
            )
            char["malId"] = match["id"]
            char["imageUrl"] = match["image"]
            if "_fetchFailed" in char:
                del char["_fetchFailed"]
            patched_count += 1
        else:
            print(f"  [-] No high-confidence match found for '{char_name}'. Left intact.")

    print(f"// Patched {patched_count} out of {len(characters)} characters.")

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print("// PATCH COMPLETE. Payload saved.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Patch Jikan character/anime images directly from the official Anime cast lists to bypass caching bugs."
    )
    parser.add_argument("--file", required=True, help="Path to the Universe JSON file (e.g. src/data/aot.json)")
    args = parser.parse_args()
    patch_images(args.file)
