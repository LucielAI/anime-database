#!/usr/bin/env python3
"""Fix missing fields in universes."""
import json
import os

BASE = '/data/workspace/anime-database/src/data'

def load(path):
    with open(path) as f:
        return json.load(f)

def save(path, d):
    with open(path, 'w') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)

def fix_naruto():
    path = f"{BASE}/naruto.core.json"
    d = load(path)
    # counterplay[3] missing loreSubtitle
    if len(d.get('counterplay',[])) > 3:
        if 'loreSubtitle' not in d['counterplay'][3]:
            d['counterplay'][3]['loreSubtitle'] = "Susanoo vs Amaterasu Stalemate"
    # hero missing primarySystemType
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'power_engine'
    save(path, d)
    print("Fixed Naruto")

def fix_mobpsycho100():
    path = f"{BASE}/mobpsycho100.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'entity_db'
    save(path, d)
    print("Fixed Mob Psycho 100")

def fix_rezero():
    path = f"{BASE}/rezero.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'core_laws'
    save(path, d)
    print("Fixed Re:Zero")

def fix_overlord():
    path = f"{BASE}/overlord.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'entity_db'
    save(path, d)
    print("Fixed Overlord")

def fix_fireforce():
    path = f"{BASE}/fireforce.core.json"
    d = load(path)
    if len(d.get('counterplay',[])) > 1:
        if 'loreSubtitle' not in d['counterplay'][1]:
            d['counterplay'][1]['loreSubtitle'] = "Infernalization Cure"
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'core_laws'
    save(path, d)
    print("Fixed Fire Force")

def fix_tokyo_revengers():
    path = f"{BASE}/tokyo_revengers.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'factions'
    save(path, d)
    print("Fixed Tokyo Revengers")

def fix_bleach():
    path = f"{BASE}/bleach.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'power_engine'
    save(path, d)
    print("Fixed Bleach")

def fix_blackclover():
    path = f"{BASE}/blackclover.core.json"
    d = load(path)
    if len(d.get('counterplay',[])) > 1:
        if 'loreSubtitle' not in d['counterplay'][1]:
            d['counterplay'][1]['loreSubtitle'] = "Physical Combat Bypasses Anti-Magic"
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'power_engine'
    save(path, d)
    print("Fixed Black Clover")

def fix_parasyte():
    path = f"{BASE}/parasyte.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'entity_db'
    save(path, d)
    print("Fixed Parasyte")

def fix_onepiece():
    path = f"{BASE}/onepiece.core.json"
    d = load(path)
    if 'primarySystemType' not in d.get('hero',{}):
        d['hero']['primarySystemType'] = 'factions'
    save(path, d)
    print("Fixed One Piece")

fixes = [fix_naruto, fix_mobpsycho100, fix_rezero, fix_overlord, fix_fireforce,
         fix_tokyo_revengers, fix_bleach, fix_blackclover, fix_parasyte, fix_onepiece]

for f in fixes:
    try:
        f()
    except Exception as e:
        print(f"ERROR in {f.__name__}: {e}")

print("\nAll fixes applied.")
