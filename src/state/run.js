import {
  DOOR_CATEGORIES,
  FOYER_ROOM,
  ROOM_DEFINITIONS,
  ROOM_MAP,
  bossSprites,
  enemySprites,
  merchantSprites,
} from "../data/index.js";
import {
  clearActiveCombat,
  clearCodexView,
  updateState,
} from "./state.js";
import { sampleWithoutReplacement } from "./random.js";
import {
  DEFAULT_PLAYER_STATS,
  MERCHANT_BASE_DRAFT_COST,
} from "./config.js";
import { filterDevDisabledEntries } from "./devtools.js";

function buildInitialRoomPool() {
  return ROOM_DEFINITIONS.map((room) => room.key);
}

export function getDoorCategoryOptions(count) {
  const categories = sampleWithoutReplacement(DOOR_CATEGORIES, count);
  return categories.map((category) => ({ ...category }));
}

export function initializeRunState(options = {}) {
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
    currentRoomIsEnhanced: false,
  });
  clearCodexView();
  clearActiveCombat();
}

export function clearRunState(options = {}) {
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
    currentRoomIsEnhanced: false,
  });
  clearCodexView();
  clearActiveCombat();
}

function getEncounterPoolForType(type) {
  switch (type) {
    case "combat":
    case "elite":
      return filterDevDisabledEntries("enemy", enemySprites);
    case "boss":
      return filterDevDisabledEntries("boss", bossSprites);
    case "merchant":
      return filterDevDisabledEntries("merchant", merchantSprites);
    default:
      return null;
  }
}

export function getEncounterForType(type) {
  const pool = getEncounterPoolForType(type);
  if (!pool) {
    return null;
  }
  const [sprite] = sampleWithoutReplacement(pool, 1);
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

export async function goToRoom(ctx, roomKey, options = {}) {
  const room = ROOM_MAP.get(roomKey);
  if (!room) {
    ctx.showToast("That path is sealed.");
    return;
  }

  const currentPool = Array.isArray(ctx.state.roomPool)
    ? ctx.state.roomPool
    : [];
  const nextRoomPool = currentPool.filter((key) => key !== roomKey);
  updateState({ roomPool: nextRoomPool });

  let roomHistory = Array.isArray(ctx.state.roomHistory)
    ? ctx.state.roomHistory.slice()
    : [];
  if (roomHistory[roomHistory.length - 1] !== roomKey) {
    roomHistory = [...roomHistory, roomKey];
  }
  updateState({
    roomHistory,
    currentRoomNumber: roomHistory.length,
    currentRoomKey: roomKey,
    lastRunScreen: "room",
    corridorRefreshes: 0,
  });

  const encounterType = options.encounterType || null;
  updateState({
    currentEncounterType: encounterType,
    currentRoomIsEnhanced: !!options.enhanced,
  });
  const encounter = getEncounterForType(encounterType);
  updateState({ currentEncounter: encounter });

  await ctx.transitionTo("room", {
    room,
    background: room.background,
    ariaLabel: room.ariaLabel,
    encounterType,
    encounter,
  });
  ctx.showToast(`You enter ${room.name}.`);
}

export async function goToFoyer(ctx) {
  updateState({ roomPool: [] });

  let roomHistory = Array.isArray(ctx.state.roomHistory)
    ? ctx.state.roomHistory.slice()
    : [];
  if (roomHistory[roomHistory.length - 1] !== FOYER_ROOM.key) {
    roomHistory = [...roomHistory, FOYER_ROOM.key];
  }
  updateState({
    roomHistory,
    currentRoomNumber: roomHistory.length,
    currentRoomKey: FOYER_ROOM.key,
    lastRunScreen: "foyer",
    corridorRefreshes: 0,
  });

  updateState({
    currentEncounterType: "boss",
    currentRoomIsEnhanced: false,
  });
  const encounter = getEncounterForType("boss");
  updateState({ currentEncounter: encounter });

  await ctx.transitionTo("foyer", {
    encounterType: "boss",
    encounter,
  });
  ctx.showToast("The foyer looms ahead.");
}
