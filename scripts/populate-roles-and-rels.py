#!/usr/bin/env python3
"""
populate-roles-and-rels.py
Fetches role + relationships from Jikan API for ALL characters in all universes.

Approach:
- For each universe, query /anime/{malId}/characters once (rate: 3/sec)
- For each character needing data, query /characters/{id}/full (batched, 3/sec)
- Updates .core.json files in-place

Usage: python3 scripts/populate-roles-and-rels.py [--dry-run]
"""

import json, glob, os, time, sys, urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

DRY_RUN = '--dry-run' in sys.argv
REPO = Path('/data/workspace/anime-database/src/data')
JIKAN = 'https://api.jikan.moe/v4'
RATE = 0.35  # seconds between requests (~3/sec)

MAL_IDS = {
    'bleach': 269, 'chainsawman': 44511, 'codegeass': 1575, 'deathnote': 1535,
    'demonslayer': 38000, 'dragonballz': 813, 'fmab': 5114, 'frieren': 52991,
    'goblinslayer': 37349, 'mha': 31964, 'mushokutensei': 39535,
    'naruto': 20, 'one-piece': 21, 'sololeveling': 52299, 'tokyo-ghoul': 22319
}

def jikan_get(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AnimeArchiveBot/1.0'})
            with urllib.request.urlopen(req, timeout=12) as resp:
                time.sleep(RATE)
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                return None
    return None

def get_anime_characters(mal_id):
    """Fetch all characters for an anime. Returns dict keyed by name_lower and mal_id."""
    data = jikan_get(f'{JIKAN}/anime/{mal_id}/characters')
    if not data or 'data' not in data:
        return {}
    result = {}
    for entry in data['data']:
        char = entry['character']
        cid = char['mal_id']
        name_lower = char['name'].lower()
        role = entry['role']
        # Skip characters with no role
        if role in ('None', None, ''):
            continue
        info = {'name': char['name'], 'role': role, 'malId': cid}
        result[cid] = info
        result[name_lower] = info
    return result

def get_character_full_relationships(cid):
    """Fetch a character's anime appearances from /characters/{id}/full."""
    data = jikan_get(f'{JIKAN}/characters/{cid}/full')
    if not data or 'data' not in data:
        return []
    anime_list = []
    for a in data['data'].get('anime', [])[:8]:  # top 8 anime appearances
        anime_list.append(a['anime']['title'])
    return anime_list

def update_universe(slug, mal_id):
    path = REPO / f'{slug}.core.json'
    if not path.exists():
        return False, f'{slug}: file not found'
    
    with open(path) as f:
        data = json.load(f)
    
    # Step 1: Get all characters for this anime
    jikan_chars = get_anime_characters(mal_id)
    if not jikan_chars:
        return False, f'{slug}: no Jikan data for MAL {mal_id}'
    
    # Step 2: For each character needing data, get relationships from /full
    updated_role = 0
    updated_rel = 0
    chars_needing_rel = []
    
    for char in data.get('characters', []):
        name_lower = char.get('name', '').lower()
        cid = char.get('malId')
        
        # Find in Jikan data
        jc = jikan_chars.get(cid) or jikan_chars.get(name_lower)
        
        if jc:
            # Populate role if missing
            if char.get('role') is None and jc['role']:
                char['role'] = jc['role']
                updated_role += 1
            
            # Track for relationships fetch
            if char.get('relationships') is None and jc.get('malId'):
                chars_needing_rel.append((char, jc['malId']))
    
    # Step 3: Batch-fetch relationships (3 at a time to respect rate limit)
    # Skip relationships fetch in DRY RUN (too slow)
    if not DRY_RUN:
        for char, cid in chars_needing_rel:
            rels = get_character_full_relationships(cid)
            if rels:
                char['relationships'] = rels
                updated_rel += 1
    
    if DRY_RUN:
        print(f'  DRY: {slug} — role +{updated_role}, rel +{updated_rel}')
        return True, 'dry run'
    
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    total_updated = updated_role + updated_rel
    status = '✅' if total_updated > 0 else '⚠️  (no changes)'
    print(f'  {status} {slug}: role +{updated_role}, rel +{updated_rel}')
    return True, f'updated {total_updated} fields'

def main():
    universes = sorted(MAL_IDS.keys())
    print(f'{"[DRY RUN] " if DRY_RUN else ""}Processing {len(universes)} universes...')
    print(f'Rate limit: {RATE}s between requests (~3/sec)')
    print()
    
    results = []
    for slug in universes:
        mal_id = MAL_IDS[slug]
        print(f'[{universes.index(slug)+1}/{len(universes)}] {slug} (MAL {mal_id})...', end=' ', flush=True)
        ok, msg = update_universe(slug, mal_id)
        results.append((slug, ok, msg))
    
    print(f'\n{"="*50}')
    succeeded = sum(1 for _, ok, _ in results if ok)
    print(f'Completed: {succeeded}/{len(universes)}')
    for slug, ok, msg in results:
        if not ok:
            print(f'  FAILED: {slug} — {msg}')
    
    if DRY_RUN:
        print('\nRemove --dry-run to apply changes.')

if __name__ == '__main__':
    main()
