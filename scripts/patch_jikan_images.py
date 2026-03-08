import json
import requests
import time
import argparse
import sys
import os

def patch_images(filepath):
    print(f"// ARCHIVE INITIATED: Patching Jikan images for {filepath}")
    
    if not os.path.exists(filepath):
        print(f"Error: File {filepath} not found.")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    anime_id = payload.get('malId')
    anime_name = payload.get('anime')
    
    if not anime_id:
        print(f"Error: No malId found in {filepath}. Cannot fetch cast.")
        return

    print(f"// Fetching official cast list for {anime_name} (ID: {anime_id})")
    try:
        url = f"https://api.jikan.moe/v4/anime/{anime_id}/characters"
        res = requests.get(url)
        res.raise_for_status()
        cast_data = res.json().get('data', [])
        print(f"// Success: Retrieved {len(cast_data)} cast members.")
    except Exception as e:
        print(f"// API Failure: {e}")
        return

    # Build a lookup dictionary { "first last": {id, image}, "last, first": {id, image} }
    cast_dict = {}
    for member in cast_data:
        person = member.get('character', {})
        mal_id = person.get('mal_id')
        name = person.get('name', '').lower()
        image = person.get('images', {}).get('jpg', {}).get('image_url')
        
        if mal_id and image:
            cast_dict[name] = {"id": mal_id, "image": image}
            # Add reversed name just in case ("Yeager, Zeke" -> "Zeke Yeager")
            if ", " in name:
                parts = name.split(', ')
                reversed_name = f"{parts[1]} {parts[0]}"
                cast_dict[reversed_name] = {"id": mal_id, "image": image}

    # Patch the characters in the payload
    characters = payload.get('characters', [])
    patched_count = 0
    
    for char in characters:
        char_name = char.get('name', '').lower()
        # Find exact or partial match
        match = cast_dict.get(char_name)
        if not match:
            # Try partial word match fallback
            for k, v in cast_dict.items():
                if char_name in k or k in char_name:
                    match = v
                    break

        if match:
            print(f"  [+] Match found for {char.get('name')}: ID {match['id']}")
            char['malId'] = match['id']
            char['imageUrl'] = match['image']
            patched_count += 1
            time.sleep(0.3) # Avoid ratelimit if doing further queries
        else:
            print(f"  [-] No match found for {char.get('name')}. Left intact.")

    print(f"// Patched {patched_count} out of {len(characters)} characters.")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    
    print("// PATCH COMPLETE. Payload saved.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Patch Jikan character images directly from the official Anime cast lists to bypass caching bugs.")
    parser.add_argument('--file', required=True, help="Path to the Universe JSON file (e.g. src/data/aot.json)")
    args = parser.parse_args()
    patch_images(args.file)
