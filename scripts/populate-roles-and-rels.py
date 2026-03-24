#!/usr/bin/env python3
"""
populate-roles-and-rels.py
Refactored: uses anime-specific /anime/{id}/characters endpoint.
Dry-run by default. Use --confirm to apply.
Patch only malId + imageUrl. Preserve all rich fields.
"""
import json, os, sys, urllib.request, time, argparse
from difflib import SequenceMatcher

JIKAN_SLEEP = 0.4

def jikan_get(path, retries=2):
    for attempt in range(retries):
        try:
            url = 'https://api.jikan.moe/v4' + path
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            r = urllib.request.urlopen(req, timeout=10)
            return json.loads(r.read())
        except Exception:
            if attempt < retries - 1:
                time.sleep(1)
    return None

def jikan_chars_for_anime(anime_id):
    """Fetch all characters for a specific anime via anime-specific endpoint."""
    result = jikan_get(f'/anime/{anime_id}/characters')
    if not result:
        return {}
    chars = {}
    for entry in result['data']:
        c = entry['character']
        name = c['name']
        mid = c['mal_id']
        role = entry.get('role', 'Unknown')
        img = c['images']['jpg']['image_url'].replace('https://myanimelist.net', 'https://cdn.myanimelist.net')
        chars[name] = {'malId': mid, 'imageUrl': img, 'role': role, '_jikan_name': name}
        # Index by last-name for fuzzy matching — list to handle same-last-name collisions
        parts = name.split(',')
        if len(parts) >= 2:
            last_key = '_last:' + parts[0].strip().lower()  # lowercase for case-insensitive lookup
            if last_key not in chars:
                chars[last_key] = []
            chars[last_key].append(chars[name])
    return chars

def last_name(full_name):
    """Extract last token from 'First Last' format."""
    parts = full_name.strip().split()
    return parts[-1] if parts else full_name

def first_name(full_name):
    """Extract first token from 'First Last' format."""
    parts = full_name.strip().split()
    return parts[0] if parts else full_name

def name_sim(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def best_match(stored_name, jikan_chars):
    """
    Match stored character to Jikan character using last-name + first-name logic.
    Handles same-last-name characters (e.g., Tanjiro + Nezuko Kamado) correctly.
    Returns (jikan_name, jc, confidence_str) or None.
    """
    stored_last = last_name(stored_name).lower()
    stored_first = first_name(stored_name).lower()

    # Phase 1: Check _last: index for exact last-name matches
    last_key = '_last:' + stored_last
    if last_key in jikan_chars:
        candidates_for_last = jikan_chars[last_key]
        if len(candidates_for_last) == 1:
            # Only one character with this last name — high confidence if first names match loosely
            jc = candidates_for_last[0]
            jikan_name = jc.get('_jikan_name', '')
            parts = jikan_name.split(',')
            j_first = parts[1].strip().lower() if len(parts) >= 2 else ''
            if stored_first == j_first:
                return jikan_name, jc, 'exact_full'
            else:
                return jikan_name, jc, 'exact_last'
        else:
            # Multiple characters with same last name — try fuzzy first-name match
            best_sim = -1
            best_jc = None
            best_jn = None
            for jc in candidates_for_last:
                jikan_name = jc.get('_jikan_name', '')
                parts = jikan_name.split(',')
                j_first = parts[1].strip().lower() if len(parts) >= 2 else ''
                if stored_first == j_first:
                    # Exact first-name match — use this one
                    return jikan_name, jc, 'exact_full'
                # Fuzzy: check similarity against first name
                sim = name_sim(stored_first, j_first)
                if sim > best_sim:
                    best_sim = sim
                    best_jc = jc
                    best_jn = jikan_name
            # No exact first-name match — use best fuzzy match if good enough, else skip
            if best_sim >= 0.7:
                return best_jn, best_jc, f'fuzzy_last_{best_sim:.2f}'
            else:
                return None  # no good match among same-last-name chars

    # Phase 2: No last-name match in index — fuzzy search all characters
    candidates = []
    for jikan_name, jc in jikan_chars.items():
        if jikan_name.startswith('_'):
            continue
        parts = jikan_name.split(',')
        if len(parts) >= 2:
            j_last = parts[0].strip().lower()
            j_first = parts[1].strip().lower()
        else:
            j_last = jikan_name.lower()
            j_first = ''

        if stored_last == j_last:
            if stored_first == j_first:
                candidates.append((jikan_name, jc, 'exact_full', 1.0))
            else:
                candidates.append((jikan_name, jc, 'exact_last', 0.95))
        else:
            sim = name_sim(stored_name, jikan_name)
            if sim >= 0.8:
                candidates.append((jikan_name, jc, f'similar_{sim:.2f}', sim))

    if not candidates:
        return None

    # Sort: exact_full > exact_last > similar
    def sort_key(c):
        conf = c[2]
        if conf == 'exact_full':
            return (0, -c[3])
        elif conf == 'exact_last':
            return (1, -c[3])
        else:
            return (2, -c[3])
    candidates.sort(key=sort_key)
    name, jc, conf, score = candidates[0]
    return name, jc, conf

def img_ok(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        r = urllib.request.urlopen(req, timeout=6)
        return r.getcode() == 200
    except:
        return False

def fix_universe(slug, dry_run=True, min_conf='exact_last'):
    core_path = f'src/data/{slug}.core.json'
    if not os.path.exists(core_path):
        print(f'ERROR: {core_path} not found')
        return {}
    with open(core_path) as f:
        core = json.load(f)
    mal_id = core.get('malId')
    if not mal_id:
        print(f'ERROR: {slug} has no malId')
        return {}
    anime_name = core.get('anime', slug)
    print(f'\n[{slug}] Fetching Jikan anime {mal_id} ({anime_name})...')
    jikan_chars = jikan_chars_for_anime(mal_id)
    print(f'[{slug}] {len(jikan_chars)} Jikan characters loaded')
    stored_chars = core.get('characters', [])
    results = {'slug': slug, 'updates': [], 'manual_review': [], 'skipped': [], 'already_correct': []}
    for sc in stored_chars:
        sn = sc.get('name', '')
        match = best_match(sn, jikan_chars)
        if not match:
            results['skipped'].append({'name': sn, 'stored_malId': sc.get('malId'), 'reason': 'no Jikan match'})
            continue
        jn, jc, conf = match
        # Determine auto-apply vs manual review
        auto_apply = conf in ('exact_full', 'exact_last') or conf.startswith('fuzzy_last')
        if conf.startswith('similar'):
            score = float(conf.split('_')[1])
            auto_apply = (score >= 0.90)  # ECHO-verified: ≥0.90 auto-apply
        if not auto_apply:
            results['manual_review'].append({
                'name': sn, 'stored_malId': sc.get('malId'), 'jikan_malId': jc['malId'],
                'jikan_name': jn, 'confidence': conf, 'reason': 'low confidence match'})
            continue
        # Verify image
        if not img_ok(jc['imageUrl']):
            results['manual_review'].append({
                'name': sn, 'stored_malId': sc.get('malId'), 'jikan_malId': jc['malId'],
                'jikan_name': jn, 'confidence': conf, 'reason': 'Jikan image 404'})
            continue
        if sc.get('malId') == jc['malId'] and sc.get('imageUrl') == jc['imageUrl']:
            results['already_correct'].append({'name': sn, 'malId': jc['malId']})
            continue
        results['updates'].append({
            'name': sn, 'stored_malId': sc.get('malId'), 'stored_imageUrl': sc.get('imageUrl', ''),
            'jikan_malId': jc['malId'], 'jikan_imageUrl': jc['imageUrl'],
            'confidence': conf, 'jikan_name': jn})
    mode = 'DRY-RUN' if dry_run else 'CONFIRM'
    print(f'\n[{slug}] === {mode} ===')
    print(f'  Stored chars: {len(stored_chars)} | Jikan chars: {len(jikan_chars)}')
    print(f'  Updates: {len(results["updates"])} | Already correct: {len(results["already_correct"])} | Manual: {len(results["manual_review"])} | Skipped: {len(results["skipped"])}')
    if results['updates']:
        print(f'\n━━━ UPDATES ━━━')
        for r in results['updates']:
            print(f"  ✅ {r['name']}: {r['stored_malId']} → {r['jikan_malId']} [{r['confidence']}]")
    if results['manual_review']:
        print(f'\n━━━ MANUAL REVIEW ━━━')
        for r in results['manual_review']:
            print(f"  ⚠️  {r['name']}: {r['stored_malId']} → {r['jikan_malId']} [{r['confidence']}] — {r['reason']}")
    if results['skipped']:
        for r in results['skipped'][:3]:
            print(f"  ❌ {r['name']}: no match — {r.get('reason','')}")
    print(f'\nFields changed: ONLY malId, imageUrl')
    print(f'Fields preserved: name, loreBio, systemBio, role, relationships, primaryAbility, description, etc.')
    # Write review JSON
    review_path = f'/tmp/review-{slug}.json'
    with open(review_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f'Review data: {review_path}')
    if dry_run:
        print(f'\n=== DRY-RUN COMPLETE — no files modified ===')
        print(f'Run with --confirm to apply updates')
        return results
    # Apply
    for r in results['updates']:
        for char in core['characters']:
            if char['name'] == r['name']:
                char['malId'] = r['jikan_malId']
                char['imageUrl'] = r['jikan_imageUrl']
                break
    with open(core_path, 'w') as f:
        json.dump(core, f, indent=2, ensure_ascii=False)
    print(f'\n[{slug}] Saved — {len(results["updates"])} characters updated')
    return results

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--universe', required=True)
    p.add_argument('--confirm', action='store_true')
    p.add_argument('--verbose', action='store_true')
    args = p.parse_args()
    dry_run = not args.confirm
    if args.confirm:
        print('⚠️ CONFIRM MODE')
    fix_universe(args.universe, dry_run=dry_run)
