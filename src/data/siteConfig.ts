export interface NavItem {
  id: string;
  label: string;
  href: string;
  code: string;
}

export interface StatusItem {
  id: string;
  label: string;
  category: string;
  accent: 'cyan' | 'blue' | 'purple' | 'magenta';
  isThemeStatus?: boolean;
}

export interface AboutFeatureCard {
  id: string;
  title: string;
  code: string;
  description: string;
  accent: 'cyan' | 'blue' | 'purple';
  iconKey: 'gaming' | 'development' | 'community';
}

export interface BotCommandItem {
  name: string;
  desc: string;
  usage?: string;
}

export interface BotCommandCategory {
  id: string;
  name: string;
  shortLabel: string;
  accentHex: string;
  commands: BotCommandItem[];
}

export interface BotSystemCard {
  id: string;
  name: string;
  statusBadge: string;
  systemLabels: [string, string, string];
  description: string;
  editableNote: string;
  inviteUrl: string;
  buttonText: string;
  featurePlaceholders: {
    slot: string;
    title: string;
    detail: string;
  }[];
  commandCategories: BotCommandCategory[];
}

export interface CommunityCard {
  id: 'slashstr1ker' | 'netquel' | 'softbear';
  code: string;
  sectorTag: string;
  name: string;
  subtitleTag: string;
  description: string;
  inviteUrl: string;
  buttonText: string;
  theme: {
    primary: string;
    secondary: string;
    glow: string;
    badgeBg: string;
    emblemType: 'command-crest' | 'nexus-core' | 'studio-forge';
  };
}

export interface YouTubeVideoItem {
  videoId: string;
  title: string;
  duration: string;
  views: string;
  publishedAgo: string;
  url: string;
  embedUrl: string;
  thumbnail: string;
}

export const SITE_CONFIG = {
  brand: {
    name: 'SlashStr1ker',
    upperName: 'SLASHSTR1KER',
    domain: 'https://slash-striker.github.io/',
    tagline: 'Gaming Beyond Limits. Bots Beyond Imagination.',
    heroMainHeading: 'WELCOME TO THE DIGITAL FRONTIER',
    heroDescription:
      'Explore my gaming universe, discover powerful Discord bots, join the community, and venture into the next generation of digital experiences.',
    scrollPrompt: 'SCROLL TO EXPLORE',
  },

  links: {
    youtubeChannel: 'https://www.youtube.com/@SlashStr1ker?sub_confirmation=1',
    slashStr1kerDiscord: 'https://discord.gg/48CMZz5SwD',
    netquelNexusDiscord: 'https://discord.gg/nNuCFerYwR',
    softbearGamesDiscord: 'https://discord.gg/MrxkJtX6FF',
    featuredBotInvite:
      'https://discord.com/oauth2/authorize?client_id=1505829367631183963',
  },

  navigation: [
    { id: 'home', label: 'Home', href: '#home', code: '01' },
    { id: 'about', label: 'About', href: '#about', code: '02' },
    { id: 'youtube', label: 'YouTube', href: '#youtube', code: '03' },
    { id: 'bots', label: 'Discord Bots', href: '#bots', code: '04' },
    { id: 'communities', label: 'Communities', href: '#communities', code: '05' },
    { id: 'contact', label: 'Contact', href: '#contact', code: '06' },
  ] satisfies NavItem[],

  heroStatusPanel: [
    {
      id: 'gaming',
      label: 'Gaming & Content Creation',
      category: 'SECTOR // MEDIA',
      accent: 'cyan',
    },
    {
      id: 'bots',
      label: 'Discord Bot Development',
      category: 'SECTOR // AI LAB',
      accent: 'blue',
    },
    {
      id: 'communities',
      label: 'Gaming Communities',
      category: 'SECTOR // NETWORK',
      accent: 'purple',
    },
    {
      id: 'universe',
      label: 'Digital Universe: Online',
      category: 'THEME // INTERFACE',
      accent: 'magenta',
      isThemeStatus: true,
    },
  ] satisfies StatusItem[],

  about: {
    heading: 'BEHIND THE SCREEN',
    sectionTag: 'IDENTITY MATRIX // 02',
    description:
      'Welcome to the world of SlashStr1ker — a place where gaming, technology, creativity, and community collide. From YouTube content to Discord bots and gaming communities, this is the central hub for everything I create and share.',
    cards: [
      {
        id: 'gaming',
        title: 'GAMING',
        code: 'MOD-01 // FRONTIER',
        description:
          'Discover gaming content, adventures, experiments, and new experiences across the digital frontier.',
        accent: 'cyan',
        iconKey: 'gaming',
      },
      {
        id: 'development',
        title: 'DEVELOPMENT',
        code: 'MOD-02 // ARCHITECTURE',
        description:
          'Explore Discord bots and digital projects designed to bring useful tools and engaging experiences to online communities.',
        accent: 'blue',
        iconKey: 'development',
      },
      {
        id: 'community',
        title: 'COMMUNITY',
        code: 'MOD-03 // NEXUS',
        description:
          'Connect with other gamers, discover new communities, and become part of the SlashStr1ker universe.',
        accent: 'purple',
        iconKey: 'community',
      },
    ] satisfies AboutFeatureCard[],
  },

  youtube: {
    sectionTag: 'DEEP SPACE BROADCAST // 03',
    channelName: 'SlashStr1ker',
    channelHandle: '@SlashStr1ker',
    channelId: 'UCNkuaq6HNa8UW4usOvPZtvw',
    heading: 'TRANSMISSION RECEIVED?',
    subheading: 'Join the channel. Enter the universe.',
    description:
      'Gaming, digital adventures, and more. Subscribe to SlashStr1ker and join the journey as the universe continues to expand.',
    primaryButtonText: 'SUBSCRIBE TO SLASHSTR1KER',
    secondaryButtonText: 'JOIN THE DISCORD COMMUNITY',
    channelUrl: 'https://www.youtube.com/@SlashStr1ker?sub_confirmation=1',
    discordUrl: 'https://discord.gg/48CMZz5SwD',
    highlights: [
      {
        label: 'SIGNAL ORIGIN',
        value: 'SlashStr1ker Official Channel',
      },
      {
        label: 'BROADCAST FOCUS',
        value: 'Netquel & Digital Adventures',
      },
      {
        label: 'AUTO-FEED',
        value: 'Latest Upload Synced',
      },
    ],
    fallbackVideos: [
      {
        videoId: 'WUpAjEMnU4Y',
        title: 'Netquel.com | Anyone miss the older Netquel? | SlashStr1ker',
        duration: '19:23',
        views: '60 views',
        publishedAgo: '1d ago',
        url: 'https://www.youtube.com/watch?v=WUpAjEMnU4Y',
        embedUrl: 'https://www.youtube-nocookie.com/embed/WUpAjEMnU4Y',
        thumbnail: 'https://i.ytimg.com/vi/WUpAjEMnU4Y/hq720.jpg',
      },
      {
        videoId: '2TWL9SnYT4M',
        title:
          'Netquel.com | FORGE | Just trying the Forge Game Mode | SlashStr1ker',
        duration: '23:37',
        views: '73 views',
        publishedAgo: '3d ago',
        url: 'https://www.youtube.com/watch?v=2TWL9SnYT4M',
        embedUrl: 'https://www.youtube-nocookie.com/embed/2TWL9SnYT4M',
        thumbnail: 'https://i.ytimg.com/vi/2TWL9SnYT4M/hq720.jpg',
      },
      {
        videoId: '5RGZa9rl3Jk',
        title:
          'Netquel.com | No way Netquel got an update | Tutorial Part 1 (Main-hub/Party Servers) |SlashStr1ker|',
        duration: '11:20',
        views: '222 views',
        publishedAgo: '3w ago',
        url: 'https://www.youtube.com/watch?v=5RGZa9rl3Jk',
        embedUrl: 'https://www.youtube-nocookie.com/embed/5RGZa9rl3Jk',
        thumbnail: 'https://i.ytimg.com/vi/5RGZa9rl3Jk/hq720.jpg',
      },
      {
        videoId: 'LX7Q3X5iKZw',
        title:
          'Netquel.com | NETQUEL GOT AN UPDATE | Tutorial Part 1 (Main-hub + Party Servers) |SlashStr1ker|',
        duration: '12:05',
        views: '194 views',
        publishedAgo: '3w ago',
        url: 'https://www.youtube.com/watch?v=LX7Q3X5iKZw',
        embedUrl: 'https://www.youtube-nocookie.com/embed/LX7Q3X5iKZw',
        thumbnail: 'https://i.ytimg.com/vi/LX7Q3X5iKZw/hq720.jpg',
      },
    ] satisfies YouTubeVideoItem[],
  },

  botLab: {
    sectionTag: 'CYBERNETIC SYSTEMS // 04',
    heading: 'THE BOT LAB',
    subtitle:
      'Intelligent tools. Automated systems. Next-level Discord experiences.',
    featuredBot: {
      id: 'slashstr1ker-bot',
      name: 'SlashStr1ker Bot',
      statusBadge: 'DISCORD BOT',
      systemLabels: ['BOT SYSTEM', 'INVITATION PORTAL', 'DIGITAL ASSISTANT'],
      description:
        'A full-scale cyberpunk economy, deep-space mining, neural casino, Dragon Hatchery, and Netquel highscore system built for Discord communities.',
      editableNote:
        'Interactive Neural Command Terminal — browse real slash commands extracted directly from the bot codebase or click any command to copy it.',
      inviteUrl:
        'https://discord.com/oauth2/authorize?client_id=1505829367631183963',
      buttonText: 'ADD TO DISCORD',
      featurePlaceholders: [
        {
          slot: 'SYSTEM 01 // ECONOMY & HEISTS',
          title: 'Neural Economy, Vaults & Co-Op Crime',
          detail:
            'Full wallet, bank, and mining-bank system with /work, /daily streaks, /crime co-op crew heists, /bounty pools, /fish tournaments, and P2P /trade.',
        },
        {
          slot: 'SYSTEM 02 // DEEP-SPACE MINING & GALAXY',
          title: 'Drills, Drone Fleets, Ores & Galaxy Rebirth',
          detail:
            'Mine rare ores and dragon eggs with /mine, manage up to 7 drones and 5 crew in /mining, sell on dynamic markets, and jump galaxies via /galaxy.',
        },
        {
          slot: 'SYSTEM 03 // CASINO & PARTY MINIGAMES',
          title: 'Blackjack, Roulette & Multiplayer Game Night',
          detail:
            'Play /blackjack, /roulette, /scratchcard, 8 solo minigames (/5dice, /mastermind, /lightsout, /highlow), and party games (/mafia, /spy, /bomb).',
        },
        {
          slot: 'SYSTEM 04 // DRAGON HATCHERY & NETQUEL HS',
          title: 'Profiles, Dragon Racing & Netquel Highscores',
          detail:
            'Incubate and race dragons inside /profile, climb XP and streak leaderboards, and inspect official Netquel player dossiers with /hs.',
        },
      ],
      commandCategories: [
        {
          id: 'economy',
          name: '⚡ ECONOMY SYSTEMS',
          shortLabel: '⚡ Economy',
          accentHex: '#00F5FF',
          commands: [
            {
              name: '/main-hub',
              desc: 'Your Dragon Code command center: balances, drill setup, drone fleet, crew, stockpile value, and active contracts',
            },
            {
              name: '/work',
              desc: 'Complete career assignments for credits',
            },
            {
              name: '/daily',
              desc: 'Claim your daily cosmic reward and build your streak multiplier',
            },
            {
              name: '/crime',
              desc: 'Solo breaches or escalating co-op heists with crew roles (hacker / driver / muscle)',
            },
            {
              name: '/rob',
              desc: "Rob a player's wallet or start a bank heist",
            },
            {
              name: '/fish',
              desc: 'Neural Ocean Fishing System — cast to fish, sell, shop, view your log, or check the live tournament board',
            },
            {
              name: '/bank',
              desc: 'Vault access: deposit, withdraw, or check your balances',
            },
            {
              name: '/balance',
              desc: 'Check your wallet, bank, and financial identity',
            },
            {
              name: '/transfer',
              desc: 'Transfer credits between mining bank, wallet, or another user',
            },
            {
              name: '/trade',
              desc: 'Trade items and credits with another player — both sides must confirm',
            },
            {
              name: '/bounty',
              desc: "Put a price on someone's head; whoever robs them collects the pool",
            },
            {
              name: '/invest',
              desc: 'Contrarian market PvP — bet long or short on an ore in 5-minute rounds',
            },
            {
              name: '/beg',
              desc: 'Beg on the streets for spare coins',
            },
            {
              name: '/remind',
              desc: 'Set, list, or cancel a private DM reminder (e.g. /remind 2h claim the contract)',
            },
          ],
        },
        {
          id: 'career',
          name: '💼 MINING & GALAXY',
          shortLabel: '⛏️ Mining & Galaxy',
          accentHex: '#397BFF',
          commands: [
            {
              name: '/mine',
              desc: 'Complete a mining run for ore, XP, mining-bank credits, and rare dragon egg drops',
            },
            {
              name: '/mining',
              desc: 'Mining hub: drill & location upgrades, drones, refine, boosts, crew, contracts, property, and stats',
            },
            {
              name: '/mining-inventory',
              desc: 'View your stored ores, refined materials, artifacts, drones, and crew',
            },
            {
              name: '/sell',
              desc: 'Sell your mined ores, refined materials, and artifacts at dynamic market prices',
            },
            {
              name: '/galaxy',
              desc: 'Galaxy travel & rebirth — view the star chart, unlock galaxies, jump sectors, or rebirth for +25% permanent yield',
            },
            {
              name: '/job',
              desc: 'Browse clearance career pathways or apply for promotion',
            },
          ],
        },
        {
          id: 'casino',
          name: '🎰 CASINO & GAMES',
          shortLabel: '🎰 Casino & Games',
          accentHex: '#FF3CAC',
          commands: [
            {
              name: '/blackjack',
              desc: 'Play interactive virtual blackjack against the dealer',
            },
            {
              name: '/roulette',
              desc: 'Spin the American roulette wheel — bet on colors, areas, or exact numbers (0–36)',
            },
            {
              name: '/games',
              desc: 'All minigames in one hub: 5dice, hangman, highlow, lightsout, mastermind, matchpairs, rps, or tictactoe',
            },
            {
              name: '/scratchcard',
              desc: 'Buy and scratch hidden holographic reward cards for prizes',
            },
            {
              name: '/guess-number',
              desc: 'Free-to-play number challenge — exact hit wins 500,000 coins',
            },
            {
              name: '/activities',
              desc: 'QOTD + multiplayer party games: bomb, math, mafia, and spy',
            },
            {
              name: '/mafia',
              desc: 'Mafia: Neon Protocol — social deduction party game with friends (5–10 players)',
            },
            {
              name: '/spy',
              desc: 'Spy Hunters — interrogate your friends and uncover the undercover agent (4–8 players)',
            },
            {
              name: '/bomb',
              desc: 'Arm a time bomb and defuse it with friends for entry-fee stakes',
            },
            {
              name: '/math',
              desc: 'Open a rapid-fire Math Duel — first correct answer takes the pot',
            },
            {
              name: '/5dice',
              desc: 'Play a Yahtzee-style five-dice scoring game',
            },
            {
              name: '/highlow',
              desc: 'Play the multi-round High/Low card guessing game',
            },
            {
              name: '/mastermind',
              desc: 'Crack the secret cipher code in Mastermind',
            },
            {
              name: '/lightsout',
              desc: 'Solve the interactive Lights Out puzzle grid',
            },
            {
              name: '/matchpairs',
              desc: 'Match hidden signal pairs on a 5×4 memory grid',
            },
            {
              name: '/hangman',
              desc: 'Play interactive Hangman word deduction',
            },
            {
              name: '/rps',
              desc: 'Play Rock Paper Scissors',
            },
            {
              name: '/tictactoe',
              desc: 'Play Tic-Tac-Toe against the bot or a friend',
            },
            {
              name: '/casino',
              desc: 'View virtual casino rules and your personal wagering summary',
            },
            {
              name: '/game-night',
              desc: 'The Game Night hub — overview of every party game on the station',
            },
          ],
        },
        {
          id: 'profile',
          name: '👤 PROFILE, DRAGONS & NETQUEL',
          shortLabel: '🐉 Profile & Netquel',
          accentHex: '#A855F7',
          commands: [
            {
              name: '/profile',
              desc: 'Your full profile AND the Dragon Hatchery: pets, eggs, feeding, quests, badges, titles, and dragon racing',
            },
            {
              name: '/hs',
              desc: 'View official Netquel highscores — inspect a player dossier or the global leaderboard',
            },
            {
              name: '/rank',
              desc: 'View your custom level and XP rank card',
            },
            {
              name: '/level-leaderboard',
              desc: 'View the top XP users across the server',
            },
            {
              name: '/ec-leaderboard',
              desc: 'View the richest users in the neural economy',
            },
            {
              name: '/daily-leaderboard',
              desc: 'View the top daily streak leaders in the streak matrix',
            },
            {
              name: '/prestige',
              desc: 'Reset after reaching required streak for permanent prestige bonuses',
            },
            {
              name: '/ec-stats',
              desc: 'Economy, blackjack, and casino statistics in one dashboard',
            },
            {
              name: '/ec-cooldowns',
              desc: 'Open the live command cooldown dashboard with refresh controls',
            },
            {
              name: '/credits-audit',
              desc: 'Inspect your recent coin transactions',
            },
          ],
        },
        {
          id: 'shop',
          name: '🛒 NEURAL SHOP & MARKET',
          shortLabel: '🛒 Shop & Market',
          accentHex: '#00F5FF',
          commands: [
            {
              name: '/shop',
              desc: 'Browse or buy items from the Neural Shop with autocomplete',
            },
            {
              name: '/inventory',
              desc: 'View your shop item and equipment inventory',
            },
            {
              name: '/open-box',
              desc: 'Open mystery boxes (supports mode:auto toggle)',
            },
            {
              name: '/item-give',
              desc: 'Give items or stored fish to another user',
            },
            {
              name: '/market',
              desc: 'View live dynamic ore prices and active market events',
            },
            {
              name: '/lottery',
              desc: 'Join the weekly Neural Lottery or check jackpot odds',
            },
          ],
        },
        {
          id: 'utility',
          name: '🌐 SOCIAL, TIME & COUNTING',
          shortLabel: '🌐 Social & Utility',
          accentHex: '#397BFF',
          commands: [
            {
              name: '/commands-list',
              desc: 'Open the interactive Neural Command Terminal inside Discord',
            },
            {
              name: '/ui-style',
              desc: 'Toggle between high-tech cyberpunk and standard command embed styling',
            },
            {
              name: '/birthday',
              desc: 'Check a registered birthday or set your own',
            },
            {
              name: '/set-sleep',
              desc: 'Set your local timezone and sleep schedule',
            },
            {
              name: '/see-users-time',
              desc: "View another user's local timezone and sleep schedule",
            },
            {
              name: '/time-at',
              desc: 'Convert a timestamp between user timezones',
            },
            {
              name: '/toggle-ping',
              desc: 'Toggle notification roles and game-night pings',
            },
            {
              name: '/game-pings',
              desc: 'Ping the Game Ping role to rally players for game night',
            },
            {
              name: '/nextcount',
              desc: 'Privately check the next required number in the counting grid',
            },
            {
              name: '/count-leaderboard',
              desc: 'View the counting channel leaderboard',
            },
            {
              name: '/ping',
              desc: 'Display live bot and Discord API latency',
            },
          ],
        },
        {
          id: 'admin',
          name: '🔧 STAFF & ADMIN CONTROLS',
          shortLabel: '🔧 Admin & Staff',
          accentHex: '#FF3CAC',
          commands: [
            {
              name: '/dragon-admin',
              desc: '[ADMIN] Manage dragons, tournaments, market rounds, flash deals, capsules, seasonal gifts, racing, and bounties',
            },
            {
              name: '/giveaway',
              desc: '[ADMIN] Launch an interactive credit giveaway with staff reroll controls',
            },
            {
              name: '/hs-admin',
              desc: '[ADMIN] Record and sync official Netquel highscores',
            },
            {
              name: '/admin',
              desc: '[ADMIN] Manage bot economy, item grants, and mining state',
            },
            {
              name: '/casino-admin',
              desc: '[ADMIN] Configure virtual casino table controls',
            },
            {
              name: '/credits-give',
              desc: 'Give credits to a user',
            },
            {
              name: '/edit',
              desc: "[ADMIN] Edit a user's economy, inventory, daily streak, or XP",
            },
            {
              name: '/reset',
              desc: "[ADMIN] Reset a user's economy, stats, wallet, inventory, or XP",
            },
            {
              name: '/verify',
              desc: '[STAFF] Deploy the interactive member verification terminal',
            },
            {
              name: '/staff',
              desc: '[STAFF] Broadcast an encrypted staff signal',
            },
          ],
        },
      ],
    } satisfies BotSystemCard,
    additionalBots: [] as BotSystemCard[],
    comingSoonTitle: 'MORE SYSTEMS COMING SOON',
    comingSoonDescription:
      'Additional expansion bays are online and reserved for future Discord bots and automated tools in the SlashStr1ker ecosystem.',
  },

  communities: {
    sectionTag: 'ALLIANCE DIRECTORY // 05',
    heading: 'FIND YOUR SQUAD',
    subtitle: 'Three gateways. One digital frontier.',
    servers: [
      {
        id: 'slashstr1ker',
        code: 'GATEWAY 01 // COMMAND HUB',
        sectorTag: 'OFFICIAL CREATOR SERVER',
        name: 'SlashStr1ker Discord',
        subtitleTag: 'Primary Flagship Community',
        description:
          'The official community hub for the SlashStr1ker YouTube channel. Connect with the community and stay involved in the latest activities.',
        inviteUrl: 'https://discord.gg/48CMZz5SwD',
        buttonText: 'JOIN MY COMMUNITY',
        theme: {
          primary: '#00F5FF',
          secondary: '#397BFF',
          glow: 'rgba(0, 245, 255, 0.35)',
          badgeBg: 'rgba(0, 245, 255, 0.12)',
          emblemType: 'command-crest',
        },
      },
      {
        id: 'netquel',
        code: 'GATEWAY 02 // QUANTUM REALM',
        sectorTag: 'NETQUEL UNIVERSE',
        name: 'Netquel Nexus',
        subtitleTag: 'Dimensional Network Hub',
        description:
          'Enter the Netquel Nexus community and connect with others in the Netquel universe.',
        inviteUrl: 'https://discord.gg/nNuCFerYwR',
        buttonText: 'ENTER NETQUEL NEXUS',
        theme: {
          primary: '#A855F7',
          secondary: '#FF3CAC',
          glow: 'rgba(168, 85, 247, 0.38)',
          badgeBg: 'rgba(168, 85, 247, 0.14)',
          emblemType: 'nexus-core',
        },
      },
      {
        id: 'softbear',
        code: 'GATEWAY 03 // STUDIO FORGE',
        sectorTag: 'OFFICIAL GAME CREATOR',
        name: 'Softbear Games (Official Game Creator)',
        subtitleTag: 'Creators of Netquel',
        description:
          'Visit the official Softbear Games community, associated with the creators of Netquel.',
        inviteUrl: 'https://discord.gg/MrxkJtX6FF',
        buttonText: 'JOIN SOFTBEAR GAMES',
        theme: {
          primary: '#397BFF',
          secondary: '#00F5FF',
          glow: 'rgba(57, 123, 255, 0.38)',
          badgeBg: 'rgba(57, 123, 255, 0.14)',
          emblemType: 'studio-forge',
        },
      },
    ] satisfies CommunityCard[],
  },

  contact: {
    sectionTag: 'DIRECT COMMS // 06',
    heading: 'ESTABLISH CONNECTION',
    subtitle:
      'Have a question, want to connect, or want to talk about my projects?',
    promptText: 'Need to reach me? Find me on Discord.',
    platform: 'Discord',
    discordUsername: 'slashstr1ker_',
    copySuccessText: 'USERNAME COPIED.',
    communityUrl: 'https://discord.gg/48CMZz5SwD',
    youtubeUrl: 'https://www.youtube.com/@SlashStr1ker?sub_confirmation=1',
  },

  footer: {
    tagline: 'Gaming Beyond Limits. Bots Beyond Imagination.',
    endTransmission: 'END OF TRANSMISSION — SEE YOU IN THE NEXT UNIVERSE.',
  },
} as const;
