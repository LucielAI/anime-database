/**
 * SOURCE OF TRUTH — Index Metadata (insights.js) vs Full Content (insights-content.js)
 *
 * This file: lightweight array of metadata for list/grid/filter views.
 * insights-content.js: full slug-keyed post content for individual post rendering.
 *
 * RULE: Every insight MUST exist in BOTH files.
 *       - Add slug + metadata HERE (insights.js array)
 *       - Add full content in insights-content.js (INSIGHTS_BY_SLUG object)
 *       - Never define insight content inline in component files
 *
 * The two files are kept in sync MANUALLY. Before adding an insight, update both.
 */
// Consumed by InsightsRoute.jsx (array) and InsightPost.jsx (slug-keyed map).
// Do NOT define INSIGHTS inline in those components any more.
import { Network, Zap, Clock3, Users, BookOpen } from 'lucide-react'

export const INSIGHTS = [
  {
    slug: 'one-piece-power-economy',
    universe: 'one-piece',
    universeAnime: 'One Piece',
    title: 'Why the One Piece World Is Designed Like an Economy',
    subtitle: 'The Yonko system, maritime trade routes, and Devil Fruit markets.',
    readTime: '5 min',
    category: 'World Analysis',
    tags: ['economics', 'power systems', 'faction analysis'],
    teaser: 'In the One Piece world, political power flows through territorial control and trade monopoly — not individual strength alone. The Four Emperors maintain their positions not just through combat prowess, but by controlling the flow of goods, information, and human capital across the Grand Line.',
    featured: true,
  },
  {
    slug: 'naruto-chakra-meritocracy',
    universe: 'naruto',
    universeAnime: 'Naruto',
    title: 'Chakra as a Bureaucratic Resource',
    subtitle: 'How shinobi villages turned personal energy into a labor market.',
    readTime: '4 min',
    category: 'System Analysis',
    tags: ['economics', 'shinobi systems', 'bureaucracy'],
    teaser: "Naruto's world converts individual chakra into a tradeable resource through mission rankings, seal-based contracts, and village loyalty. The system rewards specialization and loyalty over raw power — which is why characters like Shikamaru and Gaara rise faster than stronger but less disciplined shinobi.",
    featured: false,
  },
  {
    slug: 'jjk-cursed-energy-thermodynamics',
    universe: 'jjk',
    universeAnime: 'Jujutsu Kaisen',
    title: "Cursed Energy as an Inverse Heat Engine",
    subtitle: "Why Gojo's Infinity works like a thermodynamic paradox.",
    readTime: '6 min',
    category: 'Mechanics',
    tags: ['physics', 'combat systems', 'power analysis'],
    teaser: "Jujutsu Kaisen's power system is built on negative emotional energy — hate, fear, and grief generate power. But this creates a thermodynamic problem: the system extracts entropy from human suffering to fuel combat. Which means reducing suffering in the world literally weakens the fighters who depend on it.",
    featured: false,
  },
  {
    slug: 'aot-determinism-chaos',
    universe: 'aot',
    universeAnime: 'Attack on Titan',
    title: 'The Determinism Engine in Attack on Titan',
    subtitle: 'Why every freedom fight circles back to the same trap.',
    readTime: '5 min',
    category: 'World Analysis',
    tags: ['philosophy', 'time', 'determinism'],
    teaser: 'Attack on Titan runs on a closed causal loop. The future sends memories backward; the past shapes the future; every rebellion creates the very system it opposes. This makes the world feel like a machine with no off switch — and the characters aware of it are the ones who suffer most.',
    featured: false,
  },
  {
    slug: 'hxh-nen-specialization',
    universe: 'hxh',
    universeAnime: 'Hunter x Hunter',
    title: 'Why Nen Is the Best Magic System in Anime',
    subtitle: 'Vow and Limitations as a self-limiting growth protocol.',
    readTime: '7 min',
    category: 'System Analysis',
    tags: ['power systems', 'strategy', 'depth'],
    teaser: "Nen's vow-and-limitation mechanic is essentially a self-imposed constraint that trades one kind of power for another. By restricting yourself to a narrow ability, you gain exponentially more output. This mirrors real-world skill acquisition — the more you specialize, the more efficiently you develop mastery in that domain.",
    featured: false,
  },
  {
    slug: 'death-note-killing-archetype',
    universe: 'deathnote',
    universeAnime: 'Death Note',
    title: 'Death Note as a Tool Critique',
    subtitle: 'The notebook as a mirror for power fantasies.',
    readTime: '4 min',
    category: 'Thematic Analysis',
    tags: ['power', 'morality', 'deconstruction'],
    teaser: "Death Note asks: what happens when an ordinary person gets absolute power? Light Yagami starts as a moralist and becomes a tyrant — the tool doesn't change him, it reveals him. This makes Death Note less about the notebook and more about the psychology of people who believe they deserve to judge others.",
    featured: false,
  },
  {
    slug: 'demonslayer-breathing-economics',
    universe: 'demonslayer',
    universeAnime: 'Demon Slayer',
    title: 'Breathing Forms as Weaponized Poetry',
    subtitle: 'How swordsmanship became a language system.',
    readTime: '4 min',
    category: 'Combat Analysis',
    tags: ['combat', 'aesthetics', 'power systems'],
    teaser: "Demon Slayer's breathing system converts emotional states into combat techniques. Water Breathing, Flame Breathing — each is a philosophy of movement. Muzan's pursuit of the Blue Spider Lily makes sense in this framework: he's looking for the one breathing form that would complete his own fragmented system.",
    featured: false,
  },
  {
    slug: 'chainsawman-devil-economy',
    universe: 'chainsawman',
    universeAnime: 'Chainsaw Man',
    title: 'Why Devil Contracts Are a Raw Deal',
    subtitle: 'Fear as fuel, trauma as currency.',
    readTime: '5 min',
    category: 'System Analysis',
    tags: ['power systems', 'economics', 'fear'],
    teaser: 'In Chainsaw Man, devil contracts cost parts of your body or your future. The system is inherently extractive — devils get stronger by consuming fear, and humans pay in flesh, lifespan, or sanity. This makes every contract a bad deal in the long run, which is precisely why people keep making them.',
    featured: false,
  },
]

// Slug-keyed map for InsightPost — re-exported from insights-content
export { INSIGHTS_BY_SLUG } from './insights-content'
