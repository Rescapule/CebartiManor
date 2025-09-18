import {
  CONSUMABLE_DEFINITIONS,
  CONSUMABLE_MAP,
  MEMORY_DEFINITIONS,
  MEMORY_MAP,
} from "../data/index.js";
import { MAX_CONSUMABLE_SLOTS, DEFAULT_PLAYER_STATS } from "../state/config.js";
import {
  adjustConsumableCount,
  ensurePlayerConsumables,
  getState,
  incrementShroudGuard,
  setEssenceValues,
  updateState,
} from "../state/state.js";
import { addGold } from "../state/inventory.js";
import { sampleWithoutReplacement } from "../state/random.js";
import { createElement } from "./dom.js";
import { updateCombatUI } from "./combat.js";
import { formatPassiveDescription } from "./codex.js";

function resolveContext(ctx) {
  if (ctx && typeof ctx === "object") {
    if (ctx.state) {
      return ctx;
    }
    return { ...ctx, state: getState() };
  }
  return { state: getState() };
}

function triggerResourceUpdate(ctx) {
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
  const state = getState();
  const packCount = 3;
  if (!Array.isArray(state.draftPacks) || state.draftPacks.length === 0) {
    updateState({
      draftPacks: createMemoryDraftPacks(packCount, 3),
      selectedDrafts: new Array(packCount).fill(null),
      playerMemories: [],
    });
  }
  const currentState = getState();
  if (!Array.isArray(currentState.selectedDrafts)) {
    updateState({
      selectedDrafts: new Array(currentState.draftPacks.length).fill(null),
    });
  }
}

export function renderMemoryDraft(ctx) {
  ensureDraftState();
  const context = resolveContext(ctx);
  const state = context.state;

  const container = createElement("div", "memory-draft");
  const summary = createElement(
    "div",
    "memory-draft__summary",
    state.playerMemories.length === state.draftPacks.length
      ? "Draft complete. Review your memories before continuing."
      : "Draft three memories to define your starting action pool."
  );
  container.appendChild(summary);

  state.draftPacks.forEach((pack, index) => {
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
    container.appendChild(column);
  });

  const chosenList = createElement("ul", "memory-draft__chosen");
  state.selectedDrafts.forEach((key, idx) => {
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
    const state = getState();
    const selectedDrafts = state.selectedDrafts.slice();
    selectedDrafts[packIndex] = memory.key;
    updateState({
      selectedDrafts,
      playerMemories: selectedDrafts.filter(Boolean),
    });
    updateMemoryDraftSelection(ctx);
  });

  return card;
}

export function updateMemoryDraftSelection(ctx) {
  const context = resolveContext(ctx);
  const state = context.state;

  const draftContainers = document.querySelectorAll(".memory-card");
  draftContainers.forEach((card) => {
    const packIndex = Number(card.dataset.packIndex);
    const key = card.dataset.memoryKey;
    if (state.selectedDrafts[packIndex] === key) {
      card.classList.add("is-selected");
    } else {
      card.classList.remove("is-selected");
    }
  });

  const chosenItems = document.querySelectorAll(".memory-draft__chosen-item");
  chosenItems.forEach((item, index) => {
    const key = state.selectedDrafts[index];
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
    if (state.playerMemories.length === state.draftPacks.length) {
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
      state.playerMemories.length !== state.draftPacks.length;
  }
}

export function renderConsumableDisplay(container, ctx) {
  if (!container) {
    return;
  }
  const context = resolveContext(ctx);
  const state = context.state;
  container.classList.add("run-resources__item", "run-resources__item--consumables");

  const label = createElement("span", "run-resources__label", "Consumables");
  const slotRow = createElement("div", "consumable-slots");

  const items = [];
  CONSUMABLE_DEFINITIONS.forEach((definition) => {
    const count = Number(state.playerConsumables?.[definition.key] || 0);
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
    button.title = tooltipParts.join(" — ");
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

  container.replaceChildren(label, slotRow);
}

function useConsumable(ctx, key) {
  const context = resolveContext(ctx);
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
        const state = getState();
        const before = state.playerEssence || 0;
        const cappedMax = state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
        const nextEssence = Math.min(cappedMax, before + amount);
        setEssenceValues(nextEssence);
        gainedEssence = Math.max(0, Math.round(nextEssence - before));
        message =
          gainedEssence > 0
            ? `You restore ${gainedEssence} Essence.`
            : "You are already at full essence.";
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
        const state = getState();
        const previousMax = state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
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
  const state = getState();
  if (
    gainedEssence > 0 &&
    state.activeCombat &&
    state.activeCombat.status === "inProgress"
  ) {
    state.activeCombat.player.essence = Math.min(
      state.activeCombat.player.maxEssence,
      state.activeCombat.player.essence + gainedEssence
    );
    updateCombatUI(state.activeCombat);
  }
  triggerResourceUpdate(context);
}
