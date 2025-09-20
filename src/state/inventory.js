import {
  adjustConsumableCount,
  adjustGold,
  awardRelic,
  ensurePlayerConsumables,
  getState,
  recordMemory,
} from "./state.js";
import { MAX_CONSUMABLE_SLOTS } from "./config.js";
import {
  getConsumableSlotLimit,
  getPlayerPassiveSummary,
} from "./passives.js";
import { CONSUMABLE_MAP, MEMORY_MAP, RELIC_MAP } from "../data/index.js";
import { isDevEntryDisabled } from "./devtools.js";

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

export function getConsumableCount(key) {
  if (!key) {
    return 0;
  }
  const consumables = ensurePlayerConsumables();
  return Number(consumables?.[key] || 0);
}

export function spendConsumableCharge(key, ctx) {
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

export function addGold(amount, ctx) {
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

export function addConsumable(key, count = 1, ctx) {
  if (!key || count === 0) {
    return false;
  }
  const context = resolveContext(ctx);
  if (isDevEntryDisabled("consumable", key)) {
    context.showToast?.("That consumable has been disabled.");
    return false;
  }
  ensurePlayerConsumables();
  const currentTotal = getTotalConsumables();
  let success = false;
  if (count > 0) {
    const capacity = getConsumableSlotLimit(context.state, MAX_CONSUMABLE_SLOTS);
    const remainingSlots = capacity - currentTotal;
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
        const message =
          amountToAdd === count
            ? `Added ${amountToAdd} × ${item.name} to your satchel.`
            : `Added ${amountToAdd} × ${item.name}. Your satchel cannot hold more.`;
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

export function addRelic(key, ctx) {
  if (!key) {
    return false;
  }
  const context = resolveContext(ctx);
  if (isDevEntryDisabled("relic", key)) {
    context.showToast?.("That relic has been disabled.");
    return false;
  }
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

export function addMemoryToState(key, ctx) {
  if (!key) {
    return false;
  }
  const context = resolveContext(ctx);
  if (isDevEntryDisabled("memory", key)) {
    context.showToast?.("That memory has been disabled.");
    return false;
  }
  if (!recordMemory(key)) {
    return false;
  }
  if (context.showToast) {
    const memory = MEMORY_MAP.get(key);
    context.showToast(`A new memory surfaces: ${memory?.name || key}.`);
  }
  notifyResourceUpdate(context);
  const passiveSummary = getPlayerPassiveSummary();
  const memoryGold = Math.max(0, Math.round(passiveSummary.memoryPickupGold || 0));
  if (memoryGold > 0) {
    addGold(memoryGold, context);
  }
  return true;
}
