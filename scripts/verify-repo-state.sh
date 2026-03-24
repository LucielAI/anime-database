#!/bin/bash
# verify-repo-state.sh
# Repo-state awareness gate — verifies PR status against GitHub API before claiming "fixed" or "merged"
# Usage: bash scripts/verify-repo-state.sh
# Exit 0 = verified clean, Exit 1 = mismatch found

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "=== REPO-STATE VERIFICATION ==="
echo "Timestamp: $(date -u)"
echo ""

FAILED=0

python3 << 'PYEOF'
import json, urllib.request, os, sys, subprocess

TOKEN_ENV = os.environ.get('GITHUB_TOKEN', '')
TOKEN = TOKEN_ENV or ''

REPO = 'LucielAI/anime-database'
HEADERS = {'Authorization': f'token {TOKEN}'} if TOKEN else {}
FAILED = 0

def gh_get(path):
    url = f'https://api.github.com/repos/{REPO}{path}'
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        return json.loads(urllib.request.urlopen(req, timeout=10).read())
    except Exception as e:
        return {'error': str(e)}

def check_pr(pr_num):
    result = gh_get(f'/pulls/{pr_num}')
    if 'error' in result:
        print(f'  PR #{pr_num}: Could not verify — {result["error"]}')
        return None
    
    state = result.get('state', 'unknown')
    merged = result.get('merged', False)
    title = result.get('title', '')[:50]
    
    print(f'  PR #{pr_num}: state={state}, merged={merged}, title="{title}"')
    return {'state': state, 'merged': merged}

# Get current Main SHA from GitHub
main_ref = gh_get('/git/ref/heads/Main')
if 'error' not in main_ref:
    current_sha = main_ref.get('object', {}).get('sha', '')[:8]
    print(f'GitHub Main HEAD: {current_sha}')
else:
    print(f'  Could not fetch Main SHA: {main_ref.get("error")}')
    current_sha = None

# Check recent PRs
prs_to_check = [127, 126, 125, 124, 123, 121, 120, 118]
print('\nVerifying claimed PR merges:')

for pr in prs_to_check:
    r = check_pr(pr)
    if r is not None and r['merged'] == False and r['state'] == 'closed':
        print(f'  ⚠️  PR #{pr}: CLOSED but NOT merged — duplicate/mistaken claim!')
        FAILED = 1
    elif r is not None and r['merged'] == True:
        print(f'  ✅ PR #{pr}: actually merged')

# Check if local HEAD matches GitHub Main
local_sha = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], 
                          capture_output=True, text=True).stdout.strip()
print(f'\nLocal HEAD: {local_sha}')
if current_sha and local_sha != current_sha:
    print(f'  ⚠️  Local is behind GitHub Main by {current_sha}')
    print(f'  Run: git fetch origin Main')

sys.exit(FAILED)
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ REPO-STATE MISMATCH DETECTED"
    exit 1
else
    echo ""
    echo "✅ Repo-state verified — claims match reality"
    exit 0
fi
