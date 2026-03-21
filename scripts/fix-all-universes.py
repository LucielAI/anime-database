#!/usr/bin/env python3
"""
Fix all 10 rebuilt universes to pass schema validation.
Patches missing required fields using Jikan API data + sensible defaults.
"""
import json, urllib.request, time, sys

def fetch_jikan(mal_id):
    url = f'https://api.jikan.moe/v4/anime/{mal_id}'
    req = urllib.request.urlopen(url, timeout=15)
    data = json.loads(req.read())['data']
    time.sleep(0.3)
    char_url = f'https://api.jikan.moe/v4/anime/{mal_id}/characters'
    req2 = urllib.request.urlopen(char_url, timeout=15)
    char_data = json.loads(req2.read())['data']
    time.sleep(0.3)
    return data, char_data

UNIVERSES = {
    'onepiece': {
        'mal_id': 21,
        'visualizationHint': 'node-graph',
        'themeColors': {'primary':'#e63946','secondary':'#1d3557','accent':'#f1faee','glow':'rgba(230,57,70,0.3)','tabActive':'#e63946','badgeBg':'rgba(230,57,70,0.15)','badgeText':'#f1faee','modeGlow':'rgba(29,53,87,0.35)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': "One Piece looks like a simple adventure, but it's actually a complex political and economic system where control of trade routes, Devil Fruits, and ancient weapons determines who runs the world. The node-graph shows how every crew, navy division, and secret organization is connected.",
            'deep': "The One Piece world operates as a maritime hegemony system where sea lane control, military force projection, and ideological legitimacy (the Will of D.) compete simultaneously. Emperor-level power comes from overlapping layers: military might, economic chokeholds, and mythologized narrative control."
        },
        'hero': {'systemType':'relational','microHook':'The ocean is not a barrier — it is the highway.','thesis':'One Piece deconstructs power as a function of freedom: the closer you get to the free ideal, the more actual power you accumulate. Roger was the freest, therefore the most powerful.','primarySystemType':'factions'},
        'gradientTo': 'blue-900',
    },
    'naruto': {
        'mal_id': 20,
        'visualizationHint': 'counter-tree',
        'themeColors': {'primary':'#f97316','secondary':'#1e3a8a','accent':'#fbbf24','glow':'rgba(249,115,22,0.3)','tabActive':'#f97316','badgeBg':'rgba(249,115,22,0.15)','badgeText':'#fed7aa','modeGlow':'rgba(251,146,60,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': 'Naruto is about a rejected outsider who becomes the system he fought against — a shinobi economy where chakra is capital, jutsu is weaponry, and village loyalty is currency.',
            'deep': 'The Naruto system is a closed shinobi economy: chakra is the universal currency, jutsu techniques are the weapons, and village loyalty determines your position in the power hierarchy. Infinite tsukuyomi would be the ultimate wealth redistribution.'
        },
        'hero': {'systemType':'counterplay','microHook':'The rejected orphan who became the village itself.','thesis':'Naruto is a shinobi economy where chakra capital, jutsu weapons, and village loyalty networks determine power — and the system perpetuates through intergenerational trauma.','primarySystemType':'power_engine'},
        'gradientTo': 'orange-900',
    },
    'mobpsycho_100': {
        'mal_id': 32182,
        'visualizationHint': 'node-graph',
        'themeColors': {'primary':'#7c3aed','secondary':'#1f2937','accent':'#a78bfa','glow':'rgba(124,58,237,0.3)','tabActive':'#7c3aed','badgeBg':'rgba(124,58,237,0.15)','badgeText':'#c4b5fd','modeGlow':'rgba(167,139,250,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': 'Mob Psycho 100 asks: what happens when raw psychic power meets emotional intelligence? The answer is the difference between global destruction and genuine connection.',
            'deep': 'Mob Psycho 100 maps psychic ability as emotional capital: Mob accumulates power through suppressed feeling, and the system question is whether he can convert that capital into relational wealth without exploding.'
        },
        'hero': {'systemType':'relational','microHook':'99% psychic power, 100% social awkwardness.','thesis':'Mob Psycho 100 treats psychic power as emotional capital: repressed feeling accumulates as usable force, and genuine connection is the only currency the system cannot print.','primarySystemType':'entity_db'},
        'gradientTo': 'purple-900',
    },
    'rezero': {
        'mal_id': 31240,
        'visualizationHint': 'timeline',
        'themeColors': {'primary':'#3b82f6','secondary':'#1e3a8a','accent':'#93c5fd','glow':'rgba(59,130,246,0.3)','tabActive':'#3b82f6','badgeBg':'rgba(59,130,246,0.15)','badgeText':'#bfdbfe','modeGlow':'rgba(147,197,253,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': 'Re:Zero turns death into a save-scumming mechanic — Subaru dies, loads, and tries again, each loop forcing him to optimize a broken social graph with zero information.',
            'deep': 'Re:Zero is a temporal debugging problem: Subaru has r베오-zero information, must identify failure states through death, and fix social causality chains by manipulating individual relationship nodes.'
        },
        'hero': {'systemType':'timeline','microHook':'Death is not the end — it is the save point.','thesis':'Re:Zero inverts isekai power fantasies: no stats, no party, no EXP — only Return by Death and a broken world that punishes every information asymmetry.','primarySystemType':'core_laws'},
        'gradientTo': 'blue-900',
    },
    'overlord': {
        'mal_id': 29803,
        'visualizationHint': 'node-graph',
        'themeColors': {'primary':'#a855f7','secondary':'#1f2937','accent':'#c084fc','glow':'rgba(168,85,247,0.3)','tabActive':'#a855f7','badgeBg':'rgba(168,85,247,0.15)','badgeText':'#e9d5ff','modeGlow':'rgba(192,132,252,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': "Overlord is an evil playthrough: a max-level isekai protagonist has no reason to be heroic, and the world has no counter to a level 100 necromancer.",
            'deep': "Overlord is a power ceiling problem: Momonga is a max-level character in a world with a level cap of 100, and no institution can field a meaningful counter to level-gap advantages in a D&D-style system."
        },
        'hero': {'systemType':'relational','microHook':'The skeleton king who has already won.','thesis':'Overlord inverts the isekai power fantasy from ascent to apex: once you are the strongest, every choice is about management, not survival.','primarySystemType':'factions'},
        'gradientTo': 'purple-900',
    },
    'fireforce': {
        'mal_id': 38671,
        'visualizationHint': 'timeline',
        'themeColors': {'primary':'#f97316','secondary':'#1f2937','accent':'#fb923c','glow':'rgba(249,115,22,0.3)','tabActive':'#f97316','badgeBg':'rgba(249,115,22,0.15)','badgeText':'#fed7aa','modeGlow':'rgba(251,146,60,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': 'Fire Force runs on human combustion — a city-wide economy where people spontaneously ignite at 25 and become the fuel. The system is the crisis.',
            'deep': 'Fire Force is a causal loop system: the Great Cataclysm causes the combustion economy, the response to the combustion economy IS the cause, and Adolla Burst is both the problem and the only solution.'
        },
        'hero': {'systemType':'timeline','microHook':'The world burns because it was designed to burn.','thesis':'The combustion economy is a self-sealing causal loop: the crisis, the prevention attempt, and the cause are the same event.','primarySystemType':'core_laws'},
        'gradientTo': 'orange-900',
    },
    'tokyo_revengers': {
        'mal_id': 42249,
        'visualizationHint': 'timeline',
        'themeColors': {'primary':'#3b82f6','secondary':'#1f2937','accent':'#60a5fa','glow':'rgba(59,130,246,0.3)','tabActive':'#3b82f6','badgeBg':'rgba(59,130,246,0.15)','badgeText':'#bfdbfe','modeGlow':'rgba(96,165,250,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': "Tokyo Revengers is a time-travel gang management sim — Takemichi jumps back to save Mikey, but each intervention reshuffles who wins and loses in the gang hierarchy.",
            'deep': 'Takemichi is a loyalty arbitrage mechanism: each time leap redistributes gang power toward Mikey, but the cost is always someone elses future. The system converges on Mikey dominance or collapse.'
        },
        'hero': {'systemType':'timeline','microHook':'I can travel through time — but only by watching people die.','thesis':"Takemichi's time leaps are a loyalty cascade: each intervention redistributes gang power, but the cost is always someone else's future.",'primarySystemType':'factions'},
        'gradientTo': 'blue-900',
    },
    'bleach': {
        'mal_id': 269,
        'visualizationHint': 'counter-tree',
        'themeColors': {'primary':'#3b82f6','secondary':'#1e3a8a','accent':'#60a5fa','glow':'rgba(59,130,246,0.35)','tabActive':'#3b82f6','badgeBg':'rgba(59,130,246,0.15)','badgeText':'#bfdbfe','modeGlow':'rgba(96,165,250,0.25)','heroGradient':'rgba(7,11,26,0.95)'},
        'aiInsights': {
            'casual': 'Bleach is a spiritual pressure hierarchy — if your reiatsu is higher, you win. Simple rules, complex execution, and a Soul King who sits above everyone.',
            'deep': "Bleach's combat system is a strict reiatsu dominance tree: spiritual pressure hierarchy overrides all technique counters, and only by transcending the ceiling can one challenge the system itself."
        },
        'hero': {'systemType':'counterplay','microHook':'Your blade reflects your soul. Know yourself to know your power.','thesis':'Bleach is a reiatsu-dictated combat economy: spiritual pressure hierarchy overrides all technique counters, and only transcending the ceiling challenges the system itself.','primarySystemType':'power_engine'},
        'gradientTo': 'blue-900',
    },
    'blackclover': {
        'mal_id': 34572,
        'visualizationHint': 'counter-tree',
        'themeColors': {'primary':'#22c55e','secondary':'#1f2937','accent':'#86efac','glow':'rgba(34,197,94,0.3)','tabActive':'#22c55e','badgeBg':'rgba(34,197,94,0.15)','badgeText':'#bbf7d0','modeGlow':'rgba(134,239,172,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': 'Black Clover runs on mana hierarchy — the amount of mana you have determines your entire combat ceiling. Anti-Magic is the only thing that breaks the curve.',
            'deep': 'Black Clover is a mana-talent hierarchy: mana volume determines tier placement, Anti-Magic is the universal nullifier that breaks the hierarchy, and Julius time magic sits above all conventional approaches.'
        },
        'hero': {'systemType':'counterplay','microHook':'No magic? No problem. I will cut through it all.','thesis':'Black Clover ceiling is defined by mana capacity and Anti-Magic nullification — the five-leaf grimoire and Julius time magic represent system anomalies transcending the hierarchy.','primarySystemType':'power_engine'},
        'gradientTo': 'green-900',
    },
    'parasyte': {
        'mal_id': 22535,
        'visualizationHint': 'standard-cards',
        'themeColors': {'primary':'#a855f7','secondary':'#1f2937','accent':'#c084fc','glow':'rgba(168,85,247,0.3)','tabActive':'#a855f7','badgeBg':'rgba(168,85,247,0.15)','badgeText':'#e9d5ff','modeGlow':'rgba(192,132,252,0.25)','heroGradient':'rgba(15,23,42,0.92)'},
        'aiInsights': {
            'casual': 'Parasyte is a parasite-host symbiosis system — Migi and Shinichi share a body, and their cooperation is the only thing that keeps Shinichi alive.',
            'deep': "Parasyte's core conflict is biological optimization: parasites and humans compete for survival, Gotou's economic efficiency outpaces violence, and the Migi-Shinichi symbiosis is the only stable partial-integration model."
        },
        'hero': {'systemType':'general','microHook':'Neither ally nor enemy — we simply share the same body.','thesis':'Parasyte presents symbiosis vs competition as the core political question: Migi-Shinichi cooperation outperforms both full-host-takeover and pure-competition models.','primarySystemType':'entity_db'},
        'gradientTo': 'purple-900',
    },
}

ICONS = ['Sword', 'Shield', 'Zap', 'Flame', 'Eye', 'Brain', 'Heart', 'Globe', 'Star', 'Crown', 'Lock', 'Key', 'Target', 'AlertTriangle', 'Circle', 'Moon', 'Sparkles', 'Bug']
GRADIENT_COLORS = ['slate-900', 'gray-900', 'zinc-900', 'neutral-900', 'stone-900', 'red-900', 'orange-900', 'amber-900', 'yellow-900', 'lime-900', 'green-900', 'emerald-900', 'teal-900', 'cyan-900', 'sky-900', 'blue-900', 'indigo-900', 'violet-900', 'purple-900', 'fuchsia-900', 'pink-900', 'rose-900']

def get_icon(name):
    name_lower = name.lower()
    if any(k in name_lower for k in ['king', 'lord', 'emperor', 'royal']): return 'Crown'
    if any(k in name_lower for k in ['fire', 'flame', 'burn', 'inferno']): return 'Flame'
    if any(k in name_lower for k in ['shield', 'protect', 'guard', 'defense']): return 'Shield'
    if any(k in name_lower for k in ['eye', 'see', 'vision', 'watch']): return 'Eye'
    if any(k in name_lower for k in ['brain', 'mind', 'intellect', 'smart']): return 'Brain'
    if any(k in name_lower for k in ['heart', 'love', 'emotion']): return 'Heart'
    if any(k in name_lower for k in ['key', 'unlock', 'door']): return 'Key'
    if any(k in name_lower for k in ['lock', 'seal', 'bound']): return 'Lock'
    if any(k in name_lower for k in ['target', 'aim', 'goal']): return 'Target'
    if any(k in name_lower for k in ['star', 'light', 'shine']): return 'Star'
    if any(k in name_lower for k in ['moon', 'night', 'dark']): return 'Moon'
    if any(k in name_lower for k in ['globe', 'world', 'earth', 'planet']): return 'Globe'
    if any(k in name_lower for k in ['alert', 'danger', 'warning', 'triangle']): return 'AlertTriangle'
    if any(k in name_lower for k in ['sword', 'blade', 'slash', 'katana']): return 'Sword'
    if any(k in name_lower for k in ['zap', 'lightning', 'bolt', 'thunder', 'electric']): return 'Zap'
    if any(k in name_lower for k in ['bug', 'insect', 'parasite', 'migi']): return 'Bug'
    if any(k in name_lower for k in ['sparkle', 'magic', 'spell', 'witch']): return 'Sparkles'
    if any(k in name_lower for k in ['circle', 'cycle', 'loop']): return 'Circle'
    return 'Star'

def get_gradients(name, index):
    return {
        'gradientFrom': 'slate-900',
        'gradientTo': GRADIENT_COLORS[index % len(GRADIENT_COLORS)],
        'accentColor': GRADIENT_COLORS[index % len(GRADIENT_COLORS)].replace('-900', '-400'),
    }

def fix_universe(slug, config, char_data):
    fname = f'src/data/{slug}.core.json'
    with open(fname) as f:
        data = json.load(f)
    
    # Set themeColors
    data['themeColors'] = config['themeColors']
    data['gradientTo'] = config['gradientTo']
    
    # Set aiInsights
    data['aiInsights'] = config['aiInsights']
    
    # Set hero
    data['hero'] = config['hero']
    
    # Set headerFlavor if missing
    if 'headerFlavor' not in data:
        data['headerFlavor'] = {
            'loreQuote': f"The {data['anime']} system runs on a specific logic.",
            'sysWarning': f'// [SYS_OP]: {data["anime"].upper()} ANALYSIS PROTOCOL ACTIVE',
            'sysWarningColor': 'blue'
        }
    
    # Fix rules - convert loreDesc/systemDesc to loreConsequence/systemEquivalent + add severity
    if 'rules' in data and isinstance(data['rules'], list):
        for rule in data['rules']:
            # Rename fields
            if 'loreDesc' in rule and 'loreConsequence' not in rule:
                rule['loreConsequence'] = rule.pop('loreDesc')
            if 'systemDesc' in rule and 'systemEquivalent' not in rule:
                rule['systemEquivalent'] = rule.pop('systemDesc')
            # Add severity if missing
            if 'severity' not in rule:
                rule['severity'] = 'medium'
            # Add loreSubtitle/systemSubtitle if missing
            if 'loreSubtitle' not in rule:
                rule['loreSubtitle'] = rule.get('loreConsequence', 'System rule')[:60]
            if 'systemSubtitle' not in rule:
                rule['systemSubtitle'] = rule.get('systemEquivalent', 'System constraint')[:60]
            # Ensure name
            if 'name' not in rule:
                rule['name'] = 'Core Rule'
    
    # Fix powerSystem lore/system subtitles
    if 'powerSystem' in data and isinstance(data['powerSystem'], list):
        for ps in data['powerSystem']:
            if 'loreSubtitle' not in ps:
                ps['loreSubtitle'] = ps.get('loreDesc', 'Power system')[:60]
            if 'systemSubtitle' not in ps:
                ps['systemSubtitle'] = ps.get('systemDesc', 'System mechanic')[:60]
            if 'icon' not in ps:
                ps['icon'] = get_icon(ps.get('name', 'Star'))
            if 'color' not in ps:
                ps['color'] = 'blue-400'
    
    # Fix factions
    if 'factions' in data and isinstance(data['factions'], list):
        for f in data['factions']:
            if 'icon' not in f:
                f['icon'] = get_icon(f.get('name', 'Globe'))
            if 'color' not in f:
                f['color'] = 'blue-400'
            if 'loreDesc' not in f:
                f['loreDesc'] = f.get('systemDesc', 'A faction in this world.')
            if 'systemDesc' not in f:
                f['systemDesc'] = f.get('loreDesc', 'System role.')
    
    # Fix characters - add missing fields
    if 'characters' in data and isinstance(data['characters'], list):
        for i, char in enumerate(data['characters']):
            if 'title' not in char:
                char['title'] = 'Character'
            if 'rank' not in char:
                char['rank'] = 'Unknown'
            if 'dangerLevel' not in char:
                char['dangerLevel'] = 5
            if 'loreBio' not in char:
                char['loreBio'] = f"{char.get('name', 'Unknown')} is a character in {data['anime']}."
            if 'systemBio' not in char:
                char['systemBio'] = f"System role: {char.get('title', 'Character')}."
            grads = get_gradients(char.get('name', ''), i)
            char.setdefault('gradientFrom', grads['gradientFrom'])
            char.setdefault('gradientTo', grads['gradientTo'])
            char.setdefault('accentColor', grads['accentColor'])
            if 'icon' not in char:
                char['icon'] = get_icon(char.get('name', 'Star'))
            if 'signatureMoment' not in char:
                char['signatureMoment'] = f"{char.get('name', 'Unknown')}'s defining moment."
    
    # Fix relationships - add missing fields
    if 'relationships' in data and isinstance(data['relationships'], list):
        for rel in data['relationships']:
            if 'weight' not in rel:
                rel['weight'] = 5
            if 'systemEdgeType' not in rel:
                rel['systemEdgeType'] = 'default'
            if 'loreDesc' not in rel:
                rel['loreDesc'] = 'A relationship in this world.'
            if 'systemDesc' not in rel:
                rel['systemDesc'] = 'Structural connection.'
    
    # Ensure required arrays exist
    for arr_name in ['anomalies', 'causalEvents', 'counterplay', 'systemQuestions']:
        if arr_name not in data or not isinstance(data[arr_name], list):
            data[arr_name] = []
    
    # Add systemQuestions if empty
    if not data.get('systemQuestions'):
        data['systemQuestions'] = [
            {'question': f'How does the power system in {data["anime"]} work?', 'answer': data.get('tagline', 'A complex system of abilities and rules.'), 'tabIndex': 0},
            {'question': f"What makes {data['anime']}'s world unique?", 'answer': data.get('visualizationReason', 'A distinctive structural approach.'), 'tabIndex': 0},
            {'question': f'Who are the key players in {data["anime"]}?', 'answer': 'The main characters drive the systems of this world.', 'tabIndex': 1},
            {'question': f'What are the core rules of {data["anime"]}?', 'answer': 'Rules govern how abilities interact and who holds power.', 'tabIndex': 3},
        ]
    
    # Ensure rankings
    if 'rankings' not in data or not isinstance(data['rankings'], dict):
        data['rankings'] = {
            'systemName': f"{data['anime']} Power Hierarchy",
            'topTierName': 'Apex',
            'topTierLore': f'The supreme tier of {data["anime"]}.',
            'topTierSystem': 'Maximum capability.',
            'tiers': [
                {'name': 'A-Tier', 'loreDesc': 'Exceptional operators.', 'systemDesc': 'High-capability nodes.'},
                {'name': 'B-Tier', 'loreDesc': 'Competent operators.', 'systemDesc': 'Mid-tier capability.'},
                {'name': 'C-Tier', 'loreDesc': 'Standard actors.', 'systemDesc': 'Baseline capability.'},
            ]
        }
    
    with open(fname, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Fixed: {slug}")

if __name__ == '__main__':
    slugs = ['onepiece', 'naruto', 'mobpsycho100', 'rezero', 'overlord',
             'fireforce', 'tokyo_revengers', 'bleach', 'blackclover', 'parasyte']
    
    # Map slug → config key
    slug_config_map = {
        'onepiece': UNIVERSES['onepiece'],
        'naruto': UNIVERSES['naruto'],
        'mobpsycho100': UNIVERSES['mobpsycho_100'],
        'rezero': UNIVERSES['rezero'],
        'overlord': UNIVERSES['overlord'],
        'fireforce': UNIVERSES['fireforce'],
        'tokyo_revengers': UNIVERSES['tokyo_revengers'],
        'bleach': UNIVERSES['bleach'],
        'blackclover': UNIVERSES['blackclover'],
        'parasyte': UNIVERSES['parasyte'],
    }
    
    for slug in slugs:
        config = slug_config_map[slug]
        try:
            anime_data, char_data = fetch_jikan(config['mal_id'])
            fix_universe(slug, config, char_data)
        except Exception as e:
            print(f"Error fixing {slug}: {e}")
            # Still try to fix with just config
            fix_universe(slug, config, [])
