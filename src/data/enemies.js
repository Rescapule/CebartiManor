export const ENEMY_DEFINITIONS = {
  corridorMimic: {
    maxEssence: 12,
    moves: [
      {
        key: "splinterSlam",
        name: "Splinter Slam",
        type: "attack",
        damage: 4,
        description: "Slams you with jagged boards.",
      },
      {
        key: "hungryMaw",
        name: "Hungry Maw",
        type: "attack",
        damage: 6,
        apply: { vulnerable: 1 },
        description: "Bites down and leaves you exposed.",
      },
      {
        key: "splinterShield",
        name: "Splinter Shield",
        type: "block",
        block: 5,
        description: "Raises a shield of floorboards.",
      },
    ],
  },
  greedyShade: {
    maxEssence: 10,
    moves: [
      {
        key: "claw",
        name: "Greedy Claw",
        type: "attack",
        damage: 5,
        description: "Rakes spectral claws across you.",
      },
      {
        key: "essenceSip",
        name: "Essence Sip",
        type: "drain",
        damage: 3,
        heal: 3,
        description: "Steals a sip of your essence.",
      },
      {
        key: "shroud",
        name: "Hoarded Shroud",
        type: "buff",
        armor: 2,
        description: "Wraps itself in stolen protections.",
      },
    ],
  },
  jesterWraith: {
    maxEssence: 11,
    moves: [
      {
        key: "bellWhip",
        name: "Bell Whip",
        type: "attack",
        damage: 4,
        description: "A snapping lash of bells.",
      },
      {
        key: "cackle",
        name: "Cackling Hex",
        type: "debuff",
        apply: { confused: 1 },
        description: "Unsettles your memories.",
      },
      {
        key: "pratfall",
        name: "Pratfall",
        type: "attack",
        damage: 7,
        description: "Crashes into you with comedic malice.",
      },
    ],
  },
  mourningChoir: {
    maxEssence: 14,
    moves: [
      {
        key: "wail",
        name: "Choral Wail",
        type: "attack",
        damage: 3,
        description: "A wail that chips at your spirit.",
      },
      {
        key: "lament",
        name: "Lament",
        type: "debuff",
        apply: { fatigue: 1 },
        description: "A lament that wearies you.",
      },
      {
        key: "crescendo",
        name: "Crescendo",
        type: "attack",
        damage: 6,
        description: "A swelling chorus slams into you.",
      },
    ],
  },
  oathbreakerKnight: {
    maxEssence: 16,
    moves: [
      {
        key: "sunder",
        name: "Sunder",
        type: "attack",
        damage: 6,
        description: "A heavy downward strike.",
      },
      {
        key: "chainBind",
        name: "Chain Bind",
        type: "debuff",
        apply: { restrained: 1 },
        description: "Chains lash out to bind you.",
      },
      {
        key: "oathShield",
        name: "Oath Shield",
        type: "block",
        block: 6,
        description: "Raises a spectral shield of vows.",
      },
    ],
  },
  possessedArmor: {
    maxEssence: 13,
    moves: [
      {
        key: "gauntletSmash",
        name: "Gauntlet Smash",
        type: "attack",
        type: "attack",
        damage: 5,
        description: "A brutal armored punch.",
      },
      {
        key: "clangor",
        name: "Clanging Roar",
        type: "debuff",
        apply: { vulnerable: 1 },
        description: "The roar leaves you rattled.",
      },
      {
        key: "plateWall",
        name: "Plate Wall",
        type: "block",
        block: 7,
        description: "Plates rearrange to defend the host.",
      },
    ],
  },
  stygianHound: {
    maxEssence: 9,
    moves: [
      {
        key: "bite",
        name: "Abyssal Bite",
        type: "attack",
        damage: 5,
        description: "Gnaws with void-fanged teeth.",
      },
      {
        key: "howl",
        name: "Spectral Howl",
        type: "debuff",
        apply: { vulnerable: 1 },
        description: "A chilling howl saps your poise.",
      },
      {
        key: "shadowPounce",
        name: "Shadow Pounce",
        type: "attack",
        damage: 7,
        description: "Leaps from darkness to rend essence.",
      },
    ],
  },
  wailingWidow: {
    maxEssence: 12,
    moves: [
      {
        key: "veilSwipe",
        name: "Veil Swipe",
        type: "attack",
        damage: 4,
        description: "Swipes with tattered veils.",
      },
      {
        key: "mourningKeen",
        name: "Mourning Keen",
        type: "debuff",
        apply: { bleed: 1 },
        description: "A keening note cuts deep.",
      },
      {
        key: "widowsEmbrace",
        name: "Widow's Embrace",
        type: "drain",
        damage: 3,
        heal: 3,
        description: "Steals warmth from your soul.",
      },
    ],
  },
  archivist: {
    maxEssence: 66,
    moves: [
      {
        key: "catalogStrike",
        name: "Catalog Strike",
        type: "attack",
        damage: 7,
        description: "Files you under 'Defiant'.",
      },
      {
        key: "inkSnare",
        name: "Ink Snare",
        type: "debuff",
        apply: { restrained: 1 },
        description: "Snares you in viscous script.",
      },
      {
        key: "knowledgeShield",
        name: "Knowledge Shield",
        type: "block",
        block: 8,
        description: "Layers defensive glyphs.",
      },
    ],
  },
  floodBride: {
    maxEssence: 72,
    moves: [
      {
        key: "tidalRush",
        name: "Tidal Rush",
        type: "attack",
        damage: 8,
        description: "A tide crashes down upon you.",
      },
      {
        key: "drownedGrasp",
        name: "Drowned Grasp",
        type: "debuff",
        apply: { bleed: 1 },
        description: "Drags you toward the undertow.",
      },
      {
        key: "undertow",
        name: "Undertow",
        type: "attack",
        damage: 6,
        description: "Pulls you beneath spectral waters.",
      },
    ],
  },
};

export const DEFAULT_ENEMY_MOVES = [
  {
    key: "hauntingSwipe",
    name: "Haunting Swipe",
    type: "attack",
    damage: 4,
    description: "A chilling swipe of ectoplasm.",
  },
  {
    key: "gloomShield",
    name: "Gloom Shield",
    type: "block",
    block: 4,
    description: "Shadows coil defensively.",
  },
  {
    key: "dreadWhisper",
    name: "Dread Whisper",
    type: "debuff",
    apply: { vulnerable: 1 },
    description: "A whisper that leaves you exposed.",
  },
];

