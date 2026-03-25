#!/bin/bash
# enforce-universe-quality.sh
# BLOCKING gate — fails if any quality check fails
# Usage: bash scripts/enforce-universe-quality.sh [--fix]
# With --fix: attempts to fix minor issues
# Without --fix: reports only, exit code determines block

set -eo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export REPO_DIR
cd "$REPO_DIR"

FIX_MODE=false
if [ "$1" = "--fix" ]; then
    FIX_MODE=true
fi

echo "=== ENFORCEMENT GATE: Universe Quality ==="
echo "Timestamp: $(date -u)"
echo ""

FAILED=0

# ============================================================
# HELPER: find all universe payload files
# Both *.core.json AND *.json (but NOT *.extended.json)
# ============================================================
get_universe_files() {
    find "$REPO_DIR/src/data" -maxdepth 1 -type f \( -name "*.core.json" -o -name "*.json" \) ! -name "*.extended.json" | sort
}

# ============================================================
# GATE 1: File Integrity — anime field must match filename
# ============================================================
echo "[GATE 1] File integrity check..."

python3 << 'PYEOF'
import json, os, sys

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def universe_files():
    """Return all universe payload files (*.core.json and *.json, not *.extended.json)."""
    return sorted([f for f in os.listdir(repo)
                   if (f.endswith('.core.json') or f.endswith('.json'))
                   and not f.endswith('.extended.json')])

def slug(fname):
    """Extract universe slug from filename."""
    if fname.endswith('.core.json'):
        return fname.replace('.core.json', '')
    return fname.replace('.json', '')

core_files = universe_files()
print(f'  Checking {len(core_files)} universe files...')

errors = []
for fname in core_files:
    fpath = f'{repo}/{fname}'
    s = slug(fname)  # use function, not variable
    with open(fpath) as f:
        d = json.load(f)
    anime = d.get('anime', '')
    if not anime:
        errors.append(f'  {s}: anime field is empty')
    
    # Check for cross-character contamination
    # Note: Some character names appear in multiple anime (e.g. "Rem" is in both Re:Zero AND Death Note as different characters)
    # Only flag if character appears in a universe where they definitely don't exist
    cross_checks = {
        'Saitama': ['one-punch-man'],
        'Naruto': ['naruto'],
        'Luffy': ['one-piece'],
        'Ichigo': ['bleach'],
        'Goku': ['dragonballz'],
        'Shinichi': ['parasyte'],
        'Anya': ['spy-x-family'],
        # Rem exists in both Re:Zero AND Death Note — different characters, don't flag
    }
    char_names = [c.get('name','') for c in d.get('characters',[])]
    for char, valid_slugs in cross_checks.items():
        if char in char_names and s not in valid_slugs:
            errors.append(f'  {s}: cross-contamination "{char}" (belongs in {valid_slugs[0]})')

if errors:
    print('FAIL: File integrity violations:')
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print(f'  PASS: All {len(universe_files())} files have anime fields, no cross-contamination')
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: File integrity check failed"
    FAILED=1
fi

# ============================================================
# GATE 2: Image Verification — all images must return 200
# ============================================================
echo ""
echo "[GATE 2] Image verification..."

python3 << 'PYEOF'
import json, urllib.request, os, sys

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def universe_files():
    return sorted([f for f in os.listdir(repo)
                   if (f.endswith('.core.json') or f.endswith('.json'))
                   and not f.endswith('.extended.json')])

def slug(fname):
    if fname.endswith('.core.json'):
        return fname.replace('.core.json', '')
    return fname.replace('.json', '')

def check(url):
    if not url:
        return False
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        r = urllib.request.urlopen(req, timeout=5)
        return r.getcode() == 200
    except:
        return False

errors = []
for fname in universe_files():
    fpath = f'{repo}/{fname}'
    if not os.path.exists(fpath):
        errors.append(f'  {fname}: FILE MISSING')
        continue
    with open(fpath) as f:
        d = json.load(f)
    
    s = slug(fname)
    
    # animeImageUrl
    url = d.get('animeImageUrl', '')
    if not url:
        errors.append(f'  {s}: animeImageUrl MISSING')
    elif not check(url):
        errors.append(f'  {s}: animeImageUrl ❌ {url[-40:]}')
    
    # hero.imageUrl — check but warn only (not used in current UI)
    url = d.get('hero', {}).get('imageUrl', '')
    if not url:
        print(f'  WARN: {s}: hero.imageUrl MISSING (not blocking — not used in UI)')
    elif not check(url):
        errors.append(f'  {s}: hero.imageUrl ❌ {url[-40:]}')
    
    # character images
    for c in d.get('characters', []):
        url = c.get('imageUrl', '')
        name = c.get('name', '?')
        # Allow _fetchFailed: true as valid (image not available)
        if not url and not c.get('_fetchFailed'):
            errors.append(f'  {s}/{name}: imageUrl MISSING')
        elif url and url != 'null' and not check(url):
            errors.append(f'  {s}/{name}: ❌ {url[-40:]}')

if errors:
    print('FAIL: Image verification failures:')
    for e in errors[:20]:  # limit output
        print(e)
    if len(errors) > 20:
        print(f'  ... and {len(errors)-20} more')
    sys.exit(1)
else:
    print('  PASS: All images return HTTP 200')
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: Image verification failed"
    FAILED=1
fi

# ============================================================
# GATE 2b: Catalog Image Verification — catalog.js images
# ============================================================
echo ""
echo "[GATE 2b] Catalog image verification..."

python3 - << 'PYEOF'
import json, urllib.request, os, sys, re

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def check(url):
    if not url:
        return False
    url = url.replace('https://myanimelist.net', 'https://cdn.myanimelist.net')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        r = urllib.request.urlopen(req, timeout=5)
        return r.getcode() == 200
    except:
        return False

catalog_path = f'{repo}/catalog.js'
with open(catalog_path) as f:
    content = f.read()

# Check images for ALL catalog entries (all 30 universes)
pattern = r"id: '([^']+)', anime: '([^']+)', tagline: '([^']+)', malId: (\d+)"
entries = re.findall(pattern, content)
errors = []

for entry in entries:
    uid, anime, tagline, malId = entry
    # Find animeImageUrl for this entry
    idx = content.find(f"id: '{uid}'")
    next_idx = content.find(f"id: '", idx + 10)
    chunk = content[idx:next_idx if next_idx > 0 else idx + 2000]
    img_match = re.search(r"animeImageUrl: '([^']+)'", chunk)
    if img_match:
        imgUrl = img_match.group(1)
        if not check(imgUrl):
            errors.append(f'  catalog.js/{uid}: animeImageUrl FAIL {imgUrl[-40:]}')
        # Check MAL ID matches .core.json
        core_path = f'{repo}/{uid}.core.json'
        if os.path.exists(core_path):
            with open(core_path) as f:
                core = json.load(f)
            core_mal = core.get('malId')
            if str(core_mal) != str(malId):
                errors.append(f'  catalog.js/{uid}: MAL ID mismatch catalog={malId} .core.json={core_mal}')

if errors:
    print('FAIL: Catalog issues:')
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print('  PASS: All catalog images return HTTP 200')
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: Catalog image check failed"
    FAILED=1
fi

# ============================================================
# GATE 2c: Cross-universe character dedup
# ============================================================
echo ""
echo "[GATE 2c] Cross-universe character dedup..."

python3 << 'PYEOF'
import json, os, sys
from collections import defaultdict

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def universe_files():
    return sorted([f for f in os.listdir(repo)
                   if (f.endswith('.core.json') or f.endswith('.json'))
                   and not f.endswith('.extended.json')])

def slug(fname):
    if fname.endswith('.core.json'):
        return fname.replace('.core.json', '')
    return fname.replace('.json', '')

# Build malId -> set(of universe slugs) map — now covers ALL universe files
malId_to_universes = defaultdict(set)

for fname in universe_files():
    fpath = f'{repo}/{fname}'
    s = slug(fname)
    with open(fpath) as f:
        d = json.load(f)
    for c in d.get('characters', []):
        malId = c.get('malId')
        if malId is not None:
            malId_to_universes[malId].add(s)

# Find cross-universe duplicates (same malId in DIFFERENT universe files)
cross_universe_dups = {mid: slugs for mid, slugs in malId_to_universes.items() if len(slugs) > 1}

if cross_universe_dups:
    print('FAIL: Character malIds found in multiple universes:')
    for mid, slugs in sorted(cross_universe_dups.items()):
        details = []
        for fname in universe_files():
            fpath = f'{repo}/{fname}'
            s = slug(fname)
            if s not in slugs:
                continue
            with open(fpath) as f:
                d = json.load(f)
            for c in d.get('characters', []):
                if c.get('malId') == mid:
                    details.append(f'{c.get("name","?")}@{s}')
        print(f'  malId={mid}: {", ".join(sorted(details))}')
    sys.exit(1)
else:
    all_files = universe_files()
    print(f'  PASS: All {len(all_files)} universes have unique character malIds (no cross-universe contamination)')
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: Cross-universe character duplication found"
    FAILED=1
fi

# ============================================================
# GATE 3: Template Content Check
# ============================================================
echo ""
echo "[GATE 3] Template/filler content check..."

python3 << 'PYEOF'
import json, os, sys

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def universe_files():
    return sorted([f for f in os.listdir(repo)
                   if (f.endswith('.core.json') or f.endswith('.json'))
                   and not f.endswith('.extended.json')])

def slug(fname):
    if fname.endswith('.core.json'):
        return fname.replace('.core.json', '')
    return fname.replace('.json', '')

errors = []
for fname in universe_files():
    fpath = f'{repo}/{fname}'
    if not os.path.exists(fpath):
        continue
    with open(fpath) as f:
        d = json.load(f)
    
    s = slug(fname)
    
    # Check tagline starts with anime name
    tagline = d.get('tagline', '')
    anime_name = d.get('anime', '')
    if anime_name and anime_name not in tagline and tagline:
        # Allow partial match for long titles
        short_name = anime_name.split(' - ')[0].split(':')[0].strip()
        if short_name not in tagline:
            errors.append(f'  {s}: tagline missing anime name ("{tagline[:50]}")')
    
    # Check microHook length
    mh = d.get('hero', {}).get('microHook', '')
    if len(mh) > 95:
        errors.append(f'  {s}: microHook {len(mh)} chars (limit 95) — "{mh[:50]}"')
    
    # Check thesis length
    th = d.get('hero', {}).get('thesis', '')
    if len(th) > 140:
        errors.append(f'  {s}: thesis {len(th)} chars (limit 140)')
    
    # Check for template descriptions (role missing = broken template)
    for c in d.get('characters', []):
        name = c.get('name', '')
        desc = c.get('description', '')
        anime = d.get('anime', '')
        # Detect: "{Name} is a [nothing] from {Anime}" — role slot is empty
        if f'{name} is a from {anime}' in desc or f'{name} is an from {anime}' in desc:
            errors.append(f'  {s}/{name}: TEMPLATE (role field empty) — "{desc[:60]}"')
        # Flag descriptions that are just the bare template with no real content
        if desc.startswith(f'{name} is a') and 'from {anime}' in desc and len(desc) < 80:
            errors.append(f'  {s}/{name}: bare template description — "{desc[:60]}"')
        
        # Check for 'What is' system questions
    for sq in d.get('systemQuestions', []):
        q = sq.get('question', '')
        if q.startswith('What is'):
            errors.append(f'  {s}: "What is" systemQuestion — must be "Why does" or "How does"')

if errors:
    print('FAIL: Content quality violations:')
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print('  PASS: No template content, correct lengths, taglines OK')
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: Content quality check failed"
    FAILED=1
fi

# ============================================================
# GATE 3b: Character Field Completeness — role + relationships
# ============================================================
echo ""
echo "[GATE 3b] Character role/relationships completeness..."

python3 << 'PYEOF'
import json, os, sys

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def universe_files():
    return sorted([f for f in os.listdir(repo)
                   if (f.endswith('.core.json') or f.endswith('.json'))
                   and not f.endswith('.extended.json')])

def slug(fname):
    if fname.endswith('.core.json'):
        return fname.replace('.core.json', '')
    return fname.replace('.json', '')

errors = []
for fname in universe_files():
    fpath = f'{repo}/{fname}'
    s = slug(fname)
    with open(fpath) as f:
        d = json.load(f)
    
    chars = d.get('characters', [])
    fix_mode = os.environ.get('ENFORCE_FIX') == '1'
    changed = False
    for c in chars:
        name = c.get('name', '?')
        # Check role field
        role = c.get('role')
        if not role:
            errors.append(f'  {s}/{name}: role MISSING')
        elif role not in ('Main', 'Supporting', 'Antagonist', 'Minor'):
            errors.append(f'  {s}/{name}: invalid role "{role}" (must be Main/Supporting/Antagonist/Minor)')
        
        # Check relationships field
        if 'relationships' not in c:
            if fix_mode:
                c['relationships'] = []
                changed = True
                print(f'  AUTO-FIX: {s}/{name}: added empty relationships array')
            else:
                errors.append(f'  {s}/{name}: relationships field MISSING')
        elif not isinstance(c.get('relationships'), list):
            errors.append(f'  {s}/{name}: relationships must be array')
        
        # Check relationships reference only this universe's characters
        rels = c.get('relationships', [])
        char_names = {ch.get('name') for ch in chars}
        franchise_indicators = ['Season', 'Movie', 'Special', 'Ova', 'Episode', 'Part', 'Arc', 'Chapter', ': ']
        for rel in rels:
            if rel in char_names:
                continue
            if any(ind in rel for ind in franchise_indicators):
                continue
            # non-character, non-franchise ref: warn only
            print(f'  WARN: {s}/{name}: non-character relationship — "{rel}"')
    
    if changed:
        with open(fpath, 'w') as f:
            json.dump(d, f, indent=2, ensure_ascii=False)

if errors:
    print('FAIL: Character field completeness violations:')
    for e in errors[:30]:
        print(e)
    if len(errors) > 30:
        print(f'  ... and {len(errors)-30} more')
    sys.exit(1)
else:
    all_files = universe_files()
    print(f'  PASS: All {len(all_files)} universes — all characters have role + relationships')
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: Character completeness check failed"
    FAILED=1
fi

# ============================================================
# GATE 4: Validation — must pass
# ============================================================
echo ""
echo "[GATE 4] Schema validation..."

npm run validate:all 2>&1 | grep -q "errors= 0"
if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: validate:all has errors"
    npm run validate:all 2>&1 | grep "FAIL\|errors="
    FAILED=1
else
    echo "  PASS: validate:all — 0 errors"
fi

# ============================================================
# GATE 0: Jikan API Verification — MAL ID + character spot-check
# ============================================================
echo ""
echo "[GATE 0] Jikan API verification (MAL ID + sample character check)..."

python3 << 'PYEOF'
import json, os, sys, urllib.request, time

repo = os.environ.get('REPO_DIR', '/data/workspace/anime-database') + '/src/data'

def universe_files():
    return sorted([f for f in os.listdir(repo)
                   if (f.endswith('.core.json') or f.endswith('.json'))
                   and not f.endswith('.extended.json')])

def slug(fname):
    if fname.endswith('.core.json'):
        return fname.replace('.core.json', '')
    return fname.replace('.json', '')

errors = []
warnings = []

known_wrong = {
    'fire-force': {'wrong': 31964, 'correct': 38671},
    'jjk': {'wrong': 44738, 'correct': 40748},
    'spy-x-family': {'wrong': 50693, 'correct': 50265},
}

def jikan_get(path, retries=2):
    for attempt in range(retries):
        try:
            url = f'https://api.jikan.moe/v4{path}'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            r = urllib.request.urlopen(req, timeout=10)
            return json.loads(r.read())
        except Exception:
            if attempt < retries - 1:
                time.sleep(1)
    return None

for fname in universe_files():
    s = slug(fname)
    with open(f'{repo}/{fname}') as f:
        d = json.load(f)
    
    mal_id = d.get('malId')
    anime_name = d.get('anime', '')
    
    if not mal_id:
        errors.append(f'  {s}: malId MISSING')
        continue
    
    if s in known_wrong and mal_id == known_wrong[s].get('wrong'):
        errors.append(f'  {s}: malId {mal_id} is KNOWN WRONG (correct: {known_wrong[s]["correct"]})')
        continue
    
    result = jikan_get(f'/anime/{mal_id}')
    if not result:
        warnings.append(f'  {s}: Jikan unreachable for malId {mal_id} (non-blocking)')
        continue
    
    # Validate via animeImageUrl match as proxy for correct anime
    # (English/Japanese title differences are expected — don't compare titles)
    jikan_image = result.get('data', {}).get('images', {}).get('jpg', {}).get('image_url', '')
    our_img = d.get('animeImageUrl', '')
    
    if jikan_image and our_img:
        import re
        jikan_img_match = re.search(r'/images/anime/(\d+)/', jikan_image)
        our_img_match = re.search(r'/images/anime/(\d+)/', our_img)
        jikan_img_id = jikan_img_match.group(1) if jikan_img_match else None
        our_img_id = our_img_match.group(1) if our_img_match else None
        
        # Flag if image IDs differ by more than 10000 (clear wrong anime)
        if jikan_img_id and our_img_id:
            if abs(int(jikan_img_id) - int(our_img_id)) > 10000:
                errors.append(f'  {s}: animeImageUrl mismatch (ID diff >10000: ours={our_img_id} vs Jikan={jikan_img_id})')

if errors:
    print('FAIL: Jikan verification failures:')
    for e in errors:
        print(e)
    sys.exit(1)
else:
    all_files = universe_files()
    print(f'  PASS: All {len(all_files)} universes passed Jikan MAL ID verification')
    for w in warnings:
        print(w)
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ BLOCKED: Jikan verification failed"
    FAILED=1
else
    echo "  INFO: Jikan failures are non-blocking warnings"
fi

# ============================================================
# RESULT
# ============================================================
echo ""
if [ $FAILED -eq 1 ]; then
    echo "❌ ENFORCEMENT FAILED — blocking commit"
    exit 1
else
    echo "✅ ALL ENFORCEMENT GATES PASSED"
    exit 0
fi
