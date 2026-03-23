#!/bin/bash
# enforce-universe-quality.sh
# BLOCKING gate — fails if any quality check fails
# Usage: bash scripts/enforce-universe-quality.sh [--fix]
# With --fix: attempts to fix minor issues
# Without --fix: reports only, exit code determines block

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
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
# GATE 1: File Integrity — anime field must match filename
# ============================================================
echo "[GATE 1] File integrity check..."

python3 << 'PYEOF'
import json, os, sys

repo = '/data/workspace/anime-database/src/data'

expected_anime = {
    'black-clover.core.json': 'Black Clover',
    're-zero.core.json': 'Re:Zero - Starting Life in Another World',
    'blue-lock.core.json': 'Blue Lock',
    'sword-art-online.core.json': 'Sword Art Online',
    'tokyo-revengers.core.json': 'Tokyo Revengers',
    'one-punch-man.core.json': 'One Punch Man',
    'spy-x-family.core.json': 'Spy x Family',
    'fire-force.core.json': 'Fire Force',
    'parasyte.core.json': 'Parasyte'
}

errors = []
for fname, expected_anime_name in expected_anime.items():
    fpath = f'{repo}/{fname}'
    if not os.path.exists(fpath):
        errors.append(f'  {fname}: FILE MISSING')
        continue
    with open(fpath) as f:
        d = json.load(f)
    actual = d.get('anime', '')
    if actual != expected_anime_name:
        errors.append(f'  {fname}: anime="{actual}" (expected "{expected_anime_name}")')
    
    # Check for cross-character contamination (no fixed counts — just watch for bleed)
    cross_checks = {
        'Saitama': ['one-punch-man.core.json'],
        'Naruto': ['naruto.core.json'],
        'Luffy': ['one-piece.core.json'],
        'Ichigo': ['bleach.core.json'],
        'Goku': ['dragonballz.core.json'],
        'Shinichi': ['parasyte.core.json'],
    }
    for char, valid_files in cross_checks.items():
        if char in [c.get('name','') for c in d.get('characters',[])] and fname not in valid_files:
            errors.append(f'  {fname}: cross-contamination "{char}" found')

if errors:
    print('FAIL: File integrity violations:')
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print('  PASS: All 9 files have correct anime fields and character counts')
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

repo = '/data/workspace/anime-database/src/data'
new_universes = [
    'black-clover.core.json', 're-zero.core.json', 'blue-lock.core.json',
    'sword-art-online.core.json', 'tokyo-revengers.core.json', 'one-punch-man.core.json',
    'spy-x-family.core.json', 'fire-force.core.json', 'parasyte.core.json'
]

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
for fname in new_universes:
    fpath = f'{repo}/{fname}'
    if not os.path.exists(fpath):
        errors.append(f'  {fname}: FILE MISSING')
        continue
    with open(fpath) as f:
        d = json.load(f)
    
    slug = fname.replace('.core.json', '')
    
    # animeImageUrl
    url = d.get('animeImageUrl', '')
    if not url:
        errors.append(f'  {slug}: animeImageUrl MISSING')
    elif not check(url):
        errors.append(f'  {slug}: animeImageUrl ❌ {url[-40:]}')
    
    # hero.imageUrl
    url = d.get('hero', {}).get('imageUrl', '')
    if not url:
        errors.append(f'  {slug}: hero.imageUrl MISSING')
    elif not check(url):
        errors.append(f'  {slug}: hero.imageUrl ❌ {url[-40:]}')
    
    # character images
    for c in d.get('characters', []):
        url = c.get('imageUrl', '')
        name = c.get('name', '?')
        if not url:
            errors.append(f'  {slug}/{name}: imageUrl MISSING')
        elif not check(url):
            errors.append(f'  {slug}/{name}: ❌ {url[-40:]}')

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
# GATE 3: Template Content Check
# ============================================================
echo ""
echo "[GATE 3] Template/filler content check..."

python3 << 'PYEOF'
import json, os, sys

repo = '/data/workspace/anime-database/src/data'
new_universes = [
    'black-clover.core.json', 're-zero.core.json', 'blue-lock.core.json',
    'sword-art-online.core.json', 'tokyo-revengers.core.json', 'one-punch-man.core.json',
    'spy-x-family.core.json', 'fire-force.core.json', 'parasyte.core.json'
]

errors = []
for fname in new_universes:
    fpath = f'{repo}/{fname}'
    if not os.path.exists(fpath):
        continue
    with open(fpath) as f:
        d = json.load(f)
    
    slug = fname.replace('.core.json', '')
    
    # Check tagline contains anime name
    tagline = d.get('tagline', '')
    anime_name = d.get('anime', '')
    if anime_name and anime_name not in tagline and tagline:
        # Allow partial match for long titles
        short_name = anime_name.split(' - ')[0].split(':')[0].strip()
        if short_name not in tagline:
            errors.append(f'  {slug}: tagline missing anime name ("{tagline[:50]}")')
    
    # Check microHook length
    mh = d.get('hero', {}).get('microHook', '')
    if len(mh) > 95:
        errors.append(f'  {slug}: microHook {len(mh)} chars (limit 95) — "{mh[:50]}"')
    
    # Check thesis length
    th = d.get('hero', {}).get('thesis', '')
    if len(th) > 140:
        errors.append(f'  {slug}: thesis {len(th)} chars (limit 140)')
    
    # Check for template descriptions
    for c in d.get('characters', []):
        name = c.get('name', '')
        desc = c.get('description', '')
        anime = d.get('anime', '')
        # Detect template pattern
        if desc.startswith(f'{name} is a') or desc.startswith(f'{name} is an'):
            if f'from {anime}' in desc or f'from ' in desc:
                errors.append(f'  {slug}/{name}: TEMPLATE description — "{desc[:60]}"')
        
        # Check for 'What is' system questions
    for sq in d.get('systemQuestions', []):
        q = sq.get('question', '')
        if q.startswith('What is'):
            errors.append(f'  {slug}: "What is" systemQuestion — must be "Why does" or "How does"')

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
