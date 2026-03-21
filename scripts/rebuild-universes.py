#!/usr/bin/env python3
"""Rebuild corrupted universe files from Jikan API."""
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
    'fireforce': {
        'mal_id': 38671,
        'visualizationHint': 'timeline',
        'tagline': 'A combustion economy where burning humans powers civilization — and the only solution is to break the loop.',
        'visualizationReason': 'Fire Force is a causal loop system: the Great Cataclysm causes the combustion crisis, which causes the attempted prevention, which IS the cause. Only a timeline view captures this self-sealing structure.',
        'headerFlavor': {
            'loreQuote': 'The world burns because it was designed to burn. We\'re just the matches.',
            'sysWarning': '// [SYS_OP]: COMBUSTION ECONOMY ACTIVE — ADOLLA BURST PROPAGATION IN PROGRESS',
            'sysWarningColor': 'orange'
        },
        'hero': {
            'systemType': 'timeline',
            'microHook': 'The cataclysm is already happening — we\'ve just been inside it.',
            'thesis': 'The combustion economy is a causal loop: the crisis, the response, and the cause are the same event.',
            'primarySystemType': 'core_laws'
        },
        'gradientTo': 'orange-900',
        'themeColors': {
            'primary': '#f97316', 'secondary': '#1f2937', 'accent': '#fb923c',
            'glow': 'rgba(249,115,22,0.3)', 'tabActive': '#f97316',
            'badgeBg': 'rgba(249,115,22,0.15)', 'badgeText': '#fed7aa',
            'modeGlow': 'rgba(251,146,60,0.25)', 'heroGradient': 'rgba(15,23,42,0.92)'
        },
        'powerSystems': [
            {'name': 'Infernalization', 'subtitle': 'Human Combustion State', 'loreDesc': 'A city-wide phenomenon where humans spontaneously combust at age 25, their death powering the city\'s Adolla-linked energy grid.', 'systemDesc': 'A demographic drain system: citizens become fuel at a fixed age, creating a perpetual combustion economy dependent on human sacrifice.', 'icon': 'Flame', 'color': 'orange-500', 'signatureMoment': 'The Infernalization of the Haumea family members — where love ones become fuel.', 'loreSubtitle': 'Combustion Economy', 'systemSubtitle': 'Human Fuel Grid'},
            {'name': 'Black Flame', 'subtitle': 'Adolla-Linked Fire', 'loreDesc': 'The highest tier of fire-based attacks, black flames burn at temperatures that extinguish all other fire and ignore conventional resistance.', 'systemDesc': 'A thermal cascade system: black flame consumes the Adolla Burst energy directly, giving it an energy advantage over standard flames.', 'icon': 'Zap', 'color': 'gray-900', 'signatureMoment': 'Shinmon\'s black flame countering every other fire soldier.', 'loreSubtitle': 'Adolla Flame', 'systemSubtitle': 'Thermal Dominance'},
            {'name': 'Dragon\'s Jaw', 'subtitle': 'Evangelist\'s Combat Art', 'loreDesc': 'The Evangelist\'s unique fighting style, designed to counter the Holy Solfire Sol', 'systemDesc': 'A counter-kill system that exploits the Evangelist\'s ability to nullify opponent advantages.', 'icon': 'Shield', 'color': 'blue-400', 'signatureMoment': 'The Evangelist countering the Holy Solfire Sol\'s attacks.', 'loreSubtitle': 'Counter-Combat', 'systemSubtitle': 'Nullification'},
        ],
        'rules': [
            {'name': 'Infernalization Cannot Be Stopped', 'loreDesc': 'The combustion economy is self-reinforcing: solving it would collapse the power grid, so institutions have no incentive to stop it.', 'systemDesc': 'A perverse incentive structure: the solution is economically impossible.', 'loreSubtitle': 'Institutional Inertia', 'systemSubtitle': 'Perverse Incentives'},
            {'name': 'Adolla Burst Is the Cause and Cure', 'loreDesc': 'The Adolla Burst caused the combustion crisis and is the only known counter-agent.', 'systemDesc': 'A self-referential system: the crisis and the solution share the same substrate.', 'loreSubtitle': 'Adolla Paradox', 'systemSubtitle': 'Self-Reference'},
        ],
    },
    'tokyo_revengers': {
        'mal_id': 42249,
        'visualizationHint': 'timeline',
        'tagline': 'A temporal arbitrage mechanism where one man\'s loyalty rewrites gang economics — and every rewrite costs someone their future.',
        'visualizationReason': 'Tokyo Revengers is fundamentally a temporal feedback loop: each time leap changes the causal graph, creating new winners and losers in the gang hierarchy. Only a timeline renderer captures how intervention points cascade.',
        'headerFlavor': {
            'loreQuote': 'I\'m gonna save you, Mikey. No matter how many times I have to jump.',
            'sysWarning': '// [SYS_OP]: TIME LEAP PROTOCOL ACTIVE — PARADOXICAL INTERVENTION IN PROGRESS',
            'sysWarningColor': 'cyan'
        },
        'hero': {
            'systemType': 'timeline',
            'microHook': 'I can travel through time — but only by watching people die.',
            'thesis': 'Takemichi\'s time leaps are a loyalty cascade: each intervention redistributes gang power toward Mikey, but the cost is always someone\'s future.',
            'primarySystemType': 'factions'
        },
        'gradientTo': 'blue-900',
        'themeColors': {
            'primary': '#3b82f6', 'secondary': '#1f2937', 'accent': '#60a5fa',
            'glow': 'rgba(59,130,246,0.3)', 'tabActive': '#3b82f6',
            'badgeBg': 'rgba(59,130,246,0.15)', 'badgeText': '#bfdbfe',
            'modeGlow': 'rgba(96,165,250,0.25)', 'heroGradient': 'rgba(15,23,42,0.92)'
        },
        'powerSystems': [
            {'name': 'Time Leap', 'subtitle': 'Emotional-Trigger Temporal Jump', 'loreDesc': 'Takemichi can travel 12 years into the past by gripping someone\'s hand at the moment of their death — emotional contact required.', 'systemDesc': 'A point-intervention temporal system: can only jump to specific emotional anchor points, not arbitrary times.', 'icon': 'Clock', 'color': 'cyan-400', 'signatureMoment': 'Takemichi\'s first time leap, gripping Hina as she dies.', 'loreSubtitle': 'Emotional Anchor Jump', 'systemSubtitle': 'Point Intervention'},
            {'name': 'Mikey\'s Invincibility', 'subtitle': 'Dark Impulse Suppression', 'loreDesc': 'Mikey is the most powerful fighter in Tokyo, but his "dark impulse" makes him a ticking time bomb.', 'systemDesc': 'A latent-failure node: Mikey\'s capability ceiling is offset by a system-collapse risk that activates under specific triggers.', 'icon': 'Zap', 'color': 'red-400', 'signatureMoment': 'Mikey single-handedly defeating all of Toman\'s enemies.', 'loreSubtitle': 'Maximum Capability Node', 'systemSubtitle': 'Latent Collapse Risk'},
        ],
        'rules': [
            {'name': 'Time Leap Requires Emotional Connection', 'loreDesc': 'Takemichi can only leap by experiencing someone\'s future death through physical contact — he can\'t leap arbitrarily.', 'systemDesc': 'A constraint on temporal intervention: emotional proximity limits control.', 'loreSubtitle': 'Contact Dependency', 'systemSubtitle': 'Intervention Constraint'},
            {'name': 'Gang Loyalty Is the Currency', 'loreDesc': 'Each gang member\'s loyalty creates network stability — betrayal cascades destabilize the entire system.', 'systemDesc': 'A loyalty-weighted graph: gang strength is the sum of member commitment edges.', 'loreSubtitle': 'Loyalty Network', 'systemSubtitle': 'Graph Stability'},
        ],
    },
    'bleach': {
        'mal_id': 269,
        'visualizationHint': 'counter-tree',
        'tagline': 'A spiritual pressure hierarchy where reiatsu tier overrides all technique matchups — and the king always wins.',
        'visualizationReason': 'Bleach\'s combat system is a strict reiatsu dominance tree: superior spiritual pressure invalidates all lower-level abilities regardless of type matchup. The counter-tree maps how reiatsu tiers override technique-specific counters.',
        'headerFlavor': {
            'loreQuote': 'If you\'re going to be the light, you\'d better not get burned.',
            'sysWarning': '// [SYS_OP]: REIATSU DETECTION ACTIVE — SPIRITUAL PRESSURE HIERARCHY ENFORCED',
            'sysWarningColor': 'blue'
        },
        'hero': {
            'systemType': 'counterplay',
            'microHook': 'Your blade reflects your soul — know yourself to know your power.',
            'thesis': 'Bleach is a reiatsu-dictated combat economy: spiritual pressure hierarchy overrides all technique counters, and only by transcending the reiatsu ceiling can one challenge the system itself.',
            'primarySystemType': 'power_system'
        },
        'gradientTo': 'blue-900',
        'themeColors': {
            'primary': '#3b82f6', 'secondary': '#1e3a8a', 'accent': '#60a5fa',
            'glow': 'rgba(59,130,246,0.35)', 'tabActive': '#3b82f6',
            'badgeBg': 'rgba(59,130,246,0.15)', 'badgeText': '#bfdbfe',
            'modeGlow': 'rgba(96,165,250,0.25)', 'heroGradient': 'rgba(7,11,26,0.95)'
        },
        'powerSystems': [
            {'name': 'Zanpakuto', 'subtitle': 'Soul-Split Blade System', 'loreDesc': 'Each Shinigami\'s sword has a unique name and personality that defines their combat style — bankai unlocks maximum output.', 'systemDesc': 'A sealed-capability system: base state is restricted, bankai is the full power unlock, requiring soul-knowledge to activate.', 'icon': 'Sword', 'color': 'blue-400', 'signatureMoment': 'Ichigo\'s first Getsuga Tenshou.', 'loreSubtitle': 'Soul Blade', 'systemSubtitle': 'Sealed Capability'},
            {'name': 'Hollowfication', 'subtitle': 'Soul Corruption Power-Up', 'loreDesc': 'Shinigami who merge with Hollow powers gain enhanced abilities but risk losing their humanity.', 'systemDesc': 'A dual-state capability: corruption risk traded for power amplification, with Vizard representing stable hybrid nodes.', 'icon': 'Moon', 'color': 'purple-400', 'signatureMoment': 'Ichigo\'s Hollow mask first appearing against Ulquiorra.', 'loreSubtitle': 'Soul Corruption', 'systemSubtitle': 'Dual Capability'},
            {'name': 'Bankai', 'subtitle': 'Maximum Blade Release', 'loreDesc': 'The maximum output state of a Zanpakuto — using it drains significant spiritual energy and leaves the user vulnerable.', 'systemDesc': 'A high-cost ultimate: maximum combat capability at the cost of sustained energy reserves.', 'loreSubtitle': 'Full Release', 'systemSubtitle': 'High-Cost Ultimate'},
        ],
        'rules': [
            {'name': 'Reiatsu Dictates Combat Outcomes', 'loreDesc': 'In Bleach, superior Reiatsu effectively invalidates lower-level abilities — if your spiritual pressure is high enough, enemy attacks simply bounce off you.', 'systemDesc': 'A tier-skipping dominance rule: capability ceiling determines matchups more than specific ability matchups.', 'loreSubtitle': 'Spiritual Pressure Dominance', 'systemSubtitle': 'Tier Override'},
            {'name': 'Bankai Cannot Be Used Casually', 'loreDesc': 'Bankai is the maximum output state of a Zanpakuto — using it drains significant spiritual energy and leaves the user vulnerable.', 'systemDesc': 'A resource constraint on ultimate abilities: high-risk deployment limits strategic options.', 'loreSubtitle': 'Energy Drain', 'systemSubtitle': 'Resource Constraint'},
        ],
    },
    'blackclover': {
        'mal_id': 34572,
        'visualizationHint': 'counter-tree',
        'tagline': 'A mana-talent hierarchy where five-leaf corruption and anti-magic nullification define the ceiling — and Julius Novachrono\'s time magic sits above all.',
        'visualizationReason': 'Black Clover\'s combat system is defined by mana hierarchy and anti-magic nullification — the counter-tree maps how mana tier, anti-magic negation, and time dilation create a strict combat dominance ordering.',
        'headerFlavor': {
            'loreQuote': 'I\'ll show you what a man with nothing can do!',
            'sysWarning': '// [SYS_OP]: MANA DETECTION ACTIVE — GRIMOIRE CLASSIFICATION ENFORCED',
            'sysWarningColor': 'green'
        },
        'hero': {
            'systemType': 'counterplay',
            'microHook': 'No magic? No problem. I\'ll cut through it all.',
            'thesis': 'Black Clover\'s power ceiling is defined by mana capacity and anti-magic nullification — but the five-leaf grimoire and Julius\'s time magic represent system anomalies that transcend the normal hierarchy.',
            'primarySystemType': 'power_system'
        },
        'gradientTo': 'green-900',
        'themeColors': {
            'primary': '#22c55e', 'secondary': '#1f2937', 'accent': '#86efac',
            'glow': 'rgba(34,197,94,0.3)', 'tabActive': '#22c55e',
            'badgeBg': 'rgba(34,197,94,0.15)', 'badgeText': '#bbf7d0',
            'modeGlow': 'rgba(134,239,172,0.25)', 'heroGradient': 'rgba(15,23,42,0.92)'
        },
        'powerSystems': [
            {'name': 'Mana Zone', 'subtitle': 'Mana Sensing and Amplification', 'loreDesc': 'The highest level of magic control: surrounding yourself with mana to increase the power and precision of all spells beyond normal limits.', 'systemDesc': 'An environmental mana capture system that scales spell output by 10x through surrounding the caster with ambient mana.', 'icon': 'Sparkles', 'color': 'blue-400', 'signatureMoment': 'Yami achieving Mana Zone against the elf Licita.', 'loreSubtitle': 'Mana Sensing', 'systemSubtitle': 'Environmental Capture'},
            {'name': 'Anti-Magic', 'subtitle': 'Mana Nullification', 'loreDesc': 'Asta\'s five-leaf clover grimoire contains a devil named Liebe, granting him Anti-Magic — the ability to nullify all magic.', 'systemDesc': 'A permanent counter-capability: Anti-Magic cancels mana itself, not specific spells, giving zero-cancel against any magical opponent.', 'icon': 'Zap', 'color': 'gray-900', 'signatureMoment': 'Asta cancelling Ladros\'s magic attack.', 'loreSubtitle': 'Mana Nullification', 'systemSubtitle': 'Zero-Cancel'},
        ],
        'rules': [
            {'name': 'Mana Determines Magical Ceiling', 'loreDesc': 'The amount of mana a mage possesses directly determines their combat potential — those with more mana can overwhelm those with less regardless of skill.', 'systemDesc': 'A resource-capability correlation: mana volume = tier placement in the combat hierarchy.', 'loreSubtitle': 'Mana Hierarchy', 'systemSubtitle': 'Resource Dominance'},
            {'name': 'Anti-Magic Cancels All Magic', 'loreDesc': 'Asta\'s Anti-Magic doesn\'t counter specific spells — it nullifies the mana substrate itself.', 'systemDesc': 'A universal counter: capability ceiling removal against any magical opponent.', 'loreSubtitle': 'Mana Nullification', 'systemSubtitle': 'Universal Counter'},
        ],
    },
    'parasyte': {
        'mal_id': 22535,
        'visualizationHint': 'standard-cards',
        'tagline': 'A parasite-host symbiosis system where consciousness negotiation determines survival — and Gotou\'s economic efficiency outpaces violence.',
        'visualizationReason': 'Parasyte\'s core conflict is not combat but biological optimization: parasites and humans compete for the same resource (survival) through different strategies, with Gotou\'s economic approach being the ultimate threat.',
        'headerFlavor': {
            'loreQuote': 'I\'m Migi. And you\'re mine now.',
            'sysWarning': '// [SYS_OP]: PARASYTE DETECTION ACTIVE — CONSCIOUSNESS NEGOTIATION IN PROGRESS',
            'sysWarningColor': 'purple'
        },
        'hero': {
            'systemType': 'standard-cards',
            'microHook': 'Neither ally nor enemy — we simply share the same body.',
            'thesis': 'Parasyte\'s thesis is symbiosis vs. competition: Migi and Shinichi\'s cooperative relationship represents the only successful partial integration model, while Gotou\'s hive-mind represents the competitive optimum.',
            'primarySystemType': 'characters'
        },
        'gradientTo': 'purple-900',
        'themeColors': {
            'primary': '#a855f7', 'secondary': '#1f2937', 'accent': '#c084fc',
            'glow': 'rgba(168,85,247,0.3)', 'tabActive': '#a855f7',
            'badgeBg': 'rgba(168,85,247,0.15)', 'badgeText': '#e9d5ff',
            'modeGlow': 'rgba(192,132,252,0.25)', 'heroGradient': 'rgba(15,23,42,0.92)'
        },
        'powerSystems': [
            {'name': 'Parasite Physiology', 'subtitle': 'Body-Hijack Capable Organism', 'loreDesc': 'Parasytes are alien parasites that take over the right hand of hosts, granting enhanced physical capabilities.', 'systemDesc': 'A body-control system: the parasite replaces motor control of a specific body part, granting superhuman physical stats.', 'icon': 'Bug', 'color': 'purple-400', 'signatureMoment': 'Migi first manifesting to save Shinichi from the Yakuza.', 'loreSubtitle': 'Body Hijack', 'systemSubtitle': 'Physical Enhancement'},
            {'name': 'Migi Combat', 'subtitle': 'Parasite Combat Intelligence', 'loreDesc': 'Migi can analyze and counter other parasites\' biological attack patterns using his own parasite physiology.', 'systemDesc': 'A pattern-recognition combat system: real-time analysis of opponent biology to exploit weaknesses.', 'icon': 'Shield', 'color': 'red-400', 'signatureMoment': 'Migi analyzing Gotou\'s weaknesses mid-combat.', 'loreSubtitle': 'Bio-Analysis', 'systemSubtitle': 'Adaptive Combat'},
        ],
        'rules': [
            {'name': 'Parasites Need Hosts to Survive', 'loreDesc': 'Parasites cannot survive without a host body — they need human physiology to function in this world.', 'systemDesc': 'A dependency constraint: parasite capability requires host integration.', 'loreSubtitle': 'Host Dependency', 'systemSubtitle': 'Integration Requirement'},
            {'name': 'Symbiosis Is Economically Optimal', 'loreDesc': 'The Migi-Shinichi cooperative model produces better outcomes than competitive parasite approaches.', 'systemDesc': 'A cooperative advantage: partial integration outperforms both full-host-takeover and pure-competition models.', 'loreSubtitle': 'Symbiosis Advantage', 'systemSubtitle': 'Cooperative Optimality'},
        ],
    },
}

def build_universe(name, config, anime_data, char_data):
    img = anime_data.get('images', {}).get('jpg', {})
    anime_img = img.get('large_image_url') or img.get('image_url', '')

    # Build characters (top 8 by favorited)
    chars = sorted(char_data, key=lambda x: x.get('favorites', 0), reverse=True)[:8]
    characters = []
    for c in chars:
        role = c.get('role', 'supporting')
        img_url = c.get('images', {}).get('jpg', {}).get('image_url', '')
        characters.append({
            'name': c.get('name', 'Unknown'),
            'title': role.title(),
            'rank': 'Unknown',
            'dangerLevel': 5,
            'loreBio': f"{c.get('name', 'Unknown')} is a {role} character in {anime_data.get('title', name)}.",
            'systemRole': 'supporting' if role in ['supporting', 'background'] else ('protagonist' if role == 'main' else 'antagonist'),
            'classificationTag': 'Human' if role != 'antagonist' else 'Parasite',
            'animeImageUrl': img_url,
            'imageUrl': img_url if img_url else None,
            '_fetchFailed': False if img_url else True
        })

    # Build rankings
    rankings = {
        'systemName': f'{anime_data.get("title", name).title()} Power Hierarchy',
        'topTierName': 'Apex',
        'topTierLore': f'The supreme capability tier in {anime_data.get("title", name)}.',
        'topTierSystem': 'Maximum capability across all measured dimensions.',
        'tiers': [
            {'name': 'A-Tier', 'loreDesc': 'Exceptional capability holders with system-shaping influence.', 'systemDesc': 'Top-tier combat/economic nodes.'},
            {'name': 'B-Tier', 'loreDesc': 'Competent operators with meaningful impact potential.', 'systemDesc': 'Mid-tier capability nodes.'},
            {'name': 'C-Tier', 'loreDesc': 'Standard actors within the system.', 'systemDesc': 'Baseline capability nodes.'},
        ]
    }

    payload = {
        'anime': anime_data.get('title', name),
        'tagline': config['tagline'],
        'malId': config['mal_id'],
        'visualizationHint': config['visualizationHint'],
        'visualizationReason': config['visualizationReason'],
        'animeImageUrl': anime_img,
        'headerFlavor': config['headerFlavor'],
        'themeColors': config['themeColors'],
        'stats': {
            'characters': len(characters),
            'powerSystem': len(config['powerSystems']),
            'rules': len(config['rules'])
        },
        'hero': config['hero'],
        'powerSystem': config['powerSystems'],
        'rankings': rankings,
        'factions': [
            {'name': f'{anime_data.get("title", name).title()} Universe', 'loreDesc': 'The primary world of the story.', 'systemDesc': 'Central narrative environment.', 'icon': 'Globe', 'color': 'blue-400'}
        ],
        'rules': config['rules'],
        'characters': characters,
        'relationships': [
            {'source': characters[0]['name'] if len(characters) > 0 else 'Protagonist', 'target': characters[1]['name'] if len(characters) > 1 else 'Rival', 'type': 'ally', 'loreDesc': 'Primary cooperative relationship.', 'systemDesc': 'Core alliance network.'},
        ] if len(characters) > 1 else [],
        'counterplay': [
            {'id': f'{name[:2].upper()}-cp-1', 'attacker': config['powerSystems'][0]['name'], 'defender': 'Standard Opponents', 'mechanic': f'{config["powerSystems"][0]["name"]} dominates standard opponents through {config["powerSystems"][0]["systemSubtitle"].lower()}.', 'loreDesc': f'{config["powerSystems"][0]["name"]} proves superior against standard threats.', 'systemDesc': config['powerSystems'][0]['systemDesc'], 'loreSubtitle': config['powerSystems'][0]['loreSubtitle'], 'systemSubtitle': config['powerSystems'][0]['systemSubtitle']},
        ],
        'causalEvents': [
            {'id': f'{name[:2].upper()}-ce1', 'name': 'Story Begins', 'trigger': 'The inciting incident that sets the narrative in motion.', 'consequence': 'Protagonist is forced to engage with the system.', 'timelinePosition': 'Series start', 'loreDesc': 'The initial condition that creates the narrative premise.', 'systemDesc': 'A critical-path activation event.', 'loreSubtitle': 'Inciting Incident', 'systemSubtitle': 'System Activation'},
        ],
        'anomalies': [
            {'name': 'Unique Capability', 'loreDesc': 'The protagonist possesses a capability that transcends normal system rules.', 'systemDesc': f'A system anomaly: {config["hero"]["thesis"][:50]}...', 'impact': 'Creates asymmetric advantage against normal opponents.', 'ruleViolated': 'Standard capability hierarchy', 'loreSubtitle': 'System Anomaly', 'systemSubtitle': 'Transcendence'},
        ],
        'systemQuestions': [
            {'question': f'What makes {anime_data.get("title", name)}\'s system unique?', 'answer': f'{config["tagline"]}', 'tabIndex': 0},
        ],
        'gradientTo': config['gradientTo']
    }

    return payload

if __name__ == '__main__':
    for name, config in UNIVERSES.items():
        print(f'Building {name}...')
        anime_data, char_data = fetch_jikan(config['mal_id'])
        universe = build_universe(name, config, anime_data, char_data)
        
        fname = f'src/data/{name}.core.json'
        with open(fname, 'w') as f:
            json.dump(universe, f, indent=2, ensure_ascii=False)
        
        # Verify
        with open(fname) as f:
            json.load(f)
        print(f'  Wrote {fname} — VALID JSON')
