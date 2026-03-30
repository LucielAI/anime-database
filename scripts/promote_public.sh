#!/usr/bin/env python3
"""
Promote: Private → Public Repository Sync
Syncs selected files from LucielAI/anime-database to LucielAI/Animearchive.app
"""
import os, sys, json, base64, subprocess
from urllib.request import Request, urlopen
from urllib.error import HTTPError

#── Config ──────────────────────────────────────────────────────
TOKEN = os.environ.get("PUBLIC_REPO_SYNC_TOKEN", "")
SOURCE_REPO = "LucielAI/anime-database"
TARGET_REPO = "LucielAI/Animearchive.app"
TARGET_BRANCH = os.environ.get("TARGET_BRANCH", "main")
DRY_RUN = os.environ.get("DRY_RUN", "true").lower() == "true"
FORCE_PUSH = os.environ.get("FORCE_PUSH", "false").lower() == "true"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
ALLOWLIST = os.path.join(REPO_ROOT, "release", "public-allowlist.txt")
DENYLIST = os.path.join(REPO_ROOT, "release", "public-denylist.txt")

#── Git helpers ─────────────────────────────────────────────────
def git_show(path, sha):
    result = subprocess.run(
        ["git", "show", f"{sha}:{path}"],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    if result.returncode != 0:
        return None
    return result.stdout

def git_ls_tree(sha):
    result = subprocess.run(
        ["git", "ls-tree", "-r", "--name-only", sha],
        capture_output=True, text=True, cwd=REPO_ROOT
    )
    if result.returncode != 0 or not result.stdout.strip():
        # Fallback: git show
        result = subprocess.run(
            ["git", "show", "--recursive", "--name-only", sha],
            capture_output=True, text=True, cwd=REPO_ROOT
        )
        if result.returncode != 0:
            return []
        return [l for l in result.stdout.splitlines() if l and not l.startswith("sha256")]
    return [l for l in result.stdout.splitlines() if l]

#── GitHub API ──────────────────────────────────────────────────
def api(method, path, data=None):
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }
    body = json.dumps(data).encode() if data else None
    req = Request(url, method=method, data=body, headers=headers)
    try:
        with urlopen(req) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        print(f"API ERROR {e.code}: {error_body[:500]}", file=sys.stderr)
        raise

#── Load patterns ───────────────────────────────────────────────
def load_patterns(path):
    patterns = []
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    patterns.append(line)
    return patterns

def matches_patterns(path, patterns):
    for p in patterns:
        if p.endswith("/"):
            prefix = p.rstrip("/")
            if path == prefix or path.startswith(prefix + "/"):
                return True
        elif "^" in p:
            import re
            if re.match(p, path):
                return True
        else:
            if path == p:
                return True
    return False

#── Main ───────────────────────────────────────────────────────
print("=" * 50)
print("   Promote: Private → Public")
print("=" * 50)
print(f"Source SHA:  {subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()}")
print(f"Target:      {TARGET_REPO} @ {TARGET_BRANCH}")
print(f"Dry run:     {DRY_RUN}")
print()

if not TOKEN:
    print("ERROR: PUBLIC_REPO_SYNC_TOKEN not set")
    sys.exit(1)

source_sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, cwd=REPO_ROOT).stdout.strip()
files = git_ls_tree(source_sha)
print(f"Source files: {len(files)}")

# Load denylist
deny_patterns = load_patterns(DENYLIST)
allow_patterns = load_patterns(ALLOWLIST)

# Check denylist violations
violations = [f for f in files if matches_patterns(f, deny_patterns)]
if violations:
    print(f"\nDENYLIST VIOLATIONS ({len(violations)}):")
    for v in violations[:10]:
        print(f"  REMOVE: {v}")
    sys.exit(1)
print("Denylist: clean")

# Apply allowlist
promoted = [f for f in files if matches_patterns(f, allow_patterns)]
print(f"Files to promote: {len(promoted)}")

if not promoted:
    print("ERROR: No files matched allowlist")
    sys.exit(1)

if DRY_RUN:
    print("\n--- DRY RUN: Would promote ---")
    for f in promoted[:20]:
        print(f"  {f}")
    if len(promoted) > 20:
        print(f"  ... and {len(promoted) - 20} more")
    sys.exit(0)

# Get target repo info
print(f"\nFetching target repo {TARGET_REPO}...")
target_info = api("GET", f"/repos/{TARGET_REPO}")
target_default = target_info.get("default_branch", "main")
print(f"Target default branch: {target_default}")

# Get current target tree
print("Fetching target tree...")
target_tree_data = api("GET", f"/repos/{TARGET_REPO}/git/trees/{target_default}?recursive=1")
target_files = {f["path"]: f["sha"] for f in target_tree_data.get("tree", []) if f["type"] == "blob"}

# Create blobs for source files
print(f"Creating {len(promoted)} blobs...")
blobs = {}
for i, file in enumerate(promoted):
    content = git_show(file, source_sha)
    if content is None:
        print(f"  SKIP (can't read): {file}")
        continue
    encoded = base64.b64encode(content.encode()).decode()
    blob = api("POST", f"/repos/{TARGET_REPO}/git/blobs", {
        "content": encoded,
        "encoding": "base64"
    })
    blobs[file] = blob["sha"]
    if (i + 1) % 20 == 0:
        print(f"  ... {i+1}/{len(promoted)} blobs created")

print(f"Created {len(blobs)} blobs")

# Build new tree
tree_items = [{"path": f, "mode": "100644", "type": "blob", "sha": sha} for f, sha in blobs.items()]
new_tree = api("POST", f"/repos/{TARGET_REPO}/git/trees", {
    "tree": tree_items,
    "base_tree": target_tree_data.get("sha")
})
print(f"New tree: {new_tree['sha']}")

# Create commit
source_short = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=REPO_ROOT).stdout.strip()
commit_msg = f"""Promote from {SOURCE_REPO} @ {source_short}

Files promoted: {len(promoted)}
Source commit: {source_sha}
Promoted by: GitHub Actions promote-public.yml"""

# Get current target commit SHA
target_ref = api("GET", f"/repos/{TARGET_REPO}/git/refs/heads/{target_default}")
target_commit_sha = target_ref["object"]["sha"]

new_commit = api("POST", f"/repos/{TARGET_REPO}/git/commits", {
    "message": commit_msg,
    "tree": new_tree["sha"],
    "parents": [target_commit_sha]
})
print(f"New commit: {new_commit['sha']}")

# Update ref
update_result = api("PUT", f"/repos/{TARGET_REPO}/git/refs/heads/{target_default}", {
    "sha": new_commit["sha"],
    "force": FORCE_PUSH
})

print()
print("=" * 50)
print(f"SUCCESS: Promoted {len(promoted)} files to {TARGET_REPO}")
print(f"Commit: {new_commit['sha']}")
print("=" * 50)
