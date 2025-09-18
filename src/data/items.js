export const MANOR_KEY_CONSUMABLE_KEY = "consumableManorKey";
export const ENHANCED_DOOR_CHANCE = 0.25;
export const ENHANCED_GOLD_MULTIPLIER = 1.5;

export const RELIC_DEFINITIONS = [
  {
    key: "relicCandleRedWax",
    name: "Candle of Red Wax",
    emotion: "Anger",
    description:
      "Bleed deals +1 damage per stack each turn. Heal for half the bleed damage dealt.",
    passive: { bleedBonus: 1, bleedHealFraction: 0.5 },
  },
  {
    key: "relicBrassKnuckles",
    name: "Brass Knuckles",
    emotion: "Anger",
    description:
      "Strike deals +3 damage. After Strike, your next Grapple this turn costs −1 AP.",
    passive: { strikeDamageBonus: 3, grappleDiscountAfterStrike: 1 },
  },
  {
    key: "relicRustedChains",
    name: "Rusted Chains",
    emotion: "Anger",
    description: "Grapple applies Restrained (2) instead of (1).",
    passive: { grappleRestrainedBonus: 1 },
  },
  {
    key: "relicSkullDice",
    name: "Skull Dice",
    emotion: "Anger",
    description: "While Strike is face-up, gain +15% critical chance.",
    passive: { strikeFaceUpCritBonus: 15 },
  },
  {
    key: "relicAshenBrand",
    name: "Ashen Brand",
    emotion: "Anger",
    description: "Whenever Throw deals damage, apply Vulnerable (1).",
    passive: { throwAppliesVulnerable: 1 },
  },
  {
    key: "relicPorcelainRat",
    name: "Porcelain Rat Figurine",
    emotion: "Fear",
    description:
      "Each turn you block 10+ damage, apply Dazed (1) to the foe.",
    passive: { blockThresholdDaze: 10, blockThresholdDazeStacks: 1 },
  },
  {
    key: "relicIronWallPlate",
    name: "Iron Wall Plate",
    emotion: "Fear",
    description: "Guard provides +4 additional Block.",
    passive: { guardBlockBonus: 4 },
  },
  {
    key: "relicKnightsOath",
    name: "Knight's Oath Band",
    emotion: "Fear",
    description: "When you Brace, gain Retaliate (2).",
    passive: { braceRetaliate: 2 },
  },
  {
    key: "relicTarnishedSpear",
    name: "Tarnished Spear",
    emotion: "Fear",
    description: "Counter deals +5 damage if you blocked since last turn.",
    passive: { counterBlockedBonusDamage: 5 },
  },
  {
    key: "relicStoneGuardian",
    name: "Stone Guardian Idol",
    emotion: "Fear",
    description:
      "At end of your turn, if you played no attacks, gain Armor (2) for the fight.",
    passive: { armorGainNoAttack: 2 },
  },
  {
    key: "relicLanternFestival",
    name: "Lantern of Festival Glass",
    emotion: "Joy",
    description: "While any buff is active, gain Essence Regen (1).",
    passive: { buffGrantsEssenceRegen: 1 },
  },
  {
    key: "relicConfettiPouch",
    name: "Confetti Pouch",
    emotion: "Joy",
    description: "Spark deals +3 damage if you played a buff this turn.",
    passive: { sparkBuffBonus: 3 },
  },
  {
    key: "relicGoldenLyre",
    name: "Golden Lyre",
    emotion: "Joy",
    description: "Festival Light also grants +5% Critical Chance to allies this turn.",
    passive: { festivalLightCritBonus: 5 },
  },
  {
    key: "relicBellRevelry",
    name: "Bell of Revelry",
    emotion: "Joy",
    description: "At end of turn, if you played Elation, heal 3 additional Essence.",
    passive: { elationEndHeal: 3 },
  },
  {
    key: "relicMirrorMask",
    name: "Mirror Mask",
    emotion: "Joy",
    description: "The first buff you play each combat is duplicated.",
    passive: { firstBuffDuplicated: true },
  },
  {
    key: "relicDirgeBell",
    name: "Dirge Bell",
    emotion: "Sadness",
    description: "Wither applies Bleed (1) in addition to its normal effect.",
    passive: { witherAppliesExtraBleed: 1 },
  },
  {
    key: "relicObsidianTear",
    name: "Obsidian Tear Pendant",
    emotion: "Sadness",
    description: "Breakthrough costs 1 less AP if the enemy has Fatigue.",
    passive: { breakthroughFatigueDiscount: 1 },
  },
  {
    key: "relicGraveSoil",
    name: "Grave Soil Jar",
    emotion: "Sadness",
    description: "Whenever you inflict Fatigue, gain +1 AP next turn.",
    passive: { fatigueApBonus: 1 },
  },
  {
    key: "relicMourningVeil",
    name: "Veil of Mourning Silk",
    emotion: "Sadness",
    description: "While Burden is face-up, gain Armor (1).",
    passive: { burdenFaceUpArmor: 1 },
  },
  {
    key: "relicTombKey",
    name: "Tomb Key",
    emotion: "Sadness",
    description: "If you played Breakthrough this combat, gain +15 gold at victory.",
    passive: { breakthroughGoldReward: 15 },
  },
];

export const CONSUMABLE_DEFINITIONS = [
  {
    key: "consumablePotionVigor",
    name: "Potion of Vigor",
    description: "Restore 12 Essence (cannot exceed your maximum).",
    icon: "✚",
    effect: { type: "restoreEssence", amount: 12 },
  },
  {
    key: "consumableTorch",
    name: "Everbright Torch",
    description: "Reveal the next two room types on the map.",
    icon: "☼",
    effect: { type: "revealRooms", count: 2 },
  },
  {
    key: "consumableCursedHourglass",
    name: "Cursed Hourglass",
    description:
      "Skip the next enemy turn. Lose 5 Essence at the end of your next turn.",
    icon: "⌛",
    effect: { type: "skipEnemyTurn", essencePenalty: 5 },
  },
  {
    key: "consumableSoulLantern",
    name: "Soul Lantern",
    description: "Negate the next time you would die this combat, then shatter.",
    icon: "☀",
    effect: { type: "revive", healthFraction: 0.5 },
  },
  {
    key: "consumablePotionAegis",
    name: "Potion of Aegis",
    description: "Gain Armor (4) and Block (10).",
    icon: "❈",
    effect: { type: "gainArmorAndBlock", armor: 4, block: 10 },
  },
  {
    key: "consumableVialFrenzy",
    name: "Vial of Frenzy",
    description: "Your attacks deal +75% damage this combat.",
    icon: "⚔",
    effect: { type: "damageMultiplier", amount: 1.75 },
  },
  {
    key: "consumableCursedCoin",
    name: "Cursed Coin",
    description:
      "Gain 40 Gold. Each combat this run starts with Dazed (1).",
    icon: "☠",
    effect: { type: "gainGoldWithCurse", amount: 40, curse: "dazed" },
  },
  {
    key: "consumablePocketWatch",
    name: "Silver Pocketwatch",
    description: "Set your AP to 6 and draw 2 extra memories next turn.",
    icon: "⌚",
    effect: { type: "setApAndDraw", ap: 6, draw: 2 },
  },
  {
    key: "consumableBottledStorm",
    name: "Bottled Storm",
    description: "Deal 15 damage to all enemies.",
    icon: "☇",
    effect: { type: "aoeDamage", amount: 15 },
  },
  {
    key: "consumableVialSerenity",
    name: "Vial of Serenity",
    description: "Remove all negative statuses from yourself.",
    icon: "✤",
    effect: { type: "cleanse" },
  },
  {
    key: "consumableSoulJar",
    name: "Soul Jar",
    description:
      "Store 10 Essence now. You may shatter the jar later to restore it.",
    icon: "❂",
    effect: { type: "storeEssence", amount: 10 },
  },
  {
    key: "consumableElixirFocus",
    name: "Elixir of Focus",
    description:
      "Your next 2 actions this combat cost 1 less AP (minimum 0).",
    icon: "✺",
    effect: { type: "discountActions", count: 2, amount: 1 },
  },
  {
    key: "consumableVialNightshade",
    name: "Vial of Nightshade",
    description: "Apply Poison (8) to an enemy.",
    icon: "☘",
    effect: { type: "applyStatus", status: "poison", stacks: 8 },
  },
  {
    key: "consumableDiceFates",
    name: "Dice of Fates",
    description: "Reroll all room options on the map.",
    icon: "⚅",
    effect: { type: "rerollRooms" },
  },
  {
    key: "consumableCandleWard",
    name: "Candle Ward",
    description:
      "Gain 3 Ward charges that negate incoming damage instances.",
    icon: "🕯",
    effect: { type: "gainWard", charges: 3 },
  },
  {
    key: "consumablePotionEssence",
    name: "Potion of Essence",
    description: "Restore 6 Essence (cannot exceed your maximum).",
    icon: "✦",
    effect: { type: "restoreEssence", amount: 6 },
  },
  {
    key: "consumablePolishedCoin",
    name: "Polished Coin",
    description: "Gain 15 Gold immediately.",
    icon: "◎",
    effect: { type: "gainGold", amount: 15 },
  },
  {
    key: "consumableShroudTalisman",
    name: "Shroud Talisman",
    description:
      "Negate the next cursed effect or trap that would afflict you this run.",
    icon: "☽",
    effect: { type: "grantShroudGuard" },
  },
  {
    key: "consumablePotionLingering",
    name: "Potion of Lingering",
    description:
      "Permanently increase your maximum Essence by 5 and restore to full.",
    icon: "✶",
    effect: { type: "increaseMaxEssence", amount: 5 },
  },
  {
    key: MANOR_KEY_CONSUMABLE_KEY,
    name: "Manor Key",
    description: "Unlocks a locked enhanced door within the corridor.",
    icon: "🗝",
    effect: { type: "unlockDoor" },
  },
];

export const RELIC_MAP = new Map(
  RELIC_DEFINITIONS.map((relic) => [relic.key, relic])
);

export const CONSUMABLE_MAP = new Map(
  CONSUMABLE_DEFINITIONS.map((item) => [item.key, item])
);
