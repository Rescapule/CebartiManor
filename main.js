(function () {
  const backgrounds = {
    splash: "bg_cebartimanor_ext.png",
    menu: "bg_wallpaper.png",
    well: "bg_room_well.png",
    corridor: "bg_corridor.png",
    foyer: "bg_room_foyer.png",
    victory: "bg_victoryscreen.png",
  };

  const playerCharacter = {
    key: "playerGhost",
    name: "Player Ghost",
    src: "cs_player_ghost1.png",
    alt: "The player's ghostly form glimmering with cerulean ectoplasm.",
    facing: "right",
  };

  const enemySprites = [
    {
      key: "corridorMimic",
      name: "Corridor Mimic",
      src: "cs_enemy_corridormimic1.png",
      alt: "A corridor mimic unfurling a maw of warped floorboards.",
      facing: "left",
    },
    {
      key: "greedyShade",
      name: "Greedy Shade",
      src: "cs_enemy_greedyshade1.png",
      alt: "A hunched shade clutching pilfered relics to its chest.",
      facing: "left",
    },
    {
      key: "jesterWraith",
      name: "Jester Wraith",
      src: "cs_enemy_jesterwraith1.png",
      alt: "A wraith clad in jester bells with a razor grin.",
      facing: "left",
    },
    {
      key: "mourningChoir",
      name: "Mourning Choir",
      src: "cs_enemy_mourningchoir1.png",
      alt: "A trio of veiled mourners singing a spectral hymn.",
      facing: "left",
    },
    {
      key: "oathbreakerKnight",
      name: "Oathbreaker Knight",
      src: "cs_enemy_oathbreakerknight1.png",
      alt: "A fallen knight wreathed in oathbound chains.",
      facing: "left",
    },
    {
      key: "possessedArmor",
      name: "Possessed Armor",
      src: "cs_enemy_possessedarmor1.png",
      alt: "Vacant armor animated by violet specters.",
      facing: "left",
    },
    {
      key: "stygianHound",
      name: "Stygian Hound",
      src: "cs_enemy_stygianhound1.png",
      alt: "A spectral hound with abyssal flame eyes.",
      facing: "left",
    },
    {
      key: "wailingWidow",
      name: "Wailing Widow",
      src: "cs_enemy_wailingwidow1.png",
      alt: "A widow draped in tattered mourning veils.",
      facing: "left",
    },
  ];

  const bossSprites = [
    {
      key: "archivist",
      name: "The Archivist",
      src: "cs_boss_archivist1.png",
      alt: "The Archivist boss cloaked in luminous script.",
      facing: "left",
    },
    {
      key: "floodBride",
      name: "The Flood Bride",
      src: "cs_boss_floodbride1.png",
      alt: "The Flood Bride boss trailing drowned lace and tidewater.",
      facing: "left",
    },
  ];

  const merchantSprites = [
    {
      key: "bellringer",
      name: "Bellringer",
      src: "cs_npc_bellringer1.png",
      alt: "A spectral bellringer merchant cradling chains of chimes.",
      facing: "left",
    },
    {
      key: "candleman",
      name: "Candleman",
      src: "cs_npc_candleman1.png",
      alt: "A waxen vendor crowned with flickering candles.",
      facing: "left",
    },
    {
      key: "collector",
      name: "Collector",
      src: "cs_npc_collector1.png",
      alt: "A cloaked collector weighed down by curiosities.",
      facing: "left",
    },
    {
      key: "helenCebarti",
      name: "Helen Cebarti",
      src: "cs_npc_helencebarti1.png",
      alt: "Helen Cebarti, poised behind a spectral negotiating table.",
      facing: "left",
    },
    {
      key: "ragpicker",
      name: "Ragpicker",
      src: "cs_npc_ragpicker1.png",
      alt: "A ragpicker merchant draped in salvaged fabrics.",
      facing: "left",
    },
  ];

  const ACTION_SEQUENCES = {
    brawler: ["strike", "grapple", "throw"],
    festival: ["festivalLight", "sparks"],
    fatigue: ["fatigue", "stumble", "breakthrough"],
  };

  const ACTION_DEFINITIONS = {
    strike: {
      key: "strike",
      name: "Strike",
      emotion: "anger",
      cost: { ap: 1, essence: 0 },
      type: "attack",
      baseDamage: 6,
      description: "Deal 6 damage.",
      chain: { key: "brawler", index: 0 },
      facingEffect(combat) {
        combat.player.temp.critChance += 5;
      },
      effect: ({ combat, actor, target }) => {
        dealDamage(combat, actor, target, 6, { source: "Strike" });
      },
    },
    grapple: {
      key: "grapple",
      name: "Grapple",
      emotion: "anger",
      cost: { ap: 2, essence: 0 },
      type: "control",
      baseDamage: 0,
      description: "Restrain the target; they cannot cycle actions next turn.",
      chain: { key: "brawler", index: 1 },
      facingEffect(combat) {
        combat.player.temp.armor += 2;
      },
      effect: ({ combat, actor, target }) => {
        applyStatus(target, "restrained", 1, { duration: 1 });
        logCombat(
          combat,
          `${actor.name} restrains ${target.name}, preventing cycling next turn.`
        );
      },
    },
    throw: {
      key: "throw",
      name: "Throw",
      emotion: "anger",
      cost: { ap: 3, essence: 0 },
      type: "attack",
      baseDamage: 12,
      description: "Deal 12 damage; +6 if the target is restrained.",
      chain: { key: "brawler", index: 2 },
      loopToStart: true,
      effect: ({ combat, actor, target }) => {
        const bonus = hasStatus(target, "restrained") ? 6 : 0;
        dealDamage(combat, actor, target, 12 + bonus, { source: "Throw" });
      },
    },
    bloodlash: {
      key: "bloodlash",
      name: "Bloodlash",
      emotion: "anger",
      cost: { ap: 2, essence: 0 },
      type: "attack",
      baseDamage: 8,
      description: "Deal 8 damage and apply Bleed (2).",
      effect: ({ combat, actor, target }) => {
        dealDamage(combat, actor, target, 8, { source: "Bloodlash" });
        applyStatus(target, "bleed", 2, { duration: 3 });
        logCombat(combat, `${target.name} suffers Bleed (2).`);
      },
    },
    roar: {
      key: "roar",
      name: "Roar",
      emotion: "anger",
      cost: { ap: 1, essence: 0 },
      type: "utility",
      baseDamage: 0,
      description: "Force all enemy action slots to cycle once.",
      effect: ({ combat, actor, target }) => {
        advanceEnemyMove(target, 1);
        applyStatus(target, "shaken", 1, { duration: 1 });
        logCombat(
          combat,
          `${actor.name}'s roar unsettles ${target.name}, scrambling their next move.`
        );
      },
    },
    smash: {
      key: "smash",
      name: "Smash",
      emotion: "anger",
      cost: { ap: 3, essence: 0 },
      type: "attack",
      baseDamage: 12,
      description: "Deal 12 damage; +6 if the target has Bleed.",
      effect: ({ combat, actor, target }) => {
        const bleedStacks = getStatusStacks(target, "bleed");
        const bonus = bleedStacks > 0 ? 6 : 0;
        dealDamage(combat, actor, target, 12 + bonus, { source: "Smash" });
      },
    },
    overdrive: {
      key: "overdrive",
      name: "Overdrive",
      emotion: "anger",
      cost: { ap: "variable", essence: 0 },
      type: "attack",
      baseDamage: 0,
      description: "Spend remaining AP to deal 3× AP spent as damage.",
      facingEffect(combat) {
        combat.player.temp.apRegen += 1;
      },
      effect: ({ combat, actor, target }) => {
        const apSpent = Math.max(0, actor.ap);
        if (apSpent <= 0) {
          logCombat(combat, "No AP remains for Overdrive.");
          return { cancel: true };
        }
        const damage = apSpent * 3;
        actor.ap = 0;
        dealDamage(combat, actor, target, damage, { source: "Overdrive" });
        logCombat(
          combat,
          `${actor.name} channels ${apSpent} AP into Overdrive for ${damage} damage.`
        );
        return { spentCustomAp: apSpent };
      },
    },
    etherealShroud: {
      key: "etherealShroud",
      name: "Ethereal Shroud",
      emotion: "fear",
      cost: { ap: 2, essence: 0 },
      type: "defense",
      baseDamage: 0,
      description: "Gain Block (8). This action is retained until used.",
      retained: true,
      facingEffect(combat) {
        combat.player.temp.armor += 2;
      },
      effect: ({ combat, actor }) => {
        actor.block = (actor.block || 0) + 8;
        logCombat(combat, `${actor.name} gains an ethereal shroud (Block 8).`);
      },
    },
    counterguard: {
      key: "counterguard",
      name: "Counterguard",
      emotion: "fear",
      cost: { ap: 2, essence: 0 },
      type: "defense",
      baseDamage: 0,
      description: "Gain Block (6). If all damage is blocked, retaliate for 5.",
      facingEffect(combat) {
        combat.player.temp.retaliateMultiplier = Math.max(
          combat.player.temp.retaliateMultiplier,
          2
        );
      },
      effect: ({ combat, actor }) => {
        actor.block = (actor.block || 0) + 6;
        actor.flags = actor.flags || {};
        actor.flags.counterguard = 5;
        logCombat(combat, `${actor.name} prepares to counter with Counterguard.`);
      },
    },
    stall: {
      key: "stall",
      name: "Stall",
      emotion: "fear",
      cost: { ap: 1, essence: 0 },
      type: "control",
      baseDamage: 0,
      description: "Force the enemy to delay its next action.",
      effect: ({ combat, target }) => {
        target.flags = target.flags || {};
        target.flags.stalled = (target.flags.stalled || 0) + 1;
        logCombat(combat, `${target.name} hesitates, their next action delayed.`);
      },
    },
    festivalLight: {
      key: "festivalLight",
      name: "Festival Light",
      emotion: "joy",
      cost: { ap: 2, essence: 0 },
      type: "buff",
      baseDamage: 0,
      description: "Gain +10% Crit Chance for 2 turns.",
      chain: { key: "festival", index: 0 },
      effect: ({ combat, actor }) => {
        applyStatus(actor, "critBuff", 10, { duration: 2 });
        logCombat(combat, `${actor.name}'s strikes glow with festival light.`);
      },
    },
    sparks: {
      key: "sparks",
      name: "Sparks",
      emotion: "joy",
      cost: { ap: 2, essence: 0 },
      type: "attack",
      baseDamage: 5,
      description: "Deal 5 damage to the enemy.",
      chain: { key: "festival", index: 1 },
      loopToStart: true,
      effect: ({ combat, actor, target }) => {
        dealDamage(combat, actor, target, 5, { source: "Sparks" });
      },
    },
    cheer: {
      key: "cheer",
      name: "Cheer",
      emotion: "joy",
      cost: { ap: 1, essence: 0 },
      type: "buff",
      baseDamage: 0,
      description: "Gain +2 AP for this turn only.",
      facingEffect(combat) {
        combat.player.temp.buffCostReduction += 1;
      },
      effect: ({ combat, actor }) => {
        actor.ap += 2;
        logCombat(combat, `${actor.name} rallies, gaining 2 temporary AP.`);
      },
    },
    songOfTriumph: {
      key: "songOfTriumph",
      name: "Song of Triumph",
      emotion: "joy",
      cost: { ap: 3, essence: 0 },
      type: "buff",
      baseDamage: 0,
      description: "Grant +2 Armor, +10% Crit Chance, +1 Speed for 1 turn.",
      facingEffect(combat) {
        combat.player.temp.essenceRegen += 1;
      },
      effect: ({ combat, actor }) => {
        applyStatus(actor, "armor", 2, { duration: 1 });
        applyStatus(actor, "critBuff", 10, { duration: 1 });
        actor.temp.nextTurnApBonus += 1;
        logCombat(combat, `${actor.name} sings a triumphant song, bolstering their spirit.`);
      },
    },
    laughter: {
      key: "laughter",
      name: "Laughter",
      emotion: "joy",
      cost: { ap: 1, essence: 0 },
      type: "heal",
      baseDamage: 0,
      description: "Heal 3 Essence.",
      facingEffect(combat) {
        combat.player.temp.endOfTurnHealing += 1;
        combat.player.temp.damageBonus += 1;
      },
      effect: ({ combat, actor }) => {
        healCombatant(combat, actor, 3);
      },
    },
    fatigue: {
      key: "fatigue",
      name: "Fatigue",
      emotion: "sadness",
      cost: { ap: 2, essence: 0 },
      type: "penalty",
      baseDamage: 0,
      description: "While face-up, reduce AP regeneration by 1.",
      chain: { key: "fatigue", index: 0 },
      facingEffect(combat) {
        combat.player.temp.apRegen -= 1;
      },
      effect: ({ combat }) => {
        logCombat(
          combat,
          "Fatigue weighs on you. Cycle through the chain to reach Breakthrough."
        );
      },
    },
    stumble: {
      key: "stumble",
      name: "Stumble",
      emotion: "sadness",
      cost: { ap: 2, essence: 0 },
      type: "penalty",
      baseDamage: 0,
      description: "No effect other than advancing the chain.",
      chain: { key: "fatigue", index: 1 },
      effect: ({ combat }) => {
        logCombat(combat, "You stumble forward, inching toward a breakthrough.");
      },
    },
    breakthrough: {
      key: "breakthrough",
      name: "Breakthrough",
      emotion: "sadness",
      cost: { ap: 3, essence: 5 },
      type: "attack",
      baseDamage: 20,
      description: "Deal 20 damage. Costs 5 Essence.",
      chain: { key: "fatigue", index: 2 },
      resetChain: true,
      effect: ({ combat, actor, target }) => {
        if (actor.essence < 5) {
          logCombat(combat, `${actor.name} lacks the Essence to unleash Breakthrough.`);
          return { cancel: true };
        }
        actor.essence -= 5;
        dealDamage(combat, actor, target, 20, { source: "Breakthrough" });
      },
    },
    dirge: {
      key: "dirge",
      name: "Dirge",
      emotion: "sadness",
      cost: { ap: 4, essence: 0 },
      type: "attack",
      baseDamage: 8,
      description: "Deal 8 damage and apply Bleed (2).",
      effect: ({ combat, actor, target }) => {
        dealDamage(combat, actor, target, 8, { source: "Dirge" });
        applyStatus(target, "bleed", 2, { duration: 3 });
        logCombat(combat, `${target.name} is swept into a bleeding dirge.`);
      },
    },
    remembrance: {
      key: "remembrance",
      name: "Remembrance",
      emotion: "sadness",
      cost: { ap: 2, essence: 0 },
      type: "utility",
      baseDamage: 0,
      description: "Duplicate the last action played (cost +1 AP).",
      facingEffect(combat) {
        if (combat.player.actionSlots.some((slot) => slot === null)) {
          combat.player.temp.critChance += 2;
        }
      },
      effect: ({ combat, actor }) => {
        const last = actor.history[actor.history.length - 1];
        if (!last) {
          logCombat(combat, "There is no recent action to remember.");
          return { cancel: true };
        }
        actor.flags = actor.flags || {};
        actor.flags.remembrance = last;
        logCombat(
          combat,
          `${actor.name} prepares to echo ${last.name} at increased cost.`
        );
      },
    },
    shuffleMemory: {
      key: "shuffleMemory",
      name: "Shuffle Memory",
      emotion: "ambiguous",
      cost: { ap: 2, essence: 0 },
      type: "utility",
      baseDamage: 0,
      description: "Reroll a random action slot from your soup.",
      effect: ({ combat }) => {
        rerollRandomPlayerSlot(combat);
      },
    },
    quicken: {
      key: "quicken",
      name: "Quicken",
      emotion: "ambiguous",
      cost: { ap: 1, essence: 0 },
      type: "buff",
      baseDamage: 0,
      description: "Gain +2 AP that must be spent this turn.",
      effect: ({ combat, actor }) => {
        actor.ap += 2;
        logCombat(combat, `${actor.name} accelerates their plans (+2 AP).`);
      },
    },
  };

  const MEMORY_DEFINITIONS = [
    {
      key: "memoryBarFight",
      name: "Memory of the Bar Fight",
      emotion: "Anger",
      description: "Adds the Strike chain to your action soup.",
      contributions: [
        { action: "strike", weight: 100 },
        { action: "grapple", weight: 50 },
      ],
    },
    {
      key: "memoryBloodBlade",
      name: "Memory of the Blood-soaked Blade",
      emotion: "Anger",
      description: "Bleed strikes hit harder.",
      contributions: [{ action: "bloodlash", weight: 100 }],
      passive: { bleedBonus: 1 },
    },
    {
      key: "memoryWarCry",
      name: "Memory of the War Cry",
      emotion: "Anger",
      description: "Roar applies Vulnerable while face-up.",
      contributions: [{ action: "roar", weight: 75 }],
      passive: { roarAppliesVulnerable: true },
    },
    {
      key: "memoryLastStand",
      name: "Memory of the Last Stand",
      emotion: "Anger",
      description: "Overdrive grants +1 AP regen while face-up.",
      contributions: [{ action: "overdrive", weight: 150 }],
    },
    {
      key: "memoryLockedDoor",
      name: "Memory of the Locked Door",
      emotion: "Fear",
      description: "Gain Ethereal Shroud for reliable defense.",
      contributions: [{ action: "etherealShroud", weight: 100 }],
    },
    {
      key: "memoryParanoidWatchman",
      name: "Memory of the Paranoid Watchman",
      emotion: "Fear",
      description: "Counterguard doubles retaliation while face-up.",
      contributions: [{ action: "counterguard", weight: 75 }],
      passive: { counterguardRetaliateBonus: true },
    },
    {
      key: "memoryHoarder",
      name: "Memory of the Hoarder",
      emotion: "Fear",
      description: "Increases AP carryover cap by 3.",
      contributions: [{ action: "stall", weight: 75 }],
      passive: { apCarryoverBonus: 3 },
    },
    {
      key: "memoryFestival",
      name: "Memory of the Festival",
      emotion: "Joy",
      description: "Festival Light and Sparks form a celebratory chain.",
      contributions: [
        { action: "festivalLight", weight: 100 },
        { action: "sparks", weight: 50 },
      ],
    },
    {
      key: "memoryToast",
      name: "Memory of the Toast",
      emotion: "Joy",
      description: "Cheer reduces the cost of your buffs while face-up.",
      contributions: [{ action: "cheer", weight: 100 }],
      passive: { buffCostReductionWhileFaceUp: true },
    },
    {
      key: "memorySong",
      name: "Memory of the Song",
      emotion: "Joy",
      description: "Song of Triumph restores Essence while face-up.",
      contributions: [{ action: "songOfTriumph", weight: 75 }],
      passive: { songEssenceRegen: 1 },
    },
    {
      key: "memoryLaughingCrowd",
      name: "Memory of the Laughing Crowd",
      emotion: "Joy",
      description: "Laughter heals more while face-up.",
      contributions: [{ action: "laughter", weight: 100 }],
      passive: { laughterDamageBonus: 1 },
    },
    {
      key: "memoryLongMarch",
      name: "Memory of the Long March",
      emotion: "Sadness",
      description: "Adds the Fatigue chain culminating in Breakthrough.",
      contributions: [
        { action: "fatigue", weight: 100 },
        { action: "stumble", weight: 50 },
        { action: "breakthrough", weight: 25 },
      ],
    },
    {
      key: "memoryBurialBell",
      name: "Memory of the Burial Bell",
      emotion: "Sadness",
      description: "Dirge costs less AP while face-up.",
      contributions: [{ action: "dirge", weight: 100 }],
      passive: { dirgeCostReduction: 1 },
    },
    {
      key: "memoryEmptyChair",
      name: "Memory of the Empty Chair",
      emotion: "Sadness",
      description: "Remembrance thrives in empty slots.",
      contributions: [{ action: "remembrance", weight: 300 }],
      passive: { emptySlotCritBonus: 2 },
    },
    {
      key: "memoryTrickCandle",
      name: "Memory of the Trick Candle",
      emotion: "Ambiguous",
      description: "Shuffle a random memory into place when needed.",
      contributions: [{ action: "shuffleMemory", weight: 75 }],
    },
    {
      key: "memoryHourglass",
      name: "Memory of the Hourglass",
      emotion: "Ambiguous",
      description: "Quicken grants bursts of AP.",
      contributions: [{ action: "quicken", weight: 100 }],
    },
  ];

  const MEMORY_MAP = new Map(
    MEMORY_DEFINITIONS.map((memory) => [memory.key, memory])
  );

  const DEFAULT_PLAYER_STATS = {
    maxEssence: 12,
    baseApRegen: 3,
    baseCritChance: 5,
    apCarryover: 6,
  };

  const ENEMY_DEFINITIONS = {
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
      maxEssence: 22,
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
      maxEssence: 24,
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

  const DEFAULT_ENEMY_MOVES = [
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

  const roomDefinitions = [
    {
      key: "well",
      name: "Submerged Reliquary",
      background: "bg_room_well.png",
      description:
        "The well chamber opens into a circular antechamber, its waters thrumming with residual whispers that tug at your memory.",
      ariaLabel: "A flooded reliquary chamber branching from the manor's Styx well.",
    },
    {
      key: "atrium",
      name: "Flooded Atrium",
      background: "bg_room_atrium.png",
      description:
        "Collapsed skylights spill moonlight across the atrium's reflecting pool. Spectral vines curl toward the rippling surface.",
      ariaLabel: "A decayed manor atrium filled with water and moonlight.",
    },
    {
      key: "bedroom",
      name: "Forsaken Bedroom",
      background: "bg_room_bedroom.png",
      description:
        "Antique furniture floats inches above the ground, swaying in time with a lullaby no mortal voice should sing.",
      ariaLabel: "An abandoned bedroom with haunted furnishings suspended midair.",
    },
    {
      key: "closet",
      name: "Locksmith's Closet",
      background: "bg_room_closet.png",
      description:
        "Walls of keys clatter like chimes. One of them pulses with a heartbeat in sync with your own.",
      ariaLabel: "A cramped closet overflowing with shimmering keys.",
    },
    {
      key: "counsel",
      name: "Counsel Chamber",
      background: "bg_room_counsel.png",
      description:
        "Couches circle a darkened fireplace. The ashes whisper fractured therapy sessions from lifetimes ago.",
      ariaLabel: "A dim counseling chamber lined with couches and a smoldering hearth.",
    },
    {
      key: "kitchen",
      name: "Haunted Kitchen",
      background: "bg_room_kitchen.png",
      description:
        "Copper pots rattle without touch. Aromas of impossible feasts pull at your hunger and your soul alike.",
      ariaLabel: "A spectral kitchen with floating utensils and lingering aromas.",
    },
    {
      key: "studio",
      name: "Painter's Studio",
      background: "bg_room_studio.png",
      description:
        "Unfinished canvases watch you. Fresh paint crawls across them, forming scenes of your past lives.",
      ariaLabel: "An artist's studio where the paintings appear to move on their own.",
    },
    {
      key: "study",
      name: "Occult Study",
      background: "bg_room_study.png",
      description:
        "Books flutter from shelves as if anxious birds. Glyphs glow along the desk, cataloging every decision you've made tonight.",
      ariaLabel: "A study filled with floating books and glowing occult glyphs.",
    },
    {
      key: "washroom",
      name: "Mirror Washroom",
      background: "bg_room_washroom.png",
      description:
        "Steam coats the mirrors, yet silhouettes stare back from beyond the glass waiting to trade places.",
      ariaLabel: "A misty washroom with haunted mirrors.",
    },
    {
      key: "winecellar",
      name: "Cursed Wine Cellar",
      background: "bg_room_winecellar.png",
      description:
        "Barrels hum with the voices of bottled celebrations. A single cork trembles, eager to release something old.",
      ariaLabel: "A wine cellar where barrels glow with spectral light.",
    },
  ];

  const foyerRoom = {
    key: "foyer",
    name: "The Foyer",
    background: backgrounds.foyer,
    description:
      "Helen Cebarti's foyer waits in stillness. The manor itself holds its breath for the coming confrontation.",
    ariaLabel: "The foyer of Cebarti Manor prepared for the final confrontation.",
  };

  const TOTAL_ROOMS_PER_RUN = roomDefinitions.length + 1;

  const state = {
    currentScreen: null,
    hasSave: false,
    inRun: false,
    lastRunScreen: null,
    corridorRefreshes: 0,
    roomPool: [],
    roomHistory: [],
    currentRoomNumber: 0,
    currentRoomKey: null,
    currentEncounterType: null,
    currentEncounter: null,
    playerMemories: [],
    draftPacks: [],
    selectedDrafts: [],
  };

  const ROOMS_BEFORE_BOSS = roomDefinitions.length;
  const roomMap = roomDefinitions.reduce((map, room) => {
    map.set(room.key, room);
    return map;
  }, new Map());

  const doorCategories = [
    {
      key: "combat",
      label: "Combat",
      colorClass: "door-button--crimson",
      ariaDescription: "Engage in a standard combat encounter.",
      detail: "Battle restless shades.",
    },
    {
      key: "elite",
      label: "Elite Combat",
      colorClass: "door-button--violet",
      ariaDescription: "Challenge a formidable elite opponent.",
      detail: "Face a formidable elite.",
    },
    {
      key: "boss",
      label: "Boss Combat",
      colorClass: "door-button--umbra",
      ariaDescription: "Confront a boss-tier adversary.",
      detail: "Challenge a boss-tier foe.",
    },
    {
      key: "recovery",
      label: "Recovery",
      colorClass: "door-button--verdant",
      ariaDescription: "Recover resources and gather your strength.",
      detail: "Recover your strength.",
    },
    {
      key: "treasure",
      label: "Treasure",
      colorClass: "door-button--amber",
      ariaDescription: "Search for rare rewards hidden within the manor.",
      detail: "Seek hidden rewards.",
    },
    {
      key: "merchant",
      label: "Merchant",
      colorClass: "door-button--azure",
      ariaDescription: "Trade with a spectral merchant.",
      detail: "Barter with a spectral vendor.",
    },
    {
      key: "event",
      label: "Event",
      colorClass: "door-button--aether",
      ariaDescription: "Trigger an unpredictable manor event.",
      detail: "Stumble into a strange event.",
    },
  ];

  function buildInitialRoomPool() {
    return roomDefinitions.map((room) => room.key);
  }

  function initializeRunState() {
    state.roomPool = buildInitialRoomPool();
    state.roomHistory = [];
    state.currentRoomNumber = 0;
    state.currentRoomKey = null;
    state.corridorRefreshes = 0;
    state.currentEncounterType = null;
    state.currentEncounter = null;
    state.playerMemories = [];
    state.draftPacks = [];
    state.selectedDrafts = [];
  }

  function clearRunState() {
    state.roomPool = [];
    state.roomHistory = [];
    state.currentRoomNumber = 0;
    state.currentRoomKey = null;
    state.corridorRefreshes = 0;
    state.lastRunScreen = null;
    state.hasSave = false;
    state.inRun = false;
    state.currentEncounterType = null;
    state.currentEncounter = null;
    state.playerMemories = [];
    state.draftPacks = [];
    state.selectedDrafts = [];
  }

  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function sampleWithoutReplacement(source, count) {
    if (!Array.isArray(source) || source.length === 0 || count <= 0) {
      return [];
    }
    const pool = shuffle(source);
    return pool.slice(0, Math.min(count, pool.length));
  }

  function getDoorCategoryOptions(count) {
    const categories = sampleWithoutReplacement(doorCategories, count);
    return categories.map((category) => ({ ...category }));
  }

  async function goToRoom(ctx, roomKey, options = {}) {
    const room = roomMap.get(roomKey);
    if (!room) {
      ctx.showToast("That path is sealed.");
      return;
    }

    ctx.state.roomPool = ctx.state.roomPool.filter((key) => key !== roomKey);
    if (ctx.state.roomHistory[ctx.state.roomHistory.length - 1] !== roomKey) {
      ctx.state.roomHistory.push(roomKey);
    }
    ctx.state.currentRoomNumber = ctx.state.roomHistory.length;
    ctx.state.currentRoomKey = roomKey;
    ctx.state.lastRunScreen = "room";
    ctx.state.corridorRefreshes = 0;

    const encounterType = options.encounterType || null;
    ctx.state.currentEncounterType = encounterType;
    const encounter = getEncounterForType(encounterType);
    ctx.state.currentEncounter = encounter;

    await ctx.transitionTo("room", {
      room,
      background: room.background,
      ariaLabel: room.ariaLabel,
      encounterType,
      encounter,
    });
    ctx.showToast(`You enter ${room.name}.`);
  }

  async function goToFoyer(ctx) {
    ctx.state.roomPool = [];
    if (ctx.state.roomHistory[ctx.state.roomHistory.length - 1] !== foyerRoom.key) {
      ctx.state.roomHistory.push(foyerRoom.key);
    }
    ctx.state.currentRoomNumber = ctx.state.roomHistory.length;
    ctx.state.currentRoomKey = foyerRoom.key;
    ctx.state.lastRunScreen = "foyer";
    ctx.state.corridorRefreshes = 0;

    ctx.state.currentEncounterType = "boss";
    const encounter = getEncounterForType("boss");
    ctx.state.currentEncounter = encounter;

    await ctx.transitionTo("foyer", {
      encounterType: "boss",
      encounter,
    });
    ctx.showToast("The foyer looms ahead.");
  }

  const backgroundEl = document.getElementById("background");
  const contentEl = document.getElementById("content");
  const fadeOverlay = document.getElementById("fade-overlay");
  const toastEl = document.getElementById("toast");

  let toastTimeout = null;

  const screens = {
    splash: {
      key: "splash",
      background: backgrounds.splash,
      ariaLabel: "Exterior view of Cebarti Manor at night.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--splash");
        const panel = createElement("div", "panel panel--splash");

        const title = createElement("h1", "screen__title", "Cebarti Manor");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "A haunted roguelike prototype set within Helen Cebarti's cursed manor."
        );
        const prompt = createElement(
          "button",
          "button button--primary splash__cta",
          "Click to Continue"
        );

        prompt.addEventListener("click", () => ctx.transitionTo("mainMenu"));
        wrapper.addEventListener("click", (event) => {
          if (event.target === wrapper) {
            ctx.transitionTo("mainMenu");
          }
        });

        panel.append(title, subtitle, prompt);
        wrapper.append(panel);
        return wrapper;
      },
    },
    mainMenu: {
      key: "mainMenu",
      type: "menu",
      ariaLabel: "Wallpaper from inside Cebarti Manor, used for menus.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--menu");
        const panel = createElement("div", "panel panel--menu");

        const title = createElement("h1", "screen__title", "Cebarti Manor");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Choose how you will haunt the manor."
        );

        const menu = createElement("div", "menu");

        const continueBtn = createElement(
          "button",
          "button menu__button",
          "Continue Run"
        );
        continueBtn.style.display = ctx.state.hasSave ? "block" : "none";
        continueBtn.addEventListener("click", () => {
          if (!ctx.state.hasSave || !ctx.state.lastRunScreen) {
            ctx.showToast("No run to continue yet.");
            return;
          }
          ctx.state.inRun = true;
          ctx.transitionTo(ctx.state.lastRunScreen);
        });

        const newRunBtn = createElement(
          "button",
          "button menu__button",
          "New Run"
        );
        newRunBtn.addEventListener("click", () => {
          initializeRunState();
          ctx.state.inRun = true;
          ctx.state.hasSave = false;
          ctx.state.lastRunScreen = "well";
          ctx.transitionTo("well");
        });

        const bestiaryBtn = createElement(
          "button",
          "button menu__button",
          "Beastiary"
        );
        bestiaryBtn.addEventListener("click", () => ctx.transitionTo("bestiary"));

        const settingsBtn = createElement(
          "button",
          "button menu__button",
          "Settings"
        );
        settingsBtn.addEventListener("click", () => ctx.transitionTo("settings"));

        const exitBtn = createElement("button", "button menu__button", "Exit");
        exitBtn.addEventListener("click", () => {
          ctx.showToast("Exit will be available in the desktop build.");
        });

        menu.append(continueBtn, newRunBtn, bestiaryBtn, settingsBtn, exitBtn);
        panel.append(title, subtitle, menu);
        wrapper.append(panel);
        return wrapper;
      },
    },
    bestiary: {
      key: "bestiary",
      type: "menu",
      ariaLabel: "Wallpaper from inside Cebarti Manor, used for menus.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--menu");
        const panel = createElement("div", "panel panel--menu");

        const title = createElement("h2", "screen__title", "Beastiary");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Catalog the manor's residents. Bestiary entries will unlock as development continues."
        );

        const backButton = createElement(
          "button",
          "button",
          "Back to Menu"
        );
        backButton.addEventListener("click", () => ctx.transitionTo("mainMenu"));

        panel.append(title, subtitle, backButton);
        wrapper.append(panel);
        return wrapper;
      },
    },
    settings: {
      key: "settings",
      type: "menu",
      ariaLabel: "Wallpaper from inside Cebarti Manor, used for menus.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--menu");
        const panel = createElement("div", "panel panel--menu");

        const title = createElement("h2", "screen__title", "Settings");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Configure your haunting experience. Options will arrive in future updates."
        );

        const backButton = createElement(
          "button",
          "button",
          "Back to Menu"
        );
        backButton.addEventListener("click", () => ctx.transitionTo("mainMenu"));

        panel.append(title, subtitle, backButton);
        wrapper.append(panel);
        return wrapper;
      },
    },
    well: {
      key: "well",
      background: backgrounds.well,
      ariaLabel: "The Styx well inside Cebarti Manor.",
      checkpoint: true,
      render(ctx) {
        const wrapper = createElement("div", "screen screen--well");

        ctx.state.currentEncounterType = null;
        ctx.state.currentEncounter = null;

        const title = createElement("h2", "screen__title", "The Styx Well");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Draft three memories to define this run's starting action pool."
        );

        const wellScene = createWellScene();
        const draftPanel = renderMemoryDraft(ctx);

        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Continue"
        );
        continueButton.disabled =
          ctx.state.playerMemories.length !== ctx.state.draftPacks.length;
        continueButton.addEventListener("click", async () => {
          if (ctx.state.playerMemories.length !== ctx.state.draftPacks.length) {
            ctx.showToast("Choose one memory from each set to proceed.");
            return;
          }
          ctx.state.corridorRefreshes = 0;
          ctx.state.lastRunScreen = "corridor";
          await ctx.transitionTo("corridor");
          ctx.showToast("You ascend into the corridor.");
        });
        footer.appendChild(continueButton);

        wrapper.append(title, subtitle, wellScene, draftPanel, footer);
        window.requestAnimationFrame(() => updateMemoryDraftSelection(ctx));
        return wrapper;
      },
    },
    corridor: {
      key: "corridor",
      background: backgrounds.corridor,
      ariaLabel: "A corridor within Cebarti Manor awaiting door choices.",
      checkpoint: true,
      render(ctx) {
        if (ctx.options && ctx.options.fromRoom) {
          ctx.state.currentRoomKey = null;
        }

        ctx.state.currentEncounterType = null;
        ctx.state.currentEncounter = null;

        const wrapper = createElement("div", "screen screen--corridor");
        const availableRooms = Array.isArray(ctx.state.roomPool)
          ? ctx.state.roomPool
          : [];
        const roomsRemaining = Math.max(availableRooms.length, 0);
        const roomsCleared = Math.min(
          ROOMS_BEFORE_BOSS - roomsRemaining,
          ROOMS_BEFORE_BOSS
        );

        const tracker = createRunTracker(
          `Rooms Cleared ${roomsCleared}/${ROOMS_BEFORE_BOSS}`
        );

        const title = createElement("h2", "screen__title", "The Corridor");
        const refreshCount = ctx.state.corridorRefreshes;
        let descriptionText;

        if (roomsRemaining === 0) {
          descriptionText =
            "Only the foyer remains. Steel yourself before the final confrontation.";
        } else if (roomsRemaining === 1) {
          descriptionText =
            "Only a single chamber stands between you and the foyer. Choose with care.";
        } else {
          descriptionText = `${roomsRemaining} chambers remain before the foyer.`;
        }

        if (roomsRemaining > 0) {
          if (refreshCount === 0) {
            descriptionText += " Three doors shimmer ahead.";
          } else {
            descriptionText += ` The manor has reshaped itself ${refreshCount} time${
              refreshCount === 1 ? "" : "s"
            }.`;
          }
        }

        const subtitle = createElement("p", "screen__subtitle", descriptionText);

        const doorMap = createElement("div", "door-map");
        if (roomsRemaining === 0) {
          const { element: foyerDoor, button: foyerButton } = createDoorChoice(
            "Door to the Foyer",
            ["door-button--umbra"],
            {
              ariaDescription:
                "Leads directly to the foyer and the final encounter.",
              displayLabel: "Foyer",
              detail: "Face Helen Cebarti's final challenge.",
            }
          );
          foyerButton.addEventListener("click", async () => {
            foyerButton.disabled = true;
            await goToFoyer(ctx);
          });
          doorMap.appendChild(foyerDoor);
        } else {
          const doorCount = Math.min(3, roomsRemaining);
          const roomsForDoors = sampleWithoutReplacement(availableRooms, doorCount);
          const categories = getDoorCategoryOptions(doorCount);

          roomsForDoors.forEach((roomKey, index) => {
            const category = categories[index] || {};
            const extraClasses = [];
            if (typeof category.colorClass === "string" && category.colorClass) {
              extraClasses.push(category.colorClass);
            }
            const { element: doorChoice, button: doorButton } = createDoorChoice(
              category.label || `Door ${index + 1}`,
              extraClasses,
              {
                ariaDescription:
                  category.ariaDescription || "Leads to an unknown chamber.",
                detail: category.detail,
                dataset:
                  typeof category.key === "string"
                    ? { category: category.key }
                    : undefined,
              }
            );
            doorButton.addEventListener("click", async () => {
              doorButton.disabled = true;
              await goToRoom(ctx, roomKey, { encounterType: category.key });
            });
            doorMap.appendChild(doorChoice);
          });
        }

        let footer = null;
        if (roomsRemaining > 0) {
          footer = createElement("div", "screen-footer");
          const continueButton = createElement(
            "button",
            "button button--primary",
            "Continue Down the Corridor"
          );
          continueButton.addEventListener("click", async () => {
            ctx.state.corridorRefreshes += 1;
            ctx.state.lastRunScreen = "corridor";
            await ctx.transitionTo("corridor", { refresh: true });
            ctx.showToast("The corridor rearranges itself.");
          });
          footer.appendChild(continueButton);
        }

        wrapper.append(tracker, title, subtitle, doorMap);
        if (footer) {
          wrapper.appendChild(footer);
        }
        return wrapper;
      },
    },
    room: {
      key: "room",
      render(ctx) {
        const roomData = ctx.options?.room;
        const encounterType =
          ctx.options?.encounterType || ctx.state.currentEncounterType;
        const encounter = ctx.options?.encounter || ctx.state.currentEncounter;
        const wrapper = createElement("div", "screen screen--room");
        const roomNumber = Math.max(ctx.state.currentRoomNumber, 1);
        const tracker = createRunTracker(
          `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
        );

        if (!roomData) {
          const title = createElement("h2", "screen__title", "The Manor Resists");
          const subtitle = createElement(
            "p",
            "screen__subtitle",
            "The chosen doorway seals shut. You retreat to the corridor."
          );
          const footer = createElement("div", "screen-footer");
          const backButton = createElement(
            "button",
            "button button--primary",
            "Return to the Corridor"
          );
          backButton.addEventListener("click", async () => {
            ctx.state.currentRoomKey = null;
            ctx.state.lastRunScreen = "corridor";
            await ctx.transitionTo("corridor", { refresh: true });
          });
          footer.appendChild(backButton);
          ctx.state.currentEncounterType = null;
          ctx.state.currentEncounter = null;
          wrapper.append(tracker, title, subtitle, footer);
          return wrapper;
        }

        const title = createElement("h2", "screen__title", roomData.name);
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          roomData.description
        );

        wrapper.append(tracker, title, subtitle);

        if (isCombatEncounter(encounterType)) {
          const combatExperience = createCombatExperience(ctx, {
            room: roomData,
            encounterType,
            encounter,
          });
          wrapper.append(combatExperience.container, combatExperience.footer);
          return wrapper;
        }

        const encounterScene = createEncounterScene({ encounter });
        const prompt = createElement(
          "p",
          "screen__subtitle",
          getEncounterPrompt(encounterType, encounter)
        );
        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Return to the Corridor"
        );
        continueButton.addEventListener("click", async () => {
          ctx.state.currentRoomKey = null;
          ctx.state.lastRunScreen = "corridor";
          ctx.state.corridorRefreshes = 0;
          ctx.state.currentEncounterType = null;
          ctx.state.currentEncounter = null;
          await ctx.transitionTo("corridor", { fromRoom: true });
          ctx.showToast("You slip back into the corridor.");
        });
        footer.appendChild(continueButton);

        wrapper.append(encounterScene.scene, prompt, footer);
        return wrapper;
      },
    },
    foyer: {
      key: "foyer",
      background: backgrounds.foyer,
      ariaLabel: foyerRoom.ariaLabel,
      checkpoint: true,
      render(ctx) {
        const wrapper = createElement("div", "screen screen--room screen--foyer");
        const roomNumber = Math.max(ctx.state.currentRoomNumber, TOTAL_ROOMS_PER_RUN);
        const tracker = createRunTracker(
          `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
        );

        const title = createElement("h2", "screen__title", foyerRoom.name);
        const subtitle = createElement("p", "screen__subtitle", foyerRoom.description);
        const encounter = ctx.options?.encounter || ctx.state.currentEncounter;
        const encounterScene = createEncounterScene({ encounter });
        const prompt = createElement(
          "p",
          "screen__subtitle",
          getEncounterPrompt("boss", encounter)
        );

        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Challenge the Foyer"
        );
        continueButton.addEventListener("click", async () => {
          continueButton.disabled = true;
          ctx.state.hasSave = false;
          ctx.state.lastRunScreen = null;
          ctx.state.inRun = false;
          ctx.state.currentEncounterType = null;
          ctx.state.currentEncounter = null;
          await ctx.transitionTo("victory");
        });
        footer.appendChild(continueButton);

        wrapper.append(
          tracker,
          title,
          subtitle,
          encounterScene.scene,
          prompt,
          footer
        );
        return wrapper;
      },
    },
    victory: {
      key: "victory",
      background: backgrounds.victory,
      ariaLabel: "Sunlight pours through an open archway as the manor releases you.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--victory");

        const title = createElement("h2", "screen__title", "You Escape the Well");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Congratulations! You have escaped the well and step once more into the realm of the living."
        );
        const clearedRooms = Math.min(
          ctx.state.roomHistory.filter((key) => key !== foyerRoom.key).length,
          ROOMS_BEFORE_BOSS
        );
        const summary = createElement(
          "p",
          "screen__subtitle",
          `You endured ${clearedRooms} haunted chamber${clearedRooms === 1 ? "" : "s"} before confronting the foyer.`
        );

        const footer = createElement("div", "screen-footer");
        const menuButton = createElement(
          "button",
          "button button--primary",
          "Return to Main Menu"
        );
        menuButton.addEventListener("click", async () => {
          clearRunState();
          await ctx.transitionTo("mainMenu");
          ctx.showToast("You breathe freely in the manor's entry hall.");
        });
        footer.appendChild(menuButton);

        wrapper.append(title, subtitle, summary, footer);
        return wrapper;
      },
    },
  };

  function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  function createDoorButton(label, extraClasses = [], options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("door-button");
    const classes = Array.isArray(extraClasses) ? extraClasses : [extraClasses];
    classes
      .filter((cls) => typeof cls === "string" && cls.trim().length > 0)
      .forEach((cls) => button.classList.add(cls));
    button.dataset.label = label;

    const ariaDescription =
      typeof options.ariaDescription === "string"
        ? options.ariaDescription
        : "Leads to an unknown chamber.";
    button.setAttribute("aria-label", `${label}. ${ariaDescription}`);
    button.title = `${label} — ${ariaDescription}`;

    if (options.dataset && typeof options.dataset === "object") {
      Object.entries(options.dataset).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        button.dataset[key] = String(value);
      });
    }

    const hiddenLabel = createElement(
      "span",
      "sr-only",
      `${label}. ${ariaDescription}`
    );
    button.appendChild(hiddenLabel);
    return button;
  }

  function createDoorChoice(label, extraClasses = [], options = {}) {
    const button = createDoorButton(label, extraClasses, options);
    const wrapper = createElement("div", "door-option");
    wrapper.appendChild(button);

    const displayLabel =
      typeof options.displayLabel === "string" && options.displayLabel.trim().length > 0
        ? options.displayLabel
        : label;
    const labelElement = createElement("span", "door-option__label", displayLabel);
    wrapper.appendChild(labelElement);

    if (typeof options.detail === "string" && options.detail.trim().length > 0) {
      const detailElement = createElement("span", "door-option__detail", options.detail);
      wrapper.appendChild(detailElement);
    }

    return { element: wrapper, button, labelElement };
  }

  function createRunTracker(text) {
    return createElement("div", "run-tracker", text);
  }

  function createMemoryDraftPacks(count = 3, optionsPerPack = 3) {
    const packs = [];
    const memoryPool = [...MEMORY_DEFINITIONS];
    for (let i = 0; i < count; i += 1) {
      const available = sampleWithoutReplacement(memoryPool, optionsPerPack);
      packs.push(available.map((memory) => memory.key));
    }
    return packs;
  }

  function ensureDraftState(ctx) {
    const packCount = 3;
    if (!Array.isArray(ctx.state.draftPacks) || ctx.state.draftPacks.length === 0) {
      ctx.state.draftPacks = createMemoryDraftPacks(packCount, 3);
      ctx.state.selectedDrafts = new Array(packCount).fill(null);
      ctx.state.playerMemories = [];
    }
    if (!Array.isArray(ctx.state.selectedDrafts)) {
      ctx.state.selectedDrafts = new Array(ctx.state.draftPacks.length).fill(null);
    }
  }

  function renderMemoryDraft(ctx) {
    ensureDraftState(ctx);
    const container = createElement("div", "memory-draft");
    const summary = createElement(
      "div",
      "memory-draft__summary",
      ctx.state.playerMemories.length === ctx.state.draftPacks.length
        ? "Draft complete. Review your memories before continuing."
        : "Draft three memories to define your starting action pool."
    );
    container.appendChild(summary);

    ctx.state.draftPacks.forEach((pack, index) => {
      const column = createElement("div", "memory-draft__pack");
      const header = createElement("h3", "memory-draft__title", `Memory ${index + 1}`);
      column.appendChild(header);
      pack.forEach((memoryKey) => {
        const memory = MEMORY_MAP.get(memoryKey);
        if (!memory) {
          return;
        }
        const card = createMemoryCard(ctx, memory, index);
        column.appendChild(card);
      });
      container.appendChild(column);
    });

    const chosenList = createElement("ul", "memory-draft__chosen");
    ctx.state.selectedDrafts.forEach((key, idx) => {
      const li = createElement(
        "li",
        "memory-draft__chosen-item",
        key ? MEMORY_MAP.get(key)?.name || "Unknown Memory" : `Pick for slot ${idx + 1}`
      );
      chosenList.appendChild(li);
    });
    container.appendChild(chosenList);
    return container;
  }

  function createMemoryCard(ctx, memory, packIndex) {
    const card = createElement("button", "memory-card");
    card.type = "button";
    card.dataset.memoryKey = memory.key;
    card.dataset.packIndex = String(packIndex);
    card.title = `${memory.name} — ${memory.description}`;

    const header = createElement("div", "memory-card__header");
    const name = createElement("span", "memory-card__name", memory.name);
    const emotion = createElement(
      "span",
      `memory-card__emotion memory-card__emotion--${memory.emotion.toLowerCase()}`,
      memory.emotion
    );
    header.append(name, emotion);
    card.appendChild(header);

    const description = createElement("p", "memory-card__description", memory.description);
    card.appendChild(description);

    if (Array.isArray(memory.contributions) && memory.contributions.length > 0) {
      const list = createElement("ul", "memory-card__actions");
      memory.contributions.forEach((entry) => {
        const action = ACTION_DEFINITIONS[entry.action];
        const label = action ? action.name : entry.action;
        const weight = entry.weight || 0;
        const item = createElement(
          "li",
          "memory-card__action",
          `${label} (${weight}%)`
        );
        list.appendChild(item);
      });
      card.appendChild(list);
    }

    if (memory.passive) {
      const passiveText = formatPassiveDescription(memory.passive);
      const passive = createElement(
        "p",
        "memory-card__passive",
        passiveText || "Passive bonus active while relevant actions face-up."
      );
      card.appendChild(passive);
    }

    const selectedKey = ctx.state.selectedDrafts?.[packIndex] || null;
    if (selectedKey === memory.key) {
      card.classList.add("is-selected");
    }

    card.addEventListener("click", () => {
      ctx.state.selectedDrafts[packIndex] = memory.key;
      ctx.state.playerMemories = ctx.state.selectedDrafts.filter(Boolean);
      updateMemoryDraftSelection(ctx);
    });

    return card;
  }

  function formatPassiveDescription(passive = {}) {
    const parts = [];
    if (typeof passive.bleedBonus === "number") {
      parts.push(`Bleed deals +${passive.bleedBonus} damage.`);
    }
    if (typeof passive.apCarryoverBonus === "number") {
      parts.push(`Carryover cap +${passive.apCarryoverBonus} AP.`);
    }
    if (typeof passive.dirgeCostReduction === "number") {
      parts.push(`Dirge costs -${passive.dirgeCostReduction} AP.`);
    }
    if (passive.roarAppliesVulnerable) {
      parts.push("Roar causes your attacks to apply Vulnerable.");
    }
    if (passive.buffCostReductionWhileFaceUp) {
      parts.push("Cheer reduces buff costs by 1 AP while face-up.");
    }
    if (typeof passive.songEssenceRegen === "number") {
      parts.push(
        `Song of Triumph restores +${passive.songEssenceRegen} Essence each turn.`
      );
    }
    if (typeof passive.laughterDamageBonus === "number") {
      parts.push(`Laughter grants allies +${passive.laughterDamageBonus} damage.`);
    }
    if (typeof passive.emptySlotCritBonus === "number") {
      parts.push(
        `Empty slots grant +${passive.emptySlotCritBonus}% critical chance.`
      );
    }
    return parts.join(" ");
  }

  function updateMemoryDraftSelection(ctx) {
    const draftContainers = document.querySelectorAll(".memory-card");
    draftContainers.forEach((card) => {
      const packIndex = Number(card.dataset.packIndex);
      const key = card.dataset.memoryKey;
      if (ctx.state.selectedDrafts[packIndex] === key) {
        card.classList.add("is-selected");
      } else {
        card.classList.remove("is-selected");
      }
    });

    const chosenItems = document.querySelectorAll(".memory-draft__chosen-item");
    chosenItems.forEach((item, index) => {
      const key = ctx.state.selectedDrafts[index];
      if (key) {
        const memory = MEMORY_MAP.get(key);
        item.textContent = memory ? memory.name : "Unknown Memory";
        item.classList.add("is-filled");
      } else {
        item.textContent = `Pick for slot ${index + 1}`;
        item.classList.remove("is-filled");
      }
    });

    const summary = document.querySelector(".memory-draft__summary");
    if (summary) {
      if (ctx.state.playerMemories.length === ctx.state.draftPacks.length) {
        summary.textContent = "Draft complete. Review your memories before continuing.";
      } else {
        summary.textContent = "Draft three memories to define your starting action pool.";
      }
    }

    const continueButton = document.querySelector(
      ".screen--well .screen-footer .button--primary"
    );
    if (continueButton) {
      continueButton.disabled =
        ctx.state.playerMemories.length !== ctx.state.draftPacks.length;
    }
  }

  function getRandomItem(source) {
    if (!Array.isArray(source) || source.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * source.length);
    return source[index];
  }

  function getEncounterPoolForType(type) {
    switch (type) {
      case "combat":
      case "elite":
        return enemySprites;
      case "boss":
        return bossSprites;
      case "merchant":
        return merchantSprites;
      default:
        return null;
    }
  }

  function getEncounterForType(type) {
    const pool = getEncounterPoolForType(type);
    if (!pool) {
      return null;
    }
    const sprite = getRandomItem(pool);
    if (!sprite) {
      return null;
    }
    const animatedTypes = new Set(["combat", "elite", "boss"]);
    return {
      sprite,
      type,
      kind:
        type === "merchant"
          ? "merchant"
          : type === "boss"
          ? "boss"
          : "enemy",
      animate: animatedTypes.has(type),
      enterDelay: 2000,
    };
  }

  function shouldReduceMotion() {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (error) {
      return false;
    }
  }

  function createCharacterElement(sprite, options = {}) {
    if (!sprite) {
      return null;
    }

    const role = options.role || "";
    const element = createElement("div", "character");
    if (role) {
      element.classList.add(`character--${role}`);
    }

    if (sprite.facing === "left") {
      element.classList.add("character--face-left");
    } else if (sprite.facing === "right") {
      element.classList.add("character--face-right");
    }

    if (role === "encounter") {
      element.classList.add("character--encounter");
      if (!options.animate) {
        element.classList.add("is-visible");
      }
    }

    if (options.extraClasses) {
      const classes = Array.isArray(options.extraClasses)
        ? options.extraClasses
        : [options.extraClasses];
      classes
        .filter((cls) => typeof cls === "string" && cls.trim().length > 0)
        .forEach((cls) => element.classList.add(cls));
    }

    const image = document.createElement("img");
    image.className = "character__sprite";
    image.src = sprite.src;
    image.alt = sprite.alt || sprite.name || "";
    image.decoding = "async";
    image.loading = options.lazy === false ? "eager" : "lazy";
    element.appendChild(image);

    if (sprite.name) {
      const label = createElement("span", "character__label", sprite.name);
      element.appendChild(label);
    }

    return { element, image };
  }

  function createEncounterScene({ encounter } = {}) {
    const scene = createElement("div", "room-scene");
    const playerSide = createElement(
      "div",
      "room-scene__side room-scene__side--player"
    );
    const player = createCharacterElement(playerCharacter, {
      role: "player",
      lazy: false,
    });
    if (player) {
      playerSide.appendChild(player.element);
    }
    scene.appendChild(playerSide);

    const encounterSide = createElement(
      "div",
      "room-scene__side room-scene__side--encounter"
    );
    let encounterElement = null;

    if (encounter && encounter.sprite) {
      const shouldAnimate = encounter.animate && !shouldReduceMotion();
      const encounterCharacter = createCharacterElement(encounter.sprite, {
        role: "encounter",
        animate: shouldAnimate,
      });
      if (encounterCharacter) {
        encounterElement = encounterCharacter.element;
        encounterSide.appendChild(encounterElement);
        if (shouldAnimate) {
          window.setTimeout(() => {
            if (encounterElement && encounterElement.isConnected) {
              encounterElement.classList.add("is-visible");
            }
          }, Math.max(0, Number(encounter.enterDelay) || 2000));
        }
      }
    } else {
      encounterSide.classList.add("room-scene__side--empty");
    }

    if (!encounterElement) {
      scene.classList.add("room-scene--solo");
    }

    scene.appendChild(encounterSide);
    return { scene, encounterElement };
  }

  function createWellScene() {
    const scene = createElement("div", "well-scene");
    const player = createCharacterElement(playerCharacter, {
      role: "player",
      lazy: false,
      extraClasses: "character--well",
    });
    if (player) {
      scene.appendChild(player.element);
    }
    return scene;
  }

  function getEncounterPrompt(encounterType, encounter) {
    if (!encounterType) {
      return "You secure what you can from the chamber before returning to the corridor.";
    }

    const name = encounter?.sprite?.name;
    switch (encounterType) {
      case "combat":
        return name
          ? `${name} materializes with a hostile shriek.`
          : "A hostile spirit rushes to bar your way.";
      case "elite":
        return name
          ? `${name} prowls the chamber, daring you to advance.`
          : "An elite apparition challenges you for the room.";
      case "boss":
        return name
          ? `${name} gathers its strength for a decisive clash.`
          : "A boss spirit towers over the foyer awaiting your challenge.";
      case "merchant":
        return name
          ? `You trade hushed words with ${name}, bartering for forbidden goods.`
          : "A spectral merchant beckons you toward a clandestine bargain.";
      default:
        return "You secure what you can from the chamber before returning to the corridor.";
    }
  }

  function isCombatEncounter(encounterType) {
    return encounterType === "combat" || encounterType === "elite" || encounterType === "boss";
  }

  function ensureDefaultMemories(ctx) {
    if (!Array.isArray(ctx.state.playerMemories) || ctx.state.playerMemories.length === 0) {
      ctx.state.playerMemories = [
        "memoryBarFight",
        "memoryLockedDoor",
        "memoryFestival",
      ];
    }
  }

  function summarizeMemoryPassives(memoryKeys = []) {
    const summary = {
      bleedBonus: 0,
      apCarryoverBonus: 0,
      dirgeCostReduction: 0,
      roarAppliesVulnerable: false,
      buffCostReductionWhileFaceUp: false,
      songEssenceRegen: 0,
      laughterDamageBonus: 0,
      emptySlotCritBonus: 0,
    };
    memoryKeys.forEach((key) => {
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

  function buildActionSoupFromMemories(memoryKeys = []) {
    const weights = new Map();
    memoryKeys.forEach((key) => {
      const memory = MEMORY_MAP.get(key);
      if (!memory || !Array.isArray(memory.contributions)) {
        return;
      }
      memory.contributions.forEach((entry) => {
        if (!entry || !entry.action) {
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
      buffCostReduction: 0,
      essenceRegen: 0,
      endOfTurnHealing: 0,
      nextTurnApBonus: 0,
      onAttackEffects: [],
      retaliateMultiplier: 1,
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

  function createCombatState(ctx, { encounterType, encounter, room }) {
    ensureDefaultMemories(ctx);
    const memoryKeys = ctx.state.playerMemories.slice();
    const passives = summarizeMemoryPassives(memoryKeys);
    const soup = buildActionSoupFromMemories(memoryKeys);

    const player = {
      id: "player",
      side: "player",
      name: playerCharacter.name,
      maxEssence: DEFAULT_PLAYER_STATS.maxEssence,
      essence: DEFAULT_PLAYER_STATS.maxEssence,
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
    };
    resetTempStats(player);

    const sprite = encounter?.sprite || {};
    const enemyDefinition = ENEMY_DEFINITIONS[sprite.key] || {
      maxEssence: 12,
      moves: DEFAULT_ENEMY_MOVES,
    };
    const multiplier = getEncounterScaling(encounterType);
    const enemy = {
      id: "enemy",
      side: "enemy",
      name: sprite.name || "Hostile Spirit",
      maxEssence: Math.max(1, scaleValue(enemyDefinition.maxEssence || 12, multiplier)),
      essence: Math.max(1, scaleValue(enemyDefinition.maxEssence || 12, multiplier)),
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
      actionSlots: [null, null, null, null],
      log: [],
      round: 1,
      turn: "player",
      status: "inProgress",
      difficulty: multiplier,
      dom: {},
    };
  }

  function createCombatantDisplay(combatant, role, encounter) {
    const container = createElement(
      "div",
      `combatant-card combatant-card--${role}`
    );
    const avatar = createElement("div", "combatant-card__avatar");
    avatar.setAttribute("role", "img");
    avatar.title = combatant.name;
    avatar.dataset.role = role;
    container.appendChild(avatar);

    const name = createElement("div", "combatant-card__name", combatant.name);
    container.appendChild(name);

    const stats = createElement("div", "combatant-card__stats");
    container.appendChild(stats);

    if (role === "enemy" && encounter?.sprite) {
      avatar.dataset.sprite = encounter.sprite.key || "enemy";
    }

    const statusList = createElement("div", "combatant-card__statuses");
    container.appendChild(statusList);

    return { container, avatar, stats, statusList };
  }

  function createCombatExperience(ctx, { room, encounterType, encounter }) {
    const combat = createCombatState(ctx, { room, encounterType, encounter });
    const container = createElement("div", "combat");
    const sidebar = createElement("aside", "combat__sidebar");
    const statsPanel = createElement("div", "combat-sidebar__summary");
    const actionBar = createElement("div", "action-bar");
    sidebar.append(statsPanel, actionBar);

    const endTurnButton = createElement(
      "button",
      "button action-bar__end-turn",
      "End Turn"
    );
    endTurnButton.addEventListener("click", () => {
      if (combat.turn === "player" && combat.status === "inProgress") {
        endPlayerTurn(combat);
      }
    });
    sidebar.appendChild(endTurnButton);

    const main = createElement("div", "combat__main");
    const board = createElement("div", "combat__board");
    const playerDisplay = createCombatantDisplay(combat.player, "player");
    const enemyDisplay = createCombatantDisplay(combat.enemy, "enemy", encounter);
    board.append(playerDisplay.container, enemyDisplay.container);
    const floatLayer = createElement("div", "combat__float-layer");
    const logElement = createCombatLogElement();
    main.append(board, floatLayer, logElement);

    container.append(sidebar, main);

    const footer = createElement("div", "combat__footer");
    const continueButton = createElement(
      "button",
      "button button--primary",
      "Return to the Corridor"
    );
    continueButton.disabled = true;
    footer.appendChild(continueButton);

    continueButton.addEventListener("click", async () => {
      if (combat.status === "victory") {
        ctx.state.currentEncounterType = null;
        ctx.state.currentEncounter = null;
        ctx.state.lastRunScreen = "corridor";
        await ctx.transitionTo("corridor", { fromRoom: true });
        ctx.showToast("You slip back into the corridor.");
      } else if (combat.status === "defeat") {
        ctx.state.inRun = false;
        await ctx.transitionTo("mainMenu");
        ctx.showToast("Defeat drives you back to the manor's entry hall.");
      }
    });

    combat.dom = {
      container,
      sidebar,
      statsPanel,
      actionBar,
      endTurnButton,
      main,
      board,
      floatLayer,
      logElement,
      logBody: logElement.querySelector(".combat-log__body"),
      playerPanel: playerDisplay.container,
      playerStats: playerDisplay.stats,
      playerStatuses: playerDisplay.statusList,
      enemyPanel: enemyDisplay.container,
      enemyStats: enemyDisplay.stats,
      enemyStatuses: enemyDisplay.statusList,
      continueButton,
    };

    startCombat(combat);
    return { container, footer, combat };
  }

  function createCombatLogElement() {
    const details = createElement("details", "combat-log");
    details.open = false;
    const summary = createElement("summary", "combat-log__summary", "Combat Log");
    const body = createElement("div", "combat-log__body");
    details.append(summary, body);
    return details;
  }

  function startCombat(combat) {
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
    combat.actionSlots = combat.actionSlots || [null, null, null, null];
    for (let i = 0; i < combat.actionSlots.length; i += 1) {
      const slot = combat.actionSlots[i];
      if (!slot) {
        continue;
      }
      if (slot.retained && !slot.consumed && slot.actionKey) {
        continue;
      }
      combat.actionSlots[i] = null;
    }

    for (let i = 0; i < combat.actionSlots.length; i += 1) {
      if (combat.actionSlots[i]) {
        continue;
      }
      const actionKey = drawActionFromSoup(combat);
      if (!actionKey) {
        continue;
      }
      combat.actionSlots[i] = createActionSlot(actionKey);
    }
  }

  function createActionSlot(actionKey) {
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
    const entries = combat.soup || [];
    if (!entries.length) {
      return null;
    }
    const total = entries.reduce((sum, entry) => sum + (Number(entry.weight) || 0), 0);
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
        if (ACTION_DEFINITIONS[entry.action]) {
          return entry.action;
        }
      }
      roll -= weight;
    }
    const fallback = entries.find((entry) => ACTION_DEFINITIONS[entry.action]);
    return fallback ? fallback.action : null;
  }

  function applyFacingEffects(combat) {
    resetTempStats(combat.player);
    const emptySlots = combat.actionSlots.filter((slot) => slot === null).length;
    if (emptySlots > 0 && combat.player.passives.emptySlotCritBonus) {
      combat.player.temp.critChance +=
        combat.player.passives.emptySlotCritBonus * emptySlots;
    }
    combat.player.temp.damageBonus += combat.player.passives.laughterDamageBonus || 0;
    combat.player.temp.essenceRegen += combat.player.passives.songEssenceRegen || 0;

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
      if (slot.actionKey === "roar" && combat.player.passives.roarAppliesVulnerable) {
        combat.player.temp.onAttackEffects.push(({ target }) => {
          applyStatus(target, "vulnerable", 1, { duration: 2 });
          logCombat(combat, `${target.name} becomes Vulnerable under your roar.`);
        });
      }
    });
  }

  function getActionApCost(combat, action) {
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
    return cost;
  }

  function getActionEssenceCost(action) {
    if (!action || !action.cost) {
      return 0;
    }
    return Number(action.cost.essence) || 0;
  }

  function performPlayerAction(combat, slotIndex) {
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
    const apCost = getActionApCost(combat, action);
    const essenceCost = getActionEssenceCost(action);

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
      ? action.effect({ combat, actor: combat.player, target: combat.enemy, slot })
      : null;

    if (result && result.cancel) {
      combat.player.ap = initialAp;
      combat.player.essence = initialEssence;
      return;
    }

    combat.player.history.push({
      key: action.key,
      name: action.name,
    });
    if (combat.player.history.length > 12) {
      combat.player.history.shift();
    }
    if (action.key !== "remembrance") {
      combat.player.flags.lastAction = { key: action.key, name: action.name };
    }

    advanceSlotChain(combat, slot, action, slotIndex);
    handleRemembranceEcho(combat);

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
    if (!action || !action.chain) {
      slot.consumed = true;
    } else {
      const sequence = ACTION_SEQUENCES[action.chain.key];
      if (action.resetChain && sequence) {
        slot.chainIndex = 0;
        slot.actionKey = sequence[0];
      } else if (action.loopToStart && sequence) {
        slot.chainIndex = (slot.chainIndex + 1) % sequence.length;
        slot.actionKey = sequence[slot.chainIndex];
      } else if (sequence && slot.chainIndex + 1 < sequence.length) {
        slot.chainIndex += 1;
        slot.actionKey = sequence[slot.chainIndex];
      } else {
        slot.consumed = true;
      }
    }

    if (slot.consumed || !slot.actionKey) {
      combat.actionSlots[index] = null;
    }
  }

  function handleRemembranceEcho(combat) {
    const pending = combat.player.flags?.remembrance;
    if (!pending) {
      return;
    }
    combat.player.flags.remembrance = null;
    const action = ACTION_DEFINITIONS[pending.key];
    if (!action) {
      logCombat(combat, "The remembered action slips away.");
      return;
    }
    const echoCost = getActionApCost(combat, action) + 1;
    if (echoCost > combat.player.ap) {
      logCombat(combat, "You cannot afford to echo that memory right now.");
      return;
    }
    combat.player.ap -= echoCost;
    logCombat(combat, `Remembrance echoes ${action.name}.`);
    action.effect?.({ combat, actor: combat.player, target: combat.enemy, slot: null });
    combat.player.history.push({ key: action.key, name: `${action.name} (Echo)` });
    if (combat.enemy.essence <= 0) {
      handleVictory(combat);
    }
  }

  function endPlayerTurn(combat) {
    if (combat.status !== "inProgress") {
      return;
    }
    combat.turn = "enemy";
    combat.player.pendingApBonus += combat.player.temp.nextTurnApBonus || 0;
    applyEndOfTurnStatuses(combat, combat.player);
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
    applyStartOfTurnStatuses(combat, combat.enemy, "enemy");
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

  function handleVictory(combat) {
    if (combat.status !== "inProgress") {
      return;
    }
    combat.status = "victory";
    logCombat(combat, `${combat.enemy.name} collapses. You are victorious!`);
    if (combat.dom.continueButton) {
      combat.dom.continueButton.disabled = false;
      combat.dom.continueButton.textContent = "Return to the Corridor";
    }
    updateCombatUI(combat);
  }

  function handleDefeat(combat) {
    if (combat.status !== "inProgress") {
      return;
    }
    combat.status = "defeat";
    logCombat(combat, "Your essence gutters out. The manor claims another spirit.");
    if (combat.dom.continueButton) {
      combat.dom.continueButton.disabled = false;
      combat.dom.continueButton.textContent = "Return to Main Menu";
    }
    updateCombatUI(combat);
  }

  function dealDamage(combat, actor, target, amount, options = {}) {
    if (combat.status !== "inProgress") {
      return;
    }
    const initial = amount + (actor === combat.player ? combat.player.temp.damageBonus : 0);
    let damage = Math.max(0, initial);
    let isCrit = false;
    const vulnerableStacks = getStatusStacks(target, "vulnerable");
    if (vulnerableStacks > 0) {
      damage = Math.round(damage * 1.5);
    }
    if (target.statuses?.dodge) {
      target.statuses.dodge -= 1;
      logCombat(combat, `${target.name} dodges the attack.`);
      showFloatingText(combat, combat.dom[`${target.side}Panel`], "Dodge", "info");
      return;
    }
    if (actor === combat.player) {
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

    if (target.block) {
      const absorbed = Math.min(target.block, damage);
      target.block -= absorbed;
      damage -= absorbed;
      if (absorbed > 0) {
        logCombat(combat, `${target.name} blocks ${absorbed} damage.`);
      }
    }
    if (target.armor) {
      const mitigated = Math.min(target.armor, damage);
      damage -= mitigated;
      if (mitigated > 0) {
        logCombat(combat, `${target.name}'s armor absorbs ${mitigated} damage.`);
      }
    }

    if (damage <= 0) {
      logCombat(combat, `${options.source || "The attack"} is deflected.`);
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

  function healCombatant(combat, combatant, amount) {
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

  function applyStatus(target, key, stacks = 1, options = {}) {
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

  function hasStatus(target, key) {
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
      const bonus = side === "enemy" ? combat.player.passives.bleedBonus || 0 : 0;
      const bleedDamage = statuses.bleed.stacks + bonus;
      logCombat(combat, `${combatant.name} bleeds for ${bleedDamage}.`);
      dealDamage(combat, side === "enemy" ? combat.player : combat.enemy, combatant, bleedDamage, {
        source: "Bleed",
      });
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

  function logCombat(combat, message) {
    if (!combat || !message) {
      return;
    }
    combat.log = combat.log || [];
    combat.log.push(message);
    updateCombatLog(combat);
  }

  function updateCombatLog(combat) {
    if (!combat.dom || !combat.dom.logBody) {
      return;
    }
    const body = combat.dom.logBody;
    body.replaceChildren();
    combat.log.slice(-40).forEach((entry) => {
      const item = createElement("p", "combat-log__entry", entry);
      body.appendChild(item);
    });
  }

  function updateCombatUI(combat) {
    if (!combat.dom) {
      return;
    }
    updateActionButtons(combat);
    updateStatsSummary(combat);
    updateCombatantPanel(
      combat,
      combat.player,
      combat.dom.playerStats,
      combat.dom.playerStatuses
    );
    updateCombatantPanel(
      combat,
      combat.enemy,
      combat.dom.enemyStats,
      combat.dom.enemyStatuses
    );
  }

  function updateStatsSummary(combat) {
    if (!combat.dom || !combat.dom.statsPanel) {
      return;
    }
    combat.dom.statsPanel.textContent = `Essence ${combat.player.essence}/${combat.player.maxEssence} • AP ${combat.player.ap}/${combat.player.apCarryoverMax}`;
  }

  function updateCombatantPanel(combat, combatant, statsElement, statusElement) {
    if (!statsElement || !statusElement) {
      return;
    }
    const apText =
      combatant.side === "player"
        ? `AP ${combatant.ap}`
        : "";
    statsElement.textContent = `Essence ${combatant.essence}/${combatant.maxEssence}${apText ? ` • ${apText}` : ""}`;
    statusElement.replaceChildren();
    if (combatant.block) {
      statusElement.appendChild(
        createElement("span", "status-chip", `Block ${combatant.block}`)
      );
    }
    if (combatant.armor) {
      statusElement.appendChild(
        createElement("span", "status-chip", `Armor ${combatant.armor}`)
      );
    }
    if (!combatant.statuses) {
      return;
    }
    Object.entries(combatant.statuses).forEach(([key, status]) => {
      const label = formatStatusLabel(key, status);
      if (!label) {
        return;
      }
      const chip = createElement("span", "status-chip", label);
      chip.dataset.status = key;
      statusElement.appendChild(chip);
    });
  }

  function formatStatusLabel(key, status) {
    const value = status?.stacks || 0;
    switch (key) {
      case "bleed":
        return `Bleed ${value}`;
      case "vulnerable":
        return `Vulnerable ${value}`;
      case "critBuff":
        return `Crit +${value}%`;
      case "restrained":
        return "Restrained";
      case "fatigue":
        return `Fatigue ${value}`;
      default:
        return "";
    }
  }

  function updateActionButtons(combat) {
    if (!combat.dom || !combat.dom.actionBar) {
      return;
    }
    const bar = combat.dom.actionBar;
    bar.replaceChildren();
    combat.actionSlots.forEach((slot, index) => {
      const button = createActionButton(combat, slot, index);
      bar.appendChild(button);
    });
  }

  function createActionButton(combat, slot, index) {
    const button = createElement("button", "action-button");
    button.type = "button";
    if (!slot) {
      button.disabled = true;
      button.textContent = "Empty";
      return button;
    }
    const action = ACTION_DEFINITIONS[slot.actionKey];
    if (!action) {
      button.disabled = true;
      button.textContent = "Unknown";
      return button;
    }
    const apCost = getActionApCost(combat, action);
    const essenceCost = getActionEssenceCost(action);
    const header = createElement("div", "action-button__header");
    const icon = createElement("span", "action-button__icon");
    icon.dataset.emotion = action.emotion || "neutral";
    const name = createElement("span", "action-button__name", action.name);
    const cost = createElement(
      "span",
      "action-button__cost",
      [apCost ? `${apCost} AP` : null, essenceCost ? `${essenceCost} Ess` : null]
        .filter(Boolean)
        .join(" • ") || "Free"
    );
    header.append(icon, name, cost);
    button.appendChild(header);

    const description = createElement(
      "p",
      "action-button__description",
      action.description || ""
    );
    button.appendChild(description);

    if (action.chain) {
      const sequence = ACTION_SEQUENCES[action.chain.key] || [];
      const chainText = sequence.map((key) => ACTION_DEFINITIONS[key]?.name || key).join(" → ");
      const chain = createElement("p", "action-button__chain", `Chain: ${chainText}`);
      button.appendChild(chain);
    }

    const canUse =
      combat.turn === "player" &&
      combat.status === "inProgress" &&
      combat.player.ap >= apCost &&
      combat.player.essence >= essenceCost;
    button.disabled = !canUse;
    button.title = `${action.name} — ${action.description}`;
    if (canUse) {
      button.addEventListener("click", () => performPlayerAction(combat, index));
    }
    return button;
  }

  function showFloatingText(combat, targetElement, text, type) {
    if (!combat.dom || !combat.dom.floatLayer || !targetElement) {
      return;
    }
    const layer = combat.dom.floatLayer;
    const boardRect = combat.dom.board.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const bubble = createElement(
      "span",
      `floating-text floating-text--${type || "info"}`,
      text
    );
    bubble.style.left = `${targetRect.left - boardRect.left + targetRect.width / 2}px`;
    bubble.style.top = `${targetRect.top - boardRect.top}px`;
    layer.appendChild(bubble);
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
    window.setTimeout(() => {
      bubble.remove();
    }, 1200);
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

  function advanceEnemyMove(enemy, steps) {
    if (!enemy.moves || enemy.moves.length === 0) {
      return;
    }
    enemy.moveIndex = (enemy.moveIndex + (steps || 1)) % enemy.moves.length;
  }

  function getBackgroundForScreen(screenDef, options = {}) {
    if (options.background) {
      return options.background;
    }
    if (screenDef.background) {
      return screenDef.background;
    }
    if (screenDef.type === "menu") {
      return backgrounds.menu;
    }
    return backgrounds.menu;
  }

  function setBackground(screenDef, options = {}) {
    const image = getBackgroundForScreen(screenDef, options);
    if (backgroundEl.dataset.bg !== image) {
      backgroundEl.style.backgroundImage = `url("${image}")`;
      backgroundEl.dataset.bg = image;
    }
    const ariaLabel = options.ariaLabel || screenDef.ariaLabel;
    if (ariaLabel) {
      backgroundEl.setAttribute("aria-label", ariaLabel);
    } else {
      backgroundEl.removeAttribute("aria-label");
    }
  }

  function showToast(message, { duration = 3600 } = {}) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("toast--visible");
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(() => {
      toastEl.classList.remove("toast--visible");
    }, duration);
  }

  function fadeToBlack() {
    return new Promise((resolve) => {
      if (!fadeOverlay) {
        resolve();
        return;
      }
      fadeOverlay.classList.add("visible");
      requestAnimationFrame(() => {
        fadeOverlay.classList.add("opaque");
      });

      const cleanup = () => {
        window.clearTimeout(fallback);
        fadeOverlay.removeEventListener("transitionend", onTransitionEnd);
        resolve();
      };

      const onTransitionEnd = (event) => {
        if (event.target === fadeOverlay) {
          cleanup();
        }
      };

      const fallback = window.setTimeout(cleanup, 650);
      fadeOverlay.addEventListener("transitionend", onTransitionEnd);
    });
  }

  function fadeFromBlack() {
    return new Promise((resolve) => {
      if (!fadeOverlay) {
        resolve();
        return;
      }

      const cleanup = () => {
        window.clearTimeout(fallback);
        fadeOverlay.removeEventListener("transitionend", onTransitionEnd);
        fadeOverlay.classList.remove("visible");
        resolve();
      };

      const onTransitionEnd = (event) => {
        if (event.target === fadeOverlay) {
          cleanup();
        }
      };

      const fallback = window.setTimeout(cleanup, 650);
      fadeOverlay.classList.remove("opaque");
      fadeOverlay.addEventListener("transitionend", onTransitionEnd);
    });
  }

  async function transitionTo(screenKey, options = {}) {
    const screenDef = screens[screenKey];
    if (!screenDef) {
      throw new Error(`Unknown screen: ${screenKey}`);
    }
    if (state.currentScreen === screenKey && !options.refresh) {
      return;
    }

    await fadeToBlack();
    renderScreen(screenKey, options);
    await fadeFromBlack();
  }

  function renderScreen(screenKey, options = {}) {
    const screenDef = screens[screenKey];
    if (!screenDef) return;

    const context = {
      state,
      transitionTo,
      showToast,
      options,
    };

    const screenContent = screenDef.render(context);
    contentEl.replaceChildren(screenContent);
    setBackground(screenDef, options);

    state.currentScreen = screenKey;
    if (screenDef.checkpoint) {
      state.hasSave = true;
      state.lastRunScreen = screenKey;
    }

    if (screenKey === "corridor") {
      state.inRun = true;
    }
  }

  function preloadImages(imageList) {
    imageList.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  function initialize() {
    const initialScreen = screens.splash;
    setBackground(initialScreen, {});
    const splashContent = initialScreen.render({
      state,
      transitionTo,
      showToast,
      options: {},
    });
    contentEl.appendChild(splashContent);
    state.currentScreen = "splash";

    const imagesToPreload = new Set();
    Object.values(screens).forEach((screen) => {
      imagesToPreload.add(getBackgroundForScreen(screen));
    });
    roomDefinitions.forEach((room) => {
      imagesToPreload.add(room.background);
    });
    imagesToPreload.add(foyerRoom.background);
    [
      playerCharacter,
      ...enemySprites,
      ...bossSprites,
      ...merchantSprites,
    ].forEach((sprite) => {
      if (sprite && sprite.src) {
        imagesToPreload.add(sprite.src);
      }
    });
    preloadImages(Array.from(imagesToPreload));
  }

  initialize();
})();
