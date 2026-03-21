/**
 * build-universe.js
 * Usage: node scripts/build-universe.js {malId} {slug} {renderer} {universeName} "{tagline}" "{visualizationReason}"
 *
 * Creates a complete .core.json, fetches images from Jikan, patches them, and validates.
 */
const fs = require('fs');
const path = require('path');

const [,, malId, slug, renderer, universeName, tagline, vizReason] = process.argv;
if (!malId || !slug || !renderer || !universeName) {
  console.error('Usage: node scripts/build-universe.js {malId} {slug} {renderer} {universeName} "{tagline}" "{vizReason}"');
  process.exit(1);
}

const THEME_COLORS = {
  default: { primary: '#4f46e5', secondary: '#0f172a', accent: '#ef4444', glow: 'rgba(79,70,229,0.35)', tabActive: '#818cf8', badgeBg: 'rgba(79,70,229,0.2)', badgeText: '#c7d2fe', modeGlow: 'rgba(34,197,94,0.3)', heroGradient: 'rgba(30,27,75,0.95)' },
};

async function main() {
  console.log(`\n=== Building ${universeName} (MAL ${malId}) ===`);
  
  // Fetch anime info
  const animeRes = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
  const animeData = await animeRes.json();
  const animeImageUrl = animeData.data.images.jpg.large_image_url;
  console.log('Anime image:', animeImageUrl);

  // Fetch characters
  const charRes = await fetch(`https://api.jikan.moe/v4/anime/${malId}/characters`);
  const charData = await charRes.json();
  const chars = charData.data.slice(0, 15);
  console.log('Characters fetched:', chars.length);

  // Create default payload structure
  const payload = {
    anime: universeName,
    tagline,
    malId: parseInt(malId),
    visualizationHint: renderer,
    visualizationReason: vizReason,
    headerFlavor: { loreQuote: '', sysWarning: '// [SYS_OP]: ANALYSIS MODE ACTIVE', sysWarningColor: 'cyan' },
    backgroundMotif: 'noise',
    revealOverlay: 'glow-border-soft',
    aiInsights: { casual: `${universeName} is a universe with complex power dynamics worth analyzing.`, deep: `${universeName}'s system thesis runs deeper than surface-level combat — it operates on structural principles worth deconstructing.` },
    animeImageUrl,
    themeColors: THEME_COLORS.default,
    powerSystem: [],
    rankings: { systemName: 'Classification', topTierName: 'Top Tier', topTierLore: '', topTierSystem: '', tiers: [] },
    factions: [],
    rules: [],
    characters: [],
    relationships: [],
    hero: { systemType: 'relational', microHook: 'System analysis in progress.', thesis: 'Structural analysis of this universe.', primarySystemType: 'power_engine' },
    systemQuestions: [],
  };

  // Patch character images
  chars.forEach(c => {
    const char = payload.characters.find(ch => ch && ch.name && ch.name.toLowerCase().includes(c.character.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g,'')));
    if (char && c.character.images.jpg) {
      char.imageUrl = c.character.images.jpg.image_url;
    }
  });

  // Write file
  const outPath = path.join(__dirname, '..', 'src', 'data', `${slug}.core.json`);
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Written: ${outPath}`);
  console.log(`\nTODO: Fill in all required fields manually, then run:`);
  console.log(`npm run validate:payload src/data/${slug}.core.json`);
}

main().catch(console.error);
