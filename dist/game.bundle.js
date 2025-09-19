var CebartiManor = (() => {
  // src/data/backgrounds.js
  var backgrounds = {
    splash: "bg_cebartimanor_ext.png",
    menu: "bg_wallpaper.png",
    well: "bg_room_well.png",
    corridor: "bg_corridor.png",
    foyer: "bg_room_foyer.png",
    victory: "bg_victoryscreen.png"
  };

  // src/data/sprites.js
  var playerCharacter = {
    key: "playerGhost",
    name: "Player Ghost",
    src: "cs_player_ghost1.png",
    alt: "The player's ghostly form glimmering with cerulean ectoplasm.",
    facing: "right"
  };
  var enemySprites = [
    {
      key: "corridorMimic",
      name: "Corridor Mimic",
      src: "cs_enemy_corridormimic1.png",
      alt: "A corridor mimic unfurling a maw of warped floorboards.",
      facing: "left"
    },
    {
      key: "greedyShade",
      name: "Greedy Shade",
      src: "cs_enemy_greedyshade1.png",
      alt: "A hunched shade clutching pilfered relics to its chest.",
      facing: "left"
    },
    {
      key: "jesterWraith",
      name: "Jester Wraith",
      src: "cs_enemy_jesterwraith1.png",
      alt: "A wraith clad in jester bells with a razor grin.",
      facing: "left"
    },
    {
      key: "mourningChoir",
      name: "Mourning Choir",
      src: "cs_enemy_mourningchoir1.png",
      alt: "A trio of veiled mourners singing a spectral hymn.",
      facing: "left"
    },
    {
      key: "oathbreakerKnight",
      name: "Oathbreaker Knight",
      src: "cs_enemy_oathbreakerknight1.png",
      alt: "A fallen knight wreathed in oathbound chains.",
      facing: "left"
    },
    {
      key: "possessedArmor",
      name: "Possessed Armor",
      src: "cs_enemy_possessedarmor1.png",
      alt: "Vacant armor animated by violet specters.",
      facing: "left"
    },
    {
      key: "stygianHound",
      name: "Stygian Hound",
      src: "cs_enemy_stygianhound1.png",
      alt: "A spectral hound with abyssal flame eyes.",
      facing: "left"
    },
    {
      key: "wailingWidow",
      name: "Wailing Widow",
      src: "cs_enemy_wailingwidow1.png",
      alt: "A widow draped in tattered mourning veils.",
      facing: "left"
    }
  ];
  var bossSprites = [
    {
      key: "archivist",
      name: "The Archivist",
      src: "cs_boss_archivist1.png",
      alt: "The Archivist boss cloaked in luminous script.",
      facing: "left"
    },
    {
      key: "floodBride",
      name: "The Flood Bride",
      src: "cs_boss_floodbride1.png",
      alt: "The Flood Bride boss trailing drowned lace and tidewater.",
      facing: "left"
    }
  ];
  var DOOR_SPRITES = {
    base: "objspr_doors_door.png",
    lock: "objspr_doors_lock.png",
    icons: {
      combat: "objspr_doors_combatroomsign.png",
      elite: "objspr_doors_elitecombatroomsign.png",
      boss: "objspr_doors_bosscombatroomsign.png",
      merchant: "objspr_doors_merchantroomsign.png",
      treasure: "objspr_doors_treasureroomsign.png",
      recovery: "objspr_doors_restoreroomsign.png",
      event: "objspr_doors_eventroomsign.png"
    }
  };
  var merchantSprites = [
    {
      key: "bellringer",
      name: "Bellringer",
      src: "cs_npc_bellringer1.png",
      alt: "A spectral bellringer merchant cradling chains of chimes.",
      facing: "left"
    },
    {
      key: "candleman",
      name: "Candleman",
      src: "cs_npc_candleman1.png",
      alt: "A waxen vendor crowned with flickering candles.",
      facing: "left"
    },
    {
      key: "collector",
      name: "Collector",
      src: "cs_npc_collector1.png",
      alt: "A cloaked collector weighed down by curiosities.",
      facing: "left"
    },
    {
      key: "helenCebarti",
      name: "Helen Cebarti",
      src: "cs_npc_helencebarti1.png",
      alt: "Helen Cebarti, poised behind a spectral negotiating table.",
      facing: "left"
    },
    {
      key: "ragpicker",
      name: "Ragpicker",
      src: "cs_npc_ragpicker1.png",
      alt: "A ragpicker merchant draped in salvaged fabrics.",
      facing: "left"
    }
  ];

  // src/data/bestiary.js
  var BESTIARY_PAGES = [
    {
      key: "memoriesActions",
      title: "Memories & Actions",
      sections: [
        {
          type: "memory",
          emptyText: "No memories recorded in this ledger."
        },
        {
          type: "action",
          emptyText: "No actions documented yet."
        }
      ]
    },
    {
      key: "relicsConsumables",
      title: "Relics & Consumables",
      sections: [
        {
          type: "relic",
          emptyText: "No relics recorded in this ledger."
        },
        {
          type: "consumable",
          emptyText: "No consumables catalogued."
        }
      ]
    },
    {
      key: "enemiesBosses",
      title: "Enemies & Bosses",
      sections: [
        {
          type: "enemy",
          emptyText: "No enemies have been catalogued."
        },
        {
          type: "boss",
          emptyText: "No bosses have been recorded."
        }
      ]
    },
    {
      key: "playerGhosts",
      title: "Player Ghosts",
      sections: [
        {
          type: "playerGhost",
          emptyText: "No player apparitions have manifested."
        }
      ]
    }
  ];

  // src/data/items.js
  var MANOR_KEY_CONSUMABLE_KEY = "consumableManorKey";
  var ENHANCED_DOOR_CHANCE = 0.25;
  var RELIC_DEFINITIONS = [
    {
      key: "relicCandleRedWax",
      name: "Candle of Red Wax",
      emotion: "Anger",
      description: "Bleed deals +1 damage per stack each turn. Heal for half the bleed damage dealt.",
      passive: { bleedBonus: 1, bleedHealFraction: 0.5 }
    },
    {
      key: "relicBrassKnuckles",
      name: "Brass Knuckles",
      emotion: "Anger",
      description: "Strike deals +3 damage. After Strike, your next Grapple this turn costs \u22121 AP.",
      passive: { strikeDamageBonus: 3, grappleDiscountAfterStrike: 1 }
    },
    {
      key: "relicRustedChains",
      name: "Rusted Chains",
      emotion: "Anger",
      description: "Grapple applies Restrained (2) instead of (1).",
      passive: { grappleRestrainedBonus: 1 }
    },
    {
      key: "relicSkullDice",
      name: "Skull Dice",
      emotion: "Anger",
      description: "While Strike is face-up, gain +15% critical chance.",
      passive: { strikeFaceUpCritBonus: 15 }
    },
    {
      key: "relicAshenBrand",
      name: "Ashen Brand",
      emotion: "Anger",
      description: "Whenever Throw deals damage, apply Vulnerable (1).",
      passive: { throwAppliesVulnerable: 1 }
    },
    {
      key: "relicPorcelainRat",
      name: "Porcelain Rat Figurine",
      emotion: "Fear",
      description: "Each turn you block 10+ damage, apply Dazed (1) to the foe.",
      passive: { blockThresholdDaze: 10, blockThresholdDazeStacks: 1 }
    },
    {
      key: "relicIronWallPlate",
      name: "Iron Wall Plate",
      emotion: "Fear",
      description: "Guard provides +4 additional Block.",
      passive: { guardBlockBonus: 4 }
    },
    {
      key: "relicKnightsOath",
      name: "Knight's Oath Band",
      emotion: "Fear",
      description: "When you Brace, gain Retaliate (2).",
      passive: { braceRetaliate: 2 }
    },
    {
      key: "relicTarnishedSpear",
      name: "Tarnished Spear",
      emotion: "Fear",
      description: "Counter deals +5 damage if you blocked since last turn.",
      passive: { counterBlockedBonusDamage: 5 }
    },
    {
      key: "relicStoneGuardian",
      name: "Stone Guardian Idol",
      emotion: "Fear",
      description: "At end of your turn, if you played no attacks, gain Armor (2) for the fight.",
      passive: { armorGainNoAttack: 2 }
    },
    {
      key: "relicLanternFestival",
      name: "Lantern of Festival Glass",
      emotion: "Joy",
      description: "While any buff is active, gain Essence Regen (1).",
      passive: { buffGrantsEssenceRegen: 1 }
    },
    {
      key: "relicConfettiPouch",
      name: "Confetti Pouch",
      emotion: "Joy",
      description: "Spark deals +3 damage if you played a buff this turn.",
      passive: { sparkBuffBonus: 3 }
    },
    {
      key: "relicGoldenLyre",
      name: "Golden Lyre",
      emotion: "Joy",
      description: "Festival Light also grants +5% Critical Chance to allies this turn.",
      passive: { festivalLightCritBonus: 5 }
    },
    {
      key: "relicBellRevelry",
      name: "Bell of Revelry",
      emotion: "Joy",
      description: "At end of turn, if you played Elation, heal 3 additional Essence.",
      passive: { elationEndHeal: 3 }
    },
    {
      key: "relicMirrorMask",
      name: "Mirror Mask",
      emotion: "Joy",
      description: "The first buff you play each combat is duplicated.",
      passive: { firstBuffDuplicated: true }
    },
    {
      key: "relicDirgeBell",
      name: "Dirge Bell",
      emotion: "Sadness",
      description: "Wither applies Bleed (1) in addition to its normal effect.",
      passive: { witherAppliesExtraBleed: 1 }
    },
    {
      key: "relicObsidianTear",
      name: "Obsidian Tear Pendant",
      emotion: "Sadness",
      description: "Breakthrough costs 1 less AP if the enemy has Fatigue.",
      passive: { breakthroughFatigueDiscount: 1 }
    },
    {
      key: "relicGraveSoil",
      name: "Grave Soil Jar",
      emotion: "Sadness",
      description: "Whenever you inflict Fatigue, gain +1 AP next turn.",
      passive: { fatigueApBonus: 1 }
    },
    {
      key: "relicMourningVeil",
      name: "Veil of Mourning Silk",
      emotion: "Sadness",
      description: "While Burden is face-up, gain Armor (1).",
      passive: { burdenFaceUpArmor: 1 }
    },
    {
      key: "relicTombKey",
      name: "Tomb Key",
      emotion: "Sadness",
      description: "If you played Breakthrough this combat, gain +15 gold at victory.",
      passive: { breakthroughGoldReward: 15 }
    }
  ];
  var CONSUMABLE_DEFINITIONS = [
    {
      key: "consumablePotionVigor",
      name: "Potion of Vigor",
      description: "Restore 12 Essence (cannot exceed your maximum).",
      icon: "\u271A",
      effect: { type: "restoreEssence", amount: 12 }
    },
    {
      key: "consumableTorch",
      name: "Everbright Torch",
      description: "Reveal the next two room types on the map.",
      icon: "\u263C",
      effect: { type: "revealRooms", count: 2 }
    },
    {
      key: "consumableCursedHourglass",
      name: "Cursed Hourglass",
      description: "Skip the next enemy turn. Lose 5 Essence at the end of your next turn.",
      icon: "\u231B",
      effect: { type: "skipEnemyTurn", essencePenalty: 5 }
    },
    {
      key: "consumableSoulLantern",
      name: "Soul Lantern",
      description: "Negate the next time you would die this combat, then shatter.",
      icon: "\u2600",
      effect: { type: "revive", healthFraction: 0.5 }
    },
    {
      key: "consumablePotionAegis",
      name: "Potion of Aegis",
      description: "Gain Armor (4) and Block (10).",
      icon: "\u2748",
      effect: { type: "gainArmorAndBlock", armor: 4, block: 10 }
    },
    {
      key: "consumableVialFrenzy",
      name: "Vial of Frenzy",
      description: "Your attacks deal +75% damage this combat.",
      icon: "\u2694",
      effect: { type: "damageMultiplier", amount: 1.75 }
    },
    {
      key: "consumableCursedCoin",
      name: "Cursed Coin",
      description: "Gain 40 Gold. Each combat this run starts with Dazed (1).",
      icon: "\u2620",
      effect: { type: "gainGoldWithCurse", amount: 40, curse: "dazed" }
    },
    {
      key: "consumablePocketWatch",
      name: "Silver Pocketwatch",
      description: "Set your AP to 6 and draw 2 extra memories next turn.",
      icon: "\u231A",
      effect: { type: "setApAndDraw", ap: 6, draw: 2 }
    },
    {
      key: "consumableBottledStorm",
      name: "Bottled Storm",
      description: "Deal 15 damage to all enemies.",
      icon: "\u2607",
      effect: { type: "aoeDamage", amount: 15 }
    },
    {
      key: "consumableVialSerenity",
      name: "Vial of Serenity",
      description: "Remove all negative statuses from yourself.",
      icon: "\u2724",
      effect: { type: "cleanse" }
    },
    {
      key: "consumableSoulJar",
      name: "Soul Jar",
      description: "Store 10 Essence now. You may shatter the jar later to restore it.",
      icon: "\u2742",
      effect: { type: "storeEssence", amount: 10 }
    },
    {
      key: "consumableElixirFocus",
      name: "Elixir of Focus",
      description: "Your next 2 actions this combat cost 1 less AP (minimum 0).",
      icon: "\u273A",
      effect: { type: "discountActions", count: 2, amount: 1 }
    },
    {
      key: "consumableVialNightshade",
      name: "Vial of Nightshade",
      description: "Apply Poison (8) to an enemy.",
      icon: "\u2618",
      effect: { type: "applyStatus", status: "poison", stacks: 8 }
    },
    {
      key: "consumableDiceFates",
      name: "Dice of Fates",
      description: "Reroll all room options on the map.",
      icon: "\u2685",
      effect: { type: "rerollRooms" }
    },
    {
      key: "consumableCandleWard",
      name: "Candle Ward",
      description: "Gain 3 Ward charges that negate incoming damage instances.",
      icon: "\u{1F56F}",
      effect: { type: "gainWard", charges: 3 }
    },
    {
      key: "consumablePotionEssence",
      name: "Potion of Essence",
      description: "Restore 6 Essence (cannot exceed your maximum).",
      icon: "\u2726",
      effect: { type: "restoreEssence", amount: 6 }
    },
    {
      key: "consumablePolishedCoin",
      name: "Polished Coin",
      description: "Gain 15 Gold immediately.",
      icon: "\u25CE",
      effect: { type: "gainGold", amount: 15 }
    },
    {
      key: "consumableShroudTalisman",
      name: "Shroud Talisman",
      description: "Negate the next cursed effect or trap that would afflict you this run.",
      icon: "\u263D",
      effect: { type: "grantShroudGuard" }
    },
    {
      key: "consumablePotionLingering",
      name: "Potion of Lingering",
      description: "Permanently increase your maximum Essence by 5 and restore to full.",
      icon: "\u2736",
      effect: { type: "increaseMaxEssence", amount: 5 }
    },
    {
      key: MANOR_KEY_CONSUMABLE_KEY,
      name: "Manor Key",
      description: "Unlocks a locked enhanced door within the corridor.",
      icon: "\u{1F5DD}",
      effect: { type: "unlockDoor" }
    }
  ];
  var RELIC_MAP = new Map(
    RELIC_DEFINITIONS.map((relic) => [relic.key, relic])
  );
  var CONSUMABLE_MAP = new Map(
    CONSUMABLE_DEFINITIONS.map((item) => [item.key, item])
  );

  // src/combat/actions.js
  var ACTION_SEQUENCES = {
    angerCore: ["strike", "grapple", "throw"],
    fearCore: ["guard", "brace", "counter"],
    joyCore: ["spark", "festivalLight", "elation"],
    sadnessCore: ["burden", "wither", "breakthrough"]
  };
  function createCoreContribution(chainKey, weightPerAction) {
    const actions = ACTION_SEQUENCES[chainKey] || [];
    const totalWeight = weightPerAction * actions.length;
    return createMultiCoreContribution([chainKey], totalWeight);
  }
  function createMultiCoreContribution(chainKeys, totalWeight) {
    const contributions = [];
    const totalActions = chainKeys.reduce(
      (sum, key) => sum + (ACTION_SEQUENCES[key]?.length || 0),
      0
    );
    if (totalActions <= 0 || totalWeight <= 0) {
      return contributions;
    }
    const weightPerAction = totalWeight / totalActions;
    chainKeys.forEach((key) => {
      const actions = ACTION_SEQUENCES[key] || [];
      actions.forEach((actionKey) => {
        contributions.push({ action: actionKey, weight: weightPerAction });
      });
    });
    return contributions;
  }

  // src/data/memories.js
  var MEMORY_DEFINITIONS = [
    {
      key: "memoryBarFight",
      name: "Memory of the Bar Fight",
      emotion: "Anger",
      description: "Uppercut punishes foes already tangled in your Grapple.",
      contributions: [
        { action: "uppercut", weight: 1 },
        ...createCoreContribution("angerCore", 0.5)
      ]
    },
    {
      key: "memoryBloodBlade",
      name: "Memory of the Blood-soaked Blade",
      emotion: "Anger",
      description: "Bloodlash keeps pressure on so Throw lands harder.",
      contributions: [
        { action: "bloodlash", weight: 1 },
        ...createCoreContribution("angerCore", 0.5)
      ]
    },
    {
      key: "memoryFeastRoar",
      name: "Memory of the Victory Feast",
      emotion: "Anger",
      description: "Feast Roar supercharges the whole Strike \u2192 Grapple \u2192 Throw chain.",
      contributions: [
        { action: "feastRoar", weight: 1 },
        ...createCoreContribution("angerCore", 0.5)
      ]
    },
    {
      key: "memoryWatchman",
      name: "Memory of the Watchman",
      emotion: "Fear",
      description: "Tower Shield lets you punish attacks while Guard is face-up.",
      contributions: [
        { action: "towerShield", weight: 1 },
        ...createCoreContribution("fearCore", 0.5)
      ]
    },
    {
      key: "memoryLockedDoor",
      name: "Memory of the Locked Door",
      emotion: "Fear",
      description: "Iron Bar turns stored Block into Dazed disruption.",
      contributions: [
        { action: "ironBar", weight: 1 },
        ...createCoreContribution("fearCore", 0.5)
      ]
    },
    {
      key: "memoryOathKept",
      name: "Memory of the Oath Kept",
      emotion: "Fear",
      description: "Pledge Strike adds armor while closing the defensive loop.",
      contributions: [
        { action: "pledgeStrike", weight: 1 },
        ...createCoreContribution("fearCore", 0.5)
      ]
    },
    {
      key: "memorySong",
      name: "Memory of the Song",
      emotion: "Joy",
      description: "Song of Triumph boosts crits and essence to fuel Spark and Elation.",
      contributions: [
        { action: "songOfTriumph", weight: 1 },
        ...createCoreContribution("joyCore", 0.5)
      ]
    },
    {
      key: "memoryLaughingCrowd",
      name: "Memory of the Laughing Crowd",
      emotion: "Joy",
      description: "Cheer keeps morale high and crits flowing.",
      contributions: [
        { action: "cheer", weight: 1 },
        ...createCoreContribution("joyCore", 0.5)
      ]
    },
    {
      key: "memoryGoldenLantern",
      name: "Memory of the Golden Lantern",
      emotion: "Joy",
      description: "Lantern Glow blends AoE chip with essence sustain.",
      contributions: [
        { action: "lanternGlow", weight: 1 },
        ...createCoreContribution("joyCore", 0.5)
      ]
    },
    {
      key: "memoryLongMarch",
      name: "Memory of the Long March",
      emotion: "Sadness",
      description: "Dirge spreads fatigue so Breakthrough refunds momentum.",
      contributions: [
        { action: "dirge", weight: 1 },
        ...createCoreContribution("sadnessCore", 0.5)
      ]
    },
    {
      key: "memoryWidowsVeil",
      name: "Memory of the Widow's Veil",
      emotion: "Sadness",
      description: "Shroud of Loss turns bleed into a grinding edge.",
      contributions: [
        { action: "shroudOfLoss", weight: 1 },
        ...createCoreContribution("sadnessCore", 0.5)
      ]
    },
    {
      key: "memoryEmptyChair",
      name: "Memory of the Empty Chair",
      emotion: "Sadness",
      description: "Remembrance keeps AP refunds flowing for Breakthrough turns.",
      contributions: [
        { action: "remembrance", weight: 1 },
        ...createCoreContribution("sadnessCore", 0.5)
      ]
    },
    {
      key: "memoryDuel",
      name: "Memory of the Duel",
      emotion: "Hybrid",
      description: "Riposte Slash thrives when Guard and Brace absorb blows first.",
      contributions: [
        { action: "riposteSlash", weight: 1 },
        ...createCoreContribution("angerCore", 0.25),
        ...createCoreContribution("fearCore", 0.25)
      ]
    },
    {
      key: "memoryVictoryFeastHybrid",
      name: "Memory of the Victory Feast (Echoes)",
      emotion: "Hybrid",
      description: "Feast Fireworks layers crits onto Spark chains and Throw payoffs.",
      contributions: [
        { action: "feastFireworks", weight: 1 },
        ...createCoreContribution("angerCore", 0.25),
        ...createCoreContribution("joyCore", 0.25)
      ]
    },
    {
      key: "memoryBetrayal",
      name: "Memory of Betrayal",
      emotion: "Hybrid",
      description: "Backstab seeds both Bleed and Fatigue for Breakthrough or Throw.",
      contributions: [
        { action: "backstab", weight: 1 },
        ...createCoreContribution("angerCore", 0.25),
        ...createCoreContribution("sadnessCore", 0.25)
      ]
    },
    {
      key: "memoryVigil",
      name: "Memory of Vigil",
      emotion: "Hybrid",
      description: "Blessed Guard mixes Fear walls with Joyful sustain.",
      contributions: [
        { action: "blessedGuard", weight: 1 },
        ...createCoreContribution("fearCore", 0.25),
        ...createCoreContribution("joyCore", 0.25)
      ]
    },
    {
      key: "memoryFuneralProcession",
      name: "Memory of Funeral Procession",
      emotion: "Hybrid",
      description: "Processional Chant blankets enemies in fatigue while you turtle up.",
      contributions: [
        { action: "processionalChant", weight: 1 },
        ...createCoreContribution("fearCore", 0.25),
        ...createCoreContribution("sadnessCore", 0.25)
      ]
    },
    {
      key: "memoryMischievousTears",
      name: "Memory of Mischievous Tears",
      emotion: "Hybrid",
      description: "Mocking Weep copies whichever payoff your deck craves.",
      contributions: [
        { action: "mockingWeep", weight: 1 },
        ...createCoreContribution("joyCore", 0.25),
        ...createCoreContribution("sadnessCore", 0.25)
      ]
    },
    {
      key: "memoryForgottenToy",
      name: "Memory of the Forgotten Toy",
      emotion: "Wild",
      description: "Broken Plaything inflicts Vulnerable for any damage plan.",
      contributions: [
        { action: "brokenPlaything", weight: 1 },
        ...createMultiCoreContribution(["angerCore", "fearCore", "sadnessCore"], 0.5)
      ]
    },
    {
      key: "memoryOathBroken",
      name: "Memory of the Oath Broken",
      emotion: "Wild",
      description: "Vowbreaker layers Bleed onto whichever core you favor.",
      contributions: [
        { action: "vowbreaker", weight: 1 },
        ...createMultiCoreContribution(["angerCore", "joyCore", "sadnessCore"], 0.5)
      ]
    },
    {
      key: "memoryLostCarnival",
      name: "Memory of the Lost Carnival",
      emotion: "Wild",
      description: "Carnival Fire brings AoE chip and regen without leaning on Sadness.",
      contributions: [
        { action: "carnivalFire", weight: 1 },
        ...createMultiCoreContribution(["angerCore", "fearCore", "joyCore"], 0.5)
      ]
    },
    {
      key: "memoryShadowedGarden",
      name: "Memory of the Shadowed Garden",
      emotion: "Wild",
      description: "Bloom of Thorns grants armor without stirring Anger memories.",
      contributions: [
        { action: "bloomOfThorns", weight: 1 },
        ...createMultiCoreContribution(["fearCore", "joyCore", "sadnessCore"], 0.5)
      ]
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
        )
      ]
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
        )
      ]
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
        )
      ]
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
        )
      ]
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
        )
      ]
    }
  ];
  var MEMORY_MAP = new Map(
    MEMORY_DEFINITIONS.map((memory) => [memory.key, memory])
  );

  // src/data/enemies.js
  var ENEMY_DEFINITIONS = {
    corridorMimic: {
      maxEssence: 12,
      moves: [
        {
          key: "splinterSlam",
          name: "Splinter Slam",
          type: "attack",
          damage: 4,
          description: "Slams you with jagged boards."
        },
        {
          key: "hungryMaw",
          name: "Hungry Maw",
          type: "attack",
          damage: 6,
          apply: { vulnerable: 1 },
          description: "Bites down and leaves you exposed."
        },
        {
          key: "splinterShield",
          name: "Splinter Shield",
          type: "block",
          block: 5,
          description: "Raises a shield of floorboards."
        }
      ]
    },
    greedyShade: {
      maxEssence: 10,
      moves: [
        {
          key: "claw",
          name: "Greedy Claw",
          type: "attack",
          damage: 5,
          description: "Rakes spectral claws across you."
        },
        {
          key: "essenceSip",
          name: "Essence Sip",
          type: "drain",
          damage: 3,
          heal: 3,
          description: "Steals a sip of your essence."
        },
        {
          key: "shroud",
          name: "Hoarded Shroud",
          type: "buff",
          armor: 2,
          description: "Wraps itself in stolen protections."
        }
      ]
    },
    jesterWraith: {
      maxEssence: 11,
      moves: [
        {
          key: "bellWhip",
          name: "Bell Whip",
          type: "attack",
          damage: 4,
          description: "A snapping lash of bells."
        },
        {
          key: "cackle",
          name: "Cackling Hex",
          type: "debuff",
          apply: { confused: 1 },
          description: "Unsettles your memories."
        },
        {
          key: "pratfall",
          name: "Pratfall",
          type: "attack",
          damage: 7,
          description: "Crashes into you with comedic malice."
        }
      ]
    },
    mourningChoir: {
      maxEssence: 14,
      moves: [
        {
          key: "wail",
          name: "Choral Wail",
          type: "attack",
          damage: 3,
          description: "A wail that chips at your spirit."
        },
        {
          key: "lament",
          name: "Lament",
          type: "debuff",
          apply: { fatigue: 1 },
          description: "A lament that wearies you."
        },
        {
          key: "crescendo",
          name: "Crescendo",
          type: "attack",
          damage: 6,
          description: "A swelling chorus slams into you."
        }
      ]
    },
    oathbreakerKnight: {
      maxEssence: 16,
      moves: [
        {
          key: "sunder",
          name: "Sunder",
          type: "attack",
          damage: 6,
          description: "A heavy downward strike."
        },
        {
          key: "chainBind",
          name: "Chain Bind",
          type: "debuff",
          apply: { restrained: 1 },
          description: "Chains lash out to bind you."
        },
        {
          key: "oathShield",
          name: "Oath Shield",
          type: "block",
          block: 6,
          description: "Raises a spectral shield of vows."
        }
      ]
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
          description: "A brutal armored punch."
        },
        {
          key: "clangor",
          name: "Clanging Roar",
          type: "debuff",
          apply: { vulnerable: 1 },
          description: "The roar leaves you rattled."
        },
        {
          key: "plateWall",
          name: "Plate Wall",
          type: "block",
          block: 7,
          description: "Plates rearrange to defend the host."
        }
      ]
    },
    stygianHound: {
      maxEssence: 9,
      moves: [
        {
          key: "bite",
          name: "Abyssal Bite",
          type: "attack",
          damage: 5,
          description: "Gnaws with void-fanged teeth."
        },
        {
          key: "howl",
          name: "Spectral Howl",
          type: "debuff",
          apply: { vulnerable: 1 },
          description: "A chilling howl saps your poise."
        },
        {
          key: "shadowPounce",
          name: "Shadow Pounce",
          type: "attack",
          damage: 7,
          description: "Leaps from darkness to rend essence."
        }
      ]
    },
    wailingWidow: {
      maxEssence: 12,
      moves: [
        {
          key: "veilSwipe",
          name: "Veil Swipe",
          type: "attack",
          damage: 4,
          description: "Swipes with tattered veils."
        },
        {
          key: "mourningKeen",
          name: "Mourning Keen",
          type: "debuff",
          apply: { bleed: 1 },
          description: "A keening note cuts deep."
        },
        {
          key: "widowsEmbrace",
          name: "Widow's Embrace",
          type: "drain",
          damage: 3,
          heal: 3,
          description: "Steals warmth from your soul."
        }
      ]
    },
    archivist: {
      maxEssence: 66,
      moves: [
        {
          key: "catalogStrike",
          name: "Catalog Strike",
          type: "attack",
          damage: 7,
          description: "Files you under 'Defiant'."
        },
        {
          key: "inkSnare",
          name: "Ink Snare",
          type: "debuff",
          apply: { restrained: 1 },
          description: "Snares you in viscous script."
        },
        {
          key: "knowledgeShield",
          name: "Knowledge Shield",
          type: "block",
          block: 8,
          description: "Layers defensive glyphs."
        }
      ]
    },
    floodBride: {
      maxEssence: 72,
      moves: [
        {
          key: "tidalRush",
          name: "Tidal Rush",
          type: "attack",
          damage: 8,
          description: "A tide crashes down upon you."
        },
        {
          key: "drownedGrasp",
          name: "Drowned Grasp",
          type: "debuff",
          apply: { bleed: 1 },
          description: "Drags you toward the undertow."
        },
        {
          key: "undertow",
          name: "Undertow",
          type: "attack",
          damage: 6,
          description: "Pulls you beneath spectral waters."
        }
      ]
    }
  };
  var DEFAULT_ENEMY_MOVES = [
    {
      key: "hauntingSwipe",
      name: "Haunting Swipe",
      type: "attack",
      damage: 4,
      description: "A chilling swipe of ectoplasm."
    },
    {
      key: "gloomShield",
      name: "Gloom Shield",
      type: "block",
      block: 4,
      description: "Shadows coil defensively."
    },
    {
      key: "dreadWhisper",
      name: "Dread Whisper",
      type: "debuff",
      apply: { vulnerable: 1 },
      description: "A whisper that leaves you exposed."
    }
  ];

  // src/data/rooms.js
  var ROOM_DEFINITIONS = [
    {
      key: "well",
      name: "Submerged Reliquary",
      background: "bg_room_well.png",
      description: "The well chamber opens into a circular antechamber, its waters thrumming with residual whispers that tug at your memory.",
      ariaLabel: "A flooded reliquary chamber branching from the manor's Styx well."
    },
    {
      key: "atrium",
      name: "Flooded Atrium",
      background: "bg_room_atrium.png",
      description: "Collapsed skylights spill moonlight across the atrium's reflecting pool. Spectral vines curl toward the rippling surface.",
      ariaLabel: "A decayed manor atrium filled with water and moonlight."
    },
    {
      key: "bedroom",
      name: "Forsaken Bedroom",
      background: "bg_room_bedroom.png",
      description: "Antique furniture floats inches above the ground, swaying in time with a lullaby no mortal voice should sing.",
      ariaLabel: "An abandoned bedroom with haunted furnishings suspended midair."
    },
    {
      key: "closet",
      name: "Locksmith's Closet",
      background: "bg_room_closet.png",
      description: "Walls of keys clatter like chimes. One of them pulses with a heartbeat in sync with your own.",
      ariaLabel: "A cramped closet overflowing with shimmering keys."
    },
    {
      key: "counsel",
      name: "Counsel Chamber",
      background: "bg_room_counsel.png",
      description: "Couches circle a darkened fireplace. The ashes whisper fractured therapy sessions from lifetimes ago.",
      ariaLabel: "A dim counseling chamber lined with couches and a smoldering hearth."
    },
    {
      key: "kitchen",
      name: "Haunted Kitchen",
      background: "bg_room_kitchen.png",
      description: "Copper pots rattle without touch. Aromas of impossible feasts pull at your hunger and your soul alike.",
      ariaLabel: "A spectral kitchen with floating utensils and lingering aromas."
    },
    {
      key: "studio",
      name: "Painter's Studio",
      background: "bg_room_studio.png",
      description: "Unfinished canvases watch you. Fresh paint crawls across them, forming scenes of your past lives.",
      ariaLabel: "An artist's studio where the paintings appear to move on their own."
    },
    {
      key: "study",
      name: "Occult Study",
      background: "bg_room_study.png",
      description: "Books flutter from shelves as if anxious birds. Glyphs glow along the desk, cataloging every decision you've made tonight.",
      ariaLabel: "A study filled with floating books and glowing occult glyphs."
    },
    {
      key: "washroom",
      name: "Mirror Washroom",
      background: "bg_room_washroom.png",
      description: "Steam coats the mirrors, yet silhouettes stare back from beyond the glass waiting to trade places.",
      ariaLabel: "A misty washroom with haunted mirrors."
    },
    {
      key: "winecellar",
      name: "Cursed Wine Cellar",
      background: "bg_room_winecellar.png",
      description: "Barrels hum with the voices of bottled celebrations. A single cork trembles, eager to release something old.",
      ariaLabel: "A wine cellar where barrels glow with spectral light."
    }
  ];
  var FOYER_ROOM = {
    key: "foyer",
    name: "The Foyer",
    background: backgrounds.foyer,
    description: "Helen Cebarti's foyer waits in stillness. The manor itself holds its breath for the coming confrontation.",
    ariaLabel: "The foyer of Cebarti Manor prepared for the final confrontation."
  };
  var TOTAL_ROOMS_PER_RUN = ROOM_DEFINITIONS.length + 1;
  var ROOMS_BEFORE_BOSS = ROOM_DEFINITIONS.length;
  var ROOM_MAP = ROOM_DEFINITIONS.reduce((map, room) => {
    map.set(room.key, room);
    return map;
  }, /* @__PURE__ */ new Map());
  var DOOR_CATEGORIES = [
    {
      key: "combat",
      label: "Combat",
      colorClass: "door-button--crimson",
      ariaDescription: "Engage in a standard combat encounter.",
      detail: "Battle restless shades.",
      icon: DOOR_SPRITES.icons.combat
    },
    {
      key: "elite",
      label: "Elite Combat",
      colorClass: "door-button--violet",
      ariaDescription: "Challenge a formidable elite opponent.",
      detail: "Face a formidable elite.",
      icon: DOOR_SPRITES.icons.elite
    },
    {
      key: "boss",
      label: "Boss Combat",
      colorClass: "door-button--umbra",
      ariaDescription: "Confront a boss-tier adversary.",
      detail: "Challenge a boss-tier foe.",
      icon: DOOR_SPRITES.icons.boss
    },
    {
      key: "recovery",
      label: "Recovery",
      colorClass: "door-button--verdant",
      ariaDescription: "Replenish and permanently fortify your essence in a restorative chamber.",
      detail: "Claim lasting essence and mend completely.",
      icon: DOOR_SPRITES.icons.recovery
    },
    {
      key: "treasure",
      label: "Treasure",
      colorClass: "door-button--amber",
      ariaDescription: "Search for rare rewards hidden within the manor.",
      detail: "Seek hidden rewards.",
      icon: DOOR_SPRITES.icons.treasure
    },
    {
      key: "merchant",
      label: "Merchant",
      colorClass: "door-button--azure",
      ariaDescription: "Trade with a spectral merchant.",
      detail: "Barter with a spectral vendor.",
      icon: DOOR_SPRITES.icons.merchant
    },
    {
      key: "event",
      label: "Event",
      colorClass: "door-button--aether",
      ariaDescription: "Trigger an unpredictable manor event.",
      detail: "Stumble into a strange event.",
      icon: DOOR_SPRITES.icons.event
    }
  ];

  // src/state/state.js
  function createBaseState(overrides = {}) {
    return {
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
      playerRelics: [],
      playerGold: 0,
      playerConsumables: {},
      playerEssence: null,
      playerMaxEssence: null,
      shroudGuardCharges: 0,
      draftPacks: [],
      selectedDrafts: [],
      resourceDisplays: {},
      codexView: null,
      codexSelections: {},
      devMode: false,
      activeCombat: null,
      activeScreenContext: null,
      merchantDraftCost: null,
      roomRewardsClaimed: {},
      currentRoomIsEnhanced: false,
      ...overrides
    };
  }
  var state = null;
  function createState(overrides = {}) {
    state = createBaseState(overrides);
    return state;
  }
  function getState() {
    if (!state) {
      state = createBaseState();
    }
    return state;
  }
  function updateState(partial = {}) {
    const target = getState();
    Object.assign(target, partial);
    return target;
  }
  function ensurePlayerConsumables() {
    const target = getState();
    if (!target.playerConsumables || typeof target.playerConsumables !== "object") {
      target.playerConsumables = {};
    }
    return target.playerConsumables;
  }
  function ensurePlayerRelics() {
    const target = getState();
    if (!Array.isArray(target.playerRelics)) {
      target.playerRelics = [];
    }
    return target.playerRelics;
  }
  function ensurePlayerMemories() {
    const target = getState();
    if (!Array.isArray(target.playerMemories)) {
      target.playerMemories = [];
    }
    return target.playerMemories;
  }
  function ensureCodexSelections() {
    const target = getState();
    if (!target.codexSelections || typeof target.codexSelections !== "object") {
      target.codexSelections = {};
    }
    return target.codexSelections;
  }
  function ensureResourceDisplays() {
    const target = getState();
    if (!target.resourceDisplays || typeof target.resourceDisplays !== "object") {
      target.resourceDisplays = {};
    }
    return target.resourceDisplays;
  }
  function adjustGold(amount) {
    const target = getState();
    const current = Number(target.playerGold || 0);
    const delta = Math.round(Number(amount) || 0);
    const next = Math.max(0, current + delta);
    target.playerGold = next;
    return next;
  }
  function adjustConsumableCount(key, delta) {
    if (!key) {
      return { quantity: 0, removed: false };
    }
    const consumables = ensurePlayerConsumables();
    const current = Number(consumables[key] || 0);
    const next = current + Math.round(Number(delta) || 0);
    if (next <= 0) {
      delete consumables[key];
      return { quantity: 0, removed: true };
    }
    consumables[key] = next;
    return { quantity: next, removed: false };
  }
  function awardRelic(key) {
    if (!key) {
      return false;
    }
    const relics = ensurePlayerRelics();
    if (relics.includes(key)) {
      return false;
    }
    relics.push(key);
    return true;
  }
  function recordMemory(key) {
    if (!key) {
      return false;
    }
    const memories = ensurePlayerMemories();
    if (memories.includes(key)) {
      return false;
    }
    memories.push(key);
    return true;
  }
  function incrementShroudGuard(amount = 1) {
    const target = getState();
    const current = Number(target.shroudGuardCharges || 0);
    const next = current + Math.round(Number(amount) || 0);
    target.shroudGuardCharges = Math.max(0, next);
    return target.shroudGuardCharges;
  }
  function setEssenceValues(essence, maxEssence) {
    const target = getState();
    if (typeof maxEssence === "number") {
      target.playerMaxEssence = maxEssence;
    }
    if (typeof essence === "number") {
      target.playerEssence = essence;
    }
    return {
      essence: target.playerEssence,
      maxEssence: target.playerMaxEssence
    };
  }
  function setActiveCombat(combat) {
    updateState({ activeCombat: combat });
    return combat;
  }
  function clearActiveCombat() {
    updateState({ activeCombat: null });
  }
  function toggleDevMode() {
    const target = getState();
    target.devMode = !target.devMode;
    return target.devMode;
  }
  function setCodexView(view) {
    updateState({ codexView: view });
    return view;
  }
  function clearCodexView() {
    updateState({ codexView: null });
  }

  // src/state/config.js
  var MAX_CONSUMABLE_SLOTS = 3;
  var MERCHANT_BASE_DRAFT_COST = 10;
  var MERCHANT_DRAFT_COST_INCREMENT = 5;
  var DEFAULT_PLAYER_STATS = {
    maxEssence: 15,
    baseApRegen: 6,
    baseCritChance: 5,
    apCarryover: 12
  };

  // src/ui/dom.js
  var doc = typeof document === "undefined" ? null : document;
  var cachedStructure = null;
  function getElementById(id) {
    if (!doc) {
      return null;
    }
    return doc.getElementById(id);
  }
  function ensureElement({
    id,
    className,
    parent,
    insertBefore = null,
    attributes = {}
  }) {
    if (!doc || !parent || !id) {
      return null;
    }
    let element = getElementById(id);
    if (!element) {
      element = doc.createElement("div");
      element.id = id;
      if (className) {
        element.className = className;
      }
      Object.entries(attributes).forEach(([name, value]) => {
        if (value === void 0 || value === null) {
          return;
        }
        element.setAttribute(name, String(value));
      });
      if (insertBefore && parent.contains(insertBefore)) {
        parent.insertBefore(element, insertBefore);
      } else {
        parent.appendChild(element);
      }
    } else {
      if (className) {
        element.classList.add(...className.split(/\s+/g).filter(Boolean));
      }
      Object.entries(attributes).forEach(([name, value]) => {
        if (value === void 0 || value === null) {
          return;
        }
        if (element.getAttribute(name) !== String(value)) {
          element.setAttribute(name, String(value));
        }
      });
      if (!parent.contains(element)) {
        if (insertBefore && parent.contains(insertBefore)) {
          parent.insertBefore(element, insertBefore);
        } else {
          parent.appendChild(element);
        }
      } else if (insertBefore && insertBefore !== element && parent.contains(insertBefore)) {
        parent.insertBefore(element, insertBefore);
      }
    }
    return element;
  }
  function ensureGameRoot() {
    if (!doc || !doc.body) {
      return null;
    }
    let root = getElementById("game");
    if (!root) {
      root = doc.createElement("div");
      root.id = "game";
      root.className = "game";
      doc.body.appendChild(root);
    } else {
      root.classList.add("game");
    }
    return root;
  }
  function ensureGameStructure() {
    const root = ensureGameRoot();
    if (!root) {
      cachedStructure = null;
      return null;
    }
    const background = ensureElement({
      id: "background",
      className: "game__background",
      parent: root,
      insertBefore: root.firstChild,
      attributes: { role: "img", "aria-label": "" }
    });
    const content = ensureElement({
      id: "content",
      className: "game__content",
      parent: root,
      attributes: { "aria-live": "polite" }
    });
    const fadeOverlay = ensureElement({
      id: "fade-overlay",
      className: "fade-overlay",
      parent: root,
      attributes: { "aria-hidden": "true" }
    });
    const toast = ensureElement({
      id: "toast",
      className: "toast",
      parent: root,
      attributes: {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true"
      }
    });
    cachedStructure = { game: root, background, content, fadeOverlay, toast };
    return cachedStructure;
  }
  function getBackgroundElement() {
    const structure = ensureGameStructure();
    return structure ? structure.background : null;
  }
  function getContentElement() {
    const structure = ensureGameStructure();
    return structure ? structure.content : null;
  }
  function getFadeOverlayElement() {
    const structure = ensureGameStructure();
    return structure ? structure.fadeOverlay : null;
  }
  function getToastElement() {
    const structure = ensureGameStructure();
    return structure ? structure.toast : null;
  }
  function ensureGameShell() {
    return ensureGameStructure();
  }
  function getRequiredElement(getter, id) {
    const element = typeof getter === "function" ? getter() : null;
    if (!element) {
      if (!doc || !doc.body) {
        return null;
      }
      throw new Error(`Element with id "${id}" was not found in the DOM.`);
    }
    return element;
  }
  var toastTimeout = null;
  function createElement(tag, className, textContent) {
    if (!doc) {
      return null;
    }
    const element = doc.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (textContent !== void 0) {
      element.textContent = textContent;
    }
    return element;
  }
  function replaceContent(...nodes) {
    const contentElement = getRequiredElement(getContentElement, "content");
    if (!contentElement) {
      return;
    }
    contentElement.replaceChildren(...nodes);
  }
  function appendContent(...nodes) {
    const contentElement = getRequiredElement(getContentElement, "content");
    if (!contentElement) {
      return;
    }
    contentElement.append(...nodes);
  }
  function updateBackground(image, ariaLabel) {
    const backgroundElement = getRequiredElement(getBackgroundElement, "background");
    if (!backgroundElement) {
      return;
    }
    if (typeof image === "string" && backgroundElement.dataset.bg !== image) {
      backgroundElement.style.backgroundImage = `url("${image}")`;
      backgroundElement.dataset.bg = image;
    }
    if (ariaLabel) {
      backgroundElement.setAttribute("aria-label", ariaLabel);
    } else {
      backgroundElement.removeAttribute("aria-label");
    }
  }
  function showToast(message, { duration = 3600 } = {}) {
    const toastElement = getRequiredElement(getToastElement, "toast");
    if (!toastElement) {
      return;
    }
    toastElement.textContent = message;
    toastElement.classList.add("toast--visible");
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(() => {
      toastElement.classList.remove("toast--visible");
    }, duration);
  }
  function fadeToBlack() {
    return new Promise((resolve) => {
      const fadeOverlayElement = getFadeOverlayElement();
      if (!fadeOverlayElement) {
        resolve();
        return;
      }
      fadeOverlayElement.classList.add("visible");
      requestAnimationFrame(() => {
        fadeOverlayElement.classList.add("opaque");
      });
      const cleanup = () => {
        window.clearTimeout(fallback);
        fadeOverlayElement.removeEventListener("transitionend", onTransitionEnd);
        resolve();
      };
      const onTransitionEnd = (event) => {
        if (event.target === fadeOverlayElement) {
          cleanup();
        }
      };
      const fallback = window.setTimeout(cleanup, 650);
      fadeOverlayElement.addEventListener("transitionend", onTransitionEnd);
    });
  }
  function fadeFromBlack() {
    return new Promise((resolve) => {
      const fadeOverlayElement = getFadeOverlayElement();
      if (!fadeOverlayElement) {
        resolve();
        return;
      }
      const cleanup = () => {
        window.clearTimeout(fallback);
        fadeOverlayElement.removeEventListener("transitionend", onTransitionEnd);
        fadeOverlayElement.classList.remove("visible");
        resolve();
      };
      const onTransitionEnd = (event) => {
        if (event.target === fadeOverlayElement) {
          cleanup();
        }
      };
      const fallback = window.setTimeout(cleanup, 650);
      fadeOverlayElement.classList.remove("opaque");
      fadeOverlayElement.addEventListener("transitionend", onTransitionEnd);
    });
  }

  // src/combat/actions-data.js
  var ACTION_DEFINITIONS = {
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
          apCost: 1
        });
      }
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
          apCost: 2
        });
        const passives = actor === combat.player ? combat.player.passives || {} : {};
        const extra = passives.grappleRestrainedBonus || 0;
        const stacks = 1 + extra;
        applyStatus(target, "restrained", stacks, { duration: 1 });
        logCombat(combat, `${target.name} is restrained (${stacks}).`);
      }
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
          apCost: 3
        });
      }
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
          apCost: 2
        });
      }
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
          apCost: 2
        });
        applyStatus(target, "bleed", 2, { duration: 3 });
        logCombat(combat, `${target.name} suffers Bleed (2).`);
      }
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
      }
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
      }
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
      }
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
        if (actor === combat.player && actor.flags?.blockedSinceLastTurn && combat.player.passives.counterBlockedBonusDamage) {
          counterDamage += combat.player.passives.counterBlockedBonusDamage;
        }
        dealDamage(combat, actor, target, counterDamage, {
          source: "Counter",
          actionKey: "counter",
          apCost: 3
        });
        if (actor.flags?.blockedSinceLastTurn) {
          applyStatus(target, "dazed", 1, { duration: 1 });
          target.flags = target.flags || {};
          target.flags.pendingDaze = (target.flags.pendingDaze || 0) + 1;
          logCombat(combat, `${target.name} reels, becoming Dazed.`);
        }
      }
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
      }
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
          apCost: 2
        });
        if ((actor.block || 0) > 0) {
          applyStatus(target, "dazed", 1, { duration: 1 });
          target.flags = target.flags || {};
          target.flags.pendingDaze = (target.flags.pendingDaze || 0) + 1;
          logCombat(combat, `${target.name} is dazed by the iron blow.`);
        }
      }
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
          apCost: 3
        });
        applyStatus(actor, "armor", 2, { duration: 2 });
      }
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
        if (actor === combat.player && combat.player.passives.sparkBuffBonus && combat.player.flags?.playedBuffThisTurn) {
          sparkDamage += combat.player.passives.sparkBuffBonus;
        }
        dealDamage(combat, actor, target, sparkDamage, {
          source: "Spark",
          actionKey: "spark",
          apCost: 1
        });
      }
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
      }
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
          apCost: 3
        });
      }
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
      }
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
      }
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
          apCost: 3
        });
      }
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
          apCost: 1
        });
        applyStatus(target, "fatigue", 1, { duration: 2 });
        if (actor === combat.player) {
          onPlayerInflictFatigue(combat, 1);
        }
      }
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
          apCost: 2
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
      }
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
          apCost: 3
        });
        if (hasStatus(target, "bleed") || hasStatus(target, "fatigue")) {
          combat.player.pendingApBonus = (combat.player.pendingApBonus || 0) + 2;
          logCombat(combat, "Momentum surges toward next turn (+2 AP).");
        }
      }
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
          apCost: 3
        });
        applyStatus(target, "fatigue", 1, { duration: 2 });
        if (actor === combat.player) {
          onPlayerInflictFatigue(combat, 1);
        }
      }
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
      }
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
          apCost: 1
        });
      }
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
          apCost: 3
        });
      }
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
          apCost: 2
        });
      }
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
          apCost: 2
        });
        applyStatus(target, "bleed", 1, { duration: 2 });
        applyStatus(target, "fatigue", 1, { duration: 2 });
        if (actor === combat.player) {
          onPlayerInflictFatigue(combat, 1);
        }
      }
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
      }
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
          apCost: 3
        });
        applyStatus(target, "fatigue", 1, { duration: 2 });
        if (actor === combat.player) {
          onPlayerInflictFatigue(combat, 1);
        }
      }
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
          apCost: 2
        });
        duplicateRandomActionSlot(combat);
      }
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
          apCost: 1
        });
        applyStatus(target, "vulnerable", 1, { duration: 2 });
      }
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
          apCost: 2
        });
        applyStatus(target, "bleed", 1, { duration: 2 });
      }
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
          apCost: 2
        });
      }
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
          apCost: 3
        });
        applyStatus(actor, "armor", 2, { duration: 2 });
      }
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
      }
    },
    echo: {
      key: "echo",
      name: "Echo",
      emotion: "ambiguous",
      cost: { ap: "variable", essence: 0 },
      type: "attack",
      baseDamage: 0,
      description: "Copy the last action at +1 AP cost and \u221220% damage.",
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
      }
    },
    flicker: {
      key: "flicker",
      name: "Flicker",
      emotion: "ambiguous",
      cost: { ap: 1, essence: 0 },
      type: "attack",
      baseDamage: 3,
      description: "Deal 3 damage. Facing: next action costs \u22121 AP.",
      facingEffect(combat) {
        combat.player.flags = combat.player.flags || {};
        combat.player.flags.discountNextAction = (combat.player.flags.discountNextAction || 0) + 1;
      },
      effect: ({ combat, actor, target }) => {
        dealDamage(combat, actor, target, 3, {
          source: "Flicker",
          actionKey: "flicker",
          apCost: 1
        });
      }
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
          apCost: 2
        });
        combat.player.flags = combat.player.flags || {};
        combat.player.flags.greedsGamblePlayed = true;
        logCombat(combat, "You wager future spoils on this strike.");
      }
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
          apCost: 2
        });
      }
    }
  };

  // src/state/inventory.js
  function resolveContext(ctx) {
    if (ctx && typeof ctx === "object") {
      if (ctx.state) {
        return ctx;
      }
      return { ...ctx, state: getState() };
    }
    return { state: getState() };
  }
  function notifyResourceUpdate(ctx) {
    const context = resolveContext(ctx);
    if (typeof context.updateResources === "function") {
      context.updateResources(context);
      return;
    }
    const activeContext = getState().activeScreenContext;
    if (activeContext?.updateResources) {
      activeContext.updateResources(activeContext);
    }
  }
  function getTotalConsumables() {
    const consumables = ensurePlayerConsumables();
    return Object.values(consumables).reduce(
      (sum, count) => sum + Number(count || 0),
      0
    );
  }
  function getConsumableCount(key) {
    if (!key) {
      return 0;
    }
    const consumables = ensurePlayerConsumables();
    return Number(consumables?.[key] || 0);
  }
  function spendConsumableCharge(key, ctx) {
    if (!key) {
      return false;
    }
    const consumables = ensurePlayerConsumables();
    if (!consumables[key]) {
      return false;
    }
    consumables[key] -= 1;
    if (consumables[key] <= 0) {
      delete consumables[key];
    }
    notifyResourceUpdate(ctx);
    return true;
  }
  function addGold(amount, ctx) {
    const value = Math.round(Number(amount) || 0);
    if (value === 0) {
      return;
    }
    const next = adjustGold(value);
    const context = resolveContext(ctx);
    if (context.showToast) {
      const text = value > 0 ? `You gain ${value} gold.` : `You spend ${Math.abs(value)} gold.`;
      context.showToast(text);
    }
    notifyResourceUpdate(context);
    return next;
  }
  function addConsumable(key, count = 1, ctx) {
    if (!key || count === 0) {
      return false;
    }
    ensurePlayerConsumables();
    const context = resolveContext(ctx);
    const currentTotal = getTotalConsumables();
    let success = false;
    if (count > 0) {
      const remainingSlots = MAX_CONSUMABLE_SLOTS - currentTotal;
      if (remainingSlots <= 0) {
        context.showToast?.("Your satchel is full.");
        return false;
      }
      const amountToAdd = Math.min(count, remainingSlots);
      adjustConsumableCount(key, amountToAdd);
      success = amountToAdd > 0;
      if (context.showToast) {
        const item = CONSUMABLE_MAP.get(key);
        if (item) {
          const message = amountToAdd === count ? `Added ${amountToAdd} \xD7 ${item.name} to your satchel.` : `Added ${amountToAdd} \xD7 ${item.name}. Your satchel cannot hold more.`;
          context.showToast(message);
        }
      }
    } else {
      adjustConsumableCount(key, count);
      success = true;
    }
    notifyResourceUpdate(context);
    return success;
  }
  function addRelic(key, ctx) {
    if (!key) {
      return false;
    }
    const context = resolveContext(ctx);
    if (awardRelic(key)) {
      if (context.showToast) {
        const relic = RELIC_MAP.get(key);
        context.showToast(`You claim the relic: ${relic?.name || key}.`);
      }
      notifyResourceUpdate(context);
      return true;
    }
    context.showToast?.("You already carry that relic.");
    return false;
  }
  function addMemoryToState(key, ctx) {
    if (!key) {
      return false;
    }
    const context = resolveContext(ctx);
    if (!recordMemory(key)) {
      return false;
    }
    if (context.showToast) {
      const memory = MEMORY_MAP.get(key);
      context.showToast(`A new memory surfaces: ${memory?.name || key}.`);
    }
    notifyResourceUpdate(context);
    return true;
  }

  // src/state/memories.js
  var DEFAULT_PLAYER_MEMORIES = [
    "memoryBarFight",
    "memoryWatchman",
    "memorySong"
  ];
  function ensureDefaultMemories(ctx) {
    const contextState = ctx && typeof ctx === "object" ? ctx.state : null;
    const memories = contextState?.playerMemories;
    if (Array.isArray(memories) && memories.length > 0) {
      return memories;
    }
    const updatedState = updateState({
      playerMemories: DEFAULT_PLAYER_MEMORIES.slice()
    });
    if (contextState && contextState !== updatedState) {
      contextState.playerMemories = updatedState.playerMemories.slice();
    }
    return updatedState.playerMemories;
  }

  // src/state/random.js
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
  function getRandomItem(source) {
    if (!Array.isArray(source) || source.length === 0) {
      return null;
    }
    const index = Math.floor(Math.random() * source.length);
    return source[index];
  }

  // src/ui/combat.js
  function createCombatantDisplay(combatant, role, encounter) {
    const container2 = createElement(
      "div",
      `combatant-card combatant-card--${role}`
    );
    const avatar = createElement("div", "combatant-card__avatar");
    avatar.title = combatant.name;
    avatar.dataset.role = role;
    container2.appendChild(avatar);
    const spriteSource = role === "enemy" ? encounter?.sprite : role === "player" ? playerCharacter : null;
    if (spriteSource?.src) {
      const image = document.createElement("img");
      image.className = "combatant-card__sprite";
      image.src = spriteSource.src;
      image.alt = spriteSource.alt || combatant.name;
      image.loading = role === "player" ? "eager" : "lazy";
      image.decoding = "async";
      avatar.appendChild(image);
    }
    const name = createElement("div", "combatant-card__name", combatant.name);
    container2.appendChild(name);
    const stats = createElement("div", "combatant-card__stats");
    container2.appendChild(stats);
    if (role === "enemy" && encounter?.sprite) {
      avatar.dataset.sprite = encounter.sprite.key || "enemy";
    }
    const statusList = createElement("div", "combatant-card__statuses");
    container2.appendChild(statusList);
    return { container: container2, avatar, stats, statusList };
  }
  function createCombatExperience(ctx, { room, encounterType, encounter }) {
    const combat = createCombatState(ctx, { room, encounterType, encounter });
    const container2 = createElement("div", "combat");
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
    container2.append(sidebar, main);
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
        updateState({
          currentEncounterType: null,
          currentEncounter: null,
          lastRunScreen: "corridor"
        });
        await ctx.transitionTo("corridor", { fromRoom: true });
        ctx.showToast("You slip back into the corridor.");
      } else if (combat.status === "defeat") {
        updateState({ inRun: false });
        await ctx.transitionTo("mainMenu");
        ctx.showToast("Defeat drives you back to the manor's entry hall.");
      }
    });
    combat.dom = {
      container: container2,
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
      footer,
      continueButton
    };
    setActiveCombat(combat);
    startCombat(combat);
    return { container: container2, footer, combat };
  }
  function createCombatLogElement() {
    const details = createElement("details", "combat-log");
    details.open = false;
    const summary = createElement("summary", "combat-log__summary", "Combat Log");
    const body = createElement("div", "combat-log__body");
    details.append(summary, body);
    return details;
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
    const gold = combat.ctx?.state?.playerGold || 0;
    combat.dom.statsPanel.textContent = `Essence ${combat.player.essence}/${combat.player.maxEssence} \u2022 AP ${combat.player.ap}/${combat.player.apCarryoverMax} \u2022 Gold ${gold}`;
  }
  function updateCombatantPanel(combat, combatant, statsElement, statusElement) {
    if (!statsElement || !statusElement) {
      return;
    }
    const apText = combatant.side === "player" ? `AP ${combatant.ap}` : "";
    statsElement.textContent = `Essence ${combatant.essence}/${combatant.maxEssence}${apText ? ` \u2022 ${apText}` : ""}`;
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
      const label = formatStatusLabel2(key, status);
      if (!label) {
        return;
      }
      const chip = createElement("span", "status-chip", label);
      chip.dataset.status = key;
      statusElement.appendChild(chip);
    });
  }
  function formatStatusLabel2(key, status) {
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
      case "dazed":
        return `Dazed ${value}`;
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
    const essenceCost = getActionEssenceCost(combat, action);
    const header = createElement("div", "action-button__header");
    const icon = createElement("span", "action-button__icon");
    icon.dataset.emotion = action.emotion || "neutral";
    const name = createElement("span", "action-button__name", action.name);
    const cost = createElement(
      "span",
      "action-button__cost",
      [apCost ? `${apCost} AP` : null, essenceCost ? `${essenceCost} Ess` : null].filter(Boolean).join(" \u2022 ") || "Free"
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
      const chainText = sequence.map((key) => ACTION_DEFINITIONS[key]?.name || key).join(" \u2192 ");
      const chain = createElement("p", "action-button__chain", `Chain: ${chainText}`);
      button.appendChild(chain);
    }
    const canUse = combat.turn === "player" && combat.status === "inProgress" && combat.player.ap >= apCost && combat.player.essence >= essenceCost;
    button.disabled = !canUse;
    button.title = `${action.name} \u2014 ${action.description}`;
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

  // src/combat/engine.js
  function createPassiveSummary() {
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
      breakthroughGoldReward: 0
    };
  }
  function summarizeMemoryPassives(memoryKeys = []) {
    const summary = createPassiveSummary();
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
  function summarizeRelicPassives(relicKeys = []) {
    const summary = createPassiveSummary();
    relicKeys.forEach((key) => {
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
        summary.blockThresholdDaze = summary.blockThresholdDaze > 0 ? Math.min(summary.blockThresholdDaze, passive.blockThresholdDaze) : passive.blockThresholdDaze;
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
    });
    return summary;
  }
  function combinePassiveSummaries(memorySummary, relicSummary) {
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
      "breakthroughGoldReward"
    ];
    numericKeys.forEach((key) => {
      combined[key] = (combined[key] || 0) + (memorySummary[key] || 0) + (relicSummary[key] || 0);
    });
    combined.bleedMultiplier = (memorySummary.bleedMultiplier || 1) * (relicSummary.bleedMultiplier || 1);
    combined.bleedHealFraction = (memorySummary.bleedHealFraction || 0) + (relicSummary.bleedHealFraction || 0);
    combined.roarAppliesVulnerable = Boolean(
      memorySummary.roarAppliesVulnerable || relicSummary.roarAppliesVulnerable
    );
    combined.buffCostReductionWhileFaceUp = Boolean(
      memorySummary.buffCostReductionWhileFaceUp || relicSummary.buffCostReductionWhileFaceUp
    );
    combined.firstBuffDuplicated = Boolean(
      memorySummary.firstBuffDuplicated || relicSummary.firstBuffDuplicated
    );
    const blockThresholds = [
      memorySummary.blockThresholdDaze,
      relicSummary.blockThresholdDaze
    ].filter((value) => typeof value === "number" && value > 0);
    combined.blockThresholdDaze = blockThresholds.length ? Math.min(...blockThresholds) : 0;
    return combined;
  }
  function buildActionSoupFromMemories(memoryKeys = []) {
    const weights = /* @__PURE__ */ new Map();
    memoryKeys.forEach((key) => {
      const memory = MEMORY_MAP.get(key);
      if (!memory || !Array.isArray(memory.contributions)) {
        return;
      }
      memory.contributions.forEach((entry) => {
        if (!entry || !entry.action) {
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
    return Array.from(weights.entries()).filter(([, weight]) => weight > 0).map(([action, weight]) => ({ action, weight }));
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
      enemyBleedBonus: 0
    };
  }
  function getEncounterScaling(encounterType) {
    switch (encounterType) {
      case "elite":
        return 1.35;
      case "boss":
        return 1.6;
      default:
        return 1;
    }
  }
  function scaleValue(value, multiplier) {
    return Math.round(Number(value || 0) * multiplier);
  }
  function cloneEnemyMoves(moves, multiplier) {
    const list = Array.isArray(moves) && moves.length > 0 ? moves : DEFAULT_ENEMY_MOVES;
    return list.map((move) => ({
      ...move,
      damage: typeof move.damage === "number" ? scaleValue(move.damage, multiplier) : move.damage,
      block: typeof move.block === "number" ? scaleValue(move.block, multiplier) : move.block,
      heal: typeof move.heal === "number" ? scaleValue(move.heal, multiplier) : move.heal
    }));
  }
  function createCombatState(ctx, { encounterType, encounter, room }) {
    ensureDefaultMemories(ctx);
    const memoryKeys = ctx.state.playerMemories.slice();
    const relicKeys = Array.isArray(ctx.state.playerRelics) ? ctx.state.playerRelics.slice() : [];
    const memoryPassives = summarizeMemoryPassives(memoryKeys);
    const relicPassives = summarizeRelicPassives(relicKeys);
    const passives = combinePassiveSummaries(memoryPassives, relicPassives);
    const soup = buildActionSoupFromMemories(memoryKeys);
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
      relics: relicKeys
    };
    resetTempStats(player);
    const sprite = encounter?.sprite || {};
    const enemyDefinition = ENEMY_DEFINITIONS[sprite.key] || {
      maxEssence: 12,
      moves: DEFAULT_ENEMY_MOVES
    };
    const multiplier = getEncounterScaling(encounterType);
    const baseEnemyEssence = enemyDefinition.maxEssence || 12;
    const scaledEnemyEssence = Math.max(1, scaleValue(baseEnemyEssence, multiplier));
    const adjustedEnemyEssence = encounterType === "boss" ? Math.max(1, Math.round(scaledEnemyEssence / 2)) : scaledEnemyEssence;
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
      sprite
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
      dom: {}
    };
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
      chainIndex: action.chain?.index || 0
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
    combat.player.flags = combat.player.flags || {};
    combat.player.flags.discountNextAction = 0;
    combat.player.flags.unsealFaceUp = false;
    const emptySlots = combat.actionSlots.filter((slot) => slot === null).length;
    if (emptySlots > 0 && combat.player.passives.emptySlotCritBonus) {
      combat.player.temp.critChance += combat.player.passives.emptySlotCritBonus * emptySlots;
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
    if (combat.player.passives.buffGrantsEssenceRegen && (combat.player.statuses && (combat.player.statuses.critBuff || combat.player.statuses.armor) || combat.player.temp.buffCostReduction > 0)) {
      combat.player.temp.essenceRegen += combat.player.passives.buffGrantsEssenceRegen;
    }
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
    if (action.key === "breakthrough" && combat.player.passives.breakthroughFatigueDiscount && hasStatus(combat.enemy, "fatigue")) {
      cost = Math.max(0, cost - combat.player.passives.breakthroughFatigueDiscount);
    }
    if (action.key === "grapple" && combat.player.passives.grappleDiscountAfterStrike && combat.player.flags?.brassKnucklesReady) {
      cost = Math.max(0, cost - combat.player.passives.grappleDiscountAfterStrike);
    }
    const discount = combat.player.flags?.discountNextAction || 0;
    if (discount > 0) {
      cost = Math.max(0, cost - discount);
    }
    return cost;
  }
  function getActionEssenceCost(combat, action) {
    if (!action || !action.cost) {
      return 0;
    }
    const cost = Number(action.cost.essence) || 0;
    return Math.max(0, cost);
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
    const result = action.effect ? action.effect({
      combat,
      actor: combat.player,
      target: combat.enemy,
      slot,
      apCost
    }) : null;
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
      name: action.name
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
      if (combat.player.passives.firstBuffDuplicated && !combat.player.flags.mirrorMaskTriggered) {
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
        apCost
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
  }
  function endPlayerTurn(combat) {
    if (combat.status !== "inProgress") {
      return;
    }
    combat.turn = "enemy";
    combat.player.flags = combat.player.flags || {};
    combat.player.flags.blockedSinceLastTurn = false;
    combat.player.pendingApBonus += combat.player.temp.nextTurnApBonus || 0;
    applyEndOfTurnStatuses(combat, combat.player);
    if (combat.player.passives.armorGainNoAttack && !combat.player.flags.playedAttackThisTurn) {
      combat.player.armor = (combat.player.armor || 0) + combat.player.passives.armorGainNoAttack;
      logCombat(
        combat,
        `Stone Guardian Idol fortifies you (+${combat.player.passives.armorGainNoAttack} Armor).`
      );
    }
    if (combat.player.passives.elationEndHeal && combat.player.flags.elationPlayedThisTurn) {
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
    combat.actionSlots = combat.actionSlots.map(
      (slot) => slot && slot.retained && !slot.consumed ? slot : null
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
    const pendingDaze = getStatusStacks(combat.enemy, "dazed") + (combat.enemy.flags?.pendingDaze || 0);
    if (pendingDaze > 0) {
      combat.enemy.flags = combat.enemy.flags || {};
      combat.enemy.flags.stalled = (combat.enemy.flags.stalled || 0) + pendingDaze;
      removeStatus(combat.enemy, "dazed");
      combat.enemy.flags.pendingDaze = 0;
      logCombat(
        combat,
        `${combat.enemy.name} is dazed and loses ${pendingDaze} action${pendingDaze === 1 ? "" : "s"}.`
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
          source: move.name
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
          source: move.name
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
    const pool = MEMORY_DEFINITIONS.filter((memory) => !owned.has(memory.key));
    const fallback = pool.length >= count ? pool : MEMORY_DEFINITIONS;
    return sampleWithoutReplacement(fallback, count);
  }
  function generateRelicRewardOptions(ctx, count) {
    const owned = new Set(ctx.state.playerRelics || []);
    const pool = RELIC_DEFINITIONS.filter((relic) => !owned.has(relic.key));
    const fallback = pool.length >= count ? pool : RELIC_DEFINITIONS;
    return sampleWithoutReplacement(fallback, count);
  }
  function generateConsumableRewardOptions(ctx, count) {
    const pool = CONSUMABLE_DEFINITIONS.map((item) => ({ ...item }));
    return sampleWithoutReplacement(pool, count);
  }
  function generateMerchantDraftOptions(ctx, count) {
    const ownedMemories = new Set(ctx.state.playerMemories || []);
    const ownedRelics = new Set(ctx.state.playerRelics || []);
    const memoryCandidates = MEMORY_DEFINITIONS.filter(
      (memory) => !ownedMemories.has(memory.key)
    ).map((memory) => ({ ...memory, rewardType: "memory" }));
    const relicCandidates = RELIC_DEFINITIONS.filter(
      (relic) => !ownedRelics.has(relic.key)
    ).map((relic) => ({ ...relic, rewardType: "relic" }));
    const memoryPool = memoryCandidates.length >= count ? memoryCandidates : MEMORY_DEFINITIONS.map((memory) => ({
      ...memory,
      rewardType: "memory"
    }));
    const relicPool = relicCandidates.length >= count ? relicCandidates : RELIC_DEFINITIONS.map((relic) => ({
      ...relic,
      rewardType: "relic"
    }));
    const consumablePool = CONSUMABLE_DEFINITIONS.map((item) => ({
      ...item,
      rewardType: "consumable"
    }));
    const combinedPool = [...memoryPool, ...relicPool, ...consumablePool];
    return sampleWithoutReplacement(combinedPool, count);
  }
  function applyRecoveryRoomBenefits(ctx, roomKey) {
    if (!ctx?.state) {
      return null;
    }
    const roomRewardsClaimed = {
      ...ctx.state.roomRewardsClaimed || {}
    };
    if (roomKey && roomRewardsClaimed[roomKey]) {
      return null;
    }
    const increase = 5;
    const previousMax = ctx.state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
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
      const seen = /* @__PURE__ */ new Set();
      const addItem = (item) => {
        if (!item) {
          return;
        }
        const key = (item.key ? String(item.key) : null) || (item.name ? `name:${item.name}` : null);
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
      consumable: plan.consumable?.mode === "draft"
    };
    const ensureDraftForType = (type, generator, heading) => {
      const rewardPlan = plan[type];
      if (!rewardPlan || rewardPlan.mode === "none") {
        return;
      }
      const existingOptions = Array.isArray(rewardPlan.options) ? rewardPlan.options.slice() : [];
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
      if (rewardPlan.hideWhenNone === void 0) {
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
        hideWhenNone: false
      };
      const existingOptions = Array.isArray(consumablePlan.options) ? consumablePlan.options.slice() : [];
      const desiredCount = Math.max(existingOptions.length + extraConsumableDrafts, 3);
      const additional = generateConsumableRewardOptions(ctx, desiredCount);
      consumablePlan.mode = "draft";
      consumablePlan.options = mergeRewardOptions(
        existingOptions,
        additional,
        desiredCount
      );
      consumablePlan.heading = consumablePlan.heading || "Draft a Consumable";
      consumablePlan.emptyText = consumablePlan.emptyText || "No consumables remain to claim.";
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
      consumable: { mode: "none", options: [], hideWhenNone: true }
    };
    switch (encounterType) {
      case "elite": {
        plan.gold = { amount: rollDice(5, 12), label: "5d12" };
        plan.memory = {
          mode: "single",
          options: generateMemoryRewardOptions(ctx, 1)
        };
        plan.relic = {
          mode: "single",
          options: generateRelicRewardOptions(ctx, 1)
        };
        break;
      }
      case "boss": {
        const dice = rollDice(7, 12);
        plan.gold = { amount: dice + 15, label: "7d12 + 15" };
        plan.memory = {
          mode: "draft",
          options: generateMemoryRewardOptions(ctx, 3)
        };
        plan.relic = {
          mode: "draft",
          options: generateRelicRewardOptions(ctx, 3)
        };
        plan.consumable = {
          mode: "draft",
          options: generateConsumableRewardOptions(ctx, 3),
          heading: "Draft a Consumable",
          emptyText: "No consumables remain to claim.",
          hideWhenNone: false
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
                description: "Large stash of gold"
              });
              break;
            }
            case "memory": {
              plan.memory = {
                mode: "draft",
                options: generateMemoryRewardOptions(ctx, 3),
                heading: "Draft a Memory",
                hideWhenNone: false
              };
              break;
            }
            case "relic": {
              plan.relic = {
                mode: "draft",
                options: generateRelicRewardOptions(ctx, 3),
                heading: "Draft a Relic",
                hideWhenNone: false
              };
              break;
            }
            case "consumable": {
              plan.consumable = {
                mode: "draft",
                options: generateConsumableRewardOptions(ctx, 3),
                heading: "Draft a Consumable",
                emptyText: "No consumables remain to claim.",
                hideWhenNone: false
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
  var REWARD_TYPE_CONFIG = {
    memory: {
      label: "Memory",
      headings: { single: "Memory Reward", draft: "Choose a Memory" },
      noneText: "No memory reward is offered.",
      emptyText: "No memories remain to claim.",
      applyReward: (item, ctx) => addMemoryToState(item.key, ctx)
    },
    relic: {
      label: "Relic",
      headings: { single: "Relic Reward", draft: "Choose a Relic" },
      noneText: "No relic reward is offered.",
      emptyText: "No relics remain to claim.",
      applyReward: (item, ctx) => addRelic(item.key, ctx)
    },
    consumable: {
      label: "Consumable",
      headings: {
        single: "Consumable Reward",
        draft: "Choose a Consumable"
      },
      noneText: "No consumable reward is offered.",
      emptyText: "No consumables remain to claim.",
      applyReward: (item, ctx) => addConsumable(item.key, 1, ctx)
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
      }
    }
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
    const isConsumableOption = type === "consumable" || item.rewardType === "consumable";
    const iconText = isConsumableOption && (item.icon || baseName.charAt(0).toUpperCase());
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
    onClaim
  }) {
    if (!plan) {
      return null;
    }
    const mode = plan.mode || "none";
    const options = Array.isArray(plan.options) ? plan.options : [];
    const config = REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.mixed;
    const typeState = rewardState.types[type] || (rewardState.types[type] = {
      buttons: [],
      mode,
      hideWhenNone: !!plan.hideWhenNone,
      claimed: mode === "none" || options.length === 0 && !(plan.hideWhenNone && mode === "none")
    });
    typeState.mode = mode;
    typeState.hideWhenNone = !!plan.hideWhenNone;
    typeState.buttons = [];
    if (mode === "none" && typeState.hideWhenNone) {
      typeState.claimed = true;
      return null;
    }
    const fallbackLabel = config.label || formatRewardTypeLabel(type);
    const headingText = plan.heading || config.headings && (config.headings[mode] || config.headings.default) || (mode === "draft" ? `Choose a ${fallbackLabel}` : `${fallbackLabel} Reward`);
    const section = createElement("section", "combat-rewards__section");
    const heading = createElement("h4", "combat-rewards__heading", headingText);
    section.appendChild(heading);
    const list = createElement("div", "combat-rewards__choices");
    const noneText = plan.noneText || config.noneText || "No reward is offered.";
    const emptyText = plan.emptyText || config.emptyText || "No rewards remain to claim.";
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
          const success = typeof applyReward === "function" ? applyReward(item, ctx, plan) : false;
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
      onClaim
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
      types: {}
    };
    const goldRewards = Array.isArray(rewardPlan.gold) ? rewardPlan.gold : rewardPlan.gold ? [rewardPlan.gold] : [];
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
        createElement("p", "combat-rewards__detail", parts.join(" \u2013 "))
      );
    });
    const sectionOrder = [
      { type: "memory", plan: rewardPlan.memory },
      { type: "relic", plan: rewardPlan.relic },
      { type: "consumable", plan: rewardPlan.consumable },
      { type: "mixed", plan: rewardPlan.mixed }
    ];
    sectionOrder.forEach(({ type, plan: sectionPlan }) => {
      const section = buildRewardSection({
        type,
        plan: sectionPlan,
        ctx,
        rewardState,
        onClaim
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
    const description = createElement(
      "p",
      "merchant-panel__description",
      "Spend gold to draft from the merchant's curated memories, relics, and curios. Each bargain costs a little more than the last."
    );
    panel.appendChild(description);
    const actions = createElement("div", "merchant-panel__actions");
    const draftButton = createElement("button", "button button--primary");
    actions.appendChild(draftButton);
    panel.appendChild(actions);
    const rewardHolder = createElement("div", "merchant-panel__rewards");
    panel.appendChild(rewardHolder);
    const updateDraftButtonLabel = () => {
      const cost = ctx.state.merchantDraftCost || MERCHANT_BASE_DRAFT_COST;
      draftButton.textContent = `Draft a Boon (${cost} Gold)`;
    };
    updateDraftButtonLabel();
    draftButton.addEventListener("click", () => {
      const cost = ctx.state.merchantDraftCost || MERCHANT_BASE_DRAFT_COST;
      const availableGold = ctx.state.playerGold || 0;
      if (availableGold < cost) {
        ctx.showToast(`You need ${cost} gold to bargain for a draft.`);
        return;
      }
      const options = generateMerchantDraftOptions(ctx, 3);
      if (!options.length) {
        ctx.showToast("The merchant has nothing more to offer.");
        return;
      }
      addGold(-cost, ctx);
      updateState({ merchantDraftCost: cost + MERCHANT_DRAFT_COST_INCREMENT });
      updateDraftButtonLabel();
      rewardHolder.replaceChildren();
      const { panel: rewardsPanel } = createRewardsPanel(ctx, {
        encounterType: "merchant",
        plan: {
          gold: null,
          memory: { mode: "none", options: [], hideWhenNone: true },
          relic: { mode: "none", options: [], hideWhenNone: true },
          consumable: { mode: "none", options: [], hideWhenNone: true },
          mixed: {
            mode: "draft",
            options,
            heading: "Draft a Boon",
            noneText: "The merchant has no boons to trade.",
            emptyText: "The merchant's display stands empty.",
            hideWhenNone: false
          }
        },
        titleText: "Merchant's Offer",
        skipLabel: "Leave the Offer",
        allowSkip: true,
        continueButton
      });
      if (rewardsPanel) {
        rewardHolder.appendChild(rewardsPanel);
      }
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
      }
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
    const reward = getRandomItem(CONSUMABLE_DEFINITIONS);
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
      const encounterType = combat.encounterType || combat.ctx.state.currentEncounterType || "combat";
      const essenceValue = Math.max(0, Math.round(combat.player.essence));
      setEssenceValues(essenceValue, combat.player.maxEssence);
      combat.ctx.updateResources?.();
      if (encounterType === "elite") {
        attemptCombatConsumableDrop(combat, 100);
      } else if (encounterType === "combat") {
        attemptCombatConsumableDrop(combat, 50);
      }
      if (combat.player.flags?.greedsGamblePlayed) {
        const reward = getRandomItem(CONSUMABLE_DEFINITIONS);
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
  function dealDamage(combat, actor, target, amount, options = {}) {
    if (combat.status !== "inProgress") {
      return;
    }
    const isPlayerActor = actor === combat.player;
    const passives = combat.player?.passives || {};
    const actionDef = options.actionKey ? ACTION_DEFINITIONS[options.actionKey] : null;
    let actionApCost = options.apCost;
    if (typeof actionApCost === "undefined" && actionDef && actionDef.cost && actionDef.cost.ap !== "variable") {
      actionApCost = Number(actionDef.cost.ap) || 0;
    }
    const isAttackAction = Boolean(
      options.forceAttack || actionDef && actionDef.type === "attack"
    );
    let baseAmount = amount;
    if (isPlayerActor && options.actionKey === "strike" && passives.strikeDamageBonus) {
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
      const critChance = combat.player.baseCritChance + combat.player.temp.critChance + getStatusStacks(actor, "critBuff");
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
            combat.player.flags.blockedDamageThisTurn = (combat.player.flags.blockedDamageThisTurn || 0) + absorbed;
            const stacks = Math.max(1, passives.blockThresholdDazeStacks || 1);
            while (combat.player.flags.blockedDamageThisTurn >= threshold) {
              combat.player.flags.blockedDamageThisTurn -= threshold;
              applyStatus(combat.enemy, "dazed", stacks, { duration: 1 });
              combat.enemy.flags = combat.enemy.flags || {};
              combat.enemy.flags.pendingDaze = (combat.enemy.flags.pendingDaze || 0) + stacks;
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
          forceAttack: true
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
  function onPlayerInflictFatigue(combat, stacks = 1) {
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
    if (options.duration !== void 0) {
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
      const passives = combat.player.passives || {};
      const bonus = side === "enemy" ? passives.bleedBonus || 0 : 0;
      const tempBonus = side === "enemy" ? combat.player?.temp?.enemyBleedBonus || 0 : 0;
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
      if (statuses.armor.duration !== void 0) {
        statuses.armor.duration -= 1;
        if (statuses.armor.duration <= 0) {
          delete statuses.armor;
        }
      }
    } else {
      combatant.armor = 0;
    }
    if (statuses.vulnerable && statuses.vulnerable.duration !== void 0) {
      statuses.vulnerable.duration -= 1;
      if (statuses.vulnerable.duration <= 0) {
        delete statuses.vulnerable;
      }
    }
    if (statuses.restrained && statuses.restrained.duration !== void 0) {
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
      if (status.duration !== void 0) {
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
  function duplicateRandomActionSlot(combat) {
    const filled = combat.actionSlots.map((slot, index) => slot ? index : null).filter((index) => index !== null);
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

  // src/ui/codex.js
  function resolveContext2(ctx) {
    if (ctx && typeof ctx === "object") {
      if (ctx.state) {
        return ctx;
      }
      return { ...ctx, state: getState() };
    }
    return { state: getState() };
  }
  function slugifyEmotion(value) {
    return (value || "mystery").toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function closeCodexOverlay() {
    const state2 = getState();
    const codexView = state2.codexView;
    if (!codexView) {
      return;
    }
    const { overlay, handleKeydown, mode } = codexView;
    if (overlay?.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
    if (handleKeydown) {
      document.removeEventListener("keydown", handleKeydown);
    }
    const selection = {
      key: codexView.selectedKey || null,
      type: codexView.selectedType || null,
      pageIndex: codexView.pageIndex || 0
    };
    if (mode) {
      const selections = ensureCodexSelections();
      selections[mode] = selection;
    }
    clearCodexView();
  }
  function getNestedValue(source, path = []) {
    if (!source || !Array.isArray(path)) {
      return void 0;
    }
    return path.reduce((current, key) => {
      if (current && Object.prototype.hasOwnProperty.call(current, key)) {
        return current[key];
      }
      return void 0;
    }, source);
  }
  function setNestedValue(source, path = [], value) {
    if (!source || !Array.isArray(path) || path.length === 0) {
      return;
    }
    let current = source;
    for (let index = 0; index < path.length - 1; index += 1) {
      const key = path[index];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  }
  function formatNumberWithExample(example, value) {
    if (!Number.isFinite(value)) {
      return String(value);
    }
    if (typeof example === "string" && example.includes(".")) {
      const decimals = example.split(".")[1]?.length || 0;
      return Number(value).toFixed(decimals);
    }
    if (typeof example === "number" && !Number.isInteger(example)) {
      const decimalPart = String(example).split(".")[1] || "";
      return Number(value).toFixed(decimalPart.length);
    }
    if (typeof example === "number") {
      return String(Math.round(value));
    }
    return String(value);
  }
  function createDevNumberBinding(source, path = [], options = {}) {
    if (!source || !Array.isArray(path) || path.length === 0) {
      return null;
    }
    const { min = null, max = null, step = "any", formatValue = null, onChange = null } = options || {};
    return {
      step,
      get() {
        const raw = getNestedValue(source, path);
        return Number(raw);
      },
      format(value) {
        if (typeof formatValue === "function") {
          return formatValue(value);
        }
        const example = getNestedValue(source, path);
        return formatNumberWithExample(example, value);
      },
      set(newValue) {
        if (!Number.isFinite(newValue)) {
          return false;
        }
        let adjusted = newValue;
        if (Number.isFinite(min) && adjusted < min) {
          adjusted = min;
        }
        if (Number.isFinite(max) && adjusted > max) {
          adjusted = max;
        }
        setNestedValue(source, path, adjusted);
        if (typeof onChange === "function") {
          onChange(adjusted, source, path);
        }
        return true;
      }
    };
  }
  function createDevStringNumberBinding(source, path = [], matchIndex = 0, options = {}) {
    if (!source || !Array.isArray(path) || path.length === 0) {
      return null;
    }
    const { step = "any", onChange = null } = options || {};
    const numberPattern = /-?\d+(?:\.\d+)?/g;
    return {
      step,
      get() {
        const raw = getNestedValue(source, path);
        if (typeof raw !== "string") {
          return NaN;
        }
        const matches = raw.match(numberPattern);
        if (!matches || matchIndex < 0 || matchIndex >= matches.length) {
          return NaN;
        }
        return Number(matches[matchIndex]);
      },
      format(value) {
        const raw = getNestedValue(source, path);
        if (typeof raw !== "string") {
          return String(value);
        }
        const matches = raw.match(numberPattern);
        const example = matches?.[matchIndex];
        return formatNumberWithExample(example, value);
      },
      set(newValue) {
        if (!Number.isFinite(newValue)) {
          return false;
        }
        const raw = getNestedValue(source, path);
        if (typeof raw !== "string") {
          return false;
        }
        let occurrence = -1;
        const replaced = raw.replace(numberPattern, (match) => {
          occurrence += 1;
          if (occurrence === matchIndex) {
            return formatNumberWithExample(match, newValue);
          }
          return match;
        });
        setNestedValue(source, path, replaced);
        if (typeof onChange === "function") {
          onChange(newValue, replaced, source, path, matchIndex);
        }
        return true;
      }
    };
  }
  function buildStatusEffectTextData(effects) {
    if (!effects || typeof effects !== "object") {
      return { text: "", bindings: [] };
    }
    const parts = [];
    const bindings = [];
    Object.entries(effects).forEach(([key, amount]) => {
      if (amount === void 0 || amount === null) {
        return;
      }
      let label = "";
      if (typeof formatStatusLabel === "function") {
        label = formatStatusLabel(key, { stacks: amount });
      }
      if (!label) {
        const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^\s+|\s+$/g, "").replace(/^./, (char) => char.toUpperCase());
        const numericAmount = Number(amount);
        label = Number.isFinite(numericAmount) ? `${formattedKey} ${numericAmount}` : formattedKey;
      }
      parts.push(label);
      const matches = label.match(/-?\d+(?:\.\d+)?/g) || [];
      if (matches.length > 0) {
        bindings.push(createDevNumberBinding(effects, [key]));
        if (matches.length > 1) {
          for (let index = 1; index < matches.length; index += 1) {
            bindings.push(null);
          }
        }
      }
    });
    return { text: parts.join(", "), bindings };
  }
  function buildMoveDescriptionData(move) {
    if (!move) {
      return { text: "", bindingResolver: null };
    }
    const numberPattern = /-?\d+(?:\.\d+)?/g;
    const segments = [];
    const bindings = [];
    if (move.description) {
      const descriptionText = move.description;
      segments.push(descriptionText);
      const matches = descriptionText.match(numberPattern) || [];
      matches.forEach((_, index) => {
        bindings.push(createDevStringNumberBinding(move, ["description"], index));
      });
    }
    if (Number.isFinite(Number(move.damage)) && Number(move.damage) !== 0) {
      segments.push(`Damage ${Number(move.damage)}`);
      bindings.push(createDevNumberBinding(move, ["damage"]));
    }
    if (Number.isFinite(Number(move.block)) && Number(move.block) !== 0) {
      segments.push(`Block ${Number(move.block)}`);
      bindings.push(createDevNumberBinding(move, ["block"]));
    }
    if (Number.isFinite(Number(move.heal)) && Number(move.heal) !== 0) {
      segments.push(`Heal ${Number(move.heal)}`);
      bindings.push(createDevNumberBinding(move, ["heal"]));
    }
    if (move.apply) {
      const statusData = buildStatusEffectTextData(move.apply);
      if (statusData.text) {
        segments.push(`Applies ${statusData.text}`);
        statusData.bindings.forEach((binding) => bindings.push(binding));
      }
    }
    const text = segments.join(" ").trim();
    const bindingResolver = (matchValue, matchIndex) => bindings[matchIndex] || null;
    return { text, bindingResolver };
  }
  function buildMemoryEntriesFromKeys(keys = []) {
    const seen = /* @__PURE__ */ new Set();
    const entries = [];
    keys.forEach((key) => {
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const memory = MEMORY_MAP.get(key);
      if (!memory) {
        return;
      }
      const contributions = Array.isArray(memory.contributions) ? memory.contributions.map((entry, index) => {
        const action = ACTION_DEFINITIONS[entry.action];
        if (!action) {
          return null;
        }
        const bindingSource = memory.contributions[index];
        return {
          key: entry.action,
          name: action.name || entry.action,
          description: action.description || "",
          weight: Number(entry.weight) || 0,
          weightBinding: bindingSource ? createDevNumberBinding(bindingSource, ["weight"]) : null
        };
      }).filter(Boolean) : [];
      const detailParagraphs = [];
      if (memory.description) {
        detailParagraphs.push({
          text: memory.description,
          bindingSource: { object: memory, path: ["description"] }
        });
      }
      if (memory.passive) {
        const passiveText = formatPassiveDescription(memory.passive);
        if (passiveText) {
          detailParagraphs.push(passiveText);
        }
      }
      entries.push({
        key: memory.key,
        type: "memory",
        name: memory.name,
        emotion: memory.emotion || "",
        emotionSlug: slugifyEmotion(memory.emotion),
        summary: memory.description || "",
        detailParagraphs: detailParagraphs.filter(Boolean),
        contributions,
        iconSymbol: memory.name.charAt(0).toUpperCase()
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  function buildRelicEntriesFromKeys(keys = []) {
    const seen = /* @__PURE__ */ new Set();
    const entries = [];
    keys.forEach((key) => {
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const relic = RELIC_MAP.get(key);
      if (!relic) {
        return;
      }
      const paragraphs = [relic.description];
      if (relic.passive) {
        const passiveText = formatPassiveDescription(relic.passive);
        if (passiveText && passiveText !== relic.description) {
          paragraphs.push(passiveText);
        }
      }
      entries.push({
        key: relic.key,
        type: "relic",
        name: relic.name,
        emotion: relic.emotion || "",
        emotionSlug: slugifyEmotion(relic.emotion),
        summary: relic.description || "",
        detailParagraphs: paragraphs.filter(Boolean),
        iconSymbol: relic.name.charAt(0).toUpperCase()
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  function buildConsumableEntriesFromKeys(keys = []) {
    const seen = /* @__PURE__ */ new Set();
    const entries = [];
    keys.forEach((key) => {
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const consumable = CONSUMABLE_MAP.get(key);
      if (!consumable) {
        return;
      }
      const detailParagraphs = [];
      if (consumable.description) {
        detailParagraphs.push({
          text: consumable.description,
          bindingSource: { object: consumable, path: ["description"] }
        });
      }
      if (consumable.effect?.type) {
        detailParagraphs.push(`Effect: ${formatTitleCase(consumable.effect.type)}`);
      }
      entries.push({
        key: consumable.key,
        type: "consumable",
        name: consumable.name,
        emotion: consumable.emotion || "",
        emotionSlug: slugifyEmotion(consumable.emotion),
        summary: consumable.description || "",
        detailParagraphs: detailParagraphs.filter(Boolean),
        iconSymbol: consumable.icon || consumable.name.charAt(0).toUpperCase()
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  function formatActionCostLine(cost) {
    if (!cost || typeof cost !== "object") {
      return "";
    }
    const parts = [];
    const ap = Number(cost.ap);
    const essence = Number(cost.essence);
    if (Number.isFinite(ap) && ap > 0) {
      parts.push(`${ap} AP`);
    }
    if (Number.isFinite(essence) && essence > 0) {
      parts.push(`${essence} Essence`);
    }
    if (parts.length === 0) {
      return "Cost: Free.";
    }
    return `Cost: ${parts.join(" \u2022 ")}.`;
  }
  function buildActionStats(action) {
    if (!action) {
      return [];
    }
    const stats = [];
    if (action.type) {
      stats.push({ label: "Type", value: formatTitleCase(action.type) });
    }
    const damage = Number(action.baseDamage);
    if (Number.isFinite(damage) && damage !== 0) {
      stats.push({
        label: "Base Damage",
        value: damage,
        devBinding: createDevNumberBinding(action, ["baseDamage"])
      });
    }
    const block = Number(action.block);
    if (Number.isFinite(block) && block !== 0) {
      stats.push({
        label: "Block",
        value: block,
        devBinding: createDevNumberBinding(action, ["block"])
      });
    }
    const heal = Number(action.heal);
    if (Number.isFinite(heal) && heal !== 0) {
      stats.push({
        label: "Heal",
        value: heal,
        devBinding: createDevNumberBinding(action, ["heal"])
      });
    }
    if (action.apply) {
      const statusData = buildStatusEffectTextData(action.apply);
      if (statusData.text) {
        stats.push({
          label: "Applies",
          value: { text: statusData.text },
          textBindingResolver: (matchValue, matchIndex) => statusData.bindings[matchIndex] || null
        });
      }
    }
    return stats;
  }
  function buildActionEntriesFromKeys(keys = []) {
    const seen = /* @__PURE__ */ new Set();
    const entries = [];
    keys.forEach((key) => {
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const action = ACTION_DEFINITIONS[key];
      if (!action) {
        return;
      }
      const paragraphs = [];
      if (action.description) {
        paragraphs.push({
          text: action.description,
          bindingSource: { object: action, path: ["description"] }
        });
      }
      const costLine = formatActionCostLine(action.cost);
      if (costLine) {
        const costPaths = [];
        if (Number.isFinite(Number(action.cost?.ap)) && Number(action.cost.ap) > 0) {
          costPaths.push(["cost", "ap"]);
        }
        if (Number.isFinite(Number(action.cost?.essence)) && Number(action.cost.essence) > 0) {
          costPaths.push(["cost", "essence"]);
        }
        paragraphs.push({
          text: costLine,
          bindingResolver: (matchValue, matchIndex) => {
            const path = costPaths[matchIndex];
            return path ? createDevNumberBinding(action, path, { min: 0 }) : null;
          }
        });
      }
      if (action.chain) {
        const sequence = ACTION_SEQUENCES[action.chain.key] || [];
        if (sequence.length > 0) {
          const chainText = sequence.map((actionKey) => ACTION_DEFINITIONS[actionKey]?.name || actionKey).join(" \u2192 ");
          if (chainText) {
            paragraphs.push(`Chain: ${chainText}`);
          }
        }
      }
      entries.push({
        key: action.key,
        type: "action",
        name: action.name,
        emotion: action.emotion || "",
        emotionSlug: slugifyEmotion(action.emotion),
        summary: action.description || "",
        detailParagraphs: paragraphs.filter((paragraph) => {
          if (!paragraph) {
            return false;
          }
          const text = typeof paragraph === "string" ? paragraph : paragraph.text;
          return typeof text === "string" && text.trim().length > 0;
        }),
        iconSymbol: action.name.charAt(0).toUpperCase(),
        stats: buildActionStats(action)
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  function buildEnemyEntriesFromKeys(keys = [], type = "enemy") {
    const seen = /* @__PURE__ */ new Set();
    const entries = [];
    const spriteSources = type === "boss" ? bossSprites : [...enemySprites, ...bossSprites];
    const spriteMap = new Map(spriteSources.map((sprite) => [sprite.key, sprite]));
    const defaultKeys = type === "boss" ? bossSprites.map((sprite) => sprite.key) : enemySprites.map((sprite) => sprite.key);
    const sourceKeys = Array.isArray(keys) && keys.length > 0 ? keys : defaultKeys;
    sourceKeys.forEach((key) => {
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      const definition = ENEMY_DEFINITIONS[key];
      const sprite = spriteMap.get(key);
      if (!definition && !sprite) {
        return;
      }
      const name = sprite?.name || definition?.name || key.replace(/([A-Z])/g, " $1").replace(/^-+|-+$/g, "").replace(/^./, (char) => char.toUpperCase());
      const detailParagraphs = [];
      if (sprite?.alt) {
        detailParagraphs.push(sprite.alt);
      }
      const stats = [];
      if (Number.isFinite(Number(definition?.maxEssence))) {
        stats.push({
          label: "Max Essence",
          value: Number(definition.maxEssence),
          devBinding: definition ? createDevNumberBinding(definition, ["maxEssence"], { min: 1 }) : null
        });
      }
      const moves = Array.isArray(definition?.moves) ? definition.moves.map((move) => {
        const descriptionData = buildMoveDescriptionData(move);
        return {
          key: move.key,
          name: move.name || move.key,
          description: descriptionData
        };
      }) : [];
      entries.push({
        key,
        type,
        name,
        summary: sprite?.alt || "",
        detailParagraphs: detailParagraphs.filter(Boolean),
        iconSymbol: name.charAt(0).toUpperCase(),
        moves: moves.filter((move) => move.name),
        stats,
        spriteSrc: sprite?.src || null,
        spriteAlt: sprite?.alt || name
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  function buildBossEntriesFromKeys(keys = []) {
    return buildEnemyEntriesFromKeys(keys, "boss");
  }
  function buildPlayerGhostEntriesFromKeys(keys = []) {
    const entries = [];
    const spriteMap = /* @__PURE__ */ new Map([[playerCharacter.key, playerCharacter]]);
    const sourceKeys = Array.isArray(keys) && keys.length > 0 ? keys : [playerCharacter.key];
    sourceKeys.forEach((key) => {
      if (entries.some((entry) => entry.key === key)) {
        return;
      }
      const sprite = spriteMap.get(key);
      if (!sprite) {
        return;
      }
      entries.push({
        key,
        type: "playerGhost",
        name: sprite.name || "Player Ghost",
        summary: sprite.alt || "",
        detailParagraphs: [sprite.alt].filter(Boolean),
        iconSymbol: sprite.name ? sprite.name.charAt(0).toUpperCase() : "\u263D",
        spriteSrc: sprite.src || null,
        spriteAlt: sprite.alt || sprite.name || "Player Ghost"
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }
  function formatTitleCase(value) {
    if (typeof value !== "string" || value.trim().length === 0) {
      return "";
    }
    return value.split(/[\s_-]+/).map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
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
  function createConsumablesSection(ctx) {
    const state2 = getState();
    const section = createElement("section", "codex-consumables");
    const title = createElement("h3", "codex-consumables__title", "Consumables");
    section.appendChild(title);
    const entries = Object.entries(state2.playerConsumables || {}).filter(
      ([, count]) => Number(count) > 0
    );
    if (entries.length === 0) {
      section.appendChild(
        createElement(
          "p",
          "codex-consumables__empty",
          "No consumables in your satchel."
        )
      );
      return section;
    }
    const list = createElement("ul", "codex-consumables__list");
    entries.forEach(([key, count]) => {
      const consumable = CONSUMABLE_MAP.get(key);
      const item = createElement("li", "codex-consumables__item");
      const label = createElement(
        "span",
        "codex-consumables__label",
        consumable ? consumable.name : key
      );
      item.appendChild(label);
      const quantity = createElement(
        "span",
        "codex-consumables__quantity",
        `\xD7${Number(count)}`
      );
      item.appendChild(quantity);
      if (consumable?.description) {
        const description = createElement(
          "p",
          "codex-consumables__description",
          consumable.description
        );
        item.appendChild(description);
      }
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }
  function renderCodexContent(target, options = {}) {
    const {
      layout = "overlay",
      viewState = {},
      memoryKeys = [],
      actionKeys = [],
      relicKeys = [],
      consumableKeys = [],
      enemyKeys = [],
      bossKeys = [],
      playerGhostKeys = [],
      pages: customPages = [],
      emptyMessage = "No entries recorded in this ledger."
    } = options;
    const state2 = getState();
    const memoryEntries = buildMemoryEntriesFromKeys(memoryKeys);
    const actionEntries = buildActionEntriesFromKeys(actionKeys);
    const relicEntries = buildRelicEntriesFromKeys(relicKeys);
    const consumableEntries = buildConsumableEntriesFromKeys(consumableKeys);
    const enemyEntries = buildEnemyEntriesFromKeys(enemyKeys);
    const bossEntries = buildBossEntriesFromKeys(bossKeys);
    const playerGhostEntries = buildPlayerGhostEntriesFromKeys(playerGhostKeys);
    const entriesByType = {
      memory: memoryEntries,
      action: actionEntries,
      relic: relicEntries,
      consumable: consumableEntries,
      enemy: enemyEntries,
      boss: bossEntries,
      playerGhost: playerGhostEntries
    };
    const defaultSections = [
      { type: "memory", emptyText: "No memories recorded in this ledger." },
      { type: "relic", emptyText: "No relics recorded in this ledger." }
    ];
    if (consumableEntries.length > 0) {
      defaultSections.push({
        type: "consumable",
        emptyText: "No consumables catalogued."
      });
    }
    const pages = Array.isArray(customPages) && customPages.length > 0 ? customPages : [
      {
        key: "default",
        title: "",
        sections: defaultSections
      }
    ];
    target.replaceChildren();
    const hasMultiplePages = pages.length > 1;
    const shellClassNames = ["codex-shell", `codex-shell--${layout}`];
    if (hasMultiplePages) {
      shellClassNames.push("codex-shell--paged");
    }
    const shell = createElement("div", shellClassNames.join(" "));
    const codex = createElement("div", `codex codex--${layout}`);
    const pageTitle = hasMultiplePages ? createElement("h3", "codex__page-title") : null;
    if (pageTitle) {
      codex.appendChild(pageTitle);
    }
    const sections = createElement("div", "codex__sections");
    const detail = createElement("div", "codex-detail");
    codex.append(sections, detail);
    shell.appendChild(codex);
    let navPrev = null;
    let navNext = null;
    let pageIndicator = null;
    if (hasMultiplePages) {
      navPrev = createElement("button", "codex-nav codex-nav--prev", "\u2190");
      navPrev.type = "button";
      navPrev.setAttribute("aria-label", "Previous page");
      navNext = createElement("button", "codex-nav codex-nav--next", "\u2192");
      navNext.type = "button";
      navNext.setAttribute("aria-label", "Next page");
      pageIndicator = createElement("div", "codex__page-indicator");
      shell.append(navPrev, pageIndicator, navNext);
    }
    target.appendChild(shell);
    const iconButtons = [];
    function getEntriesForSection(section) {
      const entries = entriesByType[section.type] || [];
      if (typeof section.filter === "function") {
        return entries.filter((entry) => section.filter(entry) !== false);
      }
      return entries.slice();
    }
    function updateDetail(entry, pageIndex) {
      detail.replaceChildren();
      if (!entry) {
        iconButtons.forEach((button) => button.classList.remove("is-selected"));
        viewState.selectedKey = null;
        viewState.selectedType = null;
        if (typeof pageIndex === "number") {
          viewState.pageIndex = pageIndex;
        }
        detail.appendChild(
          createElement("p", "codex-detail__empty", emptyMessage)
        );
        return;
      }
      viewState.selectedKey = entry.key;
      viewState.selectedType = entry.type;
      if (typeof pageIndex === "number") {
        viewState.pageIndex = pageIndex;
      }
      const isDevMode = !!state2.devMode;
      function createDevEditableValue(valueText, binding) {
        if (!isDevMode || !binding) {
          const span = document.createElement("span");
          span.className = "codex-dev-highlight dev-editable";
          span.textContent = valueText;
          return span;
        }
        const input = document.createElement("input");
        input.type = "number";
        input.step = binding?.step || "any";
        input.className = "codex-dev-input codex-dev-highlight dev-editable";
        const resolveValue = () => {
          if (binding && typeof binding.get === "function") {
            const raw = binding.get();
            if (Number.isFinite(raw)) {
              return binding.format ? binding.format(raw) : String(raw);
            }
          }
          return valueText;
        };
        const resetValue = () => {
          input.value = resolveValue();
        };
        resetValue();
        const commit = () => {
          const numericValue = Number(input.value);
          if (!Number.isFinite(numericValue)) {
            resetValue();
            return;
          }
          if (binding && typeof binding.set === "function") {
            const success = binding.set(numericValue);
            if (success === false) {
              resetValue();
              return;
            }
          }
          refreshCodexOverlay();
        };
        input.addEventListener("blur", commit);
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            input.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            resetValue();
            input.blur();
          }
        });
        return input;
      }
      function appendTextWithNumericHighlight(target2, text, options2 = {}) {
        if (text === void 0 || text === null) {
          return;
        }
        const stringValue = String(text);
        if (!/[0-9]/.test(stringValue)) {
          target2.appendChild(document.createTextNode(stringValue));
          return;
        }
        if (!isDevMode) {
          target2.appendChild(document.createTextNode(stringValue));
          return;
        }
        const fragment = document.createDocumentFragment();
        const numberPattern = /-?\d+(?:\.\d+)?/g;
        let lastIndex = 0;
        let match;
        let matchIndex = 0;
        while ((match = numberPattern.exec(stringValue)) !== null) {
          if (match.index > lastIndex) {
            fragment.appendChild(
              document.createTextNode(stringValue.slice(lastIndex, match.index))
            );
          }
          let binding = null;
          if (typeof options2.bindingResolver === "function") {
            binding = options2.bindingResolver(match[0], matchIndex);
          } else if (options2.bindingSource) {
            const { object, path, options: bindingOptions } = options2.bindingSource;
            if (object && Array.isArray(path)) {
              binding = createDevStringNumberBinding(
                object,
                path,
                matchIndex,
                bindingOptions
              );
            }
          }
          fragment.appendChild(createDevEditableValue(match[0], binding));
          lastIndex = match.index + match[0].length;
          matchIndex += 1;
        }
        if (lastIndex < stringValue.length) {
          fragment.appendChild(
            document.createTextNode(stringValue.slice(lastIndex))
          );
        }
        target2.appendChild(fragment);
      }
      iconButtons.forEach((button) => {
        if (button.dataset.entryKey === entry.key && button.dataset.entryType === entry.type) {
          button.classList.add("is-selected");
        } else {
          button.classList.remove("is-selected");
        }
      });
      const iconClassNames = [
        "codex-detail__icon",
        `codex-detail__icon--${entry.type}`
      ];
      if (entry.emotionSlug) {
        iconClassNames.push(`codex-detail__icon--${entry.emotionSlug}`);
      }
      if (entry.spriteSrc) {
        iconClassNames.push("codex-detail__icon--has-image");
      }
      const icon = createElement("div", iconClassNames.join(" "));
      if (entry.spriteSrc) {
        const image = document.createElement("img");
        image.className = "codex-detail__image";
        image.src = entry.spriteSrc;
        image.alt = entry.spriteAlt || entry.name;
        image.loading = "lazy";
        image.decoding = "async";
        icon.appendChild(image);
      } else {
        icon.textContent = entry.iconSymbol || entry.name.charAt(0).toUpperCase();
      }
      detail.appendChild(icon);
      detail.appendChild(
        createElement("h3", "codex-detail__name", entry.name)
      );
      if (entry.stats && entry.stats.length > 0) {
        const statsList = createElement("dl", "codex-detail__stats");
        entry.stats.forEach((stat) => {
          const term = createElement("dt", "codex-detail__stat-term", stat.label);
          const definition = createElement(
            "dd",
            "codex-detail__stat-definition"
          );
          if (typeof stat.value === "object" && stat.value.text) {
            appendTextWithNumericHighlight(definition, stat.value.text, {
              bindingResolver: stat.textBindingResolver,
              bindingSource: stat.bindingSource
            });
          } else {
            const textContent = String(stat.value ?? "");
            if (isDevMode && stat.devBinding) {
              definition.appendChild(
                createDevEditableValue(textContent, stat.devBinding)
              );
            } else {
              definition.textContent = textContent;
            }
          }
          statsList.append(term, definition);
        });
        if (statsList.children.length > 0) {
          detail.appendChild(statsList);
        }
      }
      if (entry.detailParagraphs && entry.detailParagraphs.length > 0) {
        entry.detailParagraphs.forEach((paragraph) => {
          const paragraphData = typeof paragraph === "string" ? { text: paragraph } : paragraph;
          if (!paragraphData || typeof paragraphData.text !== "string" || paragraphData.text.trim().length === 0) {
            return;
          }
          const description = createElement("p", "codex-detail__description");
          appendTextWithNumericHighlight(description, paragraphData.text, {
            bindingResolver: paragraphData.bindingResolver,
            bindingSource: paragraphData.bindingSource
          });
          detail.appendChild(description);
        });
      }
      if (entry.contributions && entry.contributions.length > 0) {
        detail.appendChild(
          createElement("h4", "codex-detail__subtitle", "Action Contributions")
        );
        const list = createElement("ul", "codex-detail__list");
        entry.contributions.forEach((contribution) => {
          const weight = contribution.weight;
          const formattedWeight = Number.isFinite(weight) ? weight % 1 === 0 ? String(weight) : weight.toFixed(2).replace(/0+$/, "").replace(/\.$/, "") : "";
          const item = createElement("li", "codex-detail__list-item");
          appendTextWithNumericHighlight(item, contribution.name);
          if (formattedWeight) {
            item.appendChild(document.createTextNode(" (weight "));
            if (isDevMode && contribution.weightBinding) {
              item.appendChild(
                createDevEditableValue(formattedWeight, contribution.weightBinding)
              );
            } else {
              item.appendChild(document.createTextNode(formattedWeight));
            }
            item.appendChild(document.createTextNode(")"));
          }
          if (contribution.description) {
            item.title = contribution.description;
          }
          list.appendChild(item);
        });
        detail.appendChild(list);
      }
      if (entry.moves && entry.moves.length > 0) {
        detail.appendChild(
          createElement("h4", "codex-detail__subtitle", "Moves")
        );
        const list = createElement(
          "ul",
          "codex-detail__list codex-detail__list--moves"
        );
        entry.moves.forEach((move) => {
          if (!move || !move.name) {
            return;
          }
          const item = createElement("li", "codex-detail__list-item");
          item.appendChild(document.createTextNode(move.name));
          const descriptionData = typeof move.description === "string" ? { text: move.description } : move.description;
          if (descriptionData && descriptionData.text) {
            item.appendChild(document.createTextNode(" \u2014 "));
            appendTextWithNumericHighlight(item, descriptionData.text, {
              bindingResolver: descriptionData.bindingResolver,
              bindingSource: descriptionData.bindingSource
            });
          }
          list.appendChild(item);
        });
        detail.appendChild(list);
      }
    }
    const sectionLabels = {
      memory: "Memories",
      action: "Actions",
      relic: "Relics",
      consumable: "Consumables",
      enemy: "Enemies",
      boss: "Bosses",
      playerGhost: "Player Ghosts"
    };
    function createSection(section, entries, pageIndex) {
      const sectionElement = createElement(
        "section",
        `codex-section codex-section--${section.type}`
      );
      const titleText = section.title || sectionLabels[section.type] || formatTitleCase(section.type);
      sectionElement.appendChild(
        createElement("h3", "codex-section__title", titleText)
      );
      const iconRow = createElement("div", "codex-section__icons");
      if (entries.length === 0) {
        iconRow.appendChild(
          createElement(
            "p",
            "codex-section__empty",
            section.emptyText || "No entries recorded in this ledger."
          )
        );
      } else {
        entries.forEach((entry) => {
          const button = createElement(
            "button",
            `codex-icon codex-icon--${entry.type} ${entry.emotionSlug ? `codex-icon--${entry.emotionSlug}` : ""}`
          );
          button.type = "button";
          button.dataset.entryKey = entry.key;
          button.dataset.entryType = entry.type;
          const tooltipParts = [entry.name];
          if (entry.summary) {
            tooltipParts.push(entry.summary);
          }
          const tooltipText = tooltipParts.join(" \u2014 ");
          button.title = tooltipText;
          button.setAttribute("aria-label", entry.name);
          if (entry.spriteSrc) {
            button.classList.add("codex-icon--has-image");
            const image = document.createElement("img");
            image.className = "codex-icon__image";
            image.src = entry.spriteSrc;
            image.alt = "";
            image.loading = "lazy";
            image.decoding = "async";
            image.setAttribute("aria-hidden", "true");
            button.appendChild(image);
          } else {
            button.textContent = entry.iconSymbol || entry.name.charAt(0).toUpperCase();
          }
          const srLabel = createElement("span", "sr-only", entry.name);
          button.appendChild(srLabel);
          button.addEventListener("click", () => updateDetail(entry, pageIndex));
          iconButtons.push(button);
          iconRow.appendChild(button);
        });
      }
      sectionElement.appendChild(iconRow);
      return sectionElement;
    }
    function updateNavState(currentIndex) {
      if (!hasMultiplePages) {
        return;
      }
      if (navPrev) {
        navPrev.disabled = currentIndex <= 0;
      }
      if (navNext) {
        navNext.disabled = currentIndex >= pages.length - 1;
      }
      if (pageIndicator) {
        pageIndicator.textContent = `Page ${currentIndex + 1} of ${pages.length}`;
      }
    }
    let currentPageIndex = Math.min(
      Math.max(Number(viewState.pageIndex) || 0, 0),
      pages.length - 1
    );
    const selectionKey = viewState.selectedKey;
    const selectionType = viewState.selectedType;
    if (selectionKey && selectionType) {
      const foundIndex = pages.findIndex(
        (page) => page.sections.some(
          (section) => (entriesByType[section.type] || []).some(
            (entry) => entry.key === selectionKey && entry.type === selectionType
          )
        )
      );
      if (foundIndex >= 0) {
        currentPageIndex = foundIndex;
      }
    }
    function renderPage(pageIndex) {
      const clampedIndex = Math.min(
        Math.max(Number(pageIndex) || 0, 0),
        pages.length - 1
      );
      const page = pages[clampedIndex];
      currentPageIndex = clampedIndex;
      if (!page) {
        detail.replaceChildren();
        detail.appendChild(
          createElement("p", "codex-detail__empty", emptyMessage)
        );
        updateNavState(clampedIndex);
        return;
      }
      sections.replaceChildren();
      iconButtons.length = 0;
      if (pageTitle) {
        pageTitle.textContent = page.title || "";
        pageTitle.classList.toggle("is-hidden", !page.title);
      }
      const availableEntries = [];
      page.sections.forEach((section) => {
        const entries = getEntriesForSection(section);
        availableEntries.push(...entries);
        sections.appendChild(createSection(section, entries, clampedIndex));
      });
      let selectedEntry = null;
      if (availableEntries.length > 0) {
        if (viewState.selectedKey && viewState.selectedType) {
          selectedEntry = availableEntries.find(
            (entry) => entry.key === viewState.selectedKey && entry.type === viewState.selectedType
          ) || null;
        }
        if (!selectedEntry) {
          selectedEntry = availableEntries[0];
        }
      }
      updateDetail(selectedEntry, clampedIndex);
      updateNavState(clampedIndex);
    }
    if (navPrev) {
      navPrev.addEventListener("click", () => {
        renderPage(currentPageIndex - 1);
      });
    }
    if (navNext) {
      navNext.addEventListener("click", () => {
        renderPage(currentPageIndex + 1);
      });
    }
    renderPage(currentPageIndex);
  }
  function updateDevModeUI(view) {
    if (!view) {
      return;
    }
    const state2 = getState();
    const isActive = !!state2.devMode;
    const isBestiary = view.mode === "bestiary";
    if (view.overlay) {
      view.overlay.classList.toggle(
        "codex-overlay--dev-mode",
        isBestiary && isActive
      );
    }
    if (view.panel) {
      view.panel.classList.toggle(
        "codex-panel--dev-active",
        isBestiary && isActive
      );
    }
    if (view.devToggleButton) {
      view.devToggleButton.classList.toggle("codex-dev-toggle--active", isActive);
      view.devToggleButton.setAttribute("aria-pressed", String(isActive));
    }
  }
  function refreshCodexOverlay(ctxOverride) {
    const state2 = getState();
    const view = state2.codexView;
    if (!view || typeof view.renderContent !== "function") {
      return;
    }
    const context = resolveContext2(ctxOverride || view.ctx || {});
    view.ctx = context;
    updateDevModeUI(view);
    if (!view.content) {
      return;
    }
    view.content.replaceChildren();
    view.renderContent(view.content, context, view);
  }
  function openCodexOverlay(mode, titleText, ctx, renderContent) {
    const state2 = getState();
    if (state2.codexView && state2.codexView.mode === mode) {
      const nextView = {
        ...state2.codexView,
        ctx: resolveContext2(ctx || state2.codexView.ctx || {})
      };
      setCodexView(nextView);
      refreshCodexOverlay(ctx);
      return;
    }
    const storedSelection = state2.codexSelections?.[mode] || {
      key: null,
      type: null,
      pageIndex: 0
    };
    closeCodexOverlay();
    const overlay = createElement("div", "codex-overlay");
    const panel = createElement("div", "codex-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    const header = createElement("div", "codex-panel__header");
    const title = createElement("h2", "codex-panel__title", titleText);
    const actions = createElement("div", "codex-panel__actions");
    const closeButton = createElement("button", "codex-panel__close", "Close");
    closeButton.type = "button";
    closeButton.addEventListener("click", () => closeCodexOverlay());
    let devToggleButton = null;
    if (mode === "bestiary") {
      devToggleButton = createElement("button", "codex-dev-toggle");
      devToggleButton.type = "button";
      devToggleButton.setAttribute("aria-label", "Toggle developer mode");
      devToggleButton.title = "Toggle developer mode";
      const logo = document.createElement("img");
      logo.src = "logofull.png";
      logo.alt = "Anabolic Scrub Studios logo";
      logo.loading = "lazy";
      logo.decoding = "async";
      logo.className = "codex-dev-toggle__logo";
      devToggleButton.appendChild(logo);
      devToggleButton.addEventListener("click", () => {
        toggleDevMode();
        updateDevModeUI(getState().codexView);
        refreshCodexOverlay();
      });
      actions.appendChild(devToggleButton);
    }
    actions.appendChild(closeButton);
    header.append(title, actions);
    const content = createElement("div", "codex-panel__content");
    panel.append(header, content);
    overlay.append(panel);
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        closeCodexOverlay();
      }
    };
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeCodexOverlay();
      }
    });
    document.addEventListener("keydown", handleKeydown);
    document.body.appendChild(overlay);
    setCodexView({
      mode,
      overlay,
      panel,
      content,
      ctx: resolveContext2(ctx),
      handleKeydown,
      selectedKey: storedSelection.key,
      selectedType: storedSelection.type,
      pageIndex: storedSelection.pageIndex || 0,
      renderContent,
      devToggleButton
    });
    updateDevModeUI(getState().codexView);
    refreshCodexOverlay(ctx);
    window.requestAnimationFrame(() => closeButton.focus());
  }
  function showLedger(ctx) {
    openCodexOverlay("ledger", "Memory Ledger", ctx, (target, renderCtx, viewState) => {
      const context = resolveContext2(renderCtx);
      const state2 = context.state;
      const memoryKeys = Array.isArray(state2?.playerMemories) ? state2.playerMemories : getState().playerMemories || [];
      const relicKeys = Array.isArray(state2?.playerRelics) ? state2.playerRelics : getState().playerRelics || [];
      const codexContainer = createElement("div");
      renderCodexContent(codexContainer, {
        layout: "overlay",
        viewState,
        memoryKeys,
        relicKeys,
        emptyMessage: "No memories or relics have been recorded yet."
      });
      target.appendChild(codexContainer);
      const consumablesSection = createConsumablesSection(context);
      if (consumablesSection) {
        target.appendChild(consumablesSection);
      }
    });
  }
  function showBestiary(ctx) {
    openCodexOverlay(
      "bestiary",
      "Manor Bestiary",
      ctx,
      (target, renderCtx, viewState) => {
        const context = resolveContext2(renderCtx);
        const intro = createElement(
          "p",
          "codex-panel__intro",
          "Review every discovered memory, relic, apparition, and foe recorded across all runs."
        );
        target.appendChild(intro);
        const codexContainer = createElement("div");
        renderCodexContent(codexContainer, {
          layout: "overlay",
          viewState,
          memoryKeys: MEMORY_DEFINITIONS.map((memory) => memory.key),
          actionKeys: Object.keys(ACTION_DEFINITIONS || {}),
          relicKeys: RELIC_DEFINITIONS.map((relic) => relic.key),
          consumableKeys: CONSUMABLE_DEFINITIONS.map((item) => item.key),
          enemyKeys: enemySprites.map((sprite) => sprite.key),
          bossKeys: bossSprites.map((sprite) => sprite.key),
          playerGhostKeys: [playerCharacter.key],
          pages: BESTIARY_PAGES,
          emptyMessage: "Entries will appear here as development continues."
        });
        target.appendChild(codexContainer);
      }
    );
  }

  // src/ui/inventory.js
  function resolveContext3(ctx) {
    if (ctx && typeof ctx === "object") {
      if (ctx.state) {
        return ctx;
      }
      return { ...ctx, state: getState() };
    }
    return { state: getState() };
  }
  function triggerResourceUpdate(ctx) {
    const context = resolveContext3(ctx);
    if (typeof context.updateResources === "function") {
      context.updateResources(context);
      return;
    }
    const activeContext = getState().activeScreenContext;
    if (activeContext?.updateResources) {
      activeContext.updateResources(activeContext);
    }
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
  function ensureDraftState() {
    const state2 = getState();
    const packCount = 3;
    if (!Array.isArray(state2.draftPacks) || state2.draftPacks.length === 0) {
      updateState({
        draftPacks: createMemoryDraftPacks(packCount, 3),
        selectedDrafts: new Array(packCount).fill(null),
        playerMemories: []
      });
    }
    const currentState = getState();
    if (!Array.isArray(currentState.selectedDrafts)) {
      updateState({
        selectedDrafts: new Array(currentState.draftPacks.length).fill(null)
      });
    }
  }
  function renderMemoryDraft(ctx) {
    ensureDraftState();
    const context = resolveContext3(ctx);
    const state2 = context.state;
    const container2 = createElement("div", "memory-draft");
    const summary = createElement(
      "div",
      "memory-draft__summary",
      state2.playerMemories.length === state2.draftPacks.length ? "Draft complete. Review your memories before continuing." : "Draft three memories to define your starting action pool."
    );
    container2.appendChild(summary);
    state2.draftPacks.forEach((pack, index) => {
      const column = createElement("div", "memory-draft__pack");
      const header = createElement("h3", "memory-draft__title", `Memory ${index + 1}`);
      column.appendChild(header);
      pack.forEach((memoryKey) => {
        const memory = MEMORY_MAP.get(memoryKey);
        if (!memory) {
          return;
        }
        const card = createMemoryCard(context, memory, index);
        column.appendChild(card);
      });
      container2.appendChild(column);
    });
    const chosenList = createElement("ul", "memory-draft__chosen");
    state2.selectedDrafts.forEach((key, idx) => {
      const li = createElement(
        "li",
        "memory-draft__chosen-item",
        key ? MEMORY_MAP.get(key)?.name || "Unknown Memory" : `Pick for slot ${idx + 1}`
      );
      chosenList.appendChild(li);
    });
    container2.appendChild(chosenList);
    return container2;
  }
  function createMemoryCard(ctx, memory, packIndex) {
    const card = createElement("button", "memory-card");
    card.type = "button";
    card.dataset.memoryKey = memory.key;
    card.dataset.packIndex = String(packIndex);
    card.title = `${memory.name} \u2014 ${memory.description}`;
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
      const state2 = getState();
      const selectedDrafts = state2.selectedDrafts.slice();
      selectedDrafts[packIndex] = memory.key;
      updateState({
        selectedDrafts,
        playerMemories: selectedDrafts.filter(Boolean)
      });
      updateMemoryDraftSelection(ctx);
    });
    return card;
  }
  function updateMemoryDraftSelection(ctx) {
    const context = resolveContext3(ctx);
    const state2 = context.state;
    const draftContainers = document.querySelectorAll(".memory-card");
    draftContainers.forEach((card) => {
      const packIndex = Number(card.dataset.packIndex);
      const key = card.dataset.memoryKey;
      if (state2.selectedDrafts[packIndex] === key) {
        card.classList.add("is-selected");
      } else {
        card.classList.remove("is-selected");
      }
    });
    const chosenItems = document.querySelectorAll(".memory-draft__chosen-item");
    chosenItems.forEach((item, index) => {
      const key = state2.selectedDrafts[index];
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
      if (state2.playerMemories.length === state2.draftPacks.length) {
        summary.textContent = "Draft complete. Review your memories before continuing.";
      } else {
        summary.textContent = "Draft three memories to define your starting action pool.";
      }
    }
    const continueButton = document.querySelector(
      ".screen--well .screen-footer .button--primary"
    );
    if (continueButton) {
      continueButton.disabled = state2.playerMemories.length !== state2.draftPacks.length;
    }
  }
  function renderConsumableDisplay(container2, ctx) {
    if (!container2) {
      return;
    }
    const context = resolveContext3(ctx);
    const state2 = context.state;
    container2.classList.add("run-resources__item", "run-resources__item--consumables");
    const label = createElement("span", "run-resources__label", "Consumables");
    const slotRow = createElement("div", "consumable-slots");
    const items = [];
    CONSUMABLE_DEFINITIONS.forEach((definition) => {
      const count = Number(state2.playerConsumables?.[definition.key] || 0);
      for (let i = 0; i < count; i += 1) {
        if (items.length < MAX_CONSUMABLE_SLOTS) {
          items.push(definition);
        }
      }
    });
    items.forEach((item) => {
      const button = createElement("button", "consumable-slot");
      button.type = "button";
      const tooltipParts = [item.name];
      if (item.description) {
        tooltipParts.push(item.description);
      }
      button.title = tooltipParts.join(" \u2014 ");
      button.setAttribute("aria-label", `Use ${item.name}`);
      const iconText = item.icon || item.name.charAt(0).toUpperCase();
      const icon = createElement("span", "consumable-slot__icon", iconText);
      icon.setAttribute("aria-hidden", "true");
      button.appendChild(icon);
      const hiddenLabel = createElement("span", "sr-only", `Use ${item.name}`);
      button.appendChild(hiddenLabel);
      button.addEventListener("click", () => {
        const confirmText = `Use ${item.name}?`;
        if (window.confirm(confirmText)) {
          useConsumable(context, item.key);
        }
      });
      slotRow.appendChild(button);
    });
    const emptySlots = Math.max(MAX_CONSUMABLE_SLOTS - items.length, 0);
    for (let i = 0; i < emptySlots; i += 1) {
      slotRow.appendChild(
        createElement("span", "consumable-slot consumable-slot--empty")
      );
    }
    container2.replaceChildren(label, slotRow);
  }
  function useConsumable(ctx, key) {
    const context = resolveContext3(ctx);
    const consumables = ensurePlayerConsumables();
    if (!key || !consumables[key]) {
      context.showToast?.("No charges of that consumable remain.");
      return;
    }
    const consumable = CONSUMABLE_MAP.get(key);
    if (!consumable) {
      context.showToast?.("That item resists being used.");
      return;
    }
    const effect = consumable.effect || {};
    let gainedEssence = 0;
    let message = "";
    switch (effect.type) {
      case "restoreEssence": {
        const amount = Number(effect.amount) || 0;
        if (amount > 0) {
          const state3 = getState();
          const before = state3.playerEssence || 0;
          const cappedMax = state3.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
          const nextEssence = Math.min(cappedMax, before + amount);
          setEssenceValues(nextEssence);
          gainedEssence = Math.max(0, Math.round(nextEssence - before));
          message = gainedEssence > 0 ? `You restore ${gainedEssence} Essence.` : "You are already at full essence.";
        }
        break;
      }
      case "gainGold": {
        addGold(effect.amount || 0, context);
        break;
      }
      case "grantShroudGuard": {
        incrementShroudGuard();
        message = "A protective shroud gathers around you.";
        break;
      }
      case "increaseMaxEssence": {
        const amount = Number(effect.amount) || 0;
        if (amount > 0) {
          const state3 = getState();
          const previousMax = state3.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
          const newMax = previousMax + amount;
          setEssenceValues(newMax, newMax);
          message = `Your essence lingers, increasing permanently by ${amount}.`;
        }
        break;
      }
      case "unlockDoor": {
        context.showToast?.(
          "Keys are used automatically to open locked enhanced doors."
        );
        return;
      }
      default: {
        message = "The item fizzles without effect.";
        break;
      }
    }
    adjustConsumableCount(key, -1);
    if (message && context.showToast) {
      context.showToast(message);
    }
    const state2 = getState();
    if (gainedEssence > 0 && state2.activeCombat && state2.activeCombat.status === "inProgress") {
      state2.activeCombat.player.essence = Math.min(
        state2.activeCombat.player.maxEssence,
        state2.activeCombat.player.essence + gainedEssence
      );
      updateCombatUI(state2.activeCombat);
    }
    triggerResourceUpdate(context);
  }

  // src/state/run.js
  function buildInitialRoomPool() {
    return ROOM_DEFINITIONS.map((room) => room.key);
  }
  function getDoorCategoryOptions(count) {
    const categories = sampleWithoutReplacement(DOOR_CATEGORIES, count);
    return categories.map((category) => ({ ...category }));
  }
  function initializeRunState(options = {}) {
    if (typeof options.closeCodexOverlay === "function") {
      options.closeCodexOverlay();
    }
    updateState({
      roomPool: buildInitialRoomPool(),
      roomHistory: [],
      currentRoomNumber: 0,
      currentRoomKey: null,
      corridorRefreshes: 0,
      currentEncounterType: null,
      currentEncounter: null,
      playerMemories: [],
      playerRelics: [],
      playerGold: 0,
      playerConsumables: {},
      playerEssence: DEFAULT_PLAYER_STATS.maxEssence,
      playerMaxEssence: DEFAULT_PLAYER_STATS.maxEssence,
      shroudGuardCharges: 0,
      draftPacks: [],
      selectedDrafts: [],
      codexSelections: {},
      activeScreenContext: null,
      merchantDraftCost: MERCHANT_BASE_DRAFT_COST,
      roomRewardsClaimed: {},
      currentRoomIsEnhanced: false
    });
    clearCodexView();
    clearActiveCombat();
  }
  function clearRunState(options = {}) {
    if (typeof options.closeCodexOverlay === "function") {
      options.closeCodexOverlay();
    }
    updateState({
      roomPool: [],
      roomHistory: [],
      currentRoomNumber: 0,
      currentRoomKey: null,
      corridorRefreshes: 0,
      lastRunScreen: null,
      hasSave: false,
      inRun: false,
      currentEncounterType: null,
      currentEncounter: null,
      playerMemories: [],
      playerRelics: [],
      playerGold: 0,
      playerConsumables: {},
      playerEssence: DEFAULT_PLAYER_STATS.maxEssence,
      playerMaxEssence: DEFAULT_PLAYER_STATS.maxEssence,
      shroudGuardCharges: 0,
      draftPacks: [],
      selectedDrafts: [],
      codexSelections: {},
      activeScreenContext: null,
      merchantDraftCost: MERCHANT_BASE_DRAFT_COST,
      roomRewardsClaimed: {},
      currentRoomIsEnhanced: false
    });
    clearCodexView();
    clearActiveCombat();
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
    const animatedTypes = /* @__PURE__ */ new Set(["combat", "elite", "boss"]);
    return {
      sprite,
      type,
      kind: type === "merchant" ? "merchant" : type === "boss" ? "boss" : "enemy",
      animate: animatedTypes.has(type),
      enterDelay: 2e3
    };
  }
  async function goToRoom(ctx, roomKey, options = {}) {
    const room = ROOM_MAP.get(roomKey);
    if (!room) {
      ctx.showToast("That path is sealed.");
      return;
    }
    const currentPool = Array.isArray(ctx.state.roomPool) ? ctx.state.roomPool : [];
    const nextRoomPool = currentPool.filter((key) => key !== roomKey);
    updateState({ roomPool: nextRoomPool });
    let roomHistory = Array.isArray(ctx.state.roomHistory) ? ctx.state.roomHistory.slice() : [];
    if (roomHistory[roomHistory.length - 1] !== roomKey) {
      roomHistory = [...roomHistory, roomKey];
    }
    updateState({
      roomHistory,
      currentRoomNumber: roomHistory.length,
      currentRoomKey: roomKey,
      lastRunScreen: "room",
      corridorRefreshes: 0
    });
    const encounterType = options.encounterType || null;
    updateState({
      currentEncounterType: encounterType,
      currentRoomIsEnhanced: !!options.enhanced
    });
    const encounter = getEncounterForType(encounterType);
    updateState({ currentEncounter: encounter });
    await ctx.transitionTo("room", {
      room,
      background: room.background,
      ariaLabel: room.ariaLabel,
      encounterType,
      encounter
    });
    ctx.showToast(`You enter ${room.name}.`);
  }
  async function goToFoyer(ctx) {
    updateState({ roomPool: [] });
    let roomHistory = Array.isArray(ctx.state.roomHistory) ? ctx.state.roomHistory.slice() : [];
    if (roomHistory[roomHistory.length - 1] !== FOYER_ROOM.key) {
      roomHistory = [...roomHistory, FOYER_ROOM.key];
    }
    updateState({
      roomHistory,
      currentRoomNumber: roomHistory.length,
      currentRoomKey: FOYER_ROOM.key,
      lastRunScreen: "foyer",
      corridorRefreshes: 0
    });
    updateState({
      currentEncounterType: "boss",
      currentRoomIsEnhanced: false
    });
    const encounter = getEncounterForType("boss");
    updateState({ currentEncounter: encounter });
    await ctx.transitionTo("foyer", {
      encounterType: "boss",
      encounter
    });
    ctx.showToast("The foyer looms ahead.");
  }

  // src/ui/screens/corridor.js
  var corridorScreen = {
    key: "corridor",
    background: backgrounds.corridor,
    ariaLabel: "A corridor within Cebarti Manor awaiting door choices.",
    checkpoint: true,
    render(ctx) {
      if (ctx.options && ctx.options.fromRoom) {
        updateState({ currentRoomKey: null });
      }
      updateState({ currentEncounterType: null, currentEncounter: null });
      const wrapper = createElement("div", "screen screen--corridor");
      const availableRooms = Array.isArray(ctx.state.roomPool) ? ctx.state.roomPool : [];
      const roomsRemaining = Math.max(availableRooms.length, 0);
      const roomsCleared = Math.min(
        ROOMS_BEFORE_BOSS - roomsRemaining,
        ROOMS_BEFORE_BOSS
      );
      const tracker = ctx.helpers?.createRunTracker?.(
        ctx,
        `Rooms Cleared ${roomsCleared}/${ROOMS_BEFORE_BOSS}`
      );
      const title = createElement("h2", "screen__title", "The Corridor");
      const refreshCount = ctx.state.corridorRefreshes;
      let descriptionText;
      if (roomsRemaining === 0) {
        descriptionText = "Only the foyer remains. Steel yourself before the final confrontation.";
      } else if (roomsRemaining === 1) {
        descriptionText = "Only a single chamber stands between you and the foyer. Choose with care.";
      } else {
        descriptionText = `${roomsRemaining} chambers remain before the foyer.`;
      }
      if (roomsRemaining > 0) {
        if (refreshCount === 0) {
          descriptionText += " Three doors shimmer ahead.";
        } else {
          descriptionText += ` The manor has reshaped itself ${refreshCount} time${refreshCount === 1 ? "" : "s"}.`;
        }
      }
      const subtitle = createElement("p", "screen__subtitle", descriptionText);
      updateState({ currentRoomIsEnhanced: false });
      const doorMap = createElement("div", "door-map");
      if (roomsRemaining === 0) {
        const { element: foyerDoor, button: foyerButton } = ctx.helpers?.createDoorChoice?.("Door to the Foyer", ["door-button--umbra"], {
          ariaDescription: "Leads directly to the foyer and the final encounter.",
          displayLabel: "Foyer",
          detail: "Face Helen Cebarti's final challenge."
        }) || {};
        if (foyerDoor && foyerButton) {
          foyerButton.addEventListener("click", async () => {
            foyerButton.disabled = true;
            await goToFoyer(ctx);
          });
          doorMap.appendChild(foyerDoor);
        }
      } else {
        const doorCount = Math.min(3, roomsRemaining);
        const roomsForDoors = sampleWithoutReplacement(availableRooms, doorCount);
        const categories = getDoorCategoryOptions(doorCount);
        const doors = roomsForDoors.map((roomKey, index) => {
          const category = categories[index] || {};
          const enhanced = doorCount <= 1 ? false : Math.random() < ENHANCED_DOOR_CHANCE;
          return { roomKey, category, enhanced };
        });
        if (doors.length > 0 && doors.every((door) => door.enhanced)) {
          const randomIndex = Math.floor(Math.random() * doors.length);
          doors[randomIndex].enhanced = false;
        }
        doors.forEach(({ roomKey, category, enhanced }, index) => {
          const extraClasses = [];
          if (typeof category.colorClass === "string" && category.colorClass) {
            extraClasses.push(category.colorClass);
          }
          if (enhanced) {
            extraClasses.push("door-button--enhanced");
          }
          const detailParts = [];
          if (category.detail) {
            detailParts.push(category.detail);
          }
          if (enhanced) {
            detailParts.push("Locked \u2014 requires a Manor Key.");
          }
          const doorLabel = category.label || `Door ${index + 1}`;
          const detailText = detailParts.join(" ").trim();
          const ariaDescriptionParts = [
            category.ariaDescription || "Leads to an unknown chamber."
          ];
          if (enhanced) {
            ariaDescriptionParts.push("Locked \u2014 requires a Manor Key.");
          }
          const choice = ctx.helpers?.createDoorChoice?.(doorLabel, extraClasses, {
            ariaDescription: ariaDescriptionParts.join(" "),
            detail: detailText.length > 0 ? detailText : void 0,
            displayLabel: doorLabel,
            dataset: typeof category.key === "string" ? { category: category.key } : void 0,
            iconSrc: category.icon
          });
          if (!choice) {
            return;
          }
          const {
            element: doorChoice,
            button: doorButton,
            iconElement,
            labelElement,
            lockElement
          } = choice;
          if (iconElement) {
            iconElement.title = category.label || doorLabel;
          }
          if (labelElement && enhanced) {
            labelElement.classList.add("door-option__label--locked");
            const lockBadge = createElement("span", "door-option__badge", "Locked");
            labelElement.appendChild(lockBadge);
          }
          if (lockElement) {
            lockElement.loading = "lazy";
          }
          let isLocked = enhanced;
          if (isLocked) {
            doorButton.classList.add("door-button--locked");
          }
          doorButton.dataset.locked = isLocked ? "true" : "false";
          doorButton.dataset.enhanced = enhanced ? "true" : "false";
          if (category.key) {
            doorButton.dataset.roomType = category.key;
          }
          doorButton.addEventListener("click", async () => {
            if (isLocked) {
              const hasKey = (ctx.helpers?.getConsumableCount?.(MANOR_KEY_CONSUMABLE_KEY) || 0) > 0;
              if (!hasKey) {
                ctx.showToast("The lock refuses to budge. You'll need a Manor Key.");
                doorButton.classList.add("door-button--shake");
                window.setTimeout(() => {
                  doorButton.classList.remove("door-button--shake");
                }, 360);
                return;
              }
              const spent = ctx.helpers?.spendConsumableCharge?.(
                MANOR_KEY_CONSUMABLE_KEY,
                ctx
              );
              if (!spent) {
                ctx.showToast(
                  "The key slips from your grasp before the lock yields."
                );
                return;
              }
              ctx.showToast("The Manor Key clicks open the lock.");
              isLocked = false;
              doorButton.dataset.locked = "false";
              doorButton.classList.remove("door-button--locked");
            }
            doorButton.disabled = true;
            await goToRoom(ctx, roomKey, {
              encounterType: category.key,
              enhanced
            });
          });
          doorMap.appendChild(doorChoice);
        });
      }
      const footer = createElement("div", "screen-footer");
      if (roomsRemaining > 0) {
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Continue Down the Corridor"
        );
        continueButton.addEventListener("click", async () => {
          const corridorRefreshes = (ctx.state.corridorRefreshes || 0) + 1;
          updateState({
            corridorRefreshes,
            lastRunScreen: "corridor"
          });
          await ctx.transitionTo("corridor", { refresh: true });
          ctx.showToast("The corridor rearranges itself.");
        });
        footer.appendChild(continueButton);
      }
      const returnButton = createElement(
        "button",
        "button",
        "Return to Main Menu"
      );
      returnButton.addEventListener("click", async () => {
        const confirmReturn = window.confirm(
          "Abandon this run and return to the main menu?"
        );
        if (!confirmReturn) {
          return;
        }
        clearRunState({ closeCodexOverlay: ctx.helpers?.closeCodexOverlay });
        await ctx.transitionTo("mainMenu");
        ctx.showToast(
          "You withdraw from the corridor and return to the manor's entry hall."
        );
      });
      footer.appendChild(returnButton);
      if (tracker) {
        wrapper.append(tracker);
      }
      wrapper.append(title, subtitle, doorMap, footer);
      return wrapper;
    }
  };
  var corridor_default = corridorScreen;

  // src/ui/screens/foyer.js
  var foyerScreen = {
    key: "foyer",
    background: backgrounds.foyer,
    ariaLabel: FOYER_ROOM.ariaLabel,
    checkpoint: true,
    render(ctx) {
      const wrapper = createElement("div", "screen screen--room screen--foyer");
      const roomNumber = Math.max(ctx.state.currentRoomNumber, TOTAL_ROOMS_PER_RUN);
      const tracker = ctx.helpers?.createRunTracker?.(
        ctx,
        `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
      );
      const title = createElement("h2", "screen__title", FOYER_ROOM.name);
      const subtitle = createElement("p", "screen__subtitle", FOYER_ROOM.description);
      const encounter = ctx.options?.encounter || ctx.state.currentEncounter;
      const encounterScene = ctx.helpers?.createEncounterScene?.({ encounter });
      const prompt = createElement(
        "p",
        "screen__subtitle",
        ctx.helpers?.getEncounterPrompt?.("boss", encounter) || ""
      );
      const footer = createElement("div", "screen-footer");
      const continueButton = createElement(
        "button",
        "button button--primary",
        "Challenge the Foyer"
      );
      continueButton.addEventListener("click", async () => {
        continueButton.disabled = true;
        updateState({
          hasSave: false,
          lastRunScreen: null,
          inRun: false,
          currentEncounterType: null,
          currentEncounter: null
        });
        await ctx.transitionTo("victory");
      });
      footer.appendChild(continueButton);
      if (tracker) {
        wrapper.append(tracker);
      }
      wrapper.append(title, subtitle);
      if (encounterScene) {
        wrapper.append(encounterScene.scene);
      }
      wrapper.append(prompt, footer);
      return wrapper;
    }
  };
  var foyer_default = foyerScreen;

  // src/ui/screens/main-menu.js
  var mainMenuScreen = {
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
        updateState({ inRun: true });
        ctx.transitionTo(ctx.state.lastRunScreen);
      });
      const newRunBtn = createElement(
        "button",
        "button menu__button",
        "New Run"
      );
      newRunBtn.addEventListener("click", () => {
        initializeRunState({ closeCodexOverlay: ctx.helpers?.closeCodexOverlay });
        updateState({ inRun: true, hasSave: false, lastRunScreen: "well" });
        ctx.transitionTo("well");
      });
      const bestiaryBtn = createElement(
        "button",
        "button menu__button",
        "Bestiary"
      );
      bestiaryBtn.addEventListener("click", () => {
        ctx.helpers?.showBestiary?.(ctx);
      });
      const settingsBtn = createElement(
        "button",
        "button menu__button",
        "Settings"
      );
      settingsBtn.addEventListener("click", () => ctx.transitionTo("settings"));
      const exitBtn = createElement("button", "button menu__button", "Exit");
      exitBtn.addEventListener("click", () => {
        ctx.exitGame();
      });
      menu.append(continueBtn, newRunBtn, bestiaryBtn, settingsBtn, exitBtn);
      panel.append(title, subtitle, menu);
      wrapper.append(panel);
      return wrapper;
    }
  };
  var main_menu_default = mainMenuScreen;

  // src/ui/screens/room.js
  var roomScreen = {
    key: "room",
    render(ctx) {
      const roomData = ctx.options?.room;
      const encounterType = ctx.options?.encounterType || ctx.state.currentEncounterType;
      const encounter = ctx.options?.encounter || ctx.state.currentEncounter;
      const wrapper = createElement("div", "screen screen--room");
      const roomNumber = Math.max(ctx.state.currentRoomNumber, 1);
      const tracker = ctx.helpers?.createRunTracker?.(
        ctx,
        `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
      );
      if (tracker) {
        wrapper.appendChild(tracker);
      }
      if (!roomData) {
        const title2 = createElement("h2", "screen__title", "The Manor Resists");
        const subtitle2 = createElement(
          "p",
          "screen__subtitle",
          "The chosen doorway seals shut. You retreat to the corridor."
        );
        const footer2 = createElement("div", "screen-footer");
        const backButton = createElement(
          "button",
          "button button--primary",
          "Return to the Corridor"
        );
        backButton.addEventListener("click", async () => {
          updateState({ currentRoomKey: null, lastRunScreen: "corridor" });
          await ctx.transitionTo("corridor", { refresh: true });
        });
        footer2.appendChild(backButton);
        updateState({ currentEncounterType: null, currentEncounter: null });
        wrapper.append(title2, subtitle2, footer2);
        return wrapper;
      }
      const title = createElement("h2", "screen__title", roomData.name);
      const subtitle = createElement(
        "p",
        "screen__subtitle",
        roomData.description
      );
      wrapper.append(title, subtitle);
      if (ctx.helpers?.isCombatEncounter?.(encounterType)) {
        const combatExperience = createCombatExperience(ctx, {
          room: roomData,
          encounterType,
          encounter
        });
        wrapper.append(combatExperience.container, combatExperience.footer);
        return wrapper;
      }
      const encounterScene = ctx.helpers?.createEncounterScene?.({ encounter });
      if (encounterScene) {
        wrapper.append(encounterScene.scene);
      }
      const prompt = createElement(
        "p",
        "screen__subtitle",
        ctx.helpers?.getEncounterPrompt?.(encounterType, encounter) || ""
      );
      const footer = createElement("div", "screen-footer");
      const continueButton = createElement(
        "button",
        "button button--primary",
        "Return to the Corridor"
      );
      continueButton.addEventListener("click", async () => {
        updateState({
          currentRoomKey: null,
          lastRunScreen: "corridor",
          corridorRefreshes: 0,
          currentEncounterType: null,
          currentEncounter: null
        });
        await ctx.transitionTo("corridor", { fromRoom: true });
        ctx.showToast("You slip back into the corridor.");
      });
      footer.appendChild(continueButton);
      wrapper.append(prompt);
      if (encounterType === "recovery") {
        const recoveryResult = applyRecoveryRoomBenefits(ctx, roomData.key);
        const detailText = recoveryResult ? `You absorb the chamber's lingering calm. Maximum Essence increases by ${recoveryResult.essenceIncrease} and your essence is fully restored.` : "The chamber's restorative energies have already been spent.";
        wrapper.appendChild(createElement("p", "combat-rewards__detail", detailText));
        if (recoveryResult) {
          ctx.showToast(
            `Your essence deepens by ${recoveryResult.essenceIncrease}.`
          );
        } else {
          ctx.showToast("You feel as renewed as this chamber allows.");
        }
        wrapper.appendChild(footer);
        return wrapper;
      }
      if (encounterType === "treasure") {
        const { panel: rewardsPanel } = createRewardsPanel(ctx, {
          encounterType: "treasure",
          continueButton
        });
        if (rewardsPanel) {
          wrapper.appendChild(rewardsPanel);
        }
        wrapper.appendChild(footer);
        return wrapper;
      }
      if (encounterType === "merchant") {
        const merchantPanel = createMerchantPanel(ctx, continueButton);
        wrapper.append(merchantPanel, footer);
        return wrapper;
      }
      wrapper.appendChild(footer);
      return wrapper;
    }
  };
  var room_default = roomScreen;

  // src/ui/screens/settings.js
  var settingsScreen = {
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
    }
  };
  var settings_default = settingsScreen;

  // src/ui/screens/splash.js
  var splashScreen = {
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
    }
  };
  var splash_default = splashScreen;

  // src/ui/screens/victory.js
  var victoryScreen = {
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
        ctx.state.roomHistory.filter((key) => key !== FOYER_ROOM.key).length,
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
        clearRunState({ closeCodexOverlay: ctx.helpers?.closeCodexOverlay });
        await ctx.transitionTo("mainMenu");
        ctx.showToast("You breathe freely in the manor's entry hall.");
      });
      footer.appendChild(menuButton);
      wrapper.append(title, subtitle, summary, footer);
      return wrapper;
    }
  };
  var victory_default = victoryScreen;

  // src/ui/screens/well.js
  var wellScreen = {
    key: "well",
    background: backgrounds.well,
    ariaLabel: "The Styx well inside Cebarti Manor.",
    checkpoint: true,
    render(ctx) {
      updateState({ currentEncounterType: null, currentEncounter: null });
      const wrapper = createElement("div", "screen screen--well");
      const title = createElement("h2", "screen__title", "The Styx Well");
      const subtitle = createElement(
        "p",
        "screen__subtitle",
        "Draft three memories to define this run's starting action pool."
      );
      const wellScene = ctx.helpers?.createWellScene?.();
      const draftPanel = ctx.helpers?.renderMemoryDraft?.(ctx);
      const footer = createElement("div", "screen-footer");
      const continueButton = createElement(
        "button",
        "button button--primary",
        "Continue"
      );
      continueButton.disabled = ctx.state.playerMemories.length !== ctx.state.draftPacks.length;
      continueButton.addEventListener("click", async () => {
        if (ctx.state.playerMemories.length !== ctx.state.draftPacks.length) {
          ctx.showToast("Choose one memory from each set to proceed.");
          return;
        }
        updateState({ corridorRefreshes: 0, lastRunScreen: "corridor" });
        await ctx.transitionTo("corridor");
        ctx.showToast("You ascend into the corridor.");
      });
      footer.appendChild(continueButton);
      wrapper.append(title, subtitle);
      if (wellScene) {
        wrapper.append(wellScene);
      }
      if (draftPanel) {
        wrapper.append(draftPanel);
      }
      wrapper.append(footer);
      window.requestAnimationFrame(() => {
        ctx.helpers?.updateMemoryDraftSelection?.(ctx);
      });
      return wrapper;
    }
  };
  var well_default = wellScreen;

  // src/ui/screens/index.js
  var screens_default = [
    splash_default,
    main_menu_default,
    settings_default,
    well_default,
    corridor_default,
    room_default,
    foyer_default,
    victory_default
  ];

  // src/utils/debug.js
  var MAX_HISTORY = 200;
  var history = [];
  var listeners = /* @__PURE__ */ new Set();
  var initialized = false;
  function clampHistory() {
    while (history.length > MAX_HISTORY) {
      history.shift();
    }
  }
  function formatArgument(argument) {
    if (argument instanceof Error) {
      const message = `${argument.name || "Error"}: ${argument.message || ""}`.trim();
      const stack = argument.stack && typeof argument.stack === "string" ? argument.stack : "";
      return { text: message, details: stack && stack !== message ? stack : "" };
    }
    if (typeof argument === "string") {
      return { text: argument, details: "" };
    }
    if (typeof argument === "number" || typeof argument === "boolean" || argument === null) {
      return { text: String(argument), details: "" };
    }
    try {
      return { text: JSON.stringify(argument, null, 2), details: "" };
    } catch (error) {
      return { text: Object.prototype.toString.call(argument), details: "" };
    }
  }
  function createEntry(level, args, meta = {}) {
    const processed = args.map((arg) => formatArgument(arg));
    const text = processed.map((item) => item.text).join(" ").trim();
    const extraDetails = processed.map((item) => item.details).filter((item) => typeof item === "string" && item.trim().length > 0);
    if (typeof meta.details === "string" && meta.details.trim().length > 0) {
      extraDetails.push(meta.details.trim());
    }
    const timestamp = Date.now();
    return {
      id: `${timestamp}-${Math.random().toString(16).slice(2)}`,
      level,
      timestamp,
      text: text || level.toUpperCase(),
      details: extraDetails.join("\n\n"),
      meta,
      rawArgs: args
    };
  }
  function emit(entry) {
    history.push(entry);
    clampHistory();
    listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (error) {
      }
    });
  }
  function emitFromConsole(level, args, meta) {
    const entry = createEntry(level, args, meta);
    emit(entry);
  }
  function subscribeToDebugLog(listener, { replay = true } = {}) {
    if (typeof listener !== "function") {
      return () => {
      };
    }
    if (replay) {
      history.forEach((entry) => {
        try {
          listener(entry);
        } catch (error) {
        }
      });
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
  function clearDebugHistory() {
    history.splice(0, history.length);
    listeners.forEach((listener) => {
      try {
        listener({ type: "clear" });
      } catch (error) {
      }
    });
  }
  function attachErrorListeners() {
    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener("error", (event) => {
      const meta = {
        source: event?.filename,
        line: event?.lineno,
        column: event?.colno
      };
      const args = [event?.message || "Uncaught error"];
      if (event?.error instanceof Error && event.error.stack) {
        meta.details = event.error.stack;
      }
      emitFromConsole("error", args, meta);
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event?.reason;
      const meta = {};
      if (reason instanceof Error && reason.stack) {
        meta.details = reason.stack;
      }
      emitFromConsole("error", ["Unhandled promise rejection", reason], meta);
    });
  }
  function initializeDebugLogging() {
    if (initialized) {
      return;
    }
    initialized = true;
    const original = {};
    const levels = ["debug", "log", "info", "warn", "error"];
    levels.forEach((level) => {
      if (typeof console?.[level] === "function") {
        original[level] = console[level].bind(console);
        console[level] = (...args) => {
          try {
            emitFromConsole(level, args);
          } catch (error) {
          }
          return original[level](...args);
        };
      }
    });
    attachErrorListeners();
    emitFromConsole("info", ["Debug logging initialized"]);
  }

  // src/ui/debug-log.js
  var MAX_RENDERED_ENTRIES = 200;
  var container = null;
  var listElement = null;
  var emptyStateElement = null;
  var toggleButtonElement = null;
  var unsubscribe = null;
  var initialized2 = false;
  function formatTimestamp(timestamp) {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch (error) {
      return "--:--:--";
    }
  }
  function ensureEmptyState() {
    if (!emptyStateElement) {
      emptyStateElement = createElement(
        "div",
        "debug-log__empty",
        "Debug log will appear here."
      );
    }
    if (listElement && emptyStateElement && !listElement.contains(emptyStateElement)) {
      listElement.appendChild(emptyStateElement);
    }
  }
  function removeEmptyState() {
    if (emptyStateElement && emptyStateElement.parentElement) {
      emptyStateElement.parentElement.removeChild(emptyStateElement);
    }
  }
  function trimRenderedEntries() {
    if (!listElement) {
      return;
    }
    while (listElement.children.length > MAX_RENDERED_ENTRIES) {
      listElement.removeChild(listElement.firstChild);
    }
  }
  function renderEntry(entry) {
    if (!listElement || !entry || entry.type === "clear") {
      if (entry?.type === "clear") {
        listElement.textContent = "";
        ensureEmptyState();
      }
      return;
    }
    removeEmptyState();
    const item = createElement("article", "debug-log__entry");
    item.dataset.level = entry.level || "info";
    const header = createElement("header", "debug-log__entry-header");
    const time = createElement(
      "span",
      "debug-log__timestamp",
      formatTimestamp(entry.timestamp)
    );
    const level = createElement(
      "span",
      `debug-log__level debug-log__level--${entry.level || "info"}`,
      (entry.level || "info").toUpperCase()
    );
    header.append(time, level);
    const message = createElement("div", "debug-log__message", entry.text || "");
    item.append(header, message);
    if (entry.details && entry.details.trim().length > 0) {
      const details = createElement("pre", "debug-log__details");
      details.textContent = entry.details;
      item.append(details);
    }
    listElement.appendChild(item);
    trimRenderedEntries();
    listElement.scrollTop = listElement.scrollHeight;
  }
  function toggleCollapsed(nextCollapsed) {
    if (!container) {
      return;
    }
    const currentlyCollapsed = container.classList.contains("debug-log--collapsed");
    const shouldCollapse = typeof nextCollapsed === "boolean" ? nextCollapsed : !currentlyCollapsed;
    if (shouldCollapse) {
      container.classList.add("debug-log--collapsed");
    } else {
      container.classList.remove("debug-log--collapsed");
    }
    updateToggleLabel();
  }
  function clearEntries() {
    if (!listElement) {
      return;
    }
    listElement.textContent = "";
    ensureEmptyState();
    clearDebugHistory();
  }
  function createControls() {
    const controls = createElement("div", "debug-log__controls");
    toggleButtonElement = createElement(
      "button",
      "debug-log__button debug-log__button--toggle",
      "Show"
    );
    toggleButtonElement.type = "button";
    toggleButtonElement.addEventListener("click", () => toggleCollapsed());
    const clearButton = createElement(
      "button",
      "debug-log__button debug-log__button--clear",
      "Clear"
    );
    clearButton.type = "button";
    clearButton.addEventListener("click", clearEntries);
    controls.append(toggleButtonElement, clearButton);
    return controls;
  }
  function ensureContainer() {
    if (container || typeof document === "undefined") {
      return container;
    }
    const shell = ensureGameShell();
    const parent = shell?.game || document.body;
    container = createElement("section", "debug-log debug-log--collapsed");
    container.id = "debug-log";
    container.setAttribute("role", "log");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-label", "Debug log output");
    const header = createElement("header", "debug-log__header");
    const title = createElement("h2", "debug-log__title", "Debug Log");
    header.append(title, createControls());
    header.addEventListener("click", (event) => {
      if (event.target === header || event.target === title) {
        toggleCollapsed();
      }
    });
    listElement = createElement("div", "debug-log__entries");
    ensureEmptyState();
    container.append(header, listElement);
    parent.appendChild(container);
    if (!unsubscribe) {
      unsubscribe = subscribeToDebugLog(renderEntry);
    }
    updateToggleLabel();
    return container;
  }
  function initializeDebugLogUI() {
    if (initialized2) {
      return;
    }
    initialized2 = true;
    ensureContainer();
  }
  function updateToggleLabel() {
    if (!toggleButtonElement || !container) {
      return;
    }
    const collapsed = container.classList.contains("debug-log--collapsed");
    toggleButtonElement.textContent = collapsed ? "Show" : "Hide";
  }

  // src/main.js
  (function() {
    initializeDebugLogging();
    initializeDebugLogUI();
    console.info("Cebarti Manor: Bootstrapping application");
    const state2 = createState({
      playerEssence: DEFAULT_PLAYER_STATS.maxEssence,
      playerMaxEssence: DEFAULT_PLAYER_STATS.maxEssence,
      merchantDraftCost: MERCHANT_BASE_DRAFT_COST
    });
    const screens = {};
    screens_default.forEach((screen) => {
      screens[screen.key] = screen;
    });
    function createDoorButton(label, extraClasses = [], options = {}) {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("door-button");
      const classes = Array.isArray(extraClasses) ? extraClasses : [extraClasses];
      classes.filter((cls) => typeof cls === "string" && cls.trim().length > 0).forEach((cls) => button.classList.add(cls));
      button.dataset.label = label;
      const ariaDescription = typeof options.ariaDescription === "string" ? options.ariaDescription : "Leads to an unknown chamber.";
      button.setAttribute("aria-label", `${label}. ${ariaDescription}`);
      button.title = `${label} \u2014 ${ariaDescription}`;
      if (options.dataset && typeof options.dataset === "object") {
        Object.entries(options.dataset).forEach(([key, value]) => {
          if (value === void 0 || value === null) {
            return;
          }
          button.dataset[key] = String(value);
        });
      }
      const frame = createElement("span", "door-button__frame");
      button.appendChild(frame);
      const sprite = document.createElement("img");
      sprite.className = "door-button__sprite";
      sprite.src = DOOR_SPRITES.base;
      sprite.alt = "";
      sprite.loading = "lazy";
      sprite.decoding = "async";
      sprite.draggable = false;
      sprite.setAttribute("aria-hidden", "true");
      frame.appendChild(sprite);
      const shine = createElement("span", "door-button__shine");
      shine.setAttribute("aria-hidden", "true");
      frame.appendChild(shine);
      let iconElement = null;
      if (options.iconSrc) {
        iconElement = document.createElement("img");
        iconElement.className = "door-button__icon";
        iconElement.src = options.iconSrc;
        iconElement.alt = "";
        iconElement.loading = "lazy";
        iconElement.decoding = "async";
        iconElement.setAttribute("aria-hidden", "true");
        frame.appendChild(iconElement);
      }
      const lockElement = document.createElement("img");
      lockElement.className = "door-button__lock";
      lockElement.src = DOOR_SPRITES.lock;
      lockElement.alt = "";
      lockElement.loading = "lazy";
      lockElement.decoding = "async";
      lockElement.setAttribute("aria-hidden", "true");
      frame.appendChild(lockElement);
      const hiddenLabel = createElement(
        "span",
        "sr-only",
        `${label}. ${ariaDescription}`
      );
      button.appendChild(hiddenLabel);
      return { button, iconElement, lockElement, frame, sprite };
    }
    function createDoorChoice(label, extraClasses = [], options = {}) {
      const { button, iconElement, lockElement } = createDoorButton(
        label,
        extraClasses,
        options
      );
      const wrapper = createElement("div", "door-option");
      wrapper.appendChild(button);
      const displayLabel = typeof options.displayLabel === "string" && options.displayLabel.trim().length > 0 ? options.displayLabel : label;
      const labelElement = createElement("span", "door-option__label", displayLabel);
      wrapper.appendChild(labelElement);
      if (typeof options.detail === "string" && options.detail.trim().length > 0) {
        const detailElement = createElement("span", "door-option__detail", options.detail);
        wrapper.appendChild(detailElement);
      }
      return { element: wrapper, button, labelElement, iconElement, lockElement };
    }
    const screenHelpers = {
      createRunTracker,
      createDoorChoice,
      getConsumableCount,
      spendConsumableCharge,
      createEncounterScene,
      getEncounterPrompt,
      updateMemoryDraftSelection,
      createWellScene,
      renderMemoryDraft,
      showBestiary,
      closeCodexOverlay,
      isCombatEncounter
    };
    function resetResourceDisplayRegistry() {
      updateState({
        resourceDisplays: {
          progress: [],
          gold: [],
          essence: [],
          consumables: []
        }
      });
    }
    function registerResourceDisplay(type, element) {
      const registry = ensureResourceDisplays();
      if (!registry[type]) {
        registry[type] = [];
      }
      registry[type].push(element);
    }
    function updateResourceDisplays(ctx) {
      const goldValue = state2.playerGold || 0;
      const essenceValue = Math.max(0, Math.round(state2.playerEssence || 0));
      const maxEssenceValue = Math.max(
        essenceValue,
        Math.round(state2.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence)
      );
      if (state2.resourceDisplays?.gold) {
        state2.resourceDisplays.gold.forEach((element) => {
          element.textContent = `Gold ${goldValue}`;
        });
      }
      if (state2.resourceDisplays?.essence) {
        state2.resourceDisplays.essence.forEach((element) => {
          element.textContent = `Essence ${essenceValue}/${maxEssenceValue}`;
        });
      }
      if (state2.resourceDisplays?.consumables) {
        state2.resourceDisplays.consumables.forEach((element) => {
          renderConsumableDisplay(element, ctx);
        });
      }
      refreshCodexOverlay();
    }
    function createRelicToken(relic) {
      const token = createElement("span", "relic-token");
      const slug = (relic.emotion || "colorless").toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-+|-+$/g, "");
      if (slug) {
        token.classList.add(`relic-token--${slug}`);
      }
      token.title = relic.emotion || "Relic";
      token.setAttribute("aria-hidden", "true");
      return token;
    }
    function createLedgerButton(ctx) {
      const button = createElement("button", "inventory-button");
      button.type = "button";
      button.setAttribute(
        "aria-label",
        "Open the ledger of collected memories and relics"
      );
      const icon = createElement("span", "inventory-button__icon", "\u260D");
      icon.setAttribute("aria-hidden", "true");
      button.appendChild(icon);
      const label = createElement("span", "inventory-button__label", "Ledger");
      button.appendChild(label);
      button.addEventListener("click", () => showLedger(ctx));
      return button;
    }
    function createRunTracker(ctx, text) {
      const tracker = createElement("div", "run-tracker");
      const progress = createElement("span", "run-tracker__progress", text);
      registerResourceDisplay("progress", progress);
      tracker.appendChild(progress);
      const resources = createElement("div", "run-resources");
      const gold = createElement("span", "run-resources__item");
      registerResourceDisplay("gold", gold);
      resources.appendChild(gold);
      const essence = createElement("span", "run-resources__item");
      registerResourceDisplay("essence", essence);
      resources.appendChild(essence);
      const consumables = createElement("div", "run-resources__item run-resources__item--consumables");
      registerResourceDisplay("consumables", consumables);
      resources.appendChild(consumables);
      tracker.appendChild(resources);
      tracker.appendChild(createLedgerButton(ctx));
      updateResourceDisplays(ctx);
      return tracker;
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
        const classes = Array.isArray(options.extraClasses) ? options.extraClasses : [options.extraClasses];
        classes.filter((cls) => typeof cls === "string" && cls.trim().length > 0).forEach((cls) => element.classList.add(cls));
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
        lazy: false
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
          animate: shouldAnimate
        });
        if (encounterCharacter) {
          encounterElement = encounterCharacter.element;
          encounterSide.appendChild(encounterElement);
          if (shouldAnimate) {
            window.setTimeout(() => {
              if (encounterElement && encounterElement.isConnected) {
                encounterElement.classList.add("is-visible");
              }
            }, Math.max(0, Number(encounter.enterDelay) || 2e3));
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
        extraClasses: "character--well"
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
          return name ? `${name} materializes with a hostile shriek.` : "A hostile spirit rushes to bar your way.";
        case "elite":
          return name ? `${name} prowls the chamber, daring you to advance.` : "An elite apparition challenges you for the room.";
        case "boss":
          return name ? `${name} gathers its strength for a decisive clash.` : "A boss spirit towers over the foyer awaiting your challenge.";
        case "treasure":
          return "Glittering relics and bottled memories await your discerning grasp.";
        case "merchant":
          return name ? `You trade hushed words with ${name}, bartering for forbidden goods.` : "A spectral merchant beckons you toward a clandestine bargain.";
        case "recovery":
          return "A stillness settles here, inviting your essence to linger and mend.";
        default:
          return "You secure what you can from the chamber before returning to the corridor.";
      }
    }
    function isCombatEncounter(encounterType) {
      return encounterType === "combat" || encounterType === "elite" || encounterType === "boss";
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
      const ariaLabel = options.ariaLabel || screenDef.ariaLabel;
      updateBackground(image, ariaLabel);
    }
    function exitGame() {
      closeCodexOverlay();
      if (typeof window === "undefined") {
        return;
      }
      window.setTimeout(() => {
        window.close();
        try {
          window.location.href = "about:blank";
        } catch (error) {
        }
      }, 50);
    }
    async function transitionTo(screenKey, options = {}) {
      const screenDef = screens[screenKey];
      if (!screenDef) {
        console.error(`Attempted to transition to unknown screen: ${screenKey}`);
        throw new Error(`Unknown screen: ${screenKey}`);
      }
      if (state2.currentScreen === screenKey && !options.refresh) {
        return;
      }
      console.debug("Transitioning to screen", screenKey, options);
      await fadeToBlack();
      renderScreen(screenKey, options);
      await fadeFromBlack();
    }
    function renderScreen(screenKey, options = {}) {
      const screenDef = screens[screenKey];
      if (!screenDef) return;
      resetResourceDisplayRegistry();
      const context = {
        state: state2,
        transitionTo,
        showToast,
        options,
        updateResources: updateResourceDisplays,
        exitGame,
        helpers: screenHelpers
      };
      updateState({ activeScreenContext: context });
      let screenContent = null;
      try {
        screenContent = screenDef.render(context);
      } catch (error) {
        console.error(`Failed to render screen "${screenKey}"`, error);
        screenContent = createElement(
          "div",
          "screen screen--error",
          `Something went wrong while rendering ${screenKey}.`
        );
      }
      replaceContent(screenContent);
      setBackground(screenDef, options);
      const screenUpdates = { currentScreen: screenKey };
      if (screenDef.checkpoint) {
        screenUpdates.hasSave = true;
        screenUpdates.lastRunScreen = screenKey;
      }
      if (screenKey === "corridor") {
        screenUpdates.inRun = true;
      }
      updateState(screenUpdates);
      updateResourceDisplays(context);
    }
    function preloadImages(imageList) {
      imageList.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
    function initialize() {
      const initialScreen = screens.splash;
      console.debug("Initializing first screen", initialScreen?.key);
      setBackground(initialScreen, {});
      const splashContent = initialScreen.render({
        state: state2,
        transitionTo,
        showToast,
        options: {},
        helpers: screenHelpers
      });
      appendContent(splashContent);
      updateState({ currentScreen: "splash" });
      const imagesToPreload = /* @__PURE__ */ new Set();
      Object.values(screens).forEach((screen) => {
        imagesToPreload.add(getBackgroundForScreen(screen));
      });
      ROOM_DEFINITIONS.forEach((room) => {
        imagesToPreload.add(room.background);
      });
      imagesToPreload.add(FOYER_ROOM.background);
      [
        playerCharacter,
        ...enemySprites,
        ...bossSprites,
        ...merchantSprites
      ].forEach((sprite) => {
        if (sprite && sprite.src) {
          imagesToPreload.add(sprite.src);
        }
      });
      imagesToPreload.add(DOOR_SPRITES.base);
      imagesToPreload.add(DOOR_SPRITES.lock);
      Object.values(DOOR_SPRITES.icons || {}).forEach((src) => {
        if (src) {
          imagesToPreload.add(src);
        }
      });
      const preloadList = Array.from(imagesToPreload);
      console.debug("Preloading assets", preloadList.length);
      preloadImages(preloadList);
      console.info("Cebarti Manor: Initialization complete");
    }
    function startApplication() {
      try {
        console.debug("Ensuring game shell");
        ensureGameShell();
        initialize();
        console.info("Cebarti Manor: Application started");
      } catch (error) {
        console.error("Cebarti Manor failed to start", error);
        throw error;
      }
    }
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startApplication, { once: true });
      } else {
        startApplication();
      }
    } else {
      startApplication();
    }
  })();
})();
