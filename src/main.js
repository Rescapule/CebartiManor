import {
  backgrounds,
  playerCharacter,
  enemySprites,
  bossSprites,
  merchantSprites,
  DOOR_SPRITES,
  BESTIARY_PAGES,
  ENHANCED_GOLD_MULTIPLIER,
  RELIC_DEFINITIONS,
  CONSUMABLE_DEFINITIONS,
  RELIC_MAP,
  CONSUMABLE_MAP,
  MEMORY_DEFINITIONS,
  MEMORY_MAP,
  ROOM_DEFINITIONS,
  FOYER_ROOM,
} from "./data/index.js";
import {
  adjustConsumableCount,
  adjustGold,
  awardRelic,
  clearCodexView,
  createState,
  ensureCodexSelections,
  ensurePlayerConsumables,
  ensureResourceDisplays,
  getState,
  incrementShroudGuard,
  recordMemory,
  setActiveCombat,
  setCodexView,
  setEssenceValues,
  toggleDevMode,
  updateState,
} from "./state/state.js";
import { sampleWithoutReplacement } from "./state/random.js";
import {
  MAX_CONSUMABLE_SLOTS,
  MERCHANT_BASE_DRAFT_COST,
  MERCHANT_DRAFT_COST_INCREMENT,
  DEFAULT_PLAYER_STATS,
} from "./state/config.js";
import {
  appendContent,
  createElement,
  fadeFromBlack,
  fadeToBlack,
  replaceContent,
  showToast,
  updateBackground,
} from "./ui/dom.js";
import {
  ACTION_DEFINITIONS,
  createCombatExperience,
  applyRecoveryRoomBenefits,
  createRewardsPanel,
  createMerchantPanel,
} from "./combat/engine.js";
import {
  ACTION_SEQUENCES,
  createCoreContribution,
  createMultiCoreContribution,
} from "./combat/actions.js";
import screenModules from "./ui/screens/index.js";

(function () {

  const state = createState({
    playerEssence: DEFAULT_PLAYER_STATS.maxEssence,
    playerMaxEssence: DEFAULT_PLAYER_STATS.maxEssence,
    merchantDraftCost: MERCHANT_BASE_DRAFT_COST,
  });

  const screens = {};
  screenModules.forEach((screen) => {
    screens[screen.key] = screen;
  });

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
    isCombatEncounter,
  };

  function resetResourceDisplayRegistry() {
    updateState({
      resourceDisplays: {
        progress: [],
        gold: [],
        essence: [],
        consumables: [],
      },
    });
  }

  function registerResourceDisplay(type, element) {
    const registry = ensureResourceDisplays();
    if (!registry[type]) {
      registry[type] = [];
    }
    registry[type].push(element);
  }

  function getTotalConsumables() {
    const consumables = ensurePlayerConsumables();
    if (!consumables) {
      return 0;
    }
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
    if (!key || !state.playerConsumables || !state.playerConsumables[key]) {
      return false;
    }
    state.playerConsumables[key] -= 1;
    if (state.playerConsumables[key] <= 0) {
      delete state.playerConsumables[key];
    }
    updateResourceDisplays(ctx);
    return true;
  }

  function renderConsumableDisplay(container, ctx) {
    if (!container) {
      return;
    }
    container.classList.add("run-resources__item", "run-resources__item--consumables");
    const context = ctx || state.activeScreenContext || { state };

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

  function updateResourceDisplays(ctx) {
    const goldValue = state.playerGold || 0;
    const essenceValue = Math.max(0, Math.round(state.playerEssence || 0));
    const maxEssenceValue = Math.max(
      essenceValue,
      Math.round(state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence)
    );
    if (state.resourceDisplays?.gold) {
      state.resourceDisplays.gold.forEach((element) => {
        element.textContent = `Gold ${goldValue}`;
      });
    }
    if (state.resourceDisplays?.essence) {
      state.resourceDisplays.essence.forEach((element) => {
        element.textContent = `Essence ${essenceValue}/${maxEssenceValue}`;
      });
    }
    if (state.resourceDisplays?.consumables) {
      state.resourceDisplays.consumables.forEach((element) => {
        renderConsumableDisplay(element, ctx);
      });
    }
    refreshCodexOverlay();
  }

  function createRelicToken(relic) {
    const token = createElement("span", "relic-token");
    const slug = (relic.emotion || "colorless")
      .toLowerCase()
      .replace(/[^a-z]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
    const icon = createElement("span", "inventory-button__icon", "☍");
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

  function slugifyEmotion(value) {
    return (value || "mystery")
      .toLowerCase()
      .replace(/[^a-z]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function closeCodexOverlay() {
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
    const effectParts = [];
    if (Number.isFinite(Number(move.damage)) && Number(move.damage) !== 0) {
      effectParts.push(`Damage ${Number(move.damage)}`);
      bindings.push(createDevNumberBinding(move, ["damage"]));
    }
    if (Number.isFinite(Number(move.block)) && Number(move.block) !== 0) {
      effectParts.push(`Block ${Number(move.block)}`);
      bindings.push(createDevNumberBinding(move, ["block"]));
    }
    if (Number.isFinite(Number(move.heal)) && Number(move.heal) !== 0) {
      effectParts.push(`Heal ${Number(move.heal)}`);
      bindings.push(createDevNumberBinding(move, ["heal"]));
    }
    if (move.apply) {
      const statusData = buildStatusEffectTextData(move.apply);
      if (statusData.text) {
        effectParts.push(`Applies ${statusData.text}`);
        statusData.bindings.forEach((binding) => bindings.push(binding));
      }
    }
    if (effectParts.length > 0) {
      segments.push(effectParts.join(" • "));
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
      entries.push({
        key: consumable.key,
        type: "consumable",
        name: consumable.name,
        summary: consumable.description || "",
        detailParagraphs: [consumable.description].filter(Boolean),
        iconSymbol: consumable.icon || consumable.name.charAt(0).toUpperCase(),
      });
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  function buildActionEntriesFromKeys(keys = []) {
    const seen = new Set();
    const entries = [];
    const sourceKeys =
      Array.isArray(keys) && keys.length > 0
        ? keys
        : Object.keys(ACTION_DEFINITIONS || {});
    sourceKeys.forEach((key) => {
      if (seen.has(key)) {
        return;
      }
      const action = ACTION_DEFINITIONS[key];
      if (!action) {
        return;
      }
      seen.add(key);
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

  function formatTitleCase(value) {
    if (typeof value !== "string" || value.trim().length === 0) {
      return "";
    }
    return value
      .split(/[\s_-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }

  function createConsumablesSection(ctx) {
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
        consumable ? `${consumable.name} (x${count})` : `${key} (x${count})`
      );
      if (consumable?.description) {
        label.title = consumable.description;
      }
      item.appendChild(label);
      if (consumable) {
        const useButton = createElement(
          "button",
          "button button--ghost codex-consumables__action",
          "Use"
        );
        useButton.type = "button";
        useButton.addEventListener("click", () => {
          useConsumable(ctx || { state }, key);
        });
        item.appendChild(useButton);
      }
      list.appendChild(item);
    });
    section.appendChild(list);
    return section;
  }

  function renderCodexContent(target, options) {
    const {
      memoryKeys = [],
      actionKeys = [],
      relicKeys = [],
      consumableKeys = [],
      enemyKeys = [],
      bossKeys = [],
      playerGhostKeys = [],
      layout = "overlay",
      viewState = {},
      emptyMessage = "No entries recorded yet.",
      pages: customPages = null,
    } = options || {};

    const memoryEntries = buildMemoryEntriesFromKeys(memoryKeys);
    const actionEntries = buildActionEntriesFromKeys(actionKeys);
    const relicEntries = buildRelicEntriesFromKeys(relicKeys);
    const consumableEntries = buildConsumableEntriesFromKeys(consumableKeys);
    const enemyEntries = buildEnemyEntriesFromKeys(enemyKeys, "enemy");
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

      detail.appendChild(
        createElement("h3", "codex-detail__name", entry.name)
      );

      const typeLabels = {
        memory: "Memory",
        action: "Action",
        relic: "Relic",
        consumable: "Consumable",
        enemy: "Enemy",
        boss: "Boss",
        playerGhost: "Player Ghost",
      };
      const metaParts = [typeLabels[entry.type] || "Entry"];
      if (entry.emotion) {
        metaParts.push(entry.emotion);
      }
      if (metaParts.length > 0) {
        detail.appendChild(
          createElement("p", "codex-detail__meta", metaParts.join(" • "))
        );
      }

      if (Array.isArray(entry.stats) && entry.stats.length > 0) {
        const statsList = createElement("ul", "codex-detail__stats");
        entry.stats.forEach((stat) => {
          if (!stat || !stat.label || stat.value === undefined || stat.value === null) {
            return;
          }
          const statItem = createElement("li", "codex-detail__stat");
          statItem.appendChild(
            document.createTextNode(`${stat.label}: `)
          );
          if (typeof stat.value === "number" && Number.isFinite(stat.value)) {
            if (isDevMode && stat.devBinding) {
              statItem.appendChild(
                createDevEditableValue(String(stat.value), stat.devBinding)
              );
            } else {
              statItem.appendChild(document.createTextNode(String(stat.value)));
            }
          } else if (
            stat.value &&
            typeof stat.value === "object" &&
            typeof stat.value.text === "string"
          ) {
            appendTextWithNumericHighlight(statItem, stat.value.text, {
              bindingResolver: stat.value.bindingResolver,
              bindingSource: stat.value.bindingSource,
            });
          } else {
            appendTextWithNumericHighlight(statItem, stat.value, {
              bindingResolver: stat.textBindingResolver,
            });
          }
          statsList.appendChild(statItem);
        });
        if (statsList.childElementCount > 0) {
          detail.appendChild(statsList);
        }
      }

      if (entry.detailParagraphs && entry.detailParagraphs.length > 0) {
        entry.detailParagraphs.forEach((paragraph) => {
          const paragraphData =
            typeof paragraph === "string"
              ? { text: paragraph }
              : paragraph;
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
        section.title ||
        sectionLabels[section.type] ||
        formatTitleCase(section.type);
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
          const tooltipParts = [entry.name];
          if (entry.summary) {
            tooltipParts.push(entry.summary);
          }
          const tooltipText = tooltipParts.join(" — ");
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

  function refreshCodexOverlay(ctxOverride) {
    const view = state.codexView;
    if (!view || typeof view.renderContent !== "function") {
      return;
    }
    const ctx = ctxOverride || view.ctx || { state };
    view.ctx = ctx;
    updateDevModeUI(view);
    if (!view.content) {
      return;
    }
    view.content.replaceChildren();
    view.renderContent(view.content, ctx, view);
  }

  function openCodexOverlay(mode, titleText, ctx, renderContent) {
    if (state.codexView && state.codexView.mode === mode) {
      const nextView = {
        ...state.codexView,
        ctx: ctx || state.codexView.ctx,
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
      ctx,
      handleKeydown,
      selectedKey: storedSelection.key,
      selectedType: storedSelection.type,
      pageIndex: storedSelection.pageIndex || 0,
      renderContent,
      devToggleButton,
    });

    updateDevModeUI(state.codexView);
    refreshCodexOverlay(ctx);
    window.requestAnimationFrame(() => closeButton.focus());
  }

  function showLedger(ctx) {
    openCodexOverlay("ledger", "Memory Ledger", ctx, (target, renderCtx, viewState) => {
      const memoryKeys = Array.isArray(renderCtx.state?.playerMemories)
        ? renderCtx.state.playerMemories
        : state.playerMemories || [];
      const relicKeys = Array.isArray(renderCtx.state?.playerRelics)
        ? renderCtx.state.playerRelics
        : state.playerRelics || [];

      const codexContainer = createElement("div");
      renderCodexContent(codexContainer, {
        layout: "overlay",
        viewState,
        memoryKeys,
        relicKeys,
        emptyMessage: "No memories or relics have been recorded yet.",
      });
      target.appendChild(codexContainer);

      const consumablesSection = createConsumablesSection(renderCtx);
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

  function addGold(amount, ctx) {
    const value = Math.round(Number(amount) || 0);
    if (value === 0) {
      return;
    }
    adjustGold(value);
    if (ctx?.showToast) {
      const text = value > 0 ? `You gain ${value} gold.` : `You spend ${Math.abs(value)} gold.`;
      ctx.showToast(text);
    }
    updateResourceDisplays(ctx);
  }

  function addConsumable(key, count = 1, ctx) {
    if (!key || count === 0) {
      return false;
    }
    ensurePlayerConsumables();
    const currentTotal = getTotalConsumables();
    let success = false;
    if (count > 0) {
      const remainingSlots = MAX_CONSUMABLE_SLOTS - currentTotal;
      if (remainingSlots <= 0) {
        ctx?.showToast?.("Your satchel is full.");
        return false;
      }
      const amountToAdd = Math.min(count, remainingSlots);
      adjustConsumableCount(key, amountToAdd);
      success = amountToAdd > 0;
      if (ctx?.showToast) {
        const item = CONSUMABLE_MAP.get(key);
        if (item) {
          const message =
            amountToAdd === count
              ? `Added ${amountToAdd} × ${item.name} to your satchel.`
              : `Added ${amountToAdd} × ${item.name}. Your satchel cannot hold more.`;
          ctx.showToast(message);
        }
      }
    } else {
      adjustConsumableCount(key, count);
      success = true;
    }
    updateResourceDisplays(ctx);
    return success;
  }

  function addRelic(key, ctx) {
    if (!key) {
      return false;
    }
    if (awardRelic(key)) {
      if (ctx?.showToast) {
        const relic = RELIC_MAP.get(key);
        ctx.showToast(`You claim the relic: ${relic?.name || key}.`);
      }
      updateResourceDisplays(ctx);
      return true;
    }
    if (ctx?.showToast) {
      ctx.showToast("You already carry that relic.");
    }
    return false;
  }

  function addMemoryToState(key, ctx) {
    if (!key) {
      return false;
    }
    if (!recordMemory(key)) {
      return false;
    }
    if (ctx?.showToast) {
      const memory = MEMORY_MAP.get(key);
      ctx.showToast(`A new memory surfaces: ${memory?.name || key}.`);
    }
    updateResourceDisplays(ctx);
    return true;
  }

  function useConsumable(ctx, key) {
    if (!key || !ensurePlayerConsumables()[key]) {
      ctx?.showToast?.("No charges of that consumable remain.");
      return;
    }
    const consumable = CONSUMABLE_MAP.get(key);
    if (!consumable) {
      ctx?.showToast?.("That item resists being used.");
      return;
    }
    const effect = consumable.effect || {};
    let gainedEssence = 0;
    let message = "";
    switch (effect.type) {
      case "restoreEssence": {
        const amount = Number(effect.amount) || 0;
        if (amount > 0) {
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
        addGold(effect.amount || 0, ctx);
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
          const previousMax =
            state.playerMaxEssence || DEFAULT_PLAYER_STATS.maxEssence;
          const newMax = previousMax + amount;
          setEssenceValues(newMax, newMax);
          message = `Your essence lingers, increasing permanently by ${amount}.`;
        }
        break;
      }
      case "unlockDoor": {
        ctx?.showToast?.(
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
    if (message && ctx?.showToast) {
      ctx.showToast(message);
    }
    if (gainedEssence > 0 && state.activeCombat && state.activeCombat.status === "inProgress") {
      state.activeCombat.player.essence = Math.min(
        state.activeCombat.player.maxEssence,
        state.activeCombat.player.essence + gainedEssence
      );
      updateCombatUI(state.activeCombat);
    }
    updateResourceDisplays(ctx);
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
      updateState({
        draftPacks: createMemoryDraftPacks(packCount, 3),
        selectedDrafts: new Array(packCount).fill(null),
        playerMemories: [],
      });
    }
    if (!Array.isArray(ctx.state.selectedDrafts)) {
      updateState({
        selectedDrafts: new Array(ctx.state.draftPacks.length).fill(null),
      });
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
      const selectedDrafts = ctx.state.selectedDrafts.slice();
      selectedDrafts[packIndex] = memory.key;
      updateState({
        selectedDrafts,
        playerMemories: selectedDrafts.filter(Boolean),
      });
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
      case "treasure":
        return "Glittering relics and bottled memories await your discerning grasp.";
      case "merchant":
        return name
          ? `You trade hushed words with ${name}, bartering for forbidden goods.`
          : "A spectral merchant beckons you toward a clandestine bargain.";
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
        // ignore navigation errors in non-browser environments
      }
    }, 50);
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

    resetResourceDisplayRegistry();

    const context = {
      state,
      transitionTo,
      showToast,
      options,
      updateResources: updateResourceDisplays,
      exitGame,
      helpers: screenHelpers,
    };

    updateState({ activeScreenContext: context });

    const screenContent = screenDef.render(context);
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
    setBackground(initialScreen, {});
    const splashContent = initialScreen.render({
      state,
      transitionTo,
      showToast,
      options: {},
      helpers: screenHelpers,
    });
    appendContent(splashContent);
    updateState({ currentScreen: "splash" });

    const imagesToPreload = new Set();
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
      ...merchantSprites,
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
    preloadImages(Array.from(imagesToPreload));
  }

  initialize();
})();
