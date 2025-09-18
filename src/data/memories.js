import { createCoreContribution, createMultiCoreContribution } from "../combat/actions.js";

export const MEMORY_DEFINITIONS = [
  {
    key: "memoryBarFight",
    name: "Memory of the Bar Fight",
    emotion: "Anger",
    description: "Uppercut punishes foes already tangled in your Grapple.",
    contributions: [
      { action: "uppercut", weight: 1 },
      ...createCoreContribution("angerCore", 0.5),
    ],
  },
  {
    key: "memoryBloodBlade",
    name: "Memory of the Blood-soaked Blade",
    emotion: "Anger",
    description: "Bloodlash keeps pressure on so Throw lands harder.",
    contributions: [
      { action: "bloodlash", weight: 1 },
      ...createCoreContribution("angerCore", 0.5),
    ],
  },
  {
    key: "memoryFeastRoar",
    name: "Memory of the Victory Feast",
    emotion: "Anger",
    description: "Feast Roar supercharges the whole Strike → Grapple → Throw chain.",
    contributions: [
      { action: "feastRoar", weight: 1 },
      ...createCoreContribution("angerCore", 0.5),
    ],
  },
  {
    key: "memoryWatchman",
    name: "Memory of the Watchman",
    emotion: "Fear",
    description: "Tower Shield lets you punish attacks while Guard is face-up.",
    contributions: [
      { action: "towerShield", weight: 1 },
      ...createCoreContribution("fearCore", 0.5),
    ],
  },
  {
    key: "memoryLockedDoor",
    name: "Memory of the Locked Door",
    emotion: "Fear",
    description: "Iron Bar turns stored Block into Dazed disruption.",
    contributions: [
      { action: "ironBar", weight: 1 },
      ...createCoreContribution("fearCore", 0.5),
    ],
  },
  {
    key: "memoryOathKept",
    name: "Memory of the Oath Kept",
    emotion: "Fear",
    description: "Pledge Strike adds armor while closing the defensive loop.",
    contributions: [
      { action: "pledgeStrike", weight: 1 },
      ...createCoreContribution("fearCore", 0.5),
    ],
  },
  {
    key: "memorySong",
    name: "Memory of the Song",
    emotion: "Joy",
    description: "Song of Triumph boosts crits and essence to fuel Spark and Elation.",
    contributions: [
      { action: "songOfTriumph", weight: 1 },
      ...createCoreContribution("joyCore", 0.5),
    ],
  },
  {
    key: "memoryLaughingCrowd",
    name: "Memory of the Laughing Crowd",
    emotion: "Joy",
    description: "Cheer keeps morale high and crits flowing.",
    contributions: [
      { action: "cheer", weight: 1 },
      ...createCoreContribution("joyCore", 0.5),
    ],
  },
  {
    key: "memoryGoldenLantern",
    name: "Memory of the Golden Lantern",
    emotion: "Joy",
    description: "Lantern Glow blends AoE chip with essence sustain.",
    contributions: [
      { action: "lanternGlow", weight: 1 },
      ...createCoreContribution("joyCore", 0.5),
    ],
  },
  {
    key: "memoryLongMarch",
    name: "Memory of the Long March",
    emotion: "Sadness",
    description: "Dirge spreads fatigue so Breakthrough refunds momentum.",
    contributions: [
      { action: "dirge", weight: 1 },
      ...createCoreContribution("sadnessCore", 0.5),
    ],
  },
  {
    key: "memoryWidowsVeil",
    name: "Memory of the Widow's Veil",
    emotion: "Sadness",
    description: "Shroud of Loss turns bleed into a grinding edge.",
    contributions: [
      { action: "shroudOfLoss", weight: 1 },
      ...createCoreContribution("sadnessCore", 0.5),
    ],
  },
  {
    key: "memoryEmptyChair",
    name: "Memory of the Empty Chair",
    emotion: "Sadness",
    description: "Remembrance keeps AP refunds flowing for Breakthrough turns.",
    contributions: [
      { action: "remembrance", weight: 1 },
      ...createCoreContribution("sadnessCore", 0.5),
    ],
  },
  {
    key: "memoryDuel",
    name: "Memory of the Duel",
    emotion: "Hybrid",
    description: "Riposte Slash thrives when Guard and Brace absorb blows first.",
    contributions: [
      { action: "riposteSlash", weight: 1 },
      ...createCoreContribution("angerCore", 0.25),
      ...createCoreContribution("fearCore", 0.25),
    ],
  },
  {
    key: "memoryVictoryFeastHybrid",
    name: "Memory of the Victory Feast (Echoes)",
    emotion: "Hybrid",
    description: "Feast Fireworks layers crits onto Spark chains and Throw payoffs.",
    contributions: [
      { action: "feastFireworks", weight: 1 },
      ...createCoreContribution("angerCore", 0.25),
      ...createCoreContribution("joyCore", 0.25),
    ],
  },
  {
    key: "memoryBetrayal",
    name: "Memory of Betrayal",
    emotion: "Hybrid",
    description: "Backstab seeds both Bleed and Fatigue for Breakthrough or Throw.",
    contributions: [
      { action: "backstab", weight: 1 },
      ...createCoreContribution("angerCore", 0.25),
      ...createCoreContribution("sadnessCore", 0.25),
    ],
  },
  {
    key: "memoryVigil",
    name: "Memory of Vigil",
    emotion: "Hybrid",
    description: "Blessed Guard mixes Fear walls with Joyful sustain.",
    contributions: [
      { action: "blessedGuard", weight: 1 },
      ...createCoreContribution("fearCore", 0.25),
      ...createCoreContribution("joyCore", 0.25),
    ],
  },
  {
    key: "memoryFuneralProcession",
    name: "Memory of Funeral Procession",
    emotion: "Hybrid",
    description: "Processional Chant blankets enemies in fatigue while you turtle up.",
    contributions: [
      { action: "processionalChant", weight: 1 },
      ...createCoreContribution("fearCore", 0.25),
      ...createCoreContribution("sadnessCore", 0.25),
    ],
  },
  {
    key: "memoryMischievousTears",
    name: "Memory of Mischievous Tears",
    emotion: "Hybrid",
    description: "Mocking Weep copies whichever payoff your deck craves.",
    contributions: [
      { action: "mockingWeep", weight: 1 },
      ...createCoreContribution("joyCore", 0.25),
      ...createCoreContribution("sadnessCore", 0.25),
    ],
  },
  {
    key: "memoryForgottenToy",
    name: "Memory of the Forgotten Toy",
    emotion: "Wild",
    description: "Broken Plaything inflicts Vulnerable for any damage plan.",
    contributions: [
      { action: "brokenPlaything", weight: 1 },
      ...createMultiCoreContribution(["angerCore", "fearCore", "sadnessCore"], 0.5),
    ],
  },
  {
    key: "memoryOathBroken",
    name: "Memory of the Oath Broken",
    emotion: "Wild",
    description: "Vowbreaker layers Bleed onto whichever core you favor.",
    contributions: [
      { action: "vowbreaker", weight: 1 },
      ...createMultiCoreContribution(["angerCore", "joyCore", "sadnessCore"], 0.5),
    ],
  },
  {
    key: "memoryLostCarnival",
    name: "Memory of the Lost Carnival",
    emotion: "Wild",
    description: "Carnival Fire brings AoE chip and regen without leaning on Sadness.",
    contributions: [
      { action: "carnivalFire", weight: 1 },
      ...createMultiCoreContribution(["angerCore", "fearCore", "joyCore"], 0.5),
    ],
  },
  {
    key: "memoryShadowedGarden",
    name: "Memory of the Shadowed Garden",
    emotion: "Wild",
    description: "Bloom of Thorns grants armor without stirring Anger memories.",
    contributions: [
      { action: "bloomOfThorns", weight: 1 },
      ...createMultiCoreContribution(["fearCore", "joyCore", "sadnessCore"], 0.5),
    ],
  },
  {
    key: "memoryHourglass",
    name: "Memory of the Hourglass",
    emotion: "Ambiguous",
    description: "Borrowed Time trades essence for the AP to finish chains.",
    contributions: [
      { action: "borrowedTime", weight: 1 },
      ...createMultiCoreContribution(
        ["angerCore", "fearCore", "joyCore", "sadnessCore"],
        0.5
      ),
    ],
  },
  {
    key: "memoryFracturedMirror",
    name: "Memory of the Fractured Mirror",
    emotion: "Ambiguous",
    description: "Echo doubles your last swing for a modest premium.",
    contributions: [
      { action: "echo", weight: 1 },
      ...createMultiCoreContribution(
        ["angerCore", "fearCore", "joyCore", "sadnessCore"],
        0.5
      ),
    ],
  },
  {
    key: "memoryTrickCandle",
    name: "Memory of the Trick Candle",
    emotion: "Ambiguous",
    description: "Flicker discounts the next action so big payoffs come faster.",
    contributions: [
      { action: "flicker", weight: 1 },
      ...createMultiCoreContribution(
        ["angerCore", "fearCore", "joyCore", "sadnessCore"],
        0.5
      ),
    ],
  },
  {
    key: "memoryLockedChest",
    name: "Memory of the Locked Chest",
    emotion: "Ambiguous",
    description: "Greed's Gamble promises a consumable if you risk the AP.",
    contributions: [
      { action: "greedsGamble", weight: 1 },
      ...createMultiCoreContribution(
        ["angerCore", "fearCore", "joyCore", "sadnessCore"],
        0.5
      ),
    ],
  },
  {
    key: "memoryRustedKey",
    name: "Memory of the Rusted Key",
    emotion: "Ambiguous",
    description: "Unseal guarantees gold if you keep it face-up to the end.",
    contributions: [
      { action: "unseal", weight: 1 },
      ...createMultiCoreContribution(
        ["angerCore", "fearCore", "joyCore", "sadnessCore"],
        0.5
      ),
    ],
  },
];

export const MEMORY_MAP = new Map(
  MEMORY_DEFINITIONS.map((memory) => [memory.key, memory])
);
