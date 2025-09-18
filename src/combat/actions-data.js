import {
  applyStatus,
  dealDamage,
  duplicateRandomActionSlot,
  getActionApCost,
  hasStatus,
  healCombatant,
  logCombat,
  onPlayerInflictFatigue,
} from './engine.js';

const ACTION_DEFINITIONS = {
  strike: {
    key: "strike",
    name: "Strike",
    emotion: "anger",
    cost: { ap: 1, essence: 0 },
    type: "attack",
    baseDamage: 6,
    description: "Deal 6 damage.",
    chain: { key: "angerCore", index: 0 },
    facingEffect(combat) {
      combat.player.temp.critChance += 10;
    },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 6, {
        source: "Strike",
        actionKey: "strike",
        apCost: 1,
      });
    },
  },
  grapple: {
    key: "grapple",
    name: "Grapple",
    emotion: "anger",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 3,
    description: "Deal 3 damage and apply Restrained (1).",
    chain: { key: "angerCore", index: 1 },
    facingEffect(combat) {
      combat.player.armor = (combat.player.armor || 0) + 1;
    },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 3, {
        source: "Grapple",
        actionKey: "grapple",
        apCost: 2,
      });
      const passives = actor === combat.player ? combat.player.passives || {} : {};
      const extra = passives.grappleRestrainedBonus || 0;
      const stacks = 1 + extra;
      applyStatus(target, "restrained", stacks, { duration: 1 });
      logCombat(combat, `${target.name} is restrained (${stacks}).`);
    },
  },
  throw: {
    key: "throw",
    name: "Throw",
    emotion: "anger",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 10,
    description: "Deal 10 damage. +6 damage if the target is Restrained.",
    chain: { key: "angerCore", index: 2 },
    loopToStart: true,
    effect: ({ combat, actor, target }) => {
      const bonus = hasStatus(target, "restrained") ? 6 : 0;
      dealDamage(combat, actor, target, 10 + bonus, {
        source: "Throw",
        actionKey: "throw",
        apCost: 3,
      });
    },
  },
  uppercut: {
    key: "uppercut",
    name: "Uppercut",
    emotion: "anger",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 8,
    description: "Deal 8 damage. If target is Restrained, deal +8 damage.",
    effect: ({ combat, actor, target }) => {
      const restrainedBonus = hasStatus(target, "restrained") ? 8 : 0;
      dealDamage(combat, actor, target, 8 + restrainedBonus, {
        source: "Uppercut",
        actionKey: "uppercut",
        apCost: 2,
      });
    },
  },
  bloodlash: {
    key: "bloodlash",
    name: "Bloodlash",
    emotion: "anger",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 6,
    description: "Deal 6 damage and apply Bleed (2).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 6, {
        source: "Bloodlash",
        actionKey: "bloodlash",
        apCost: 2,
      });
      applyStatus(target, "bleed", 2, { duration: 3 });
      logCombat(combat, `${target.name} suffers Bleed (2).`);
    },
  },
  feastRoar: {
    key: "feastRoar",
    name: "Feast Roar",
    emotion: "anger",
    cost: { ap: 3, essence: 0 },
    type: "buff",
    baseDamage: 0,
    description: "All attacks deal +50% damage this turn.",
    effect: ({ combat }) => {
      combat.player.temp.damageMultiplier = Math.max(
        combat.player.temp.damageMultiplier,
        1.5
      );
      logCombat(combat, "Your attacks are empowered by the feast roar.");
    },
  },
  guard: {
    key: "guard",
    name: "Guard",
    emotion: "fear",
    cost: { ap: 1, essence: 0 },
    type: "defense",
    baseDamage: 0,
    description: "Gain Block (6). Facing: Retaliate (2).",
    chain: { key: "fearCore", index: 0 },
    facingEffect(combat) {
      combat.player.temp.retaliateDamage += 2;
    },
    effect: ({ combat, actor }) => {
      const passives = actor === combat.player ? combat.player.passives || {} : {};
      const blockBonus = passives.guardBlockBonus || 0;
      const blockAmount = 6 + blockBonus;
      actor.block = (actor.block || 0) + blockAmount;
      logCombat(combat, `${actor.name} raises their guard (Block ${blockAmount}).`);
    },
  },
  brace: {
    key: "brace",
    name: "Brace",
    emotion: "fear",
    cost: { ap: 2, essence: 0 },
    type: "defense",
    baseDamage: 0,
    description: "Gain Armor (2) and Block (6).",
    chain: { key: "fearCore", index: 1 },
    effect: ({ combat, actor }) => {
      actor.block = (actor.block || 0) + 6;
      applyStatus(actor, "armor", 2, { duration: 2 });
      logCombat(combat, `${actor.name} braces behind solid defenses.`);
      if (actor === combat.player && combat.player.passives.braceRetaliate) {
        combat.player.temp.retaliateDamage += combat.player.passives.braceRetaliate;
        logCombat(
          combat,
          `Knight's Oath Band grants Retaliate (${combat.player.passives.braceRetaliate}).`
        );
      }
    },
  },
  counter: {
    key: "counter",
    name: "Counter",
    emotion: "fear",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 8,
    description: "Deal 8 damage. If you blocked since last turn, apply Dazed (1).",
    chain: { key: "fearCore", index: 2 },
    loopToStart: true,
    effect: ({ combat, actor, target }) => {
      let counterDamage = 8;
      if (
        actor === combat.player &&
        actor.flags?.blockedSinceLastTurn &&
        combat.player.passives.counterBlockedBonusDamage
      ) {
        counterDamage += combat.player.passives.counterBlockedBonusDamage;
      }
      dealDamage(combat, actor, target, counterDamage, {
        source: "Counter",
        actionKey: "counter",
        apCost: 3,
      });
      if (actor.flags?.blockedSinceLastTurn) {
        applyStatus(target, "dazed", 1, { duration: 1 });
        target.flags = target.flags || {};
        target.flags.pendingDaze = (target.flags.pendingDaze || 0) + 1;
        logCombat(combat, `${target.name} reels, becoming Dazed.`);
      }
    },
  },
  towerShield: {
    key: "towerShield",
    name: "Tower Shield",
    emotion: "fear",
    cost: { ap: 2, essence: 0 },
    type: "defense",
    baseDamage: 0,
    description: "Gain Block (10). Facing: Retaliate (3).",
    facingEffect(combat) {
      combat.player.temp.retaliateDamage += 3;
    },
    effect: ({ combat, actor }) => {
      actor.block = (actor.block || 0) + 10;
      logCombat(combat, `${actor.name} shelters behind a tower shield (Block 10).`);
    },
  },
  ironBar: {
    key: "ironBar",
    name: "Iron Bar",
    emotion: "fear",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 6,
    description: "Deal 6 damage. If you have Block, apply Dazed (1).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 6, {
        source: "Iron Bar",
        actionKey: "ironBar",
        apCost: 2,
      });
      if ((actor.block || 0) > 0) {
        applyStatus(target, "dazed", 1, { duration: 1 });
        target.flags = target.flags || {};
        target.flags.pendingDaze = (target.flags.pendingDaze || 0) + 1;
        logCombat(combat, `${target.name} is dazed by the iron blow.`);
      }
    },
  },
  pledgeStrike: {
    key: "pledgeStrike",
    name: "Pledge Strike",
    emotion: "fear",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 10,
    description: "Deal 10 damage and gain Armor (2).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 10, {
        source: "Pledge Strike",
        actionKey: "pledgeStrike",
        apCost: 3,
      });
      applyStatus(actor, "armor", 2, { duration: 2 });
    },
  },
  spark: {
    key: "spark",
    name: "Spark",
    emotion: "joy",
    cost: { ap: 1, essence: 0 },
    type: "attack",
    baseDamage: 4,
    description: "Deal 4 damage to all enemies.",
    chain: { key: "joyCore", index: 0 },
    facingEffect(combat) {
      combat.player.temp.critChance += 5;
    },
    effect: ({ combat, actor, target }) => {
      let sparkDamage = 4;
      if (
        actor === combat.player &&
        combat.player.passives.sparkBuffBonus &&
        combat.player.flags?.playedBuffThisTurn
      ) {
        sparkDamage += combat.player.passives.sparkBuffBonus;
      }
      dealDamage(combat, actor, target, sparkDamage, {
        source: "Spark",
        actionKey: "spark",
        apCost: 1,
      });
    },
  },
  festivalLight: {
    key: "festivalLight",
    name: "Festival Light",
    emotion: "joy",
    cost: { ap: 2, essence: 0 },
    type: "buff",
    baseDamage: 0,
    description: "Allies gain +1 AP this turn.",
    chain: { key: "joyCore", index: 1 },
    effect: ({ combat, actor }) => {
      actor.ap += 1;
      logCombat(combat, `${actor.name} is invigorated by festival light (+1 AP).`);
      if (actor === combat.player && combat.player.passives.festivalLightCritBonus) {
        applyStatus(
          actor,
          "critBuff",
          combat.player.passives.festivalLightCritBonus,
          { duration: 1 }
        );
        logCombat(
          combat,
          `Golden Lyre adds +${combat.player.passives.festivalLightCritBonus}% crit this turn.`
        );
      }
    },
  },
  elation: {
    key: "elation",
    name: "Elation",
    emotion: "joy",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 8,
    description: "Heal 5 Essence and deal 8 damage to a random foe.",
    chain: { key: "joyCore", index: 2 },
    loopToStart: true,
    effect: ({ combat, actor, target }) => {
      healCombatant(combat, actor, 5);
      dealDamage(combat, actor, target, 8, {
        source: "Elation",
        actionKey: "elation",
        apCost: 3,
      });
    },
  },
  songOfTriumph: {
    key: "songOfTriumph",
    name: "Song of Triumph",
    emotion: "joy",
    cost: { ap: 2, essence: 0 },
    type: "buff",
    baseDamage: 0,
    description: "Allies gain +1% Crit and +1 Essence Regen for 1 turn.",
    effect: ({ combat, actor }) => {
      applyStatus(actor, "critBuff", 1, { duration: 1 });
      actor.temp.essenceRegen += 1;
      logCombat(combat, `${actor.name} sings a triumphant song.`);
    },
  },
  cheer: {
    key: "cheer",
    name: "Cheer",
    emotion: "joy",
    cost: { ap: 1, essence: 0 },
    type: "heal",
    baseDamage: 0,
    description: "Heal 3 Essence. Facing: +5% Crit.",
    facingEffect(combat) {
      combat.player.temp.critChance += 5;
    },
    effect: ({ combat, actor }) => {
      healCombatant(combat, actor, 3);
    },
  },
  lanternGlow: {
    key: "lanternGlow",
    name: "Lantern Glow",
    emotion: "joy",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 7,
    description: "Deal 7 AoE damage and heal 5 Essence.",
    effect: ({ combat, actor, target }) => {
      healCombatant(combat, actor, 5);
      dealDamage(combat, actor, target, 7, {
        source: "Lantern Glow",
        actionKey: "lanternGlow",
        apCost: 3,
      });
    },
  },
  burden: {
    key: "burden",
    name: "Burden",
    emotion: "sadness",
    cost: { ap: 1, essence: 0 },
    type: "attack",
    baseDamage: 2,
    description: "Deal 2 damage and apply Fatigue (1).",
    chain: { key: "sadnessCore", index: 0 },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 2, {
        source: "Burden",
        actionKey: "burden",
        apCost: 1,
      });
      applyStatus(target, "fatigue", 1, { duration: 2 });
      if (actor === combat.player) {
        onPlayerInflictFatigue(combat, 1);
      }
    },
  },
  wither: {
    key: "wither",
    name: "Wither",
    emotion: "sadness",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 5,
    description: "Deal 5 damage and apply Bleed (2).",
    chain: { key: "sadnessCore", index: 1 },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 5, {
        source: "Wither",
        actionKey: "wither",
        apCost: 2,
      });
      applyStatus(target, "bleed", 2, { duration: 3 });
      if (actor === combat.player && combat.player.passives.witherAppliesExtraBleed) {
        applyStatus(
          target,
          "bleed",
          combat.player.passives.witherAppliesExtraBleed,
          { duration: 3 }
        );
        logCombat(
          combat,
          `Dirge Bell deepens the wound (Bleed +${combat.player.passives.witherAppliesExtraBleed}).`
        );
      }
    },
  },
  breakthrough: {
    key: "breakthrough",
    name: "Breakthrough",
    emotion: "sadness",
    cost: { ap: 3, essence: 5 },
    type: "attack",
    baseDamage: 12,
    description: "Deal 12 damage. If the foe is bleeding or fatigued, gain +2 AP next turn.",
    chain: { key: "sadnessCore", index: 2 },
    resetChain: true,
    effect: ({ combat, actor, target }) => {
      if (actor.essence < 5) {
        logCombat(combat, `${actor.name} lacks the Essence to unleash Breakthrough.`);
        return { cancel: true };
      }
      actor.essence -= 5;
      dealDamage(combat, actor, target, 12, {
        source: "Breakthrough",
        actionKey: "breakthrough",
        apCost: 3,
      });
      if (hasStatus(target, "bleed") || hasStatus(target, "fatigue")) {
        combat.player.pendingApBonus = (combat.player.pendingApBonus || 0) + 2;
        logCombat(combat, "Momentum surges toward next turn (+2 AP).");
      }
    },
  },
  dirge: {
    key: "dirge",
    name: "Dirge",
    emotion: "sadness",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 6,
    description: "Deal 6 AoE damage and apply Fatigue (1) to all foes.",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 6, {
        source: "Dirge",
        actionKey: "dirge",
        apCost: 3,
      });
      applyStatus(target, "fatigue", 1, { duration: 2 });
      if (actor === combat.player) {
        onPlayerInflictFatigue(combat, 1);
      }
    },
  },
  shroudOfLoss: {
    key: "shroudOfLoss",
    name: "Shroud of Loss",
    emotion: "sadness",
    cost: { ap: 2, essence: 0 },
    type: "defense",
    baseDamage: 0,
    description: "Gain Block (8). Facing: enemies take +1 Bleed damage.",
    facingEffect(combat) {
      combat.player.temp.enemyBleedBonus += 1;
    },
    effect: ({ combat, actor }) => {
      actor.block = (actor.block || 0) + 8;
      logCombat(combat, `${actor.name} is wrapped in a shroud of loss (Block 8).`);
    },
  },
  remembrance: {
    key: "remembrance",
    name: "Remembrance",
    emotion: "sadness",
    cost: { ap: 1, essence: 0 },
    type: "attack",
    baseDamage: 3,
    description: "Deal 3 damage. Facing: +1 AP next turn.",
    chain: { key: "sadnessCore", index: 1 },
    facingEffect(combat) {
      combat.player.temp.nextTurnApBonus += 1;
    },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 3, {
        source: "Remembrance",
        actionKey: "remembrance",
        apCost: 1,
      });
    },
  },
  riposteSlash: {
    key: "riposteSlash",
    name: "Riposte Slash",
    emotion: "hybrid",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 7,
    description: "Deal 7 damage. If you blocked since last turn, deal 12 instead.",
    effect: ({ combat, actor, target }) => {
      const base = actor.flags?.blockedSinceLastTurn ? 12 : 7;
      dealDamage(combat, actor, target, base, {
        source: "Riposte Slash",
        actionKey: "riposteSlash",
        apCost: 3,
      });
    },
  },
  feastFireworks: {
    key: "feastFireworks",
    name: "Feast Fireworks",
    emotion: "hybrid",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 5,
    description: "Deal 5 AoE damage. Allies gain +5% Crit this turn.",
    effect: ({ combat, actor, target }) => {
      combat.player.temp.critChance += 5;
      dealDamage(combat, actor, target, 5, {
        source: "Feast Fireworks",
        actionKey: "feastFireworks",
        apCost: 2,
      });
    },
  },
  backstab: {
    key: "backstab",
    name: "Backstab",
    emotion: "hybrid",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 6,
    description: "Deal 6 damage; apply Bleed (1) and Fatigue (1).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 6, {
        source: "Backstab",
        actionKey: "backstab",
        apCost: 2,
      });
      applyStatus(target, "bleed", 1, { duration: 2 });
      applyStatus(target, "fatigue", 1, { duration: 2 });
      if (actor === combat.player) {
        onPlayerInflictFatigue(combat, 1);
      }
    },
  },
  blessedGuard: {
    key: "blessedGuard",
    name: "Blessed Guard",
    emotion: "hybrid",
    cost: { ap: 2, essence: 0 },
    type: "defense",
    baseDamage: 0,
    description: "Gain Block (8). Heal 3 Essence to all allies.",
    effect: ({ combat, actor }) => {
      actor.block = (actor.block || 0) + 8;
      healCombatant(combat, actor, 3);
      logCombat(combat, `${actor.name} shares a blessed guard.`);
    },
  },
  processionalChant: {
    key: "processionalChant",
    name: "Processional Chant",
    emotion: "hybrid",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 5,
    description: "Deal 5 AoE damage and apply Fatigue (1) to all foes.",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 5, {
        source: "Processional Chant",
        actionKey: "processionalChant",
        apCost: 3,
      });
      applyStatus(target, "fatigue", 1, { duration: 2 });
      if (actor === combat.player) {
        onPlayerInflictFatigue(combat, 1);
      }
    },
  },
  mockingWeep: {
    key: "mockingWeep",
    name: "Mocking Weep",
    emotion: "hybrid",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 4,
    description: "Deal 4 damage and duplicate a random action in your set.",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 4, {
        source: "Mocking Weep",
        actionKey: "mockingWeep",
        apCost: 2,
      });
      duplicateRandomActionSlot(combat);
    },
  },
  brokenPlaything: {
    key: "brokenPlaything",
    name: "Broken Plaything",
    emotion: "ambiguous",
    cost: { ap: 1, essence: 0 },
    type: "attack",
    baseDamage: 3,
    description: "Deal 3 damage and apply Vulnerable (1).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 3, {
        source: "Broken Plaything",
        actionKey: "brokenPlaything",
        apCost: 1,
      });
      applyStatus(target, "vulnerable", 1, { duration: 2 });
    },
  },
  vowbreaker: {
    key: "vowbreaker",
    name: "Vowbreaker",
    emotion: "ambiguous",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 7,
    description: "Deal 7 damage and apply Bleed (1).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 7, {
        source: "Vowbreaker",
        actionKey: "vowbreaker",
        apCost: 2,
      });
      applyStatus(target, "bleed", 1, { duration: 2 });
    },
  },
  carnivalFire: {
    key: "carnivalFire",
    name: "Carnival Fire",
    emotion: "ambiguous",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 5,
    description: "Deal 5 AoE damage. Facing: +1 Essence Regen.",
    facingEffect(combat) {
      combat.player.temp.essenceRegen += 1;
    },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 5, {
        source: "Carnival Fire",
        actionKey: "carnivalFire",
        apCost: 2,
      });
    },
  },
  bloomOfThorns: {
    key: "bloomOfThorns",
    name: "Bloom of Thorns",
    emotion: "ambiguous",
    cost: { ap: 3, essence: 0 },
    type: "attack",
    baseDamage: 8,
    description: "Deal 8 damage and gain Armor (2).",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 8, {
        source: "Bloom of Thorns",
        actionKey: "bloomOfThorns",
        apCost: 3,
      });
      applyStatus(actor, "armor", 2, { duration: 2 });
    },
  },
  borrowedTime: {
    key: "borrowedTime",
    name: "Borrowed Time",
    emotion: "ambiguous",
    cost: { ap: 0, essence: 0 },
    type: "buff",
    baseDamage: 0,
    description: "Gain +2 AP; lose 2 Essence.",
    effect: ({ combat, actor }) => {
      if (actor.essence < 2) {
        logCombat(combat, "You lack the essence to borrow more time.");
        return { cancel: true };
      }
      actor.essence -= 2;
      actor.ap += 2;
      logCombat(combat, `${actor.name} steals moments from the hourglass.`);
    },
  },
  echo: {
    key: "echo",
    name: "Echo",
    emotion: "ambiguous",
    cost: { ap: "variable", essence: 0 },
    type: "attack",
    baseDamage: 0,
    description: "Copy the last action at +1 AP cost and −20% damage.",
    effect: ({ combat, actor }) => {
      const last = actor.flags?.lastAction;
      if (!last) {
        logCombat(combat, "There is no action to echo.");
        return { cancel: true };
      }
      const action = ACTION_DEFINITIONS[last.key];
      if (!action) {
        logCombat(combat, "The last action cannot be echoed.");
        return { cancel: true };
      }
      const baseCost = getActionApCost(combat, action);
      const totalCost = baseCost + 1;
      if (totalCost > actor.ap) {
        logCombat(combat, "You lack the AP to echo that memory.");
        return { cancel: true };
      }
      actor.ap -= totalCost;
      combat.player.flags = combat.player.flags || {};
      combat.player.flags.echoDamageModifier = 0.8;
      combat.player.flags.echoActive = true;
      action.effect?.({ combat, actor, target: combat.enemy, slot: null });
      combat.player.history.push({ key: action.key, name: `${action.name} (Echo)` });
      combat.player.flags.echoActive = false;
      combat.player.flags.echoDamageModifier = 1;
      return { spentCustomAp: totalCost };
    },
  },
  flicker: {
    key: "flicker",
    name: "Flicker",
    emotion: "ambiguous",
    cost: { ap: 1, essence: 0 },
    type: "attack",
    baseDamage: 3,
    description: "Deal 3 damage. Facing: next action costs −1 AP.",
    facingEffect(combat) {
      combat.player.flags = combat.player.flags || {};
      combat.player.flags.discountNextAction =
        (combat.player.flags.discountNextAction || 0) + 1;
    },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 3, {
        source: "Flicker",
        actionKey: "flicker",
        apCost: 1,
      });
    },
  },
  greedsGamble: {
    key: "greedsGamble",
    name: "Greed's Gamble",
    emotion: "ambiguous",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 5,
    description: "Deal 5 damage. If played, gain a random consumable after combat.",
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 5, {
        source: "Greed's Gamble",
        actionKey: "greedsGamble",
        apCost: 2,
      });
      combat.player.flags = combat.player.flags || {};
      combat.player.flags.greedsGamblePlayed = true;
      logCombat(combat, "You wager future spoils on this strike.");
    },
  },
  unseal: {
    key: "unseal",
    name: "Unseal",
    emotion: "ambiguous",
    cost: { ap: 2, essence: 0 },
    type: "attack",
    baseDamage: 6,
    description: "Deal 6 damage. Facing: if in play when combat ends, gain +20 gold.",
    facingEffect(combat) {
      combat.player.flags = combat.player.flags || {};
      combat.player.flags.unsealFaceUp = true;
    },
    effect: ({ combat, actor, target }) => {
      dealDamage(combat, actor, target, 6, {
        source: "Unseal",
        actionKey: "unseal",
        apCost: 2,
      });
    },
  },
};



export { ACTION_DEFINITIONS };
