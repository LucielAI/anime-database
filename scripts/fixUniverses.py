#!/usr/bin/env python3
"""Comprehensive universe validator and fixer."""
import json
import os
import re

BASE = '/data/workspace/anime-database/src/data'

# Valid values
VALID_SEVERITIES = {'low', 'medium', 'high', 'fatal'}
VALID_HINTS = {'node-graph', 'counter-tree', 'timeline', 'standard-cards', 'network'}
VALID_VIZ_HINTS = {'node-graph', 'counter-tree', 'timeline', 'standard-cards', 'network'}
VALID_TAB_INDICES = {0, 1, 2, 3}
VALID_SYSTEM_ROLES = {'protagonist', 'rival', 'mentor', 'ally', 'antagonist', 'villain', 'anti-hero', 'strategist', 'guardian', 'leader', 'combat-specialist', 'information-monopoly', 'stabilizer', 'command-node', 'market-leader', 'institutional-monopoly', 'high-value-target', 'world-threat', 'authority', 'noble', 'narrative-device', 'meta', 'system-threat'}
TAILWIND_COLORS = {'red','orange','yellow','green','teal','cyan','blue','indigo','purple','pink','gray','slate','white','black','stone','amber','violet','fuchsia','lime','emerald','sky','neutral','rose','fuchsite'}
GRADIENT_TOKENS = {f'{c}-{shade}' for c in TAILWIND_COLORS for shade in range(100, 1000, 100)}

REQUIRED_CHAR_FIELDS = ['name', 'title', 'rank', 'dangerLevel', 'loreBio', 'systemBio', 
                          'gradientFrom', 'gradientTo', 'accentColor', 'icon', 'signatureMoment',
                          'imageUrl', 'malId', 'systemRole', 'classificationTag', 'keyAbility']
REQUIRED_THEME_KEYS = ['primary','secondary','accent','glow','tabActive','badgeBg','badgeText','modeGlow','heroGradient']

def load_json(path):
    with open(path) as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved: {path}")

def check_gradient(val, field):
    if val in {'white', 'black'}:
        return {'white': 'gray-100', 'black': 'stone-900'}.get(val, val)
    if '-' not in str(val):
        return val
    parts = str(val).split('-')
    if len(parts) >= 2:
        color = parts[0]
        shade = parts[-1]
        if color in TAILWIND_COLORS and shade.isdigit():
            return f"{color}-{shade}"
    return val

def validate_universe(path):
    errors = []
    warnings = []
    data = load_json(path)
    slug = os.path.basename(path).replace('.core.json','')
    
    # Top-level checks
    for f in ['anime','tagline','malId','visualizationHint','visualizationReason','themeColors','powerSystem','rankings','factions','rules','characters','relationships','hero','aiInsights']:
        if f not in data or data[f] is None:
            errors.append(f"Missing top-level field: {f}")
    
    if 'themeColors' in data and data['themeColors']:
        for k in REQUIRED_THEME_KEYS:
            if k not in data['themeColors']:
                errors.append(f"Missing themeColors key: {k}")
    
    # themeColors values
    if 'themeColors' in data:
        for k, v in data['themeColors'].items():
            if k == 'glow' or k == 'modeGlow' or k == 'heroGradient':
                if not str(v).startswith('rgba') and not str(v).startswith('rgb'):
                    warnings.append(f"themeColors.{k} = {v} (expected rgba/rgb)")
            elif k == 'primary' or k == 'secondary' or k == 'accent':
                pass # hex ok for these
    
    # aiInsights
    if 'aiInsights' in data:
        for k in ['casual', 'deep']:
            if k not in data['aiInsights']:
                errors.append(f"Missing aiInsights.{k}")
    
    # hero
    if 'hero' in data:
        for f in ['systemType', 'microHook', 'thesis', 'primarySystemType']:
            if f not in data['hero']:
                errors.append(f"Missing hero.{f}")
        if 'thesis' in data['hero'] and len(data['hero']['thesis']) > 140:
            errors.append(f"hero.thesis too long ({len(data['hero']['thesis'])} chars, max 140)")
    
    # powerSystem
    if 'powerSystem' in data:
        for i, ps in enumerate(data['powerSystem']):
            for f in ['name','subtitle','loreDesc','systemDesc','icon','color','signatureMoment','loreSubtitle','systemSubtitle']:
                if f not in ps:
                    errors.append(f"powerSystem[{i}].{f}")
    
    # rankings
    if 'rankings' in data:
        for f in ['systemName','topTierName','topTierLore','topTierSystem','tiers']:
            if f not in data['rankings']:
                errors.append(f"Missing rankings.{f}")
    
    # factions
    if 'factions' in data:
        for i, fa in enumerate(data['factions']):
            for f in ['name','loreDesc','systemDesc','icon','color']:
                if f not in fa:
                    errors.append(f"factions[{i}].{f}")
    
    # rules
    if 'rules' in data:
        for i, r in enumerate(data['rules']):
            for f in ['name','loreDesc','systemDesc','loreConsequence','systemEquivalent','severity','loreSubtitle','systemSubtitle']:
                if f not in r:
                    errors.append(f"rules[{i}].{f}")
            if r.get('severity') not in VALID_SEVERITIES:
                errors.append(f"rules[{i}].severity = {r.get('severity')} (not in {VALID_SEVERITIES})")
    
    # characters
    if 'characters' in data:
        for i, c in enumerate(data['characters']):
            for f in REQUIRED_CHAR_FIELDS:
                if f not in c:
                    errors.append(f"character[{i}] ({c.get('name','?')}).{f}")
            # gradient fixes
            if c.get('gradientFrom'):
                c['gradientFrom'] = check_gradient(c['gradientFrom'], 'gradientFrom')
            if c.get('gradientTo'):
                c['gradientTo'] = check_gradient(c['gradientTo'], 'gradientTo')
            # imageUrl
            if not c.get('imageUrl'):
                c['imageUrl'] = None
                c['_fetchFailed'] = True
    
    # relationships
    if 'relationships' in data:
        for i, rel in enumerate(data['relationships']):
            for f in ['source','target','type','loreDesc','systemDesc','weight','systemEdgeType']:
                if f not in rel:
                    errors.append(f"relationships[{i}].{f}")
            if rel.get('type') not in {'ally','enemy','neutral'}:
                errors.append(f"relationships[{i}].type = {rel.get('type')}")
    
    # For node-graph and counter-tree: counterplay, causalEvents, anomalies, systemQuestions
    hint = data.get('visualizationHint','')
    if hint in {'node-graph', 'counter-tree'}:
        for arr_name, req_items in [('counterplay',6), ('causalEvents',2), ('anomalies',1), ('systemQuestions',4)]:
            if arr_name not in data or len(data.get(arr_name,[])) < req_items:
                warnings.append(f"{arr_name} has {len(data.get(arr_name,[]))} items (expected {req_items}+)")
            if arr_name in data:
                for item in data[arr_name]:
                    if arr_name == 'counterplay':
                        for f in ['id','attacker','defender','mechanic','loreDesc','systemDesc','loreSubtitle','systemSubtitle']:
                            if f not in item:
                                errors.append(f"{arr_name}[*].{f}")
                    elif arr_name == 'causalEvents':
                        for f in ['id','name','trigger','consequence','timelinePosition','loreDesc','systemDesc','loreSubtitle','systemSubtitle']:
                            if f not in item:
                                errors.append(f"{arr_name}[*].{f}")
                    elif arr_name == 'anomalies':
                        for f in ['name','loreDesc','systemDesc','impact','ruleViolated','loreSubtitle','systemSubtitle']:
                            if f not in item:
                                errors.append(f"{arr_name}[*].{f}")
    
    # For timeline: causalEvents, counterplay, anomalies, systemQuestions
    if hint == 'timeline':
        for arr_name, req_items in [('counterplay',2), ('causalEvents',2), ('anomalies',1), ('systemQuestions',4)]:
            if arr_name not in data or len(data.get(arr_name,[])) < req_items:
                warnings.append(f"{arr_name} has {len(data.get(arr_name,[]))} items (expected {req_items}+)")
            if arr_name in data:
                for item in data[arr_name]:
                    if arr_name == 'counterplay':
                        for f in ['id','attacker','defender','mechanic','loreDesc','systemDesc','loreSubtitle','systemSubtitle']:
                            if f not in item:
                                errors.append(f"{arr_name}[*].{f}")
                    elif arr_name == 'causalEvents':
                        for f in ['id','name','trigger','consequence','timelinePosition','loreDesc','systemDesc','loreSubtitle','systemSubtitle']:
                            if f not in item:
                                errors.append(f"{arr_name}[*].{f}")
                    elif arr_name == 'anomalies':
                        for f in ['name','loreDesc','systemDesc','impact','ruleViolated','loreSubtitle','systemSubtitle']:
                            if f not in item:
                                errors.append(f"{arr_name}[*].{f}")
    
    return errors, warnings, data

def main():
    slugs = [
        'onepiece', 'naruto', 'mobpsycho100', 'rezero', 'overlord',
        'fireforce', 'tokyo_revengers', 'bleach', 'blackclover', 'parasyte'
    ]
    
    all_errors = {}
    all_warnings = {}
    
    for slug in slugs:
        path = f"{BASE}/{slug}.core.json"
        print(f"\n{'='*60}")
        print(f"VALIDATING: {slug}")
        errors, warnings, data = validate_universe(path)
        if errors:
            print(f"  ERRORS ({len(errors)}):")
            for e in errors[:10]:
                print(f"    - {e}")
            all_errors[slug] = errors
        else:
            print(f"  OK - no errors")
        if warnings:
            print(f"  WARNINGS ({len(warnings)}):")
            for w in warnings[:5]:
                print(f"    ~ {w}")
            all_warnings[slug] = warnings
        save_json(path, data)
    
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"  Universes with errors: {len(all_errors)}")
    for slug, errs in all_errors.items():
        print(f"    {slug}: {len(errs)} errors")
    print(f"  Universes with warnings: {len(all_warnings)}")
    for slug, warns in all_warnings.items():
        print(f"    {slug}: {len(warns)} warnings")

if __name__ == '__main__':
    main()
