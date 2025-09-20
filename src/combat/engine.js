import { ACTION_SEQUENCES } from './actions.js';
import { ACTION_DEFINITIONS } from './actions-data.js';
import {
  playerCharacter,
  enemySprites,
  bossSprites,
  merchantSprites,
  RELIC_DEFINITIONS,
  CONSUMABLE_DEFINITIONS,
  RELIC_MAP,
  CONSUMABLE_MAP,
  MEMORY_DEFINITIONS,
  MEMORY_MAP,
  ENEMY_DEFINITIONS,
  DEFAULT_ENEMY_MOVES,
} from '../data/index.js';
import {
  clearActiveCombat,
  getState,
  setEssenceValues,
  updateState,
} from '../state/state.js';
import {
  addConsumable,
  addGold,
  addMemoryToState,
  addRelic,
} from '../state/inventory.js';
import { ensureDefaultMemories } from '../state/memories.js';
import {
  DEFAULT_PLAYER_STATS,
  MERCHANT_BASE_DRAFT_COST,
  MERCHANT_DRAFT_COST_INCREMENT,
} from '../state/config.js';
import { getRandomItem, sampleWithoutReplacement } from '../state/random.js';
import { filterDevDisabledEntries, isDevEntryDisabled } from '../state/devtools.js';
import {
  combinePassiveSummaries,
  getPlayerPassiveSummary,
  summarizeMemoryPassives,
  summarizeRelicPassives,
} from '../state/passives.js';
import { showFloatingText, updateCombatLog, updateCombatUI } from '../ui/combat.js';
import { createElement } from '../ui/dom.js';

const MERCHANT_SPECIALTIES = {
  bellringer: 'memory',
  candleman: 'memory',
  collector: 'consumable',
  helenCebarti: 'mixed',
  ragpicker: 'relic',
};

function buildActionSoupFromMemories(memoryKeys = []) {
  const weights = new Map();
  memoryKeys.forEach((key) => {
    if (isDevEntryDisabled("memory", key)) {
      return;
    }
    const memory = MEMORY_MAP.get(key);
    if (!memory || !Array.isArray(memory.contributions)) {
      return;
    }
    memory.contributions.forEach((entry) => {
      if (!entry || !entry.action) {
        return;
      }
      if (isDevEntryDisabled("action", entry.action)) {
        return;
      }
      const definition = ACTION_DEFINITIONS[entry.action];
      if (!definition) {
        return;
      }
      if (definition.chain && definition.chain.index > 0) {
        return;
      }
      const weight = Number(entry.weight) || 0;
      weights.set(entry.action, (weights.get(entry.action) || 0) + weight);
    });
  });
  return Array.from(weights.entries())
    .filter(([, weight]) => weight > 0)
    .map(([action, weight]) => ({ action, weight }));
}

function resetTempStats(combatant) {
  combatant.temp = {
    critChance: 0,
    apRegen: 0,
    damageBonus: 0,
    damageMultiplier: 1,
    buffCostReduction: 0,
    essenceRegen: 0,
    endOfTurnHealing: 0,
    nextTurnApBonus: 0,
    onAttackEffects: [],
    retaliateMultiplier: 1,
    retaliateDamage: 0,
    enemyBleedBonus: 0,
  };
}

function getEncounterScaling(encounterType) {
  switch (encounterType) {
    case "elite":
      return 1.35;
    case "boss":
      return 1.6;
    default:
      return 1.0;
  }
}

function scaleValue(value, multiplier) {
  return Math.round(Number(value || 0) * multiplier);
}

function cloneEnemyMoves(moves, multiplier) {
  const list = Array.isArray(moves) && moves.length > 0 ? moves : DEFAULT_ENEMY_MOVES;
  return list.map((move) => ({
    ...move,
    damage:
      typeof move.damage === "number" ? scaleValue(move.damage, multiplier) : move.damage,
    block: typeof move.block === "number" ? scaleValue(move.block, multiplier) : move.block,
    heal: typeof move.heal === "number" ? scaleValue(move.heal, multiplier) : move.heal,
  }));
}

export function createCombatState(ctx, { encounterType, encounter, room }) {
  ensureDefaultMemories(ctx);
  const memoryKeys = Array.isArray(ctx.state.playerMemories)
    ? ctx.state.playerMemories.filter((key) => !isDevEntryDisabled("memory", key))
    : [];
  const relicKeys = Array.isArray(ctx.state.playerRelics)
    ? ctx.state.playerRelics.filter((key) => !isDevEntryDisabled("relic", key))
    : [];
  const memoryPassives = summarizeMemoryPassives(memoryKeys);
  const relicPassives = summarizeRelicPassives(relicKeys);
  const passives = combinePassiveSummaries(memoryPassives, relicPassives);
  const soup = buildActionSoupFromMemories(memoryKeys);
  const baseSlotCount = 4;
  const slotBonus = Math.max(0, Math.round(passives.actionSlotBonus || 0));
  const slotCount = Math.max(1, baseSlotCount + slotBonus);

  const player = {
    id: "player",
    side: "player",
    name: playerCharacter.name,
    maxEssence: ctx.state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence,
    essence: Math.min(
      ctx.state.playerEssence || DEFAULT_PLAYER_STATS.maxEssence,
      ctx.state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence
    ),
    ap: 0,
    baseApRegen: DEFAULT_PLAYER_STATS.baseApRegen,
    apRegen: DEFAULT_PLAYER_STATS.baseApRegen,
    baseCritChance: DEFAULT_PLAYER_STATS.baseCritChance,
    apCarryoverMax: DEFAULT_PLAYER_STATS.apCarryover + passives.apCarryoverBonus,
    statuses: {},
    block: 0,
    armor: 0,
    history: [],
    flags: {},
    pendingApBonus: 0,
    passives,
    memories: memoryKeys,
    relics: relicKeys,
  };
  resetTempStats(player);

  const sprite = encounter?.sprite || {};
  const enemyDefinition = ENEMY_DEFINITIONS[sprite.key] || {
    maxEssence: 12,
    moves: DEFAULT_ENEMY_MOVES,
  };
  const multiplier = getEncounterScaling(encounterType);
  const baseEnemyEssence = enemyDefinition.maxEssence || 12;
  const scaledEnemyEssence = Math.max(1, scaleValue(baseEnemyEssence, multiplier));
  const adjustedEnemyEssence =
    encounterType === "boss"
      ? Math.max(1, Math.round(scaledEnemyEssence / 2))
      : scaledEnemyEssence;

  const enemy = {
    id: "enemy",
    side: "enemy",
    name: sprite.name || "Hostile Spirit",
    maxEssence: adjustedEnemyEssence,
    essence: adjustedEnemyEssence,
    statuses: {},
    block: 0,
    armor: 0,
    history: [],
    flags: {},
    moves: cloneEnemyMoves(enemyDefinition.moves, multiplier),
    moveIndex: 0,
    sprite,
  };
  resetTempStats(enemy);

  return {
    ctx,
    room,
    encounterType,
    encounter,
    player,
    enemy,
    soup,
    actionSlots: new Array(slotCount).fill(null),
    log: [],
    round: 1,
    turn: "player",
    status: "inProgress",
    difficulty: multiplier,
    dom: {},
  };
}

export function startCombat(combat) {
  logCombat(
    combat,
    `${combat.enemy.name} prepares to fight within ${combat.room?.name || "the chamber"}.`
  );
  updateCombatUI(combat);
  startPlayerTurn(combat);
}

function startPlayerTurn(combat) {
  if (combat.status !== "inProgress") {
    return;
  }
  combat.turn = "player";
  logCombat(combat, `Round ${combat.round}: Your essence rallies.`);
  combat.player.flags = combat.player.flags || {};
  combat.player.flags.playedAttackThisTurn = false;
  combat.player.flags.playedBuffThisTurn = false;
  combat.player.flags.brassKnucklesReady = false;
  combat.player.flags.elationPlayedThisTurn = false;
  combat.player.flags.burdenArmorGranted = 0;
  applyStartOfTurnStatuses(combat, combat.player, "player");
  if (combat.player.essence <= 0) {
    handleDefeat(combat);
    return;
  }
  const baseRegen = combat.player.baseApRegen + (combat.player.pendingApBonus || 0);
  combat.player.pendingApBonus = 0;
  combat.player.ap = Math.min(
    combat.player.ap + baseRegen,
    combat.player.apCarryoverMax
  );
  resetTempStats(combat.player);
  refreshActionSlots(combat);
  applyFacingEffects(combat);
  if (combat.player.temp.apRegen) {
    combat.player.ap = Math.min(
      combat.player.ap + combat.player.temp.apRegen,
      combat.player.apCarryoverMax
    );
  }
  updateCombatUI(combat);
}

function refreshActionSlots(combat) {
  const passives = combat?.player?.passives || {};
  const baseSlots = 4;
  const bonus = Math.max(0, Math.round(passives.actionSlotBonus || 0));
  const desiredCount = Math.max(1, baseSlots + bonus);
  const currentSlots = Array.isArray(combat.actionSlots)
    ? combat.actionSlots.slice(0, desiredCount)
    : [];
  while (currentSlots.length < desiredCount) {
    currentSlots.push(null);
  }
  for (let i = 0; i < currentSlots.length; i += 1) {
    const slot = currentSlots[i];
    if (!slot) {
      continue;
    }
    if (slot.retained && !slot.consumed && slot.actionKey) {
      continue;
    }
    currentSlots[i] = null;
  }

  for (let i = 0; i < currentSlots.length; i += 1) {
    if (currentSlots[i]) {
      continue;
    }
    const actionKey = drawActionFromSoup(combat);
    if (!actionKey) {
      continue;
    }
    currentSlots[i] = createActionSlot(actionKey);
  }
  combat.actionSlots = currentSlots;
}

export function burnActionSlot(combat, index, options = {}) {
  if (!combat || !Array.isArray(combat.actionSlots)) {
    return false;
  }
  const slotIndex = Number(index);
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= combat.actionSlots.length) {
    return false;
  }
  combat.actionSlots[slotIndex] = null;
  const actionKey = drawActionFromSoup(combat);
  if (actionKey) {
    combat.actionSlots[slotIndex] = createActionSlot(actionKey);
  }
  if (options.log !== false) {
    logCombat(combat, 'You burn an action slot to draw anew.');
  }
  updateCombatUI(combat);
  return true;
}

function createActionSlot(actionKey) {
  if (isDevEntryDisabled("action", actionKey)) {
    return null;
  }
  const action = ACTION_DEFINITIONS[actionKey];
  if (!action) {
    return null;
  }
  const slot = {
    actionKey,
    retained: Boolean(action.retained),
    chainKey: action.chain?.key || null,
    chainIndex: action.chain?.index || 0,
  };
  return slot;
}

function drawActionFromSoup(combat) {
  const entries = (combat.soup || []).filter(
    (entry) =>
      entry &&
      entry.action &&
      !isDevEntryDisabled("action", entry.action) &&
      ACTION_DEFINITIONS[entry.action]
  );
  if (!entries.length) {
    return null;
  }
  const total = entries.reduce(
    (sum, entry) => sum + (Number(entry.weight) || 0),
    0
  );
  if (total <= 0) {
    return null;
  }
  let roll = Math.random() * total;
  for (const entry of entries) {
    const weight = Number(entry.weight) || 0;
    if (weight <= 0) {
      continue;
    }
    if (roll <= weight) {
      return entry.action;
    }
    roll -= weight;
  }
  return entries[0]?.action || null;
}

function applyFacingEffects(combat) {
  resetTempStats(combat.player);
  combat.player.flags = combat.player.flags || {};
  combat.player.flags.discountNextAction = 0;
  combat.player.flags.unsealFaceUp = false;
  const emptySlots = combat.actionSlots.filter((slot) => slot === null).length;
  if (emptySlots > 0 && combat.player.passives.emptySlotCritBonus) {
    combat.player.temp.critChance +=
      combat.player.passives.emptySlotCritBonus * emptySlots;
  }
  combat.player.temp.damageBonus += combat.player.passives.laughterDamageBonus || 0;
  combat.player.temp.essenceRegen += combat.player.passives.songEssenceRegen || 0;

  let burdenArmorStacks = 0;
  combat.actionSlots.forEach((slot) => {
    if (!slot) {
      return;
    }
    const action = ACTION_DEFINITIONS[slot.actionKey];
    if (!action) {
      return;
    }
    if (typeof action.facingEffect === "function") {
      action.facingEffect(combat);
    }
    if (action.type === "buff" && combat.player.passives.buffCostReductionWhileFaceUp) {
      combat.player.temp.buffCostReduction += 1;
    }
    if (slot.actionKey === "strike" && combat.player.passives.strikeFaceUpCritBonus) {
      combat.player.temp.critChance += combat.player.passives.strikeFaceUpCritBonus;
    }
    if (slot.actionKey === "burden" && combat.player.passives.burdenFaceUpArmor) {
      burdenArmorStacks += combat.player.passives.burdenFaceUpArmor;
    }
  });

  const previousBurdenArmor = combat.player.flags.burdenArmorGranted || 0;
  if (burdenArmorStacks > 0) {
    const additionalArmor = Math.max(0, burdenArmorStacks - previousBurdenArmor);
    if (additionalArmor > 0) {
      combat.player.armor = (combat.player.armor || 0) + additionalArmor;
      logCombat(
        combat,
        `The mourning veil steels you (+${additionalArmor} Armor).`
      );
    }
    combat.player.flags.burdenArmorGranted = burdenArmorStacks;
  } else {
    combat.player.flags.burdenArmorGranted = 0;
  }

  if (
    combat.player.passives.buffGrantsEssenceRegen &&
    ((combat.player.statuses &&
      (combat.player.statuses.critBuff || combat.player.statuses.armor)) ||
      combat.player.temp.buffCostReduction > 0)
  ) {
    combat.player.temp.essenceRegen += combat.player.passives.buffGrantsEssenceRegen;
  }
}

export function getActionApCost(combat, action) {
  if (!action || !action.cost) {
    return 0;
  }
  if (action.cost.ap === "variable") {
    return 0;
  }
  let cost = Number(action.cost.ap) || 0;
  if (action.type === "buff") {
    cost = Math.max(0, cost - combat.player.temp.buffCostReduction);
  }
  if (action.key === "dirge" && combat.player.passives.dirgeCostReduction) {
    cost = Math.max(0, cost - combat.player.passives.dirgeCostReduction);
  }
  if (
    action.key === "breakthrough" &&
    combat.player.passives.breakthroughFatigueDiscount &&
    hasStatus(combat.enemy, "fatigue")
  ) {
    cost = Math.max(0, cost - combat.player.passives.breakthroughFatigueDiscount);
  }
  if (
    action.key === "grapple" &&
    combat.player.passives.grappleDiscountAfterStrike &&
    combat.player.flags?.brassKnucklesReady
  ) {
    cost = Math.max(0, cost - combat.player.passives.grappleDiscountAfterStrike);
  }
  const discount = combat.player.flags?.discountNextAction || 0;
  if (discount > 0) {
    cost = Math.max(0, cost - discount);
  }
  return cost;
}

export function getActionEssenceCost(combat, action) {
  if (!action || !action.cost) {
    return 0;
  }
  const cost = Number(action.cost.essence) || 0;
  return Math.max(0, cost);
}

export function performPlayerAction(combat, slotIndex) {
  if (combat.status !== "inProgress" || combat.turn !== "player") {
    return;
  }
  const slot = combat.actionSlots[slotIndex];
  if (!slot) {
    return;
  }
  const action = ACTION_DEFINITIONS[slot.actionKey];
  if (!action) {
    return;
  }
  if (isDevEntryDisabled("action", action.key)) {
    logCombat(combat, "That action has been disabled in developer tools.");
    return;
  }
  const apCost = getActionApCost(combat, action);
  const essenceCost = getActionEssenceCost(combat, action);

  if (apCost > combat.player.ap) {
    logCombat(combat, "Not enough AP to perform that action.");
    return;
  }
  if (essenceCost > combat.player.essence) {
    logCombat(combat, "Your essence is too low to channel that memory.");
    return;
  }

  const initialAp = combat.player.ap;
  const initialEssence = combat.player.essence;
  combat.player.ap -= apCost;
  if (essenceCost > 0) {
    combat.player.essence -= essenceCost;
  }

  const result = action.effect
    ? action.effect({
        combat,
        actor: combat.player,
        target: combat.enemy,
        slot,
        apCost,
      })
    : null;

  if (result && result.cancel) {
    combat.player.ap = initialAp;
    combat.player.essence = initialEssence;
    return;
  }

  if (combat.player.flags.discountNextAction) {
    combat.player.flags.discountNextAction = Math.max(
      0,
      combat.player.flags.discountNextAction - 1
    );
  }

  combat.player.history.push({
    key: action.key,
    name: action.name,
  });
  if (combat.player.history.length > 12) {
    combat.player.history.shift();
  }
  if (!["remembrance", "echo"].includes(action.key)) {
    combat.player.flags.lastAction = { key: action.key, name: action.name };
  }

  let duplicateBuff = false;
  if (action.type === "buff") {
    combat.player.flags.playedBuffThisTurn = true;
    if (
      combat.player.passives.firstBuffDuplicated &&
      !combat.player.flags.mirrorMaskTriggered
    ) {
      combat.player.flags.mirrorMaskTriggered = true;
      duplicateBuff = true;
    }
  }
  if (action.type === "attack") {
    combat.player.flags.playedAttackThisTurn = true;
  }
  if (action.key === "strike") {
    combat.player.flags.brassKnucklesReady = true;
  }
  if (action.key === "grapple") {
    combat.player.flags.brassKnucklesReady = false;
  }
  if (action.key === "elation") {
    combat.player.flags.elationPlayedThisTurn = true;
  }
  if (action.key === "breakthrough") {
    combat.player.flags.breakthroughPlayedThisCombat = true;
  }

  if (duplicateBuff) {
    action.effect?.({
      combat,
      actor: combat.player,
      target: combat.enemy,
      slot,
      apCost,
    });
    logCombat(combat, `${action.name} reverberates through the mirror mask.`);
  }

  advanceSlotChain(combat, slot, action, slotIndex);

  if (combat.enemy.essence <= 0) {
    handleVictory(combat);
    return;
  }

  applyFacingEffects(combat);
  updateCombatUI(combat);
}

function advanceSlotChain(combat, slot, action, index) {
  if (!slot) {
    return;
  }
  let cycled = false;
  if (!action || !action.chain) {
    slot.consumed = true;
  } else {
    const sequence = ACTION_SEQUENCES[action.chain.key];
    if (action.resetChain && sequence) {
      slot.chainIndex = 0;
      slot.actionKey = sequence[0];
      cycled = true;
    } else if (action.loopToStart && sequence) {
      slot.chainIndex = (slot.chainIndex + 1) % sequence.length;
      slot.actionKey = sequence[slot.chainIndex];
      cycled = true;
    } else if (sequence && slot.chainIndex + 1 < sequence.length) {
      slot.chainIndex += 1;
      slot.actionKey = sequence[slot.chainIndex];
      cycled = true;
    } else {
      slot.consumed = true;
    }
  }

  if (slot.consumed || !slot.actionKey) {
    combat.actionSlots[index] = null;
  }

  if (cycled) {
    const blockGain = Math.max(0, Number(combat.player?.passives?.cycleBlockGain || 0));
    if (blockGain > 0) {
      combat.player.block = (combat.player.block || 0) + blockGain;
      logCombat(
        combat,
        `You draw steadiness from the cycle (+${blockGain} Block).`
      );
    }
  }
}

export function endPlayerTurn(combat) {
  if (combat.status !== "inProgress") {
    return;
  }
  combat.turn = "enemy";
  combat.player.flags = combat.player.flags || {};
  combat.player.flags.blockedSinceLastTurn = false;
  combat.player.pendingApBonus += combat.player.temp.nextTurnApBonus || 0;
  applyEndOfTurnStatuses(combat, combat.player);
  if (
    combat.player.passives.armorGainNoAttack &&
    !combat.player.flags.playedAttackThisTurn
  ) {
    combat.player.armor =
      (combat.player.armor || 0) + combat.player.passives.armorGainNoAttack;
    logCombat(
      combat,
      `Stone Guardian Idol fortifies you (+${combat.player.passives.armorGainNoAttack} Armor).`
    );
  }
  if (
    combat.player.passives.elationEndHeal &&
    combat.player.flags.elationPlayedThisTurn
  ) {
    const healAmount = combat.player.passives.elationEndHeal;
    if (healAmount > 0) {
      healCombatant(combat, combat.player, healAmount);
      logCombat(
        combat,
        `Bell of Revelry restores ${healAmount} Essence at turn's end.`
      );
    }
  }
  combat.player.flags.elationPlayedThisTurn = false;
  combat.actionSlots = combat.actionSlots.map((slot) =>
    slot && slot.retained && !slot.consumed ? slot : null
  );
  updateCombatUI(combat);
  startEnemyTurn(combat);
}

function startEnemyTurn(combat) {
  if (combat.status !== "inProgress") {
    return;
  }
  combat.turn = "enemy";
  combat.player.flags = combat.player.flags || {};
  combat.player.flags.blockedDamageThisTurn = 0;
  applyStartOfTurnStatuses(combat, combat.enemy, "enemy");
  const pendingDaze =
    getStatusStacks(combat.enemy, "dazed") + (combat.enemy.flags?.pendingDaze || 0);
  if (pendingDaze > 0) {
    combat.enemy.flags = combat.enemy.flags || {};
    combat.enemy.flags.stalled = (combat.enemy.flags.stalled || 0) + pendingDaze;
    removeStatus(combat.enemy, "dazed");
    combat.enemy.flags.pendingDaze = 0;
    logCombat(
      combat,
      `${combat.enemy.name} is dazed and loses ${pendingDaze} action${
        pendingDaze === 1 ? "" : "s"
      }.`
    );
  }
  if (combat.enemy.essence <= 0) {
    handleVictory(combat);
    return;
  }
  if (combat.enemy.flags.stalled) {
    combat.enemy.flags.stalled -= 1;
    logCombat(combat, `${combat.enemy.name} hesitates and loses their turn.`);
    endEnemyTurn(combat);
    return;
  }
  performEnemyMove(combat);
  if (combat.status !== "inProgress") {
    return;
  }
  endEnemyTurn(combat);
}

function performEnemyMove(combat) {
  const enemy = combat.enemy;
  if (!enemy.moves || enemy.moves.length === 0) {
    logCombat(combat, `${enemy.name} struggles to act.`);
    return;
  }
  const move = enemy.moves[enemy.moveIndex % enemy.moves.length];
  if (!move) {
    logCombat(combat, `${enemy.name} falters.`);
    return;
  }
  logCombat(combat, `${enemy.name} uses ${move.name}.`);
  switch (move.type) {
    case "attack":
      dealDamage(combat, enemy, combat.player, move.damage || 0, {
        source: move.name,
      });
      break;
    case "block":
      enemy.block = (enemy.block || 0) + (move.block || 0);
      logCombat(combat, `${enemy.name} gains ${move.block || 0} block.`);
      break;
    case "buff":
      if (move.armor) {
        applyStatus(enemy, "armor", move.armor, { duration: 1 });
        logCombat(combat, `${enemy.name} reinforces its defenses.`);
      }
      break;
    case "debuff":
      if (move.apply) {
        Object.entries(move.apply).forEach(([key, value]) => {
          applyStatus(combat.player, key, value, { duration: 2 });
          logCombat(combat, `${combat.player.name} suffers ${key}.`);
        });
      }
      break;
    case "drain":
      dealDamage(combat, enemy, combat.player, move.damage || 0, {
        source: move.name,
      });
      if (move.heal) {
        healCombatant(combat, enemy, move.heal);
      }
      break;
    default:
      logCombat(combat, `${enemy.name} pauses, unsure how to strike.`);
      break;
  }
  if (!hasStatus(enemy, "restrained")) {
    enemy.moveIndex = (enemy.moveIndex + 1) % enemy.moves.length;
  }
  updateCombatUI(combat);
  if (combat.player.essence <= 0) {
    handleDefeat(combat);
  }
}

function endEnemyTurn(combat) {
  applyEndOfTurnStatuses(combat, combat.enemy);
  combat.round += 1;
  combat.turn = "player";
  updateCombatUI(combat);
  if (combat.status === "inProgress") {
    startPlayerTurn(combat);
  }
}

function generateMemoryRewardOptions(ctx, count) {
  const owned = new Set(ctx.state.playerMemories || []);
  const available = filterDevDisabledEntries("memory", MEMORY_DEFINITIONS);
  const pool = available.filter((memory) => !owned.has(memory.key));
  const fallback = pool.length >= count ? pool : available;
  return sampleWithoutReplacement(fallback, count);
}

function generateRelicRewardOptions(ctx, count) {
  const owned = new Set(ctx.state.playerRelics || []);
  const available = filterDevDisabledEntries("relic", RELIC_DEFINITIONS);
  const pool = available.filter((relic) => !owned.has(relic.key));
  const fallback = pool.length >= count ? pool : available;
  return sampleWithoutReplacement(fallback, count);
}

function generateConsumableRewardOptions(ctx, count) {
  const enabled = filterDevDisabledEntries("consumable", CONSUMABLE_DEFINITIONS);
  const pool = enabled.map((item) => ({ ...item }));
  return sampleWithoutReplacement(pool, count);
}

function generateMerchantDraftOptions(ctx, count, specialty = 'mixed') {
  const optionCount = Math.max(1, Math.floor(Number(count) || 0));
  const type = specialty || 'mixed';
  const mapOptions = (items, rewardType) =>
    items
      .map((item) => (item ? { ...item, rewardType } : null))
      .filter((item) => item && item.key);

  switch (type) {
    case 'memory': {
      const options = generateMemoryRewardOptions(ctx, optionCount);
      return mapOptions(options, 'memory');
    }
    case 'relic': {
      const options = generateRelicRewardOptions(ctx, optionCount);
      return mapOptions(options, 'relic');
    }
    case 'consumable': {
      const options = generateConsumableRewardOptions(ctx, optionCount);
      return mapOptions(options, 'consumable');
    }
    case 'mixed':
    default: {
      const memoryOption = mapOptions(generateMemoryRewardOptions(ctx, 1), 'memory');
      const relicOption = mapOptions(generateRelicRewardOptions(ctx, 1), 'relic');
      const consumableOption = mapOptions(
        generateConsumableRewardOptions(ctx, 1),
        'consumable'
      );
      return [...memoryOption, ...relicOption, ...consumableOption];
    }
  }
}

function applyRecoveryRoomBenefits(ctx, roomKey) {
  if (!ctx?.state) {
    return null;
  }
  const roomRewardsClaimed = {
    ...(ctx.state.roomRewardsClaimed || {}),
  };
  if (roomKey && roomRewardsClaimed[roomKey]) {
    return null;
  }
  const increase = 5;
  const previousMax =
    ctx.state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
  const newMax = previousMax + increase;
  setEssenceValues(newMax, newMax);
  if (roomKey) {
    roomRewardsClaimed[roomKey] = true;
  }
  updateState({ roomRewardsClaimed });
  ctx.updateResources?.();
  return { essenceIncrease: increase };
}

function rollDice(count, sides) {
  let total = 0;
  const dieCount = Math.max(0, Math.floor(Number(count) || 0));
  const dieSides = Math.max(1, Math.floor(Number(sides) || 0));
  for (let i = 0; i < dieCount; i += 1) {
    total += Math.floor(Math.random() * dieSides) + 1;
  }
  return total;
}

function applyEnhancedRewardAdjustments(ctx, plan) {
  if (!ctx?.state?.currentRoomIsEnhanced || !plan || typeof plan !== "object") {
    return plan;
  }

  const boostGoldReward = (reward) => {
    if (!reward || typeof reward !== "object") {
      return;
    }
    const amount = Number(reward.amount);
    if (Number.isFinite(amount) && amount > 0) {
      reward.amount = Math.max(1, Math.round(amount * ENHANCED_GOLD_MULTIPLIER));
    }
  };

  if (Array.isArray(plan.gold)) {
    if (plan.gold.length === 0) {
      plan.gold = null;
    } else {
      plan.gold.forEach(boostGoldReward);
    }
  } else if (plan.gold) {
    boostGoldReward(plan.gold);
  } else {
    plan.gold = { amount: 15, label: "Bonus" };
  }

  const mergeRewardOptions = (existing = [], additional = [], limit) => {
    const merged = [];
    const seen = new Set();
    const addItem = (item) => {
      if (!item) {
        return;
      }
      const key =
        (item.key ? String(item.key) : null) ||
        (item.name ? `name:${item.name}` : null);
      if (key && seen.has(key)) {
        return;
      }
      if (key) {
        seen.add(key);
      }
      merged.push(item);
    };
    existing.forEach(addItem);
    additional.forEach(addItem);
    if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
      return merged.slice(0, limit);
    }
    return merged;
  };

  const wasDraftBefore = {
    memory: plan.memory?.mode === "draft",
    relic: plan.relic?.mode === "draft",
    consumable: plan.consumable?.mode === "draft",
  };

  const ensureDraftForType = (type, generator, heading) => {
    const rewardPlan = plan[type];
    if (!rewardPlan || rewardPlan.mode === "none") {
      return;
    }
    const existingOptions = Array.isArray(rewardPlan.options)
      ? rewardPlan.options.slice()
      : [];
    const desiredCount = Math.max(existingOptions.length || 0, 3);
    if (rewardPlan.mode === "draft") {
      const additional = generator(desiredCount + 1);
      rewardPlan.options = mergeRewardOptions(
        existingOptions,
        additional,
        desiredCount + 1
      );
    } else if (rewardPlan.mode === "single") {
      const additional = generator(Math.max(desiredCount, 3));
      rewardPlan.mode = "draft";
      rewardPlan.options = mergeRewardOptions(
        existingOptions,
        additional,
        Math.max(desiredCount, 3)
      );
    }
    if (!rewardPlan.heading && heading) {
      rewardPlan.heading = heading;
    }
    if (rewardPlan.hideWhenNone === undefined) {
      rewardPlan.hideWhenNone = false;
    }
  };

  ensureDraftForType(
    "memory",
    (count) => generateMemoryRewardOptions(ctx, count),
    "Draft a Memory"
  );
  ensureDraftForType(
    "relic",
    (count) => generateRelicRewardOptions(ctx, count),
    "Draft a Relic"
  );
  ensureDraftForType(
    "consumable",
    (count) => generateConsumableRewardOptions(ctx, count),
    "Draft a Consumable"
  );

  let extraConsumableDrafts = 0;
  Object.entries(wasDraftBefore).forEach(([type, wasDraft]) => {
    if (wasDraft && ["memory", "relic", "consumable"].includes(type)) {
      extraConsumableDrafts += 1;
    }
  });

  if (extraConsumableDrafts > 0) {
    const consumablePlan = plan.consumable || {
      mode: "draft",
      options: [],
      heading: "Draft a Consumable",
      emptyText: "No consumables remain to claim.",
      hideWhenNone: false,
    };
    const existingOptions = Array.isArray(consumablePlan.options)
      ? consumablePlan.options.slice()
      : [];
    const desiredCount = Math.max(existingOptions.length + extraConsumableDrafts, 3);
    const additional = generateConsumableRewardOptions(ctx, desiredCount);
    consumablePlan.mode = "draft";
    consumablePlan.options = mergeRewardOptions(
      existingOptions,
      additional,
      desiredCount
    );
    consumablePlan.heading = consumablePlan.heading || "Draft a Consumable";
    consumablePlan.emptyText =
      consumablePlan.emptyText || "No consumables remain to claim.";
    consumablePlan.hideWhenNone = false;
    plan.consumable = consumablePlan;
  }

  return plan;
}

function buildRewardPlan(ctx, encounterType) {
  const plan = {
    gold: null,
    memory: { mode: "none", options: [] },
    relic: { mode: "none", options: [] },
    consumable: { mode: "none", options: [], hideWhenNone: true },
  };

  switch (encounterType) {
    case "elite": {
      plan.gold = { amount: rollDice(5, 12), label: "5d12" };
      plan.memory = {
        mode: "single",
        options: generateMemoryRewardOptions(ctx, 1),
      };
      plan.relic = {
        mode: "single",
        options: generateRelicRewardOptions(ctx, 1),
      };
      break;
    }
    case "boss": {
      const dice = rollDice(7, 12);
      plan.gold = { amount: dice + 15, label: "7d12 + 15" };
      plan.memory = {
        mode: "draft",
        options: generateMemoryRewardOptions(ctx, 3),
      };
      plan.relic = {
        mode: "draft",
        options: generateRelicRewardOptions(ctx, 3),
      };
      plan.consumable = {
        mode: "draft",
        options: generateConsumableRewardOptions(ctx, 3),
        heading: "Draft a Consumable",
        emptyText: "No consumables remain to claim.",
        hideWhenNone: false,
      };
      break;
    }
    case "treasure": {
      const categories = sampleWithoutReplacement(
        ["gold", "memory", "relic", "consumable"],
        3
      );
      plan.gold = [];
      plan.memory = { mode: "none", options: [], hideWhenNone: true };
      plan.relic = { mode: "none", options: [], hideWhenNone: true };
      plan.consumable = { mode: "none", options: [], hideWhenNone: true };
      categories.forEach((category) => {
        switch (category) {
          case "gold": {
            const goldAmount = rollDice(6, 12) + 20;
            plan.gold.push({
              amount: goldAmount,
              label: "6d12 + 20",
              description: "Large stash of gold",
            });
            break;
          }
          case "memory": {
            plan.memory = {
              mode: "draft",
              options: generateMemoryRewardOptions(ctx, 3),
              heading: "Draft a Memory",
              hideWhenNone: false,
            };
            break;
          }
          case "relic": {
            plan.relic = {
              mode: "draft",
              options: generateRelicRewardOptions(ctx, 3),
              heading: "Draft a Relic",
              hideWhenNone: false,
            };
            break;
          }
          case "consumable": {
            plan.consumable = {
              mode: "draft",
              options: generateConsumableRewardOptions(ctx, 3),
              heading: "Draft a Consumable",
              emptyText: "No consumables remain to claim.",
              hideWhenNone: false,
            };
            break;
          }
          default:
            break;
        }
      });
      if (Array.isArray(plan.gold) && plan.gold.length === 0) {
        plan.gold = null;
      }
      break;
    }
    case "combat":
    default: {
      plan.gold = { amount: rollDice(3, 12), label: "3d12" };
      const memoryOptions = generateMemoryRewardOptions(ctx, 1);
      const relicOptions = generateRelicRewardOptions(ctx, 1);
      const offerMemoryFirst = Math.random() < 0.5;
      if (offerMemoryFirst && memoryOptions.length > 0) {
        plan.memory = { mode: "single", options: memoryOptions };
      } else if (!offerMemoryFirst && relicOptions.length > 0) {
        plan.relic = { mode: "single", options: relicOptions };
      } else if (memoryOptions.length > 0) {
        plan.memory = { mode: "single", options: memoryOptions };
      } else if (relicOptions.length > 0) {
        plan.relic = { mode: "single", options: relicOptions };
    }
      break;
    }
  }

  return applyEnhancedRewardAdjustments(ctx, plan);
}

const REWARD_TYPE_CONFIG = {
  memory: {
    label: "Memory",
    headings: { single: "Memory Reward", draft: "Choose a Memory" },
    noneText: "No memory reward is offered.",
    emptyText: "No memories remain to claim.",
    applyReward: (item, ctx) => addMemoryToState(item.key, ctx),
  },
  relic: {
    label: "Relic",
    headings: { single: "Relic Reward", draft: "Choose a Relic" },
    noneText: "No relic reward is offered.",
    emptyText: "No relics remain to claim.",
    applyReward: (item, ctx) => addRelic(item.key, ctx),
  },
  consumable: {
    label: "Consumable",
    headings: {
      single: "Consumable Reward",
      draft: "Choose a Consumable",
    },
    noneText: "No consumable reward is offered.",
    emptyText: "No consumables remain to claim.",
    applyReward: (item, ctx) => addConsumable(item.key, 1, ctx),
  },
  mixed: {
    label: "Boon",
    headings: { draft: "Draft a Boon" },
    noneText: "No draft is currently available.",
    emptyText: "No options remain to claim.",
    applyReward: (item, ctx) => {
      switch (item.rewardType) {
        case "memory":
          return addMemoryToState(item.key, ctx);
        case "relic":
          return addRelic(item.key, ctx);
        case "consumable":
          return addConsumable(item.key, 1, ctx);
        default:
          return false;
      }
    },
  },
};

function formatRewardTypeLabel(type) {
  switch (type) {
    case "memory":
      return "Memory";
    case "relic":
      return "Relic";
    case "consumable":
      return "Consumable";
    case "mixed":
      return "Boon";
    default:
      if (!type) {
        return "";
      }
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

function formatRewardOptionName(type, item) {
  const baseName = item.name || item.key || "Unknown Reward";
  const isConsumableOption =
    type === "consumable" || item.rewardType === "consumable";
  const iconText =
    isConsumableOption && (item.icon || baseName.charAt(0).toUpperCase());
  let name = baseName;
  if (iconText && !baseName.startsWith(`${iconText} `)) {
    name = `${iconText} ${baseName}`;
  }
  if (type === "mixed" && item.rewardType) {
    const label = formatRewardTypeLabel(item.rewardType);
    return label ? `${name} (${label})` : name;
  }
  return name;
}

function buildRewardSection({
  type,
  plan,
  ctx,
  rewardState,
  onClaim,
}) {
  if (!plan) {
    return null;
  }
  const mode = plan.mode || "none";
  const options = Array.isArray(plan.options) ? plan.options : [];
  const config = REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.mixed;
  const typeState =
    rewardState.types[type] ||
    (rewardState.types[type] = {
      buttons: [],
      mode,
      hideWhenNone: !!plan.hideWhenNone,
      claimed:
        mode === "none" ||
        (options.length === 0 && !(plan.hideWhenNone && mode === "none")),
    });
  typeState.mode = mode;
  typeState.hideWhenNone = !!plan.hideWhenNone;
  typeState.buttons = [];

  if (mode === "none" && typeState.hideWhenNone) {
    typeState.claimed = true;
    return null;
  }

  const fallbackLabel = config.label || formatRewardTypeLabel(type);
  const headingText =
    plan.heading ||
    (config.headings && (config.headings[mode] || config.headings.default)) ||
    (mode === "draft"
      ? `Choose a ${fallbackLabel}`
      : `${fallbackLabel} Reward`);

  const section = createElement("section", "combat-rewards__section");
  const heading = createElement("h4", "combat-rewards__heading", headingText);
  section.appendChild(heading);

  const list = createElement("div", "combat-rewards__choices");
  const noneText =
    plan.noneText || config.noneText || "No reward is offered.";
  const emptyText =
    plan.emptyText || config.emptyText || "No rewards remain to claim.";

  if (mode === "none") {
    typeState.claimed = true;
    list.appendChild(createElement("p", "combat-rewards__detail", noneText));
  } else if (options.length === 0) {
    typeState.claimed = true;
    list.appendChild(createElement("p", "combat-rewards__detail", emptyText));
  } else {
    options.forEach((item) => {
      const button = createElement("button", "reward-option");
      button.type = "button";
      button.classList.add(`reward-option--${type}`);
      if (type === "mixed" && item.rewardType) {
        button.classList.add(`reward-option--${item.rewardType}`);
      }
      const displayName = formatRewardOptionName(type, item);
      button.appendChild(
        createElement("span", "reward-option__name", displayName)
      );
      if (item.description) {
        button.appendChild(
          createElement("span", "reward-option__detail", item.description)
        );
        button.title = item.description;
      } else {
        button.title = displayName;
      }

      button.addEventListener("click", () => {
        if (button.classList.contains("is-selected")) {
          return;
        }
        const applyReward = config.applyReward;
        const success =
          typeof applyReward === "function"
            ? applyReward(item, ctx, plan)
            : false;
        if (!success) {
          return;
        }
        button.classList.add("is-selected");
        button.disabled = true;
        typeState.claimed = true;
        if (plan.mode === "draft") {
          typeState.buttons.forEach((btn) => {
            if (btn !== button) {
              btn.disabled = true;
            }
          });
        }
        ctx.updateResources?.();
        if (typeof onClaim === "function") {
          onClaim(type, item, rewardState);
        }
      });

      typeState.buttons.push(button);
      list.appendChild(button);
    });
  }

  section.appendChild(list);
  return section;
}

function createRewardsPanel(ctx, config = {}) {
  const {
    encounterType = "combat",
    plan: overridePlan = null,
    continueButton = null,
    titleText = "Rewards",
    skipLabel = "Skip Remaining Rewards",
    allowSkip = true,
    onSkip,
    onClaim,
  } = config;

  const rewardPlan = overridePlan || buildRewardPlan(ctx, encounterType);
  const panel = createElement("div", "combat-rewards");
  const title = createElement("h3", "combat-rewards__title", titleText);
  panel.appendChild(title);

  const rewardState = {
    presented: true,
    encounterType,
    panel,
    continueButton,
    types: {},
  };

  const goldRewards = Array.isArray(rewardPlan.gold)
    ? rewardPlan.gold
    : rewardPlan.gold
    ? [rewardPlan.gold]
    : [];
  goldRewards.forEach((entry) => {
    const amount = Math.max(0, Math.round(Number(entry.amount) || 0));
    if (amount <= 0) {
      return;
    }
    addGold(amount, ctx);
    const breakdown = entry.label ? ` (${entry.label})` : "";
    const parts = [`+${amount} Gold${breakdown}`];
    if (entry.description) {
      parts.push(entry.description);
    }
    panel.appendChild(
      createElement("p", "combat-rewards__detail", parts.join(" – "))
    );
  });

  const sectionOrder = [
    { type: "memory", plan: rewardPlan.memory },
    { type: "relic", plan: rewardPlan.relic },
    { type: "consumable", plan: rewardPlan.consumable },
    { type: "mixed", plan: rewardPlan.mixed },
  ];

  sectionOrder.forEach(({ type, plan: sectionPlan }) => {
    const section = buildRewardSection({
      type,
      plan: sectionPlan,
      ctx,
      rewardState,
      onClaim,
    });
    if (section) {
      panel.appendChild(section);
    }
  });

  if (allowSkip) {
    const actions = createElement("div", "combat-rewards__actions");
    const skipButton = createElement(
      "button",
      "button button--ghost combat-rewards__skip",
      skipLabel
    );
    skipButton.type = "button";
    skipButton.addEventListener("click", () => {
      Object.values(rewardState.types).forEach((typeState) => {
        typeState.buttons.forEach((btn) => {
          btn.disabled = true;
        });
      });
      rewardState.skipped = true;
      panel.remove();
      rewardState.panel = null;
      if (typeof onSkip === "function") {
        onSkip(rewardState);
      }
    });
    rewardState.skipButton = skipButton;
    actions.appendChild(skipButton);
    panel.appendChild(actions);
  }

  rewardState.panel = panel;
  return { panel, rewardState };
}

function createMerchantPanel(ctx, continueButton) {
  const panel = createElement("div", "merchant-panel");
  const merchantKey = ctx.state.currentEncounter?.sprite?.key || "";
  const specialty = MERCHANT_SPECIALTIES[merchantKey] || "mixed";
  const specialtyLabels = {
    memory: { singular: "Memory", plural: "Memories" },
    relic: { singular: "Relic", plural: "Relics" },
    consumable: { singular: "Consumable", plural: "Consumables" },
    mixed: { singular: "Boon", plural: "Curios" },
  };
  const labelSet = specialtyLabels[specialty] || specialtyLabels.mixed;
  const descriptionText =
    specialty === "mixed"
      ? "Helen offers a curated selection of memories, relics, and consumables. Each activation raises the shared cost across all merchants."
      : `This merchant deals exclusively in ${labelSet.plural.toLowerCase()}. Each activation raises the shared cost across all merchants.`;
  panel.appendChild(
    createElement("p", "merchant-panel__description", descriptionText)
  );

  const status = createElement(
    "p",
    "merchant-panel__status",
    "Activations used 0/3"
  );
  panel.appendChild(status);

  const actions = createElement("div", "merchant-panel__actions");
  const draftButton = createElement("button", "button button--primary");
  const removeButton = createElement("button", "button button--ghost");
  actions.append(draftButton, removeButton);
  panel.appendChild(actions);

  const rewardHolder = createElement("div", "merchant-panel__rewards");
  panel.appendChild(rewardHolder);

  const limitPerEncounter = 3;
  let activationsUsed = 0;
  let passiveSummary = getPlayerPassiveSummary();

  const getBaseCost = () => ctx.state.merchantDraftCost || MERCHANT_BASE_DRAFT_COST;
  const getActivationCost = () => {
    const multiplier = Math.max(0, passiveSummary.merchantCostMultiplier || 1);
    return Math.max(1, Math.round(getBaseCost() * multiplier));
  };
  const getDraftOptionCount = () => {
    const bonus = Math.max(0, Math.round(passiveSummary.draftOptionBonus || 0));
    return Math.max(1, 3 + bonus);
  };
  const getRemainingActivations = () => limitPerEncounter - activationsUsed;
  const refreshPassives = () => {
    passiveSummary = getPlayerPassiveSummary();
  };

  const updateStatus = () => {
    status.textContent = `Activations used ${activationsUsed}/${limitPerEncounter}`;
  };

  const getRemovalCandidates = () => {
    const candidates = [];
    const includeType = (type) => specialty === 'mixed' || specialty === type;
    if (includeType('memory')) {
      (ctx.state.playerMemories || []).forEach((key) => {
        const memory = MEMORY_MAP.get(key);
        candidates.push({
          type: 'memory',
          key,
          name: memory?.name || key,
        });
      });
    }
    if (includeType('relic')) {
      (ctx.state.playerRelics || []).forEach((key) => {
        const relic = RELIC_MAP.get(key);
        candidates.push({ type: 'relic', key, name: relic?.name || key });
      });
    }
    if (includeType('consumable')) {
      const consumables = ctx.state.playerConsumables || {};
      Object.entries(consumables).forEach(([key, count]) => {
        if (!count) {
          return;
        }
        const item = CONSUMABLE_MAP.get(key);
        candidates.push({
          type: 'consumable',
          key,
          name: item?.name || key,
          count: Number(count) || 0,
        });
      });
    }
    return candidates;
  };

  const updateButtons = () => {
    const remaining = getRemainingActivations();
    const cost = getActivationCost();
    const draftLabel = labelSet.singular;
    draftButton.textContent = `Draft ${draftLabel} (${cost} Gold)`;
    removeButton.textContent = `Remove ${draftLabel} (${cost} Gold)`;
    draftButton.disabled = remaining <= 0;
    const removalCandidates = getRemovalCandidates();
    removeButton.disabled = remaining <= 0 || removalCandidates.length === 0;
    if (removeButton.disabled && removalCandidates.length === 0) {
      removeButton.title = `You carry no ${labelSet.plural.toLowerCase()} to remove.`;
    } else {
      removeButton.title = `Pay ${cost} gold to remove a ${draftLabel.toLowerCase()}.`;
    }
    draftButton.title = `Pay ${cost} gold to draft ${draftLabel.toLowerCase()} options.`;
  };

  const recordActivation = (baseCost) => {
    const nextBase = baseCost + MERCHANT_DRAFT_COST_INCREMENT;
    updateState({ merchantDraftCost: nextBase });
    ctx.state.merchantDraftCost = nextBase;
    activationsUsed += 1;
    refreshPassives();
    updateStatus();
    updateButtons();
  };

  const ensureActivationAvailable = () => {
    if (getRemainingActivations() <= 0) {
      ctx.showToast('The merchant is finished bargaining with you this visit.');
      return false;
    }
    return true;
  };

  updateStatus();
  updateButtons();

  draftButton.addEventListener('click', () => {
    if (!ensureActivationAvailable()) {
      return;
    }
    const cost = getActivationCost();
    const availableGold = ctx.state.playerGold || 0;
    if (availableGold < cost) {
      ctx.showToast(`You need ${cost} gold to bargain for a draft.`);
      return;
    }
    const optionCount = specialty === 'mixed' ? 3 : getDraftOptionCount();
    const options = generateMerchantDraftOptions(ctx, optionCount, specialty);
    if (!options.length) {
      ctx.showToast('The merchant has nothing more to offer.');
      return;
    }
    const baseCost = getBaseCost();
    addGold(-cost, ctx);
    recordActivation(baseCost);
    rewardHolder.replaceChildren();

    const plan = {
      gold: null,
      memory: { mode: 'none', options: [], hideWhenNone: true },
      relic: { mode: 'none', options: [], hideWhenNone: true },
      consumable: { mode: 'none', options: [], hideWhenNone: true },
      mixed: { mode: 'none', options: [], hideWhenNone: true },
    };

    if (specialty === 'memory') {
      plan.memory = {
        mode: 'draft',
        options,
        heading: 'Draft a Memory',
        noneText: 'The merchant has no memories to trade.',
        emptyText: 'The shelf of memories is bare.',
        hideWhenNone: false,
      };
    } else if (specialty === 'relic') {
      plan.relic = {
        mode: 'draft',
        options,
        heading: 'Draft a Relic',
        noneText: 'The merchant has no relics to trade.',
        emptyText: 'No relics remain on display.',
        hideWhenNone: false,
      };
    } else if (specialty === 'consumable') {
      plan.consumable = {
        mode: 'draft',
        options,
        heading: 'Draft a Consumable',
        noneText: 'The merchant has no curios to offer.',
        emptyText: 'Every bottle and charm has been sold.',
        hideWhenNone: false,
      };
    } else {
      plan.mixed = {
        mode: 'draft',
        options,
        heading: 'Draft a Boon',
        noneText: 'The merchant has nothing to trade.',
        emptyText: 'The negotiating table is empty.',
        hideWhenNone: false,
      };
    }

    const { panel: rewardsPanel } = createRewardsPanel(ctx, {
      encounterType: 'merchant',
      plan,
      titleText: "Merchant's Offer",
      skipLabel: 'Leave the Offer',
      allowSkip: true,
      continueButton,
    });
    if (rewardsPanel) {
      rewardHolder.appendChild(rewardsPanel);
    }
  });

  const showRemovalOptions = () => {
    const candidates = getRemovalCandidates();
    rewardHolder.replaceChildren();
    if (candidates.length === 0) {
      rewardHolder.appendChild(
        createElement('p', 'merchant-panel__empty', 'Nothing to remove right now.')
      );
      return;
    }
    const list = createElement('div', 'merchant-removal');
    candidates.forEach((candidate) => {
      const labelParts = [candidate.name];
      if (candidate.count > 1) {
        labelParts.push(`×${candidate.count}`);
      }
      const optionButton = createElement(
        'button',
        'merchant-removal__option',
        labelParts.join(' ')
      );
      optionButton.type = 'button';
      optionButton.addEventListener('click', () => {
        if (!ensureActivationAvailable()) {
          return;
        }
        const cost = getActivationCost();
        const availableGold = ctx.state.playerGold || 0;
        if (availableGold < cost) {
          ctx.showToast(`You need ${cost} gold to request a removal.`);
          return;
        }
        const baseCost = getBaseCost();
        addGold(-cost, ctx);
        let removed = false;
        if (candidate.type === 'memory') {
          const memories = Array.isArray(ctx.state.playerMemories)
            ? ctx.state.playerMemories.slice()
            : [];
          const index = memories.indexOf(candidate.key);
          if (index !== -1) {
            memories.splice(index, 1);
            updateState({ playerMemories: memories });
            ctx.state.playerMemories = memories;
            removed = true;
          }
        } else if (candidate.type === 'relic') {
          const relics = Array.isArray(ctx.state.playerRelics)
            ? ctx.state.playerRelics.slice()
            : [];
          const index = relics.indexOf(candidate.key);
          if (index !== -1) {
            relics.splice(index, 1);
            updateState({ playerRelics: relics });
            ctx.state.playerRelics = relics;
            removed = true;
          }
        } else if (candidate.type === 'consumable') {
          const consumables = { ...(ctx.state.playerConsumables || {}) };
          if (consumables[candidate.key]) {
            delete consumables[candidate.key];
            updateState({ playerConsumables: consumables });
            ctx.state.playerConsumables = consumables;
            removed = true;
          }
        }
        if (removed) {
          recordActivation(baseCost);
          rewardHolder.replaceChildren(
            createElement(
              'p',
              'merchant-panel__message',
              `${candidate.name} has been removed from your run.`
            )
          );
          ctx.updateResources?.();
        } else {
          ctx.showToast('Nothing to remove.');
        }
      });
      list.appendChild(optionButton);
    });
    rewardHolder.appendChild(list);
  };

  removeButton.addEventListener('click', () => {
    if (!ensureActivationAvailable()) {
      return;
    }
    showRemovalOptions();
  });

  return panel;
}

function updateRewardContinueButton(combat) {
  if (!combat?.dom?.continueButton) {
    return;
  }
  combat.dom.continueButton.disabled = false;
}

function presentCombatRewards(combat) {
  if (!combat) {
    return;
  }
  if (combat.rewardState?.presented) {
    updateRewardContinueButton(combat);
    return;
  }
  const ctx = combat.ctx;
  const encounterType = combat.encounterType || ctx?.state?.currentEncounterType || "combat";
  const { panel, rewardState } = createRewardsPanel(ctx, {
    encounterType,
    continueButton: combat.dom?.continueButton || null,
    onSkip: () => {
      if (combat.rewardState) {
        combat.rewardState.skipped = true;
      }
      updateRewardContinueButton(combat);
    },
    onClaim: () => {
      updateRewardContinueButton(combat);
    },
  });

  combat.rewardState = rewardState;
  combat.dom.rewards = panel;

  const parent = combat.dom?.footer || combat.dom?.continueButton?.parentElement;
  if (parent && panel) {
    parent.insertBefore(panel, combat.dom.continueButton);
  }

  updateRewardContinueButton(combat);
}

function attemptCombatConsumableDrop(combat, chancePercent) {
  if (!combat?.ctx || !combat.ctx.state) {
    return;
  }
  const chance = Math.max(0, Number(chancePercent) || 0);
  if (chance < 100 && Math.random() * 100 >= chance) {
    return;
  }
  const candidates = filterDevDisabledEntries(
    "consumable",
    CONSUMABLE_DEFINITIONS
  );
  const reward = getRandomItem(candidates);
  if (!reward) {
    return;
  }
  const added = addConsumable(reward.key, 1, combat.ctx);
  if (added) {
    logCombat(combat, `You recover a ${reward.name} from the encounter.`);
  } else {
    logCombat(
      combat,
      `You glimpse a ${reward.name}, but your satchel cannot hold more.`
    );
  }
}

function handleVictory(combat) {
  if (combat.status !== "inProgress") {
    return;
  }
  combat.status = "victory";
  logCombat(combat, `${combat.enemy.name} collapses. You are victorious!`);
  if (combat.ctx?.state) {
    const encounterType =
      combat.encounterType ||
      combat.ctx.state.currentEncounterType ||
      "combat";
    const essenceValue = Math.max(0, Math.round(combat.player.essence));
    setEssenceValues(essenceValue, combat.player.maxEssence);
    combat.ctx.updateResources?.();
    if (encounterType === "elite") {
      attemptCombatConsumableDrop(combat, 100);
    } else if (encounterType === "combat") {
      attemptCombatConsumableDrop(combat, 50);
    }
    if (combat.player.flags?.greedsGamblePlayed) {
      const [reward] = sampleWithoutReplacement(
        filterDevDisabledEntries("consumable", CONSUMABLE_DEFINITIONS),
        1
      );
      if (reward) {
        addConsumable(reward.key, 1, combat.ctx);
        logCombat(combat, `Greed's Gamble pays out a ${reward.name}.`);
      }
      combat.player.flags.greedsGamblePlayed = false;
    }
    if (combat.player.flags?.unsealFaceUp) {
      addGold(20, combat.ctx);
      logCombat(combat, "The rusted key yields a cache of 20 gold.");
      combat.player.flags.unsealFaceUp = false;
    }
    const breakthroughReward = Number(
      combat.player.passives?.breakthroughGoldReward || 0
    );
    if (breakthroughReward > 0 && combat.player.flags?.breakthroughPlayedThisCombat) {
      addGold(breakthroughReward, combat.ctx);
      logCombat(
        combat,
        `The tomb key grants ${breakthroughReward} gold for your breakthrough.`
      );
      combat.player.flags.breakthroughPlayedThisCombat = false;
    }
  }
  clearActiveCombat();
  if (combat.dom.continueButton) {
    combat.dom.continueButton.disabled = true;
    combat.dom.continueButton.textContent = "Return to the Corridor";
  }
  presentCombatRewards(combat);
  updateCombatUI(combat);
}

function handleDefeat(combat) {
  if (combat.status !== "inProgress") {
    return;
  }
  combat.status = "defeat";
  logCombat(combat, "Your essence gutters out. The manor claims another spirit.");
  if (combat.ctx?.state) {
    setEssenceValues(0);
    combat.ctx.updateResources?.();
  }
  clearActiveCombat();
  if (combat.dom.continueButton) {
    combat.dom.continueButton.disabled = false;
    combat.dom.continueButton.textContent = "Return to Main Menu";
  }
  updateCombatUI(combat);
}

export function dealDamage(combat, actor, target, amount, options = {}) {
  if (combat.status !== "inProgress") {
    return;
  }
  const isPlayerActor = actor === combat.player;
  const passives = combat.player?.passives || {};
  const actionDef = options.actionKey ? ACTION_DEFINITIONS[options.actionKey] : null;
  let actionApCost = options.apCost;
  if (
    typeof actionApCost === "undefined" &&
    actionDef &&
    actionDef.cost &&
    actionDef.cost.ap !== "variable"
  ) {
    actionApCost = Number(actionDef.cost.ap) || 0;
  }
  const isAttackAction = Boolean(
    options.forceAttack || (actionDef && actionDef.type === "attack")
  );
  let baseAmount = amount;
  if (
    isPlayerActor &&
    options.actionKey === "strike" &&
    passives.strikeDamageBonus
  ) {
    baseAmount += passives.strikeDamageBonus;
  }

  let damage = baseAmount;
  if (isPlayerActor) {
    damage += combat.player.temp.damageBonus;
    damage = Math.max(0, damage);
    damage = Math.round(damage * (combat.player.temp.damageMultiplier || 1));
    if (combat.player.flags?.echoActive) {
      const modifier = combat.player.flags.echoDamageModifier || 1;
      damage = Math.round(damage * modifier);
      combat.player.flags.echoActive = false;
    }
  }
  damage = Math.max(0, damage);
  let isCrit = false;
  const vulnerableStacks = getStatusStacks(target, "vulnerable");
  if (vulnerableStacks > 0) {
    damage = Math.round(damage * 1.5);
  }

  let attackMissed = false;
  if (target.statuses?.dodge) {
    target.statuses.dodge -= 1;
    logCombat(combat, `${target.name} dodges the attack.`);
    showFloatingText(combat, combat.dom[`${target.side}Panel`], "Dodge", "info");
    attackMissed = true;
  }

  if (!attackMissed && isPlayerActor) {
    const critChance =
      combat.player.baseCritChance + combat.player.temp.critChance + getStatusStacks(actor, "critBuff");
    if (Math.random() * 100 < critChance) {
      damage = Math.round(damage * 2);
      isCrit = true;
    }
    combat.player.temp.onAttackEffects.forEach((effect) => {
      effect({ combat, actor, target });
    });
  }

  if (!attackMissed && target.block) {
    const absorbed = Math.min(target.block, damage);
    target.block -= absorbed;
    damage -= absorbed;
    if (absorbed > 0) {
      logCombat(combat, `${target.name} blocks ${absorbed} damage.`);
      if (target === combat.player) {
        target.flags = target.flags || {};
        target.flags.blockedSinceLastTurn = true;
        const threshold = passives.blockThresholdDaze || 0;
        if (threshold > 0) {
          combat.player.flags = combat.player.flags || {};
          combat.player.flags.blockedDamageThisTurn =
            (combat.player.flags.blockedDamageThisTurn || 0) + absorbed;
          const stacks = Math.max(1, passives.blockThresholdDazeStacks || 1);
          while (combat.player.flags.blockedDamageThisTurn >= threshold) {
            combat.player.flags.blockedDamageThisTurn -= threshold;
            applyStatus(combat.enemy, "dazed", stacks, { duration: 1 });
            combat.enemy.flags = combat.enemy.flags || {};
            combat.enemy.flags.pendingDaze =
              (combat.enemy.flags.pendingDaze || 0) + stacks;
            logCombat(
              combat,
              `Porcelain Rat startles ${combat.enemy.name}, applying Dazed (${stacks}).`
            );
          }
        }
      }
    }
  }
  if (!attackMissed && target.armor) {
    const mitigated = Math.min(target.armor, damage);
    damage -= mitigated;
    if (mitigated > 0) {
      logCombat(combat, `${target.name}'s armor absorbs ${mitigated} damage.`);
    }
  }

  if (!attackMissed && damage <= 0) {
    logCombat(combat, `${options.source || "The attack"} is deflected.`);
    attackMissed = true;
  }

  if (attackMissed) {
    return;
  }

  target.essence = Math.max(0, target.essence - damage);
  showFloatingText(
    combat,
    combat.dom[`${target.side}Panel`],
    `${damage}${isCrit ? "!" : ""}`,
    actor === combat.player ? "damage" : "enemy"
  );
  logCombat(
    combat,
    `${options.source || "The attack"} deals ${damage} damage to ${target.name}.`
  );

  if (isPlayerActor && options.actionKey === "throw" && passives.throwAppliesVulnerable) {
    applyStatus(target, "vulnerable", passives.throwAppliesVulnerable, { duration: 2 });
    logCombat(
      combat,
      `Ashen Brand brands ${target.name} with Vulnerable (${passives.throwAppliesVulnerable}).`
    );
  }

  if (target === combat.player && target.temp?.retaliateDamage && actor !== target) {
    const retaliation = target.temp.retaliateDamage;
    if (retaliation > 0) {
      logCombat(combat, `${target.name} retaliates for ${retaliation} damage.`);
      dealDamage(combat, target, actor, retaliation, {
        source: "Retaliate",
        forceAttack: true,
      });
    }
  }

  if (target.flags?.counterguard && target.block <= 0 && actor !== target) {
    const retaliation = Math.round(target.flags.counterguard * (target.temp.retaliateMultiplier || 1));
    target.flags.counterguard = 0;
    logCombat(combat, `${target.name} retaliates for ${retaliation} damage.`);
    dealDamage(combat, target, actor, retaliation, { source: "Counterguard" });
  }

  if (target.essence <= 0) {
    if (target.side === "enemy") {
      handleVictory(combat);
    } else {
      handleDefeat(combat);
    }
  }
}

export function onPlayerInflictFatigue(combat, stacks = 1) {
  if (!combat?.player?.passives?.fatigueApBonus) {
    return;
  }
  const bonus = combat.player.passives.fatigueApBonus;
  const total = bonus * Math.max(1, stacks);
  if (total <= 0) {
    return;
  }
  combat.player.pendingApBonus += total;
  logCombat(
    combat,
    `Grave Soil Jar stores +${total} AP for your next turn.`
  );
}

export function healCombatant(combat, combatant, amount) {
  if (amount <= 0) {
    return;
  }
  combatant.essence = Math.min(combatant.maxEssence, combatant.essence + amount);
  if (combat && combat.log) {
    logCombat(combat, `${combatant.name} recovers ${amount} essence.`);
    showFloatingText(
      combat,
      combat.dom[`${combatant.side}Panel`],
      `+${amount}`,
      "heal"
    );
  }
}

export function applyStatus(target, key, stacks = 1, options = {}) {
  if (!target.statuses) {
    target.statuses = {};
  }
  if (target.flags?.ignoreNextDebuff && target.side === "player") {
    const negativeStatuses = ["bleed", "vulnerable", "fatigue", "confused", "restrained"];
    if (negativeStatuses.includes(key)) {
      target.flags.ignoreNextDebuff = false;
      return;
    }
  }
  const status = target.statuses[key] || { stacks: 0 };
  status.stacks = (status.stacks || 0) + stacks;
  if (options.duration !== undefined) {
    status.duration = options.duration;
  }
  target.statuses[key] = status;
}

export function hasStatus(target, key) {
  return Boolean(target.statuses && target.statuses[key] && target.statuses[key].stacks > 0);
}

function getStatusStacks(target, key) {
  if (!target.statuses || !target.statuses[key]) {
    return 0;
  }
  return Number(target.statuses[key].stacks) || 0;
}

function removeStatus(target, key) {
  if (target.statuses) {
    delete target.statuses[key];
  }
}

function applyStartOfTurnStatuses(combat, combatant, side) {
  if (!combatant.statuses) {
    combatant.statuses = {};
  }
  const statuses = combatant.statuses;
  if (statuses.bleed && statuses.bleed.stacks > 0) {
    const passives = combat.player.passives || {};
    const bonus = side === "enemy" ? passives.bleedBonus || 0 : 0;
    const tempBonus =
      side === "enemy" ? combat.player?.temp?.enemyBleedBonus || 0 : 0;
    const multiplier = side === "enemy" ? passives.bleedMultiplier || 1 : 1;
    const healFraction = side === "enemy" ? passives.bleedHealFraction || 0 : 0;
    const bleedDamage = Math.max(
      0,
      Math.round((statuses.bleed.stacks + bonus + tempBonus) * multiplier)
    );
    logCombat(combat, `${combatant.name} bleeds for ${bleedDamage}.`);
    dealDamage(
      combat,
      side === "enemy" ? combat.player : combat.enemy,
      combatant,
      bleedDamage,
      { source: "Bleed" }
    );
    if (side === "enemy" && healFraction > 0 && bleedDamage > 0) {
      const healAmount = Math.round(bleedDamage * healFraction);
      if (healAmount > 0) {
        healCombatant(combat, combat.player, healAmount);
      }
    }
    statuses.bleed.stacks = Math.max(0, statuses.bleed.stacks - 1);
    if (statuses.bleed.stacks <= 0) {
      delete statuses.bleed;
    }
  }
  if (statuses.armor && statuses.armor.stacks) {
    combatant.armor = statuses.armor.stacks;
    if (statuses.armor.duration !== undefined) {
      statuses.armor.duration -= 1;
      if (statuses.armor.duration <= 0) {
        delete statuses.armor;
      }
    }
  } else {
    combatant.armor = 0;
  }
  if (statuses.vulnerable && statuses.vulnerable.duration !== undefined) {
    statuses.vulnerable.duration -= 1;
    if (statuses.vulnerable.duration <= 0) {
      delete statuses.vulnerable;
    }
  }
  if (statuses.restrained && statuses.restrained.duration !== undefined) {
    statuses.restrained.duration -= 1;
    if (statuses.restrained.duration <= 0) {
      delete statuses.restrained;
    }
  }
  combatant.block = Math.max(0, combatant.block || 0);
}

function applyEndOfTurnStatuses(combat, combatant) {
  if (combatant.temp && combatant.temp.essenceRegen) {
    healCombatant(combat, combatant, combatant.temp.essenceRegen);
  }
  if (combatant.temp && combatant.temp.endOfTurnHealing) {
    healCombatant(combat, combatant, combatant.temp.endOfTurnHealing);
  }
  if (!combatant.statuses) {
    return;
  }
  Object.entries(combatant.statuses).forEach(([key, status]) => {
    if (status.duration !== undefined) {
      status.duration -= 1;
      if (status.duration <= 0) {
        delete combatant.statuses[key];
      }
    }
  });
}

export function logCombat(combat, message) {
  if (!combat || !message) {
    return;
  }
  combat.log = combat.log || [];
  combat.log.push(message);
  updateCombatLog(combat);
}

function rerollRandomPlayerSlot(combat) {
  const available = combat.actionSlots
    .map((slot, index) => (slot ? index : null))
    .filter((index) => index !== null);
  if (!available.length) {
    logCombat(combat, "No memories to shuffle.");
    return;
  }
  const index = available[Math.floor(Math.random() * available.length)];
  const newActionKey = drawActionFromSoup(combat);
  if (!newActionKey) {
    logCombat(combat, "The memory resists reshaping.");
    return;
  }
  combat.actionSlots[index] = createActionSlot(newActionKey);
  applyFacingEffects(combat);
  updateCombatUI(combat);
  logCombat(combat, "A new memory floods your mind.");
}

export function duplicateRandomActionSlot(combat) {
  const filled = combat.actionSlots
    .map((slot, index) => (slot ? index : null))
    .filter((index) => index !== null);
  if (!filled.length) {
    logCombat(combat, "Nothing answers the mocking weep.");
    return;
  }
  const sourceIndex = filled[Math.floor(Math.random() * filled.length)];
  const source = combat.actionSlots[sourceIndex];
  const emptyIndex = combat.actionSlots.findIndex((slot) => slot === null);
  if (emptyIndex === -1) {
    logCombat(combat, "Your action slots are already full.");
    return;
  }
  combat.actionSlots[emptyIndex] = createActionSlot(source.actionKey);
  applyFacingEffects(combat);
  updateCombatUI(combat);
  logCombat(
    combat,
    `A mocking echo duplicates ${ACTION_DEFINITIONS[source.actionKey]?.name || "an action"}.`
  );
}

function advanceEnemyMove(enemy, steps) {
  if (!enemy.moves || enemy.moves.length === 0) {
    return;
  }
  enemy.moveIndex = (enemy.moveIndex + (steps || 1)) % enemy.moves.length;
}


export {
  applyRecoveryRoomBenefits,
  createRewardsPanel,
  createMerchantPanel,
};
