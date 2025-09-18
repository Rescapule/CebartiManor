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
  createState,
  ensureResourceDisplays,
  setActiveCombat,
  updateState,
} from "./state/state.js";
import {
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
  ensureGameShell,
} from "./ui/dom.js";
import {
  applyRecoveryRoomBenefits,
  createRewardsPanel,
  createMerchantPanel,
} from "./combat/engine.js";
import { ACTION_DEFINITIONS } from "./combat/actions-data.js";
import {
  getConsumableCount,
  spendConsumableCharge,
} from "./state/inventory.js";
import {
  closeCodexOverlay,
  refreshCodexOverlay,
  showBestiary,
  showLedger,
} from "./ui/codex.js";
import {
  renderConsumableDisplay,
  renderMemoryDraft,
  updateMemoryDraftSelection,
} from "./ui/inventory.js";
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

  function startApplication() {
    ensureGameShell();
    initialize();
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
