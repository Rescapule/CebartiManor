import {
  playerCharacter,
  enemySprites,
  bossSprites,
  BESTIARY_PAGES,
  RELIC_DEFINITIONS,
  CONSUMABLE_DEFINITIONS,
  RELIC_MAP,
  CONSUMABLE_MAP,
  MEMORY_DEFINITIONS,
  MEMORY_MAP,
  ENEMY_DEFINITIONS,
} from "../data/index.js";
import { ACTION_DEFINITIONS } from "../combat/actions-data.js";
import { ACTION_SEQUENCES } from "../combat/actions.js";
import {
  clearCodexView,
  ensureCodexSelections,
  getState,
  setCodexView,
  toggleDevMode,
} from "../state/state.js";
import { isDevEntryDisabled, toggleDevEntryDisabled } from "../state/devtools.js";
import { createElement } from "./dom.js";

function resolveContext(ctx) {
  if (ctx && typeof ctx === "object") {
    if (ctx.state) {
      return ctx;
    }
    return { ...ctx, state: getState() };
  }
  return { state: getState() };
}

function slugifyEmotion(value) {
  return (value || "mystery")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function closeCodexOverlay() {
  const state = getState();
  const codexView = state.codexView;
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
    pageIndex: codexView.pageIndex || 0,
  };
  if (mode) {
    const selections = ensureCodexSelections();
    selections[mode] = selection;
  }
  clearCodexView();
}

function getNestedValue(source, path = []) {
  if (!source || !Array.isArray(path)) {
    return undefined;
  }
  return path.reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }
    return undefined;
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
  const { min = null, max = null, step = "any", formatValue = null, onChange = null } =
    options || {};
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
    },
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
    },
  };
}

function buildStatusEffectTextData(effects) {
  if (!effects || typeof effects !== "object") {
    return { text: "", bindings: [] };
  }
  const parts = [];
  const bindings = [];
  Object.entries(effects).forEach(([key, amount]) => {
    if (amount === undefined || amount === null) {
      return;
    }
    let label = "";
    if (typeof formatStatusLabel === "function") {
      label = formatStatusLabel(key, { stacks: amount });
    }
    if (!label) {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^\s+|\s+$/g, "")
        .replace(/^./, (char) => char.toUpperCase());
      const numericAmount = Number(amount);
      label = Number.isFinite(numericAmount)
        ? `${formattedKey} ${numericAmount}`
        : formattedKey;
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
  const seen = new Set();
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
    const contributions = Array.isArray(memory.contributions)
      ? memory.contributions
          .map((entry, index) => {
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
              weightBinding: bindingSource
                ? createDevNumberBinding(bindingSource, ["weight"])
                : null,
            };
          })
          .filter(Boolean)
      : [];
    const detailParagraphs = [];
    if (memory.description) {
      detailParagraphs.push({
        text: memory.description,
        bindingSource: { object: memory, path: ["description"] },
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
      iconSymbol: memory.name.charAt(0).toUpperCase(),
    });
  });
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function buildRelicEntriesFromKeys(keys = []) {
  const seen = new Set();
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
      iconSymbol: relic.name.charAt(0).toUpperCase(),
    });
  });
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function buildConsumableEntriesFromKeys(keys = []) {
  const seen = new Set();
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
        bindingSource: { object: consumable, path: ["description"] },
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
      iconSymbol: consumable.icon || consumable.name.charAt(0).toUpperCase(),
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
  return `Cost: ${parts.join(" • ")}.`;
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
      devBinding: createDevNumberBinding(action, ["baseDamage"]),
    });
  }
  const block = Number(action.block);
  if (Number.isFinite(block) && block !== 0) {
    stats.push({
      label: "Block",
      value: block,
      devBinding: createDevNumberBinding(action, ["block"]),
    });
  }
  const heal = Number(action.heal);
  if (Number.isFinite(heal) && heal !== 0) {
    stats.push({
      label: "Heal",
      value: heal,
      devBinding: createDevNumberBinding(action, ["heal"]),
    });
  }
  if (action.apply) {
    const statusData = buildStatusEffectTextData(action.apply);
    if (statusData.text) {
      stats.push({
        label: "Applies",
        value: { text: statusData.text },
        textBindingResolver: (matchValue, matchIndex) =>
          statusData.bindings[matchIndex] || null,
      });
    }
  }
  return stats;
}

function buildActionEntriesFromKeys(keys = []) {
  const seen = new Set();
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
        bindingSource: { object: action, path: ["description"] },
      });
    }
    const costLine = formatActionCostLine(action.cost);
    if (costLine) {
      const costPaths = [];
      if (Number.isFinite(Number(action.cost?.ap)) && Number(action.cost.ap) > 0) {
        costPaths.push(["cost", "ap"]);
      }
      if (
        Number.isFinite(Number(action.cost?.essence)) &&
        Number(action.cost.essence) > 0
      ) {
        costPaths.push(["cost", "essence"]);
      }
      paragraphs.push({
        text: costLine,
        bindingResolver: (matchValue, matchIndex) => {
          const path = costPaths[matchIndex];
          return path ? createDevNumberBinding(action, path, { min: 0 }) : null;
        },
      });
    }
    if (action.chain) {
      const sequence = ACTION_SEQUENCES[action.chain.key] || [];
      if (sequence.length > 0) {
        const chainText = sequence
          .map((actionKey) => ACTION_DEFINITIONS[actionKey]?.name || actionKey)
          .join(" → ");
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
      stats: buildActionStats(action),
    });
  });
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function buildEnemyEntriesFromKeys(keys = [], type = "enemy") {
  const seen = new Set();
  const entries = [];
  const spriteSources =
    type === "boss"
      ? bossSprites
      : [...enemySprites, ...bossSprites];
  const spriteMap = new Map(spriteSources.map((sprite) => [sprite.key, sprite]));
  const defaultKeys =
    type === "boss"
      ? bossSprites.map((sprite) => sprite.key)
      : enemySprites.map((sprite) => sprite.key);
  const sourceKeys =
    Array.isArray(keys) && keys.length > 0 ? keys : defaultKeys;
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
    const name =
      sprite?.name ||
      definition?.name ||
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^-+|-+$/g, "")
        .replace(/^./, (char) => char.toUpperCase());
    const detailParagraphs = [];
    if (sprite?.alt) {
      detailParagraphs.push(sprite.alt);
    }
    const stats = [];
    if (Number.isFinite(Number(definition?.maxEssence))) {
      stats.push({
        label: "Max Essence",
        value: Number(definition.maxEssence),
        devBinding: definition
          ? createDevNumberBinding(definition, ["maxEssence"], { min: 1 })
          : null,
      });
    }
    const moves = Array.isArray(definition?.moves)
      ? definition.moves.map((move) => {
          const descriptionData = buildMoveDescriptionData(move);
          return {
            key: move.key,
            name: move.name || move.key,
            description: descriptionData,
          };
        })
      : [];
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
      spriteAlt: sprite?.alt || name,
    });
  });
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function buildBossEntriesFromKeys(keys = []) {
  return buildEnemyEntriesFromKeys(keys, "boss");
}

function buildPlayerGhostEntriesFromKeys(keys = []) {
  const entries = [];
  const spriteMap = new Map([[playerCharacter.key, playerCharacter]]);
  const sourceKeys =
    Array.isArray(keys) && keys.length > 0 ? keys : [playerCharacter.key];
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
      iconSymbol: sprite.name ? sprite.name.charAt(0).toUpperCase() : "☽",
      spriteSrc: sprite.src || null,
      spriteAlt: sprite.alt || sprite.name || "Player Ghost",
    });
  });
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function formatTitleCase(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "";
  }
  return value
    .split(/[\s_-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatPassiveDescription(passive = {}) {
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
  const state = getState();
  const section = createElement("section", "codex-consumables");
  const title = createElement("h3", "codex-consumables__title", "Consumables");
  section.appendChild(title);

  const entries = Object.entries(state.playerConsumables || {}).filter(
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
      `×${Number(count)}`
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
    emptyMessage = "No entries recorded in this ledger.",
  } = options;

  const state = getState();
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
    playerGhost: playerGhostEntries,
  };

  const defaultSections = [
    { type: "memory", emptyText: "No memories recorded in this ledger." },
    { type: "relic", emptyText: "No relics recorded in this ledger." },
  ];
  if (consumableEntries.length > 0) {
    defaultSections.push({
      type: "consumable",
      emptyText: "No consumables catalogued.",
    });
  }

  const pages =
    Array.isArray(customPages) && customPages.length > 0
      ? customPages
      : [
          {
            key: "default",
            title: "",
            sections: defaultSections,
          },
        ];

  target.replaceChildren();

  const hasMultiplePages = pages.length > 1;
  const shellClassNames = ["codex-shell", `codex-shell--${layout}`];
  if (hasMultiplePages) {
    shellClassNames.push("codex-shell--paged");
  }
  const shell = createElement("div", shellClassNames.join(" "));
  const codex = createElement("div", `codex codex--${layout}`);
  const pageTitle = hasMultiplePages
    ? createElement("h3", "codex__page-title")
    : null;
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
    navPrev = createElement("button", "codex-nav codex-nav--prev", "←");
    navPrev.type = "button";
    navPrev.setAttribute("aria-label", "Previous page");
    navNext = createElement("button", "codex-nav codex-nav--next", "→");
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

    const isDevMode = !!state.devMode;
    const isBestiaryView = state.codexView?.mode === "bestiary";
    const entryDisabled =
      entry && entry.type && entry.key
        ? isDevEntryDisabled(entry.type, entry.key)
        : false;

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

    function appendTextWithNumericHighlight(target, text, options = {}) {
      if (text === undefined || text === null) {
        return;
      }
      const stringValue = String(text);
      if (!/[0-9]/.test(stringValue)) {
        target.appendChild(document.createTextNode(stringValue));
        return;
      }
      if (!isDevMode) {
        target.appendChild(document.createTextNode(stringValue));
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
        if (typeof options.bindingResolver === "function") {
          binding = options.bindingResolver(match[0], matchIndex);
        } else if (options.bindingSource) {
          const { object, path, options: bindingOptions } = options.bindingSource;
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
      target.appendChild(fragment);
    }

    iconButtons.forEach((button) => {
      if (
        button.dataset.entryKey === entry.key &&
        button.dataset.entryType === entry.type
      ) {
        button.classList.add("is-selected");
      } else {
        button.classList.remove("is-selected");
      }
    });

    const iconClassNames = [
      "codex-detail__icon",
      `codex-detail__icon--${entry.type}`,
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

    const headerRow = createElement("div", "codex-detail__header");
    const nameElement = createElement("h3", "codex-detail__name", entry.name);
    if (entryDisabled) {
      nameElement.classList.add("codex-detail__name--disabled");
    }
    headerRow.appendChild(nameElement);

    if (isDevMode && isBestiaryView && entry.type && entry.key) {
      const toggleButton = createElement(
        "button",
        "codex-dev-disable",
        entryDisabled ? "Enable in Runs" : "Disable in Runs"
      );
      toggleButton.type = "button";
      toggleButton.setAttribute("aria-pressed", String(entryDisabled));
      toggleButton.title = entryDisabled
        ? "Disabled entries will not appear in rewards, drafts, or inventories during runs."
        : "Prevent this entry from appearing in rewards, drafts, or inventories during runs.";
      toggleButton.setAttribute("aria-label", toggleButton.title);
      if (entryDisabled) {
        toggleButton.classList.add("codex-dev-disable--active");
      }
      toggleButton.addEventListener("click", () => {
        toggleDevEntryDisabled(entry.type, entry.key);
        refreshCodexOverlay();
      });
      headerRow.appendChild(toggleButton);
    }

    detail.appendChild(headerRow);

    if (isBestiaryView && entryDisabled) {
      detail.appendChild(
        createElement(
          "p",
          "codex-detail__dev-note",
          "This entry is disabled and will not appear during runs until re-enabled."
        )
      );
    }

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
            bindingSource: stat.bindingSource,
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
        const paragraphData =
          typeof paragraph === "string" ? { text: paragraph } : paragraph;
        if (
          !paragraphData ||
          typeof paragraphData.text !== "string" ||
          paragraphData.text.trim().length === 0
        ) {
          return;
        }
        const description = createElement("p", "codex-detail__description");
        appendTextWithNumericHighlight(description, paragraphData.text, {
          bindingResolver: paragraphData.bindingResolver,
          bindingSource: paragraphData.bindingSource,
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
        const formattedWeight = Number.isFinite(weight)
          ? weight % 1 === 0
            ? String(weight)
            : weight.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")
          : "";
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
        const descriptionData =
          typeof move.description === "string"
            ? { text: move.description }
            : move.description;
        if (descriptionData && descriptionData.text) {
          item.appendChild(document.createTextNode(" — "));
          appendTextWithNumericHighlight(item, descriptionData.text, {
            bindingResolver: descriptionData.bindingResolver,
            bindingSource: descriptionData.bindingSource,
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
    playerGhost: "Player Ghosts",
  };

  function createSection(section, entries, pageIndex) {
    const sectionElement = createElement(
      "section",
      `codex-section codex-section--${section.type}`
    );
    const titleText =
      section.title || sectionLabels[section.type] || formatTitleCase(section.type);
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
          `codex-icon codex-icon--${entry.type} ${
            entry.emotionSlug ? `codex-icon--${entry.emotionSlug}` : ""
          }`
        );
        button.type = "button";
        button.dataset.entryKey = entry.key;
        button.dataset.entryType = entry.type;
        const devDisabled =
          entry && entry.type && entry.key
            ? isDevEntryDisabled(entry.type, entry.key)
            : false;
        const tooltipParts = [entry.name];
        if (entry.summary) {
          tooltipParts.push(entry.summary);
        }
        if (devDisabled) {
          tooltipParts.push("Disabled");
        }
        const tooltipText = tooltipParts.join(" — ");
        button.title = tooltipText;
        button.setAttribute("aria-label", entry.name);
        if (devDisabled) {
          button.classList.add("codex-icon--disabled");
          button.dataset.devDisabled = "true";
        }
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
    const foundIndex = pages.findIndex((page) =>
      page.sections.some((section) =>
        (entriesByType[section.type] || []).some(
          (entry) =>
            entry.key === selectionKey && entry.type === selectionType
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
        selectedEntry =
          availableEntries.find(
            (entry) =>
              entry.key === viewState.selectedKey &&
              entry.type === viewState.selectedType
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
  const state = getState();
  const isActive = !!state.devMode;
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

export function refreshCodexOverlay(ctxOverride) {
  const state = getState();
  const view = state.codexView;
  if (!view || typeof view.renderContent !== "function") {
    return;
  }
  const context = resolveContext(ctxOverride || view.ctx || {});
  view.ctx = context;
  updateDevModeUI(view);
  if (!view.content) {
    return;
  }
  view.content.replaceChildren();
  view.renderContent(view.content, context, view);
}

function openCodexOverlay(mode, titleText, ctx, renderContent) {
  const state = getState();
  if (state.codexView && state.codexView.mode === mode) {
    const nextView = {
      ...state.codexView,
      ctx: resolveContext(ctx || state.codexView.ctx || {}),
    };
    setCodexView(nextView);
    refreshCodexOverlay(ctx);
    return;
  }

  const storedSelection = state.codexSelections?.[mode] || {
    key: null,
    type: null,
    pageIndex: 0,
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
    ctx: resolveContext(ctx),
    handleKeydown,
    selectedKey: storedSelection.key,
    selectedType: storedSelection.type,
    pageIndex: storedSelection.pageIndex || 0,
    renderContent,
    devToggleButton,
  });

  updateDevModeUI(getState().codexView);
  refreshCodexOverlay(ctx);
  window.requestAnimationFrame(() => closeButton.focus());
}

export function showLedger(ctx) {
  openCodexOverlay("ledger", "Memory Ledger", ctx, (target, renderCtx, viewState) => {
    const context = resolveContext(renderCtx);
    const state = context.state;
    const memoryKeys = Array.isArray(state?.playerMemories)
      ? state.playerMemories
      : getState().playerMemories || [];
    const relicKeys = Array.isArray(state?.playerRelics)
      ? state.playerRelics
      : getState().playerRelics || [];

    const codexContainer = createElement("div");
    renderCodexContent(codexContainer, {
      layout: "overlay",
      viewState,
      memoryKeys,
      relicKeys,
      emptyMessage: "No memories or relics have been recorded yet.",
    });
    target.appendChild(codexContainer);

    const consumablesSection = createConsumablesSection(context);
    if (consumablesSection) {
      target.appendChild(consumablesSection);
    }
  });
}

export function showBestiary(ctx) {
  openCodexOverlay(
    "bestiary",
    "Manor Bestiary",
    ctx,
    (target, renderCtx, viewState) => {
      const context = resolveContext(renderCtx);
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
        emptyMessage: "Entries will appear here as development continues.",
      });
      target.appendChild(codexContainer);
    }
  );
}
