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
    ...overrides,
  };
}

let state = null;

export function createState(overrides = {}) {
  state = createBaseState(overrides);
  return state;
}

export function getState() {
  if (!state) {
    state = createBaseState();
  }
  return state;
}

export function updateState(partial = {}) {
  const target = getState();
  Object.assign(target, partial);
  return target;
}

export function ensurePlayerConsumables() {
  const target = getState();
  if (!target.playerConsumables || typeof target.playerConsumables !== "object") {
    target.playerConsumables = {};
  }
  return target.playerConsumables;
}

export function ensurePlayerRelics() {
  const target = getState();
  if (!Array.isArray(target.playerRelics)) {
    target.playerRelics = [];
  }
  return target.playerRelics;
}

export function ensurePlayerMemories() {
  const target = getState();
  if (!Array.isArray(target.playerMemories)) {
    target.playerMemories = [];
  }
  return target.playerMemories;
}

export function ensureCodexSelections() {
  const target = getState();
  if (!target.codexSelections || typeof target.codexSelections !== "object") {
    target.codexSelections = {};
  }
  return target.codexSelections;
}

export function ensureResourceDisplays() {
  const target = getState();
  if (!target.resourceDisplays || typeof target.resourceDisplays !== "object") {
    target.resourceDisplays = {};
  }
  return target.resourceDisplays;
}

export function adjustGold(amount) {
  const target = getState();
  const current = Number(target.playerGold || 0);
  const delta = Math.round(Number(amount) || 0);
  const next = Math.max(0, current + delta);
  target.playerGold = next;
  return next;
}

export function adjustConsumableCount(key, delta) {
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

export function awardRelic(key) {
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

export function recordMemory(key) {
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

export function spendConsumable(key) {
  const consumables = ensurePlayerConsumables();
  if (!key || !consumables[key]) {
    return false;
  }
  const { quantity } = adjustConsumableCount(key, -1);
  return quantity >= 0;
}

export function incrementShroudGuard(amount = 1) {
  const target = getState();
  const current = Number(target.shroudGuardCharges || 0);
  const next = current + Math.round(Number(amount) || 0);
  target.shroudGuardCharges = Math.max(0, next);
  return target.shroudGuardCharges;
}

export function setEssenceValues(essence, maxEssence) {
  const target = getState();
  if (typeof maxEssence === "number") {
    target.playerMaxEssence = maxEssence;
  }
  if (typeof essence === "number") {
    target.playerEssence = essence;
  }
  return {
    essence: target.playerEssence,
    maxEssence: target.playerMaxEssence,
  };
}

export function setActiveCombat(combat) {
  updateState({ activeCombat: combat });
  return combat;
}

export function clearActiveCombat() {
  updateState({ activeCombat: null });
}

export function toggleDevMode() {
  const target = getState();
  target.devMode = !target.devMode;
  return target.devMode;
}

export function setCodexView(view) {
  updateState({ codexView: view });
  return view;
}

export function clearCodexView() {
  updateState({ codexView: null });
}
