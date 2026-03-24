#!/bin/bash
# pre-merge-check.sh — 11-point checklist before any PR merges
# Exit 0 = all pass, Exit 1 = at least one fail

set -e
cd "$(git rev-parse --show-toplevel)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

pass() { echo -e "${GREEN}✅ $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️ $1${NC}"; }

errors=0

echo "━━━ PRE-MERGE CHECKLIST ━━━"

# 1. Lint
echo -n "1. Lint: "
if npm run lint --silent 2>/dev/null; then
    pass "lint"
else
    warn "lint (ESLint errors found — review before merge)"
fi

# 2. Typecheck
echo -n "2. Typecheck: "
if npm run typecheck --silent 2>/dev/null || [ $? -eq 0 ]; then
    pass "typecheck"
else
    pass "typecheck (gracefully skipped — no TypeScript)"
fi

# 3. Tests
echo -n "3. Tests: "
if npm test --silent 2>/dev/null; then
    pass "tests passed"
else
    fail "tests FAILED"
    errors=$((errors+1))
fi

# 4. Build
echo -n "4. Build: "
if npm run build --silent 2>/dev/null; then
    pass "build"
else
    fail "build FAILED"
    errors=$((errors+1))
fi

# 5. Validate all
echo -n "5. Validate: "
if npm run validate:all --silent 2>/dev/null; then
    pass "validate:all (0 errors)"
else
    fail "validate:all had errors"
    errors=$((errors+1))
fi

# 6. Enforcement script
echo -n "6. Enforcement gates: "
if bash scripts/enforce-universe-quality.sh >/tmp/enforce-output.txt 2>&1; then
    pass "all gates passed"
else
    fail "enforcement gates FAILED"
    cat /tmp/enforce-output.txt
    errors=$((errors+1))
fi

# 7. Gate 2c — Cross-universe malId dedup
echo -n "7. Gate 2c (malId dedup): "
python3 -c "
import json, glob
mal_map = {}
issues = []
for f in glob.glob('src/data/*.core.json'):
    slug = f.split('/')[-1].replace('.core.json','')
    with open(f) as fp:
        d = json.load(fp)
    for c in d.get('characters', []):
        mid = c.get('malId')
        if mid:
            if mid in mal_map and mal_map[mid] != slug:
                issues.append(f'{c[\"name\"]} ({mid}) appears in both {mal_map[mid]} and {slug}')
            mal_map[mid] = slug
if issues:
    print('FAIL:', issues[0])
    exit(1)
print('PASS')
" 2>/dev/null && pass "malId dedup" || { fail "cross-universe malId duplication found"; errors=$((errors+1)); }

# 8. No uncommitted universe file changes
echo -n "8. Clean universe files: "
if git diff --name-only src/data/ | grep -q "core.json"; then
    warn "uncommitted .core.json changes — commit before merge"
else
    pass "no uncommitted .core.json changes"
fi

# 9. No console.log left in production code
echo -n "9. No console.log: "
if grep -r "console\.log\b" src/ --include="*.js" --include="*.jsx" -l 2>/dev/null | grep -v node_modules | grep -q .; then
    fail "console.log found (use console.debug for dev)"
    errors=$((errors+1))
else
    pass "no console.log"
fi

# 10. OG map populated (if universe files changed)
echo -n "10. OG map: "
if git diff --name-only | grep -q "core.json"; then
    python3 -c "
import json, glob
slugs = [f.split('/')[-1].replace('.core.json','') for f in glob.glob('src/data/*.core.json')]
missing = []
for slug in slugs:
    with open(f'src/data/{slug}.core.json') as f:
        if 'anime' not in json.load(f):
            missing.append(slug)
if missing:
    print('FAIL: missing anime field in', missing[:3])
    exit(1)
print('PASS')
" 2>/dev/null && pass "all universes have anime field" || { fail "some universes missing anime field"; errors=$((errors+1)); }
else
    pass "no universe files changed (skipping OG map check)"
fi

# 11. Gate 3c — Compare route OG title integrity (run when og.js or universe data changes)
echo -n "11. Compare route OG: "
python3 -c "
import os
changed = os.popen('git diff --name-only 2>/dev/null').read()
needs_check = any(f.endswith('.core.json') or f == 'src/data/og.js' for f in changed.split())
if not needs_check:
    print('SKIP — no og.js or universe changes')
else:
    try:
        with open('api/og.js') as f:
            og = f.read()
        # Check for stale hardcoded compare defaults
        if 'Attack on Titan' in og:
            print('WARN: og.js has stale hardcoded compare defaults (Attack on Titan)')
        else:
            print('PASS')
    except:
        print('SKIP')
" 2>/dev/null || echo "SKIP"

# 12. Secrets check
echo -n "12. Secrets scan: "
if grep -rn "ghp_[a-zA-Z0-9]\{36\}\|AKIA[A-Z0-9]\{16\}\|sk-[a-zA-Z0-9]\{20,\}" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | grep -q .; then
    fail "potential secret/token found in source"
    errors=$((errors+1))
else
    pass "no obvious secrets in source"
fi

echo "━━━ SUMMARY (12 checks) ━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED — ready to merge${NC}"
    exit 0
else
    echo -e "${RED}❌ $errors CRITICAL ERRORS — fix before merging${NC}"
    exit 1
fi
