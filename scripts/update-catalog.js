const fs = require('fs');
const catalogPath = 'src/data/catalog.js';
let content = fs.readFileSync(catalogPath, 'utf8');

const newIds = ['onepiece','naruto','mobpsycho100','rezero','overlord','fireforce','tokyo_revengers','bleach','blackclover','parasyte'];

const prefMatch = content.match(/preferredOrder = \[([\s\S]*?)\];/);
const existingIds = prefMatch[1].match(/id:\s*'([^']+)'/g).map(s => s.match(/id:\s*'([^']+)'/)[1]);
const allIds = [...existingIds, ...newIds];
content = content.replace(
  /preferredOrder = \[[\s\S]*?\];/,
  'preferredOrder = [\n  ' + allIds.map(id => "id: '" + id + "'").join(',\n  ') + '\n];'
);

const newEntries = `
  onepiece: { id: 'onepiece', anime: 'One Piece', tagline: 'A world where ocean geography IS political economy.', malId: 21, visualizationHint: 'node-graph', visualizationReason: 'One Piece is defined by shifting pirate alliances, faction dependencies, and geopolitical power grids.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg', stats: { universes: 8, characters: 26, systemTypes: 4 } },
  naruto: { id: 'naruto', anime: 'Naruto', tagline: 'A shinobi economy where chakra compounding and village hierarchies determine outcomes.', malId: 20, visualizationHint: 'counter-tree', visualizationReason: 'Naruto is defined by jutsu counter relationships and power scaling hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1141/142503l.jpg', stats: { universes: 9, characters: 24, systemTypes: 3 } },
  mobpsycho100: { id: 'mobpsycho100', anime: 'Mob Psycho 100', tagline: 'A psychic ecosystem where spiritual energy flows from trauma and ego structures.', malId: 32182, visualizationHint: 'node-graph', visualizationReason: 'Mob Psycho 100 is a dependency web where esper organizations and cult followings create a network topology.', animeImageUrl: 'https://myanimelist.net/images/anime/8/80356l.jpg', stats: { universes: 6, characters: 18, systemTypes: 4 } },
  rezero: { id: 'rezero', anime: 'Re:Zero', tagline: 'A death-loop economy where checkpoint saves and trauma compounding create strategic survival.', malId: 31240, visualizationHint: 'timeline', visualizationReason: 'Re:Zero is defined by Return by Death loops and delayed-consequence decision trees.', animeImageUrl: 'https://myanimelist.net/images/anime/1522/128039l.jpg', stats: { universes: 8, characters: 24, systemTypes: 4 } },
  overlord: { id: 'overlord', anime: 'Overlord', tagline: "A heteromorphic player's endgame audit: when the raid boss becomes the guild's only member.", malId: 29803, visualizationHint: 'node-graph', visualizationReason: 'Overlord is defined by NPC servant networks and heteromorphic power hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1945/136600l.jpg', stats: { universes: 7, characters: 22, systemTypes: 4 } },
  fireforce: { id: 'fireforce', anime: 'Enen no Shouboutai', tagline: 'A combustion theology economy with spontaneous ignition and competing religious factions.', malId: 38671, visualizationHint: 'timeline', visualizationReason: 'Fire Force is defined by Causality Rift propagation and Great Cataclysm delayed consequences.', animeImageUrl: 'https://myanimelist.net/images/anime/1664/103275l.jpg', stats: { universes: 3, characters: 11, systemTypes: 3 } },
  tokyo_revengers: { id: 'tokyo_revengers', anime: 'Tokyo Revengers', tagline: 'A time-travel gang warfare system with leadership succession across timelines.', malId: 42249, visualizationHint: 'timeline', visualizationReason: 'Tokyo Revengers is a temporal loop system where gang hierarchies determine outcomes across divergent branches.', animeImageUrl: 'https://myanimelist.net/images/anime/1839/122012l.jpg', stats: { universes: 4, characters: 12, systemTypes: 3 } },
  bleach: { id: 'bleach', anime: 'Bleach', tagline: 'A soul-reaper economy where spiritual pressure and Zanpakuto relationships determine outcomes.', malId: 269, visualizationHint: 'counter-tree', visualizationReason: 'Bleach is defined by Zanpakuto counter relationships and power scaling hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1541/147774l.jpg', stats: { universes: 4, characters: 16, systemTypes: 4 } },
  blackclover: { id: 'blackclover', anime: 'Black Clover', tagline: 'A magic oligopoly where grimoire class determines political economy.', malId: 34572, visualizationHint: 'counter-tree', visualizationReason: 'Black Clover is defined by magic attribute counters and grimoire hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1173/92110l.jpg', stats: { universes: 3, characters: 12, systemTypes: 3 } },
  parasyte: { id: 'parasyte', anime: 'Parasyte -the maxim-', tagline: 'A parasite-host symbiosis economy where alien organisms and human ethics collide.', malId: 22535, visualizationHint: 'standard-cards', visualizationReason: 'Parasyte lacks a unified system thesis — standard-cards provides clean functional delivery.', animeImageUrl: 'https://myanimelist.net/images/anime/3/73178l.jpg', stats: { universes: 4, characters: 12, systemTypes: 3 } },
`;

content = content.replace(/(\n\};$)/, newEntries + '\n};');
fs.writeFileSync(catalogPath, content);
console.log('Done. New IDs added:', newIds.join(', '));
