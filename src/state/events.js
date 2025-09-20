import {
  EVENT_DEFINITIONS,
  EVENT_MAP,
  ROOM_EVENT_FLAVORS,
  RELIC_DEFINITIONS,
  RELIC_MAP,
  MEMORY_MAP,
} from "../data/index.js";
import { filterDevDisabledEntries } from "./devtools.js";
import { sampleWithoutReplacement } from "./random.js";
import { getState } from "./state.js";
import { addRelic, removeRelic, removeMemory } from "./inventory.js";

function getFlavor(roomKey, eventKey) {
  const roomData = ROOM_EVENT_FLAVORS?.[roomKey];
  if (!roomData) {
    return null;
  }
  return roomData?.[eventKey] || null;
}

export function createEventEncounter(roomKey, options = {}) {
  const availableEvents = filterDevDisabledEntries("event", EVENT_DEFINITIONS);
  if (!availableEvents || availableEvents.length === 0) {
    return null;
  }

  let selected = null;
  if (options?.eventKey) {
    const explicit = EVENT_MAP.get(options.eventKey);
    if (explicit) {
      const available = filterDevDisabledEntries("event", [explicit]);
      if (available.length > 0) {
        selected = explicit;
      }
    }
  }

  if (!selected) {
    const [choice] = sampleWithoutReplacement(availableEvents, 1);
    selected = choice || availableEvents[0];
  }

  if (!selected) {
    return null;
  }

  return {
    type: "event",
    key: selected.key,
    definition: selected,
    roomKey,
    flavor: getFlavor(roomKey, selected.key),
    resolved: false,
    result: null,
  };
}

function getOwnedRelics() {
  const state = getState();
  return Array.isArray(state.playerRelics) ? state.playerRelics.slice() : [];
}

function getOwnedMemories() {
  const state = getState();
  return Array.isArray(state.playerMemories) ? state.playerMemories.slice() : [];
}

export function awardRandomRelicFromEvent(eventEncounter, ctx) {
  const definition = eventEncounter?.definition;
  if (!definition) {
    return { success: false, reason: "noDefinition" };
  }
  const count = Math.max(1, Number(definition.effect?.count) || 1);
  const owned = new Set(getOwnedRelics());
  const eligibleRelics = filterDevDisabledEntries(
    "relic",
    RELIC_DEFINITIONS
  ).filter((relic) => relic && !owned.has(relic.key));
  if (eligibleRelics.length === 0) {
    return { success: false, reason: "noEligibleRelics" };
  }
  const selections = sampleWithoutReplacement(eligibleRelics, count);
  const awarded = [];
  selections.forEach((relic) => {
    if (relic && addRelic(relic.key, ctx)) {
      awarded.push(relic);
      owned.add(relic.key);
    }
  });
  if (awarded.length === 0) {
    return { success: false, reason: "noEligibleRelics" };
  }
  return {
    success: true,
    relics: awarded,
  };
}

export function getEventSacrificeOptions() {
  const relicOptions = getOwnedRelics()
    .map((key) => RELIC_MAP.get(key))
    .filter(Boolean)
    .map((relic) => ({ type: "relic", key: relic.key, name: relic.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const memoryOptions = getOwnedMemories()
    .map((key) => MEMORY_MAP.get(key))
    .filter(Boolean)
    .map((memory) => ({ type: "memory", key: memory.key, name: memory.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { relics: relicOptions, memories: memoryOptions };
}

export function sacrificeEventOffering(choice, ctx) {
  if (!choice || !choice.key || !choice.type) {
    return { success: false, reason: "invalidChoice" };
  }
  if (choice.type === "relic") {
    const relic = RELIC_MAP.get(choice.key);
    if (!relic) {
      return { success: false, reason: "invalidChoice" };
    }
    const removed = removeRelic(relic.key, ctx);
    if (!removed) {
      return { success: false, reason: "removeFailed" };
    }
    return { success: true, type: "relic", key: relic.key, name: relic.name };
  }
  if (choice.type === "memory") {
    const memory = MEMORY_MAP.get(choice.key);
    if (!memory) {
      return { success: false, reason: "invalidChoice" };
    }
    const removed = removeMemory(memory.key, ctx);
    if (!removed) {
      return { success: false, reason: "removeFailed" };
    }
    return { success: true, type: "memory", key: memory.key, name: memory.name };
  }
  return { success: false, reason: "invalidChoice" };
}

export function describeEventOutcome(eventEncounter, outcome) {
  if (!eventEncounter || !eventEncounter.definition) {
    return null;
  }
  const flavor = eventEncounter.flavor || getFlavor(eventEncounter.roomKey, eventEncounter.key);
  if (!outcome?.success) {
    return flavor?.failure || null;
  }
  return flavor?.resolution || null;
}
