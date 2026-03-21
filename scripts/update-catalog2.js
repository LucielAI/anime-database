const fs = require('fs');
const catalogPath = 'src/data/catalog.js';
let content = fs.readFileSync(catalogPath, 'utf8');

const newEntries = [
  { id: 'onepiece', anime: 'One Piece', tagline: 'A world where ocean geography IS political economy.', malId: 21, visualizationHint: 'node-graph', visualizationReason: 'One Piece is defined by shifting pirate alliances, faction dependencies, and geopolitical power grids.', animeImageUrl: 'https://cdn.myanimelist.net/images/anime/6/73245l.jpg', stats: { universes: 8, characters: 26, systemTypes: 4 } },
  { id: 'naruto', anime: 'Naruto', tagline: 'A shinobi economy where chakra compounding and village hierarchies determine outcomes.', malId: 20, visualizationHint: 'counter-tree', visualizationReason: 'Naruto is defined by jutsu counter relationships and power scaling hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1141/142503l.jpg', stats: { universes: 9, characters: 24, systemTypes: 3 } },
  { id: 'mobpsycho100', anime: 'Mob Psycho 100', tagline: 'A psychic ecosystem where spiritual energy flows from trauma and ego structures.', malId: 32182, visualizationHint: 'node-graph', visualizationReason: 'Mob Psycho 100 is a dependency web where esper organizations and cult followings create a network topology.', animeImageUrl: 'https://myanimelist.net/images/anime/8/80356l.jpg', stats: { universes: 6, characters: 18, systemTypes: 4 } },
  { id: 'rezero', anime: 'Re:Zero', tagline: 'A death-loop economy where checkpoint saves and trauma compounding create strategic survival.', malId: 31240, visualizationHint: 'timeline', visualizationReason: 'Re:Zero is defined by Return by Death loops and delayed-consequence decision trees.', animeImageUrl: 'https://myanimelist.net/images/anime/1522/128039l.jpg', stats: { universes: 8, characters: 24, systemTypes: 4 } },
  { id: 'overlord', anime: 'Overlord', tagline: "A heteromorphic player's endgame audit: when the raid boss becomes the guild's only member.", malId: 29803, visualizationHint: 'node-graph', visualizationReason: 'Overlord is defined by NPC servant networks and heteromorphic power hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1945/136600l.jpg', stats: { universes: 7, characters: 22, systemTypes: 4 } },
  { id: 'fireforce', anime: 'Enen no Shouboutai', tagline: 'A combustion theology economy with spontaneous ignition and competing religious factions.', malId: 38671, visualizationHint: 'timeline', visualizationReason: 'Fire Force is defined by Causality Rift propagation and Great Cataclysm delayed consequences.', animeImageUrl: 'https://myanimelist.net/images/anime/1664/103275l.jpg', stats: { universes: 3, characters: 11, systemTypes: 3 } },
  { id: 'tokyo_revengers', anime: 'Tokyo Revengers', tagline: 'A time-travel gang warfare system with leadership succession across timelines.', malId: 42249, visualizationHint: 'timeline', visualizationReason: 'Tokyo Revengers is a temporal loop system where gang hierarchies determine outcomes across divergent branches.', animeImageUrl: 'https://myanimelist.net/images/anime/1839/122012l.jpg', stats: { universes: 4, characters: 12, systemTypes: 3 } },
  { id: 'bleach', anime: 'Bleach', tagline: 'A soul-reaper economy where spiritual pressure and Zanpakuto relationships determine outcomes.', malId: 269, visualizationHint: 'counter-tree', visualizationReason: 'Bleach is defined by Zanpakuto counter relationships and power scaling hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1541/147774l.jpg', stats: { universes: 4, characters: 16, systemTypes: 4 } },
  { id: 'blackclover', anime: 'Black Clover', tagline: 'A magic oligopoly where grimoire class determines political economy.', malId: 34572, visualizationHint: 'counter-tree', visualizationReason: 'Black Clover is defined by magic attribute counters and grimoire hierarchies.', animeImageUrl: 'https://myanimelist.net/images/anime/1173/92110l.jpg', stats: { universes: 3, characters: 12, systemTypes: 3 } },
  { id: 'parasyte', anime: 'Parasyte -the maxim-', tagline: 'A parasite-host symbiosis economy where alien organisms and human ethics collide.', malId: 22535, visualizationHint: 'standard-cards', visualizationReason: 'Parasyte lacks a unified system thesis — standard-cards provides clean functional delivery.', animeImageUrl: 'https://myanimelist.net/images/anime/3/73178l.jpg', stats: { universes: 4, characters: 12, systemTypes: 3 } },
];

// Add to UNIVERSE_CATALOG array - find the last entry and add after it
const entriesStr = newEntries.map(e => JSON.stringify(e)).join(',\n  ');

// Find where UNIVERSE_CATALOG = [ ends and replace
content = content.replace(
  /(\/\/ Universe Catalog[\s\S]*?\])/,
  (match) => {
    // Remove trailing ] and add new entries
    const trimmed = match.trim();
    const withoutClosing = trimmed.slice(0, -1);
    return withoutClosing + ',\n  ' + entriesStr + '\n]';
  }
);

fs.writeFileSync(catalogPath, content);
console.log('UNIVERSE_CATALOG array updated');
