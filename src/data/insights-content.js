// Full insight content data — slug-keyed object for InsightPost.jsx rendering
// See insights.js for the source-of-truth sync contract (both files must be updated together)

export const INSIGHTS = {
  'one-piece-power-economy': {
    universe: 'one-piece',
    universeAnime: 'One Piece',
    title: 'Why the One Piece World Is Designed Like an Economy',
    readTime: '5 min',
    category: 'World Analysis',
    iconKey: 'Network',
    tags: ['economics', 'power systems', 'faction analysis'],
    content: [
      {
        type: 'thesis',
        text: 'In the One Piece world, political power flows through territorial control and trade monopoly — not individual strength alone. The Four Emperors maintain their positions not just through combat prowess, but by controlling the flow of goods, information, and human capital across the Grand Line.'
      },
      {
        type: 'breakdown',
        title: 'The Emperor System as Market Regulation',
        text: 'The Yonko are less like warlords and more like regional trade blocs. Whitebeard\'s territory was described as a "father\'s land" — where he protects, no one goes hungry. Big Mom runs a candy-based economy that extends far beyond her home island. Shanks maintains a broker status that lets him trade between all factions. This isn\'t just strength — it\'s economic leverage.'
      },
      {
        type: 'key_insight',
        text: 'The Void Century\'s secret is probably not a treasure — it\'s the original economic model that the World Government uses to maintain its monopoly.'
      },
      {
        type: 'breakdown',
        title: 'Devil Fruits as Inventions',
        text: 'Devil Fruits are essentially patented technologies. The User gets exclusive rights to one ability, transferable only through death. The World Government\'s monopoly on Sea Stone (Kairoseki) is trade policy — they control the one material that can nullify Devil Fruit powers. This mirrors real-world pharmaceutical patents and export controls.'
      },
      {
        type: 'breakdown',
        title: 'Haki as the Great Equalizer',
        text: 'Haki breaks the Devil Fruit monopoly. It\'s available to anyone with sufficient willpower, regardless of birth or luck. Rayleigh\'s statement that "Haki can defeat any Devil Fruit" is a direct challenge to the economic model — it\'s the only path to power that the elite can\'t control. This is why Blackbeard is so dangerous: he\'s acquiring both types of power simultaneously.'
      },
    ]
  },
  'naruto-chakra-meritocracy': {
    universe: 'naruto',
    universeAnime: 'Naruto',
    title: 'Chakra as a Bureaucratic Resource',
    readTime: '4 min',
    category: 'System Analysis',
    iconKey: 'Zap',
    tags: ['economics', 'shinobi systems', 'bureaucracy'],
    content: [
      {
        type: 'thesis',
        text: 'Naruto\'s world converts individual chakra into a tradeable resource through mission rankings, seal-based contracts, and village loyalty. The system rewards specialization and loyalty over raw power — which is why characters like Shikamaru and Gaara rise faster than stronger but less disciplined shinobi.'
      },
      {
        type: 'breakdown',
        title: 'The Mission System as Labor Market',
        text: 'D-rank through S-rank missions are essentially a labor market. Higher rank = more chakra required + more village politics involved. But the system also rewards innovation: Naruto\'s Shadow Clone Jutsu multiplies labor without multiplying pay. The fact that he uses it on missions that don\'t need it is a bug — or a feature. Shadow Clones generate intelligence through mass observation, which is more valuable than the mission fee.'
      },
      {
        type: 'key_insight',
        text: 'The Akatsuki\'s goal isn\'t destruction — it\'s monopoly. Capturing all the tailed beasts would give them more chakra than any single village. They\'re not terrorists; they\'re attempting a hostile takeover of the chakra economy.'
      },
    ]
  },
  'jjk-cursed-energy-thermodynamics': {
    universe: 'jjk',
    universeAnime: 'Jujutsu Kaisen',
    title: "Cursed Energy as an Inverse Heat Engine",
    readTime: '6 min',
    category: 'Mechanics',
    iconKey: 'Zap',
    tags: ['physics', 'combat systems', 'power analysis'],
    content: [
      {
        type: 'thesis',
        text: "Jujutsu Kaisen's power system is built on negative emotional energy — hate, fear, and grief generate power. But this creates a thermodynamic problem: the system extracts entropy from human suffering to fuel combat. Reducing suffering in the world literally weakens the fighters who depend on it."
      },
      {
        type: 'breakdown',
        title: "Gojo's Infinity as a Paradox",
        text: "The Infinity stops things by creating a mathematical limit — approaching but never reaching zero. It's both a defense and a philosophy: the closer you get to Gojo, the slower time feels. This mirrors his position as the \"strongest\" — he defines the reference frame. Everyone else is always approaching his level but never reaching it."
      },
      {
        type: 'key_insight',
        text: "Sukuna's domain expansion is a thermodynamic statement: he has enough cursed energy to create a guaranteed hit effect. Where Gojo's Infinity is a mathematical limit, Sukuna's Dismantle/Cleave is an algorithm — it adapts to the target's cursed energy signature and adjusts its output accordingly."
      },
    ]
  },
  'aot-determinism-chaos': {
    universe: 'aot',
    universeAnime: 'Attack on Titan',
    title: 'The Determinism Engine in Attack on Titan',
    readTime: '5 min',
    category: 'World Analysis',
    iconKey: 'Clock3',
    tags: ['philosophy', 'time', 'determinism'],
    content: [
      {
        type: 'thesis',
        text: 'Attack on Titan runs on a closed causal loop. The future sends memories backward; the past shapes the future; every rebellion creates the very system it opposes. This makes the world feel like a machine with no off switch — and the characters aware of it are the ones who suffer most.'
      },
      {
        type: 'breakdown',
        title: 'The Coordinate as a Narrative Paradox',
        text: "The Founding Titan's ability to manipulate memories across time is essentially a recursive narrative function — it can write the past to determine the future, which it already experienced. This is why Eren's character arc is inevitable: he saw the future, and the act of seeing it forced him to become the thing he saw."
      },
      {
        type: 'key_insight',
        text: 'The walls aren\'t protection — they\'re a prison. The 100m walls that protected humanity also confined their world view. Breaking the walls was simultaneously an act of liberation and an act of total war.'
      },
    ]
  },
  'hxh-nen-specialization': {
    universe: 'hxh',
    universeAnime: 'Hunter x Hunter',
    title: 'Why Nen Is the Best Magic System in Anime',
    readTime: '7 min',
    category: 'System Analysis',
    iconKey: 'Users',
    tags: ['power systems', 'strategy', 'depth'],
    content: [
      {
        type: 'thesis',
        text: 'Nen\'s vow-and-limitation mechanic is essentially a self-imposed constraint that trades one kind of power for another. By restricting yourself to a narrow ability, you gain exponentially more output. This mirrors real-world skill acquisition — the more you specialize, the more efficiently you develop mastery in that domain.'
      },
      {
        type: 'breakdown',
        title: 'The Six Principles as a Game Theory',
        text: "Ten, Zetsu, Ren, Hatsu, Gyro, and Ko aren't just techniques — they're a framework for thinking about energy allocation. The best Nen users aren't the strongest; they're the ones who understand the trade-offs most precisely. Kurapika's Chain Jail isn't powerful because it's strong — it's powerful because it's specific."
      },
      {
        type: 'key_insight',
        text: "Meruem's absolute power came from absolute consumption — he had no limitations, which made him infinitely adaptable. But that same adaptability made him vulnerable to something he couldn't consume: a genuine emotional connection. His downfall wasn't a combat weakness; it was a system design flaw."
      },
    ]
  },
  'death-note-killing-archetype': {
    universe: 'deathnote',
    universeAnime: 'Death Note',
    title: 'Death Note as a Tool Critique',
    readTime: '4 min',
    category: 'Thematic Analysis',
    iconKey: 'BookOpen',
    tags: ['power', 'morality', 'deconstruction'],
    content: [
      {
        type: 'thesis',
        text: 'Death Note asks: what happens when an ordinary person gets absolute power? Light Yagami starts as a moralist and becomes a tyrant — the tool doesn\'t change him, it reveals him.'
      },
      {
        type: 'breakdown',
        title: 'The Notebook\'s Rules as a System Design',
        text: 'The Death Note\'s rules aren\'t bugs — they\'re features. The 13-day limit exists because Ryuk explains that a Shinigami who extends their own life by killing has no incentive to help humans. This is an incentive alignment problem, not a story mechanic. The system is designed to prevent attachment.'
      },
      {
        type: 'key_insight',
        text: "Near and Mello represent two failure modes of justice: bureaucracy (Near) and violence (Mello). Neither can do what Light did — use the tool with perfect instrumental rationality. The story's conclusion isn't that justice wins; it's that neither pure system nor pure chaos can replace a human judge."
      },
    ]
  },
  'demonslayer-breathing-economics': {
    universe: 'demonslayer',
    universeAnime: 'Demon Slayer',
    title: 'Breathing Forms as Weaponized Poetry',
    readTime: '4 min',
    category: 'Combat Analysis',
    iconKey: 'Zap',
    tags: ['combat', 'aesthetics', 'power systems'],
    content: [
      {
        type: 'thesis',
        text: 'Demon Slayer\'s breathing system converts emotional states into combat techniques. Water Breathing, Flame Breathing — each is a philosophy of movement. Muzan\'s pursuit of the Blue Spider Lily makes sense in this framework: he\'s looking for the one breathing form that would complete his own fragmented system.'
      },
      {
        type: 'breakdown',
        title: 'Total Breathing as Total Conversion',
        text: 'Tanjiro\'s total breathing awareness — being able to see and counter every simultaneous attack from multiple opponents — works because he\'s converted every sensory input into combat data. This is essentially a sensor fusion problem: the more data channels you can convert to tactical information, the more efficiently you fight.'
      },
      {
        type: 'key_insight',
        text: "Muzan's disease is a system constraint he can't override. His cells are perpetually fighting the poison — which means he's always at less than 100% capacity. The Blue Spider Lily isn't a cure; it's the breathing form that would let him convert the poison itself into combat power. That's why finding it matters: it's not healing, it's optimization."
      },
    ]
  },
  'chainsawman-devil-economy': {
    universe: 'chainsawman',
    universeAnime: 'Chainsaw Man',
    title: 'Why Devil Contracts Are a Raw Deal',
    readTime: '5 min',
    category: 'System Analysis',
    iconKey: 'Network',
    tags: ['economics', 'power systems', 'power fantasy'],
    content: [
      {
        type: 'thesis',
        text: 'Every devil contract in Chainsaw Man trades something abstract — a memory, a sense, a relationship — for concrete power. This makes the system feel genuinely transactional: you get exactly what you asked for, and the devil keeps the part you can\'t get back.'
      },
      {
        type: 'breakdown',
        title: 'Makima\'s Control as a Ownership Economy',
        text: 'Makima\'s ability to "own" people through contract isn\'t just mind control — it\'s a transfer of agency. When someone belongs to her, their actions accrue to her benefit. This mirrors how capital ownership works: the owner gets the surplus labor without doing the work.'
      },
      {
        type: 'key_insight',
        text: "Denji's desire for a normal life is the one thing no devil contract can fulfill — because it requires other people's genuine choice, not transactional exchange. The ending isn't a battle victory; it's Pochita choosing to become something that can't be owned."
      },
    ]
  },
}

const INSIGHTS_BY_SLUG = INSIGHTS
export { INSIGHTS_BY_SLUG }
