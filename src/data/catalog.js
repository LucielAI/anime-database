export const preferredOrder = ['aot', 'jjk', 'chainsawman', 'demonslayer', 'hxh', 'vinlandsaga', 'steinsgate', 'deathnote', 'fmab', 'codegeass', 'mha', 'frieren', 'sololeveling', 'goblinslayer', 'mushokutensei', 'onepiece', 'naruto', 'mobpsycho100', 'rezero', 'overlord', 'fireforce', 'tokyo_revengers', 'bleach', 'blackclover', 'parasyte']

export const UNIVERSE_CATALOG = [
  {
    id: 'aot',
    anime: 'Attack on Titan',
    tagline: 'A brutal deterministic closed-loop temporal matrix',
    malId: 16498,
    visualizationHint: 'timeline',
    visualizationReason: 'Causality itself functions as the supreme power system; the timeline is a malleable battlespace.',
    animeImageUrl: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg',
    themeColors: { primary: '#6b7280', secondary: '#10b981', accent: '#ef4444', glow: 'rgba(107,114,128,0.35)', tabActive: '#6b7280', badgeBg: 'rgba(239,68,68,0.12)', badgeText: '#ef4444', modeGlow: 'rgba(16,185,129,0.25)', heroGradient: 'rgba(13,20,13,0.95)' },
    stats: { characters: 10, powerSystem: 4, rules: 4 }
  },
  {
    id: 'jjk', anime: 'Jujutsu Kaisen', tagline: 'Negative Energy Economy & Algorithmic Combat', malId: 40748, visualizationHint: 'counter-tree', visualizationReason: 'JJK is defined by technique counters and power hierarchies — the counter-tree maps how abilities nullify, exploit, and amplify each other.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg',
    themeColors: { primary: '#4f46e5', secondary: '#0f172a', accent: '#ef4444', glow: 'rgba(79, 70, 229, 0.4)', tabActive: '#818cf8', badgeBg: 'rgba(79, 70, 229, 0.2)', badgeText: '#c7d2fe', modeGlow: 'rgba(34, 197, 94, 0.5)', heroGradient: 'rgba(30, 27, 75, 0.95)' },
    stats: { characters: 10, powerSystem: 4, rules: 4 }
  },
  {
    id: 'chainsawman', anime: 'Chainsaw Man', tagline: 'A fear-fed devil economy where control networks weaponize trauma, contracts, and identity erasure.', malId: 44511, visualizationHint: 'node-graph', visualizationReason: 'Chainsaw Man is structurally a control web: fear flows into devils, contracts reroute agency, and Makima-centered dependency edges determine who can act, betray, or survive.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    themeColors: { primary: '#dc2626', secondary: '#0f172a', accent: '#f59e0b', glow: 'rgba(220,38,38,0.34)', tabActive: '#ef4444', badgeBg: 'rgba(15,23,42,0.56)', badgeText: '#fca5a5', modeGlow: 'rgba(245,158,11,0.28)', heroGradient: 'rgba(8,10,16,0.94)' },
    stats: { characters: 8, powerSystem: 4, rules: 4 }
  },
  {
    id: 'demonslayer', anime: 'Demon Slayer: Kimetsu no Yaiba', tagline: 'A nocturnal immortality network versus humans burning their own lifespan for solar-grade kill windows.', malId: 38000, visualizationHint: 'counter-tree', visualizationReason: 'Demon Slayer is fundamentally a kill-economy matchup system: each duel is decided by how breathing forms, blood arts, poison, sunlight constraints, and decapitation windows counter each other.', animeImageUrl: 'https://myanimelist.net/images/anime/1286/99889l.jpg',
    themeColors: { primary: '#dc2626', secondary: '#0f172a', accent: '#f59e0b', glow: 'rgba(220,38,38,0.30)', tabActive: '#ef4444', badgeBg: 'rgba(15,23,42,0.55)', badgeText: '#fca5a5', modeGlow: 'rgba(245,158,11,0.28)', heroGradient: 'rgba(2,6,23,0.93)' },
    stats: { characters: 10, powerSystem: 4, rules: 5 }
  },
  {
    id: 'hxh', anime: 'Hunter x Hunter', tagline: 'Contractual Power Economy & Asymmetric Information Warfare', malId: 11061, visualizationHint: 'node-graph', visualizationReason: 'HxH is defined by conditional alliances, asymmetric information, and binding contractual power — the node-graph maps the strategic web where every relationship is a potential betrayal vector.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1337/99013l.jpg',
    themeColors: { primary: '#059669', secondary: '#0f172a', accent: '#f59e0b', glow: 'rgba(5, 150, 105, 0.4)', tabActive: '#34d399', badgeBg: 'rgba(5, 150, 105, 0.2)', badgeText: '#6ee7b7', modeGlow: 'rgba(245, 158, 11, 0.5)', heroGradient: 'rgba(6, 45, 30, 0.95)' },
    stats: { characters: 11, powerSystem: 4, rules: 4 }
  },
  {
    id: 'vinlandsaga', anime: 'Vinland Saga', tagline: 'A deterministic economy of retributive violence', malId: 37521, visualizationHint: 'node-graph', visualizationReason: 'Because the universe\'s topology is defined by shifting strategic interdependence, profound mirror relationships, and the difficult severing of edges from the base violence economy.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1500/103005l.jpg',
    themeColors: { primary: '#d97706', secondary: '#dc2626', accent: '#f59e0b', glow: 'rgba(217,119,6,0.35)', tabActive: '#d97706', badgeBg: 'rgba(220,38,38,0.12)', badgeText: '#ef4444', modeGlow: 'rgba(220,38,38,0.25)', heroGradient: 'rgba(15,10,5,0.95)' },
    stats: { characters: 6, powerSystem: 4, rules: 3 }
  },
  {
    id: 'steinsgate', anime: 'Steins;Gate', tagline: 'A deterministic attractor-field prison where convergence cannot be outrun — only rewritten', malId: 9253, visualizationHint: 'timeline', visualizationReason: 'Steins;Gate is structurally defined by worldline divergence and attractor field convergence. Every meaningful event is a causal fork — D-Mails rewrite history, time leaps overwrite memory, and the entire plot is a single actor navigating a branching temporal graph toward an escape trajectory. The timeline renderer is the only lens that captures this.', animeImageUrl: 'https://myanimelist.net/images/anime/1935/127974l.jpg',
    themeColors: { primary: '#22d3ee', secondary: '#a855f7', accent: '#06b6d4', glow: 'rgba(34,211,238,0.35)', tabActive: '#22d3ee', badgeBg: 'rgba(168,85,247,0.12)', badgeText: '#a855f7', modeGlow: 'rgba(168,85,247,0.25)', heroGradient: 'rgba(8,12,20,0.95)' },
    stats: { characters: 8, powerSystem: 5, rules: 5 }
  },
  {
    id: 'deathnote', anime: 'Death Note', tagline: 'An asymmetric information war where anonymous execution power collides with probabilistic deanonymization — and psychology leaks what cryptography cannot', malId: 1535, visualizationHint: 'node-graph', visualizationReason: 'Death Note is structurally defined by relational interdependence — who controls whom, who knows what about whom, and how shifting alliances and proxy networks reshape the power graph. Every kill, investigation, and betrayal rewires the network. The node-graph renderer is the only lens that captures this web of manipulation, dependency, and counterintelligence.', animeImageUrl: 'https://myanimelist.net/images/anime/1079/138100l.jpg',
    themeColors: { primary: '#dc2626', secondary: '#1e1b4b', accent: '#ef4444', glow: 'rgba(220,38,38,0.35)', tabActive: '#dc2626', badgeBg: 'rgba(30,27,75,0.15)', badgeText: '#818cf8', modeGlow: 'rgba(220,38,38,0.25)', heroGradient: 'rgba(5,5,5,0.95)' },
    stats: { characters: 8, powerSystem: 3, rules: 5 }
  },
  {
    id: 'fmab', anime: 'Fullmetal Alchemist: Brotherhood', tagline: 'A closed thermodynamic system where every act of creation demands an equal destruction — and a 400-year parasite has been rigging the ledger from beneath the earth', malId: 5114, visualizationHint: 'node-graph', visualizationReason: 'FMAB is structurally defined by parasitic control networks — Father routes energy through a hidden layer beneath Amestris, homunculi enforce institutional dependency, and alchemists unknowingly operate on a hijacked grid. The node-graph renderer exposes who controls whom, which nodes bypass the firewall, and how the counter-network assembles to dismantle the parasite from within.', animeImageUrl: 'https://myanimelist.net/images/anime/1208/94745l.jpg',
    themeColors: { primary: '#d97706', secondary: '#991b1b', accent: '#fbbf24', glow: 'rgba(217,119,6,0.3)', tabActive: '#d97706', badgeBg: 'rgba(153,27,27,0.12)', badgeText: '#f59e0b', modeGlow: 'rgba(217,119,6,0.2)', heroGradient: 'rgba(5,5,10,0.92)' },
    stats: { characters: 9, powerSystem: 4, rules: 5 }
  },
  {
    id: 'codegeass', anime: 'Code Geass: Hangyaku no Lelouch', tagline: 'An occupied nation becomes a control-war between imperial hierarchy, masked insurgency, and a will-hacking anomaly that turns strategy into governance engineering.', malId: 1575, visualizationHint: 'node-graph', visualizationReason: 'Code Geass is a control-network story: Geass permissions, command chains, propaganda legitimacy, and betrayal edges continuously rewire who can issue orders and who obeys; node-graph most accurately surfaces that shifting authority topology.', animeImageUrl: 'https://myanimelist.net/images/anime/1032/135088l.jpg',
    themeColors: { primary: '#7c3aed', secondary: '#991b1b', accent: '#f43f5e', glow: 'rgba(124,58,237,0.35)', tabActive: '#a855f7', badgeBg: 'rgba(239,68,68,0.14)', badgeText: '#fda4af', modeGlow: 'rgba(168,85,247,0.22)', heroGradient: 'rgba(7,6,16,0.92)' },
    stats: { characters: 12, powerSystem: 3, rules: 6 }
  },
  {
    id: 'mha', anime: 'My Hero Academia', tagline: 'Mutating biological power collides with state-managed hero capitalism.', malId: 31964, visualizationHint: 'node-graph', visualizationReason: 'MHA is governed by control webs: HPSC policy routing, inherited and stolen Quirk chains, and ideological splinter networks that determine which nodes stabilize or collapse society.', animeImageUrl: 'https://myanimelist.net/images/anime/10/78745l.jpg',
    themeColors: { primary: '#0ea5e9', secondary: '#0f172a', accent: '#f97316', glow: 'rgba(14,165,233,0.35)', tabActive: '#38bdf8', badgeBg: 'rgba(14,165,233,0.18)', badgeText: '#bae6fd', modeGlow: 'rgba(249,115,22,0.42)', heroGradient: 'rgba(15,23,42,0.94)' },
    stats: { characters: 10, powerSystem: 4, rules: 6 }
  }  ,
  {
    id: 'frieren', anime: 'Sousou no Frieren', tagline: 'A post-war fantasy where mana deception, lifespan asymmetry, and visualization limits decide who survives.', malId: 52991, visualizationHint: 'timeline', visualizationReason: 'Frieren\'s core thesis is causal and longitudinal: Flamme\'s anti-demon doctrine, millennium-scale mana training, the Demon King\'s defeat, and current-era mage institutions all form a delayed-consequence chain that the timeline renderer explains best.', animeImageUrl: 'https://myanimelist.net/images/anime/1015/138006l.jpg',
    themeColors: { primary: '#0f766e', secondary: '#1e3a8a', accent: '#22d3ee', glow: 'rgba(34,211,238,0.3)', tabActive: '#14b8a6', badgeBg: 'rgba(15,118,110,0.18)', badgeText: '#67e8f9', modeGlow: 'rgba(20,184,166,0.26)', heroGradient: 'rgba(3,12,28,0.92)' },
    stats: { characters: 8, powerSystem: 4, rules: 5 }
  },
  {
    id: 'sololeveling', anime: 'Solo Leveling', tagline: 'A fixed-rank hunter economy is broken by one player running an infinite growth protocol.', malId: 52299, visualizationHint: 'node-graph', visualizationReason: 'Solo Leveling is defined by control links between cosmic factions, vessel inheritance, and gate-driven dependencies; the node graph best exposes who grants power, who exploits it, and how Jinwoo rewires the network.', animeImageUrl: 'https://myanimelist.net/images/anime/1801/142390l.jpg',
    themeColors: { primary: '#1d4ed8', secondary: '#0f172a', accent: '#a855f7', glow: 'rgba(59,130,246,0.35)', tabActive: '#3b82f6', badgeBg: 'rgba(15,23,42,0.55)', badgeText: '#bfdbfe', modeGlow: 'rgba(168,85,247,0.3)', heroGradient: 'rgba(2,6,23,0.94)' },
    stats: { characters: 8, powerSystem: 4, rules: 5 }
  },
  {
    id: 'goblinslayer', anime: 'Goblin Slayer', tagline: 'A low-prestige extermination niche becomes the hidden maintenance layer that keeps a fantasy civilization from collapsing.', malId: 37349, visualizationHint: 'node-graph', visualizationReason: 'Goblin Slayer is driven by dependency edges between frontier villages, guild bureaucracy, faith-casters, and specialist operators; the node graph best shows who supplies protection, who absorbs risk, and how trust links stabilize the system.', animeImageUrl: 'https://myanimelist.net/images/anime/1719/95621l.jpg',
    themeColors: { primary: '#065f46', secondary: '#111827', accent: '#b45309', glow: 'rgba(6,95,70,0.32)', tabActive: '#10b981', badgeBg: 'rgba(17,24,39,0.58)', badgeText: '#a7f3d0', modeGlow: 'rgba(180,83,9,0.3)', heroGradient: 'rgba(8,12,15,0.94)' },
    stats: { characters: 8, powerSystem: 4, rules: 5 }
  },
  {
    id: 'mushokutensei', anime: 'Mushoku Tensei: Jobless Reincarnation', tagline: 'A reincarnation-driven fate system where mana growth, bloodline factors, and looping causality decide civilization-scale outcomes.', malId: 39535, visualizationHint: 'timeline', visualizationReason: 'Mushoku Tensei is fundamentally a delayed-causality system: ancient god-war fallout, Laplace-era fragmentation, and present-era choices all compound across centuries, so the timeline renderer captures the thesis best.', animeImageUrl: 'https://myanimelist.net/images/anime/1530/117776l.jpg',
    themeColors: { primary: '#0f766e', secondary: '#1e293b', accent: '#7c3aed', glow: 'rgba(15,118,110,0.32)', tabActive: '#14b8a6', badgeBg: 'rgba(124,58,237,0.14)', badgeText: '#a78bfa', modeGlow: 'rgba(20,184,166,0.28)', heroGradient: 'rgba(4,14,27,0.94)' },
    stats: { characters: 10, powerSystem: 4, rules: 4 }
  }
],
  {
    id: 'onepiece',
    anime: 'One Piece',
    tagline: 'A world where ocean geography IS political economy, and whoever controls the seas controls civilization itself.',
    malId: 21,
    visualizationHint: 'node-graph',
    visualizationReason: 'One Piece is defined by shifting pirate alliances, faction dependencies, and geopolitical power grids — the node-graph maps how emperors, warlords, revolutionaries, and marines form, break, and rewire the world order.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1244/138851l.jpg',
    themeColors: { primary: '#1e40af', secondary: '#b91c1c', accent: '#f59e0b', glow: 'rgba(30,64,175,0.35)', tabActive: '#3b82f6', badgeBg: 'rgba(185,28,28,0.15)', badgeText: '#f87171', modeGlow: 'rgba(245,158,11,0.3)', heroGradient: 'rgba(5,10,25,0.94)' },
    stats: { characters: 9, powerSystem: 4, rules: 4 }
  },
  {
    id: 'naruto',
    anime: 'Naruto',
    tagline: 'A shinobi economy where chakra compounding, jutsu intellectual property, and village hierarchies determine civilization-scale outcomes.',
    malId: 20,
    visualizationHint: 'counter-tree',
    visualizationReason: 'Naruto is defined by jutsu counter relationships, elemental weaknesses, and power scaling hierarchies — the counter-tree maps how techniques nullify, amplify, or bypass each other in combat.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1141/142503l.jpg',
    themeColors: { primary: '#f97316', secondary: '#0f172a', accent: '#3b82f6', glow: 'rgba(249,115,22,0.35)', tabActive: '#fb923c', badgeBg: 'rgba(59,130,246,0.15)', badgeText: '#93c5fd', modeGlow: 'rgba(249,115,22,0.3)', heroGradient: 'rgba(15,23,42,0.94)' },
    stats: { characters: 9, powerSystem: 4, rules: 4 }
  },
  {
    id: 'mobpsycho100',
    anime: 'Mob Psycho 100',
    tagline: 'A psychic ecosystem where spiritual energy flows from trauma, belief structures weaponize into combat power, and true strength comes from emotional honesty.',
    malId: 32182,
    visualizationHint: 'node-graph',
    visualizationReason: 'Mob Psycho 100 is structurally a dependency web: esper organizations, body-thief parasites, cult followings, and ego networks create a topology where psychic power, corruption, and spiritual authority determine the entire graph structure.',
    animeImageUrl: 'https://myanimelist.net/images/anime/8/80356l.jpg',
    themeColors: { primary: '#ec4899', secondary: '#0f172a', accent: '#f472b6', glow: 'rgba(236,72,153,0.35)', tabActive: '#f472b6', badgeBg: 'rgba(236,72,153,0.15)', badgeText: '#fbcfe8', modeGlow: 'rgba(244,114,182,0.3)', heroGradient: 'rgba(15,23,42,0.94)' },
    stats: { characters: 6, powerSystem: 4, rules: 4 }
  },
  {
    id: 'rezero',
    anime: 'Re:Zero − Starting Life in Another World',
    tagline: 'A death-loop economy where checkpoint saves, information asymmetry, and trauma compounding create the ultimate strategic survival market.',
    malId: 31240,
    visualizationHint: 'timeline',
    visualizationReason: 'Re:Zero is defined by checkpoint-based causality, Return by Death loops, and delayed-consequence decision trees — the timeline renderer maps how choices propagate through parallel futures.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1522/128039l.jpg',
    themeColors: { primary: '#7c3aed', secondary: '#0f172a', accent: '#a855f7', glow: 'rgba(124,58,237,0.35)', tabActive: '#a855f7', badgeBg: 'rgba(124,58,237,0.15)', badgeText: '#d8b4fe', modeGlow: 'rgba(168,85,247,0.3)', heroGradient: 'rgba(15,23,42,0.94)' },
    stats: { characters: 8, powerSystem: 4, rules: 4 }
  },
  {
    id: 'overlord',
    anime: 'Overlord',
    tagline: 'A heteromorphic player\'s endgame audit: when the raid boss becomes the guild\'s only remaining member.',
    malId: 29803,
    visualizationHint: 'node-graph',
    visualizationReason: 'Overlord is defined by NPC servant networks, heteromorphic power hierarchies, and guild-fortress dependencies — the node-graph maps how Ainz controls, exploits, and strategically delegates through a network of loyal subordinates and rival factions.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1945/136600l.jpg',
    themeColors: { primary: '#7c3aed', secondary: '#0f172a', accent: '#fbbf24', glow: 'rgba(124,58,237,0.35)', tabActive: '#a78bfa', badgeBg: 'rgba(124,58,237,0.15)', badgeText: '#c4b5fd', modeGlow: 'rgba(251,191,36,0.3)', heroGradient: 'rgba(15,23,42,0.94)' },
    stats: { characters: 7, powerSystem: 4, rules: 4 }
  },
  {
    id: 'fireforce',
    anime: 'Enen no Shouboutai',
    tagline: 'A combustion economy where burning humans powers civilization — and the only solution is to break the loop.',
    malId: 38671,
    visualizationHint: 'timeline',
    visualizationReason: 'Fire Force is a causal loop system: the Great Cataclysm causes the combustion crisis, which causes the attempted prevention, which IS the cause. Only a timeline view captures this self-sealing structure.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1664/103275l.jpg',
    themeColors: { primary: '#f97316', secondary: '#1f2937', accent: '#fb923c', glow: 'rgba(249,115,22,0.3)', tabActive: '#f97316', badgeBg: 'rgba(249,115,22,0.15)', badgeText: '#fed7aa', modeGlow: 'rgba(251,146,60,0.25)', heroGradient: 'rgba(15,23,42,0.92)' },
    stats: { characters: 8, powerSystem: 3, rules: 2 }
  },
  {
    id: 'tokyo_revengers',
    anime: 'Tokyo Revengers',
    tagline: 'A temporal arbitrage mechanism where one man\'s loyalty rewrites gang economics — and every rewrite costs someone their future.',
    malId: 42249,
    visualizationHint: 'timeline',
    visualizationReason: 'Tokyo Revengers is fundamentally a temporal feedback loop: each time leap changes the causal graph, creating new winners and losers in the gang hierarchy. Only a timeline renderer captures how intervention points cascade.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1839/122012l.jpg',
    themeColors: { primary: '#3b82f6', secondary: '#1f2937', accent: '#60a5fa', glow: 'rgba(59,130,246,0.3)', tabActive: '#3b82f6', badgeBg: 'rgba(59,130,246,0.15)', badgeText: '#bfdbfe', modeGlow: 'rgba(96,165,250,0.25)', heroGradient: 'rgba(15,23,42,0.92)' },
    stats: { characters: 8, powerSystem: 2, rules: 2 }
  },
  {
    id: 'bleach',
    anime: 'Bleach',
    tagline: 'A spiritual pressure hierarchy where reiatsu tier overrides all technique matchups — and the king always wins.',
    malId: 269,
    visualizationHint: 'counter-tree',
    visualizationReason: 'Bleach\'s combat system is a strict reiatsu dominance tree: superior spiritual pressure invalidates all lower-level abilities regardless of type matchup. The counter-tree maps how reiatsu tiers override technique-specific counters.',
    animeImageUrl: 'https://myanimelist.net/images/anime/1541/147774l.jpg',
    themeColors: { primary: '#3b82f6', secondary: '#1e3a8a', accent: '#60a5fa', glow: 'rgba(59,130,246,0.35)', tabActive: '#3b82f6', badgeBg: 'rgba(59,130,246,0.15)', badgeText: '#bfdbfe', modeGlow: 'rgba(96,165,250,0.25)', heroGradient: 'rgba(7,11,26,0.95)' },
    stats: { characters: 8, powerSystem: 3, rules: 2 }
  },
  {
    id: 'blackclover',
    anime: 'Black Clover',
    tagline: 'A mana-talent hierarchy where five-leaf corruption and anti-magic nullification define the ceiling — and Julius Novachrono\'s time magic sits above all.',
    malId: 34572,
    visualizationHint: 'counter-tree',
    visualizationReason: 'Black Clover\'s combat system is defined by mana hierarchy and anti-magic nullification — the counter-tree maps how mana tier, anti-magic negation, and time dilation create a strict combat dominance ordering.',
    animeImageUrl: 'https://myanimelist.net/images/anime/2/88336l.jpg',
    themeColors: { primary: '#22c55e', secondary: '#1f2937', accent: '#86efac', glow: 'rgba(34,197,94,0.3)', tabActive: '#22c55e', badgeBg: 'rgba(34,197,94,0.15)', badgeText: '#bbf7d0', modeGlow: 'rgba(134,239,172,0.25)', heroGradient: 'rgba(15,23,42,0.92)' },
    stats: { characters: 8, powerSystem: 2, rules: 2 }
  },
  {
    id: 'parasyte',
    anime: 'Kiseijuu: Sei no Kakuritsu',
    tagline: 'A parasite-host symbiosis system where consciousness negotiation determines survival — and Gotou\'s economic efficiency outpaces violence.',
    malId: 22535,
    visualizationHint: 'standard-cards',
    visualizationReason: 'Parasyte\'s core conflict is not combat but biological optimization: parasites and humans compete for the same resource (survival) through different strategies, with Gotou\'s economic approach being the ultimate threat.',
    animeImageUrl: 'https://myanimelist.net/images/anime/3/73178l.jpg',
    themeColors: { primary: '#a855f7', secondary: '#1f2937', accent: '#c084fc', glow: 'rgba(168,85,247,0.3)', tabActive: '#a855f7', badgeBg: 'rgba(168,85,247,0.15)', badgeText: '#e9d5ff', modeGlow: 'rgba(192,132,252,0.25)', heroGradient: 'rgba(15,23,42,0.92)' },
    stats: { characters: 8, powerSystem: 2, rules: 2 }
  }

export const UNIVERSE_CATALOG_MAP = Object.fromEntries(UNIVERSE_CATALOG.map(entry => [entry.id, entry]))
