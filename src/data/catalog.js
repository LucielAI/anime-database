export const preferredOrder = ['aot', 'jjk', 'chainsawman', 'demonslayer', 'hxh', 'vinlandsaga', 'steinsgate', 'deathnote', 'fmab', 'codegeass', 'mha', 'frieren', 'sololeveling', 'goblinslayer', 'mushokutensei', 'naruto', 'bleach', 'dragonballz', 'mob-psycho-100', 'tokyo-ghoul', 'one-piece']

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
  },
  {
    id: 'naruto', anime: 'Naruto', tagline: 'A shinobi world where political loyalty, inter-village competition, and bloodline hierarchies define power more than any individual combat outcome', malId: 20, visualizationHint: 'node-graph', visualizationReason: 'Naruto is a village/clan network where political loyalty, inter-village competition, and bloodline hierarchies are the primary analytical dimensions. The node-graph captures the structural thesis: villages as nodes, alliances as edges, and shinobi as the human capital flowing between them.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1141/142503l.jpg',
    themeColors: { primary: '#f59e0b', secondary: '#1e3a8a', accent: '#0ea5e9', glow: 'rgba(245,158,11,0.35)', tabActive: '#f59e0b', badgeBg: 'rgba(30,58,138,0.18)', badgeText: '#0ea5e9', modeGlow: 'rgba(14,165,233,0.25)', heroGradient: 'rgba(5,10,20,0.95)' },
    stats: { characters: 15, powerSystem: 4, rules: 6 }
  },
  {
    id: 'dragonballz', anime: 'Dragon Ball Z', tagline: 'A vertical ki hierarchy where exponential transformation tiers, power levels, and the brutal arithmetic of who can destroy what define every combat outcome', malId: 813, visualizationHint: 'counter-tree', visualizationReason: 'Dragon Ball Z is a ki-based power scaling system organized as a vertical combat hierarchy. The counter-tree captures the core structural thesis: power levels as the root, transformation tiers as branching nodes, and specific matchups determining which fighter counters which.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1277/142022.jpg',
    themeColors: { primary: '#f97316', secondary: '#1e3a5f', accent: '#facc15', glow: 'rgba(249,115,22,0.35)', tabActive: '#f97316', badgeBg: 'rgba(30,58,95,0.18)', badgeText: '#facc15', modeGlow: 'rgba(250,204,21,0.25)', heroGradient: 'rgba(5,10,20,0.95)' },
    stats: { characters: 10, powerSystem: 5, rules: 5 }
  },
  {
    id: 'bleach', anime: 'Bleach', tagline: 'A multi-faction spiritual network where Reiatsu dominance, Zanpakuto resonance, and dimensional boundaries between Soul Society, Hueco Mundo, and the Human World determine survival', malId: 269, visualizationHint: 'node-graph', visualizationReason: 'Bleach is a faction-network universe where Soul Society, Hueco Mundo, the Human World, and the Quincy domain exist as distinct but interacting spiritual layers.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1541/147774l.jpg',
    themeColors: { primary: '#1e3a8a', secondary: '#0f172a', accent: '#dc2626', glow: 'rgba(30,58,138,0.35)', tabActive: '#1e3a8a', badgeBg: 'rgba(220,38,38,0.12)', badgeText: '#dc2626', modeGlow: 'rgba(30,58,138,0.25)', heroGradient: 'rgba(5,10,20,0.95)' },
    stats: { characters: 10, powerSystem: 5, rules: 5 }
  },
  {
    id: 'mob-psycho-100', anime: 'Mob Psycho 100', tagline: 'An affinity-matrix where psychic power distribution, spiritual resonance, and emotional pressure determine outcomes more than raw esper ability', malId: 32182, visualizationHint: 'affinity-matrix', visualizationReason: 'Mob Psycho 100 is a psychic power network organized as an affinity-matrix. The affinity-matrix captures the core structural thesis: each character has a psychic power level and an emotional intelligence level, and the relationship between these two dimensions determines the character arc.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/8/80356l.jpg',
    themeColors: { primary: '#f97316', secondary: '#0f172a', accent: '#fbbf24', glow: 'rgba(249,115,22,0.35)', tabActive: '#f97316', badgeBg: 'rgba(15,23,42,0.5)', badgeText: '#fbbf24', modeGlow: 'rgba(251,191,36,0.25)', heroGradient: 'rgba(20,10,5,0.95)' },
    stats: { characters: 10, powerSystem: 5, rules: 5 }
  },
  {
    id: 'tokyo-ghoul', anime: 'Tokyo Ghoul', tagline: 'A predator-prey economy where the ghoul/human biological boundary defines every alliance, motivation, and moral position', malId: 22319, visualizationHint: 'counter-tree', visualizationReason: 'Tokyo Ghoul is a ghoul/human predator-prey system organized as a counter-tree. The counter-tree captures the core structural thesis: the ghoul/human binary as the root divide, ghoul factions and CCG hierarchies as branching nodes, and specific character matchups determining which fighter counters which.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1498/134443l.jpg',
    themeColors: { primary: '#dc2626', secondary: '#0f172a', accent: '#f43f5e', glow: 'rgba(220,38,38,0.35)', tabActive: '#dc2626', badgeBg: 'rgba(15,23,42,0.6)', badgeText: '#f43f5e', modeGlow: 'rgba(220,38,38,0.25)', heroGradient: 'rgba(20,5,10,0.95)' },
    stats: { characters: 10, powerSystem: 5, rules: 5 }
  },
  {
    id: 'one-piece', anime: 'One Piece', tagline: 'An empire-faction control network where rubber physiology, haki willpower, and devil fruit economics determine who owns the seas', malId: 21, visualizationHint: 'node-graph', visualizationReason: 'One Piece operates as an empire/faction node-graph: Yonko territories, Warlord networks, Revolutionary Army cells, and Marine hierarchy form a maritime power grid where allegiances shift constantly and pirate crews function as independent business units with their own chains of command.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg',
    themeColors: { primary: '#dc2626', secondary: '#0f172a', accent: '#f59e0b', glow: 'rgba(220,38,38,0.35)', tabActive: '#dc2626', badgeBg: 'rgba(220,38,38,0.15)', badgeText: '#fbbf24', modeGlow: 'rgba(245,158,11,0.25)', heroGradient: 'rgba(10,5,5,0.95)' },
    stats: { characters: 10, powerSystem: 3, rules: 6 }
  }
]

export const UNIVERSE_CATALOG_MAP = Object.fromEntries(UNIVERSE_CATALOG.map(entry => [entry.id, entry]))