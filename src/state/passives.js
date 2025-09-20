import { MEMORY_MAP, RELIC_MAP } from "../data/index.js";
import { isDevEntryDisabled } from "./devtools.js";
import { getState } from "./state.js";

export function createPassiveSummary() {
  return {
    bleedBonus: 0,
    bleedMultiplier: 1,
    bleedHealFraction: 0,
    apCarryoverBonus: 0,
    dirgeCostReduction: 0,
    roarAppliesVulnerable: false,
    buffCostReductionWhileFaceUp: false,
    songEssenceRegen: 0,
    laughterDamageBonus: 0,
    emptySlotCritBonus: 0,
    buffGrantsEssenceRegen: 0,
    strikeDamageBonus: 0,
    grappleDiscountAfterStrike: 0,
    grappleRestrainedBonus: 0,
    strikeFaceUpCritBonus: 0,
    throwAppliesVulnerable: 0,
    blockThresholdDaze: 0,
    blockThresholdDazeStacks: 0,
    guardBlockBonus: 0,
    braceRetaliate: 0,
    counterBlockedBonusDamage: 0,
    armorGainNoAttack: 0,
    sparkBuffBonus: 0,
    festivalLightCritBonus: 0,
    elationEndHeal: 0,
    firstBuffDuplicated: false,
    witherAppliesExtraBleed: 0,
    breakthroughFatigueDiscount: 0,
    fatigueApBonus: 0,
    burdenFaceUpArmor: 0,
    breakthroughGoldReward: 0,
    actionSlotBonus: 0,
    consumableSlotBonus: 0,
    memoryPickupGold: 0,
    draftOptionBonus: 0,
    cycleBlockGain: 0,
    merchantCostMultiplier: 1,
  };
}

export function summarizeMemoryPassives(memoryKeys = []) {
  const summary = createPassiveSummary();
  memoryKeys.forEach((key) => {
    if (isDevEntryDisabled("memory", key)) {
      return;
    }
    const memory = MEMORY_MAP.get(key);
    if (!memory || !memory.passive) {
      return;
    }
    const passive = memory.passive;
    if (typeof passive.bleedBonus === "number") {
      summary.bleedBonus += passive.bleedBonus;
    }
    if (typeof passive.apCarryoverBonus === "number") {
      summary.apCarryoverBonus += passive.apCarryoverBonus;
    }
    if (typeof passive.dirgeCostReduction === "number") {
      summary.dirgeCostReduction += passive.dirgeCostReduction;
    }
    if (passive.roarAppliesVulnerable) {
      summary.roarAppliesVulnerable = true;
    }
    if (passive.buffCostReductionWhileFaceUp) {
      summary.buffCostReductionWhileFaceUp = true;
    }
    if (typeof passive.songEssenceRegen === "number") {
      summary.songEssenceRegen += passive.songEssenceRegen;
    }
    if (typeof passive.laughterDamageBonus === "number") {
      summary.laughterDamageBonus += passive.laughterDamageBonus;
    }
    if (typeof passive.emptySlotCritBonus === "number") {
      summary.emptySlotCritBonus += passive.emptySlotCritBonus;
    }
  });
  return summary;
}

export function summarizeRelicPassives(relicKeys = []) {
  const summary = createPassiveSummary();
  relicKeys.forEach((key) => {
    if (isDevEntryDisabled("relic", key)) {
      return;
    }
    const relic = RELIC_MAP.get(key);
    if (!relic || !relic.passive) {
      return;
    }
    const passive = relic.passive;
    if (typeof passive.bleedBonus === "number") {
      summary.bleedBonus += passive.bleedBonus;
    }
    if (typeof passive.buffGrantsEssenceRegen === "number") {
      summary.buffGrantsEssenceRegen += passive.buffGrantsEssenceRegen;
    }
    if (typeof passive.bleedMultiplier === "number") {
      summary.bleedMultiplier *= passive.bleedMultiplier;
    }
    if (typeof passive.bleedHealFraction === "number") {
      summary.bleedHealFraction += passive.bleedHealFraction;
    }
    if (typeof passive.strikeDamageBonus === "number") {
      summary.strikeDamageBonus += passive.strikeDamageBonus;
    }
    if (typeof passive.grappleDiscountAfterStrike === "number") {
      summary.grappleDiscountAfterStrike += passive.grappleDiscountAfterStrike;
    }
    if (typeof passive.grappleRestrainedBonus === "number") {
      summary.grappleRestrainedBonus += passive.grappleRestrainedBonus;
    }
    if (typeof passive.strikeFaceUpCritBonus === "number") {
      summary.strikeFaceUpCritBonus += passive.strikeFaceUpCritBonus;
    }
    if (typeof passive.throwAppliesVulnerable === "number") {
      summary.throwAppliesVulnerable += passive.throwAppliesVulnerable;
    }
    if (typeof passive.blockThresholdDaze === "number" && passive.blockThresholdDaze > 0) {
      summary.blockThresholdDaze =
        summary.blockThresholdDaze > 0
          ? Math.min(summary.blockThresholdDaze, passive.blockThresholdDaze)
          : passive.blockThresholdDaze;
    }
    if (typeof passive.blockThresholdDazeStacks === "number") {
      summary.blockThresholdDazeStacks += passive.blockThresholdDazeStacks;
    }
    if (typeof passive.guardBlockBonus === "number") {
      summary.guardBlockBonus += passive.guardBlockBonus;
    }
    if (typeof passive.braceRetaliate === "number") {
      summary.braceRetaliate += passive.braceRetaliate;
    }
    if (typeof passive.counterBlockedBonusDamage === "number") {
      summary.counterBlockedBonusDamage += passive.counterBlockedBonusDamage;
    }
    if (typeof passive.armorGainNoAttack === "number") {
      summary.armorGainNoAttack += passive.armorGainNoAttack;
    }
    if (typeof passive.sparkBuffBonus === "number") {
      summary.sparkBuffBonus += passive.sparkBuffBonus;
    }
    if (typeof passive.festivalLightCritBonus === "number") {
      summary.festivalLightCritBonus += passive.festivalLightCritBonus;
    }
    if (typeof passive.elationEndHeal === "number") {
      summary.elationEndHeal += passive.elationEndHeal;
    }
    if (passive.firstBuffDuplicated) {
      summary.firstBuffDuplicated = true;
    }
    if (typeof passive.witherAppliesExtraBleed === "number") {
      summary.witherAppliesExtraBleed += passive.witherAppliesExtraBleed;
    }
    if (typeof passive.breakthroughFatigueDiscount === "number") {
      summary.breakthroughFatigueDiscount += passive.breakthroughFatigueDiscount;
    }
    if (typeof passive.fatigueApBonus === "number") {
      summary.fatigueApBonus += passive.fatigueApBonus;
    }
    if (typeof passive.burdenFaceUpArmor === "number") {
      summary.burdenFaceUpArmor += passive.burdenFaceUpArmor;
    }
    if (typeof passive.breakthroughGoldReward === "number") {
      summary.breakthroughGoldReward += passive.breakthroughGoldReward;
    }
    if (typeof passive.actionSlotBonus === "number") {
      summary.actionSlotBonus += passive.actionSlotBonus;
    }
    if (typeof passive.consumableSlotBonus === "number") {
      summary.consumableSlotBonus += passive.consumableSlotBonus;
    }
    if (typeof passive.memoryPickupGold === "number") {
      summary.memoryPickupGold += passive.memoryPickupGold;
    }
    if (typeof passive.draftOptionBonus === "number") {
      summary.draftOptionBonus += passive.draftOptionBonus;
    }
    if (typeof passive.cycleBlockGain === "number") {
      summary.cycleBlockGain += passive.cycleBlockGain;
    }
    if (typeof passive.merchantCostMultiplier === "number") {
      summary.merchantCostMultiplier *= passive.merchantCostMultiplier;
    }
  });
  return summary;
}

export function combinePassiveSummaries(memorySummary, relicSummary) {
  const combined = createPassiveSummary();
  const numericKeys = [
    "bleedBonus",
    "apCarryoverBonus",
    "dirgeCostReduction",
    "songEssenceRegen",
    "laughterDamageBonus",
    "emptySlotCritBonus",
    "buffGrantsEssenceRegen",
    "strikeDamageBonus",
    "grappleDiscountAfterStrike",
    "grappleRestrainedBonus",
    "strikeFaceUpCritBonus",
    "throwAppliesVulnerable",
    "blockThresholdDazeStacks",
    "guardBlockBonus",
    "braceRetaliate",
    "counterBlockedBonusDamage",
    "armorGainNoAttack",
    "sparkBuffBonus",
    "festivalLightCritBonus",
    "elationEndHeal",
    "witherAppliesExtraBleed",
    "breakthroughFatigueDiscount",
    "fatigueApBonus",
    "burdenFaceUpArmor",
    "breakthroughGoldReward",
    "actionSlotBonus",
    "consumableSlotBonus",
    "memoryPickupGold",
    "draftOptionBonus",
    "cycleBlockGain",
  ];
  numericKeys.forEach((key) => {
    combined[key] =
      (combined[key] || 0) + (memorySummary[key] || 0) + (relicSummary[key] || 0);
  });
  combined.bleedMultiplier =
    (memorySummary.bleedMultiplier || 1) * (relicSummary.bleedMultiplier || 1);
  combined.bleedHealFraction =
    (memorySummary.bleedHealFraction || 0) + (relicSummary.bleedHealFraction || 0);
  combined.roarAppliesVulnerable = Boolean(
    memorySummary.roarAppliesVulnerable || relicSummary.roarAppliesVulnerable
  );
  combined.buffCostReductionWhileFaceUp = Boolean(
    memorySummary.buffCostReductionWhileFaceUp ||
      relicSummary.buffCostReductionWhileFaceUp
  );
  combined.firstBuffDuplicated = Boolean(
    memorySummary.firstBuffDuplicated || relicSummary.firstBuffDuplicated
  );
  const blockThresholds = [
    memorySummary.blockThresholdDaze,
    relicSummary.blockThresholdDaze,
  ].filter((value) => typeof value === "number" && value > 0);
  combined.blockThresholdDaze = blockThresholds.length
    ? Math.min(...blockThresholds)
    : 0;
  combined.merchantCostMultiplier =
    (memorySummary.merchantCostMultiplier || 1) *
    (relicSummary.merchantCostMultiplier || 1);
  return combined;
}

export function getPlayerPassiveSummary(stateOverride = null) {
  const state = stateOverride || getState();
  const memoryKeys = Array.isArray(state.playerMemories) ? state.playerMemories : [];
  const relicKeys = Array.isArray(state.playerRelics) ? state.playerRelics : [];
  const memorySummary = summarizeMemoryPassives(memoryKeys);
  const relicSummary = summarizeRelicPassives(relicKeys);
  return combinePassiveSummaries(memorySummary, relicSummary);
}

export function getConsumableSlotLimit(stateOverride = null, baseSlots = 3) {
  const summary = getPlayerPassiveSummary(stateOverride);
  const bonus = Math.max(0, Math.round(summary.consumableSlotBonus || 0));
  return Math.max(baseSlots, baseSlots + bonus);
}
