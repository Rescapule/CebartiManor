import {
  backgrounds,
  ROOM_DEFINITIONS,
  DOOR_CATEGORIES,
  enemySprites,
  bossSprites,
  merchantSprites,
  EVENT_DEFINITIONS,
} from "../data/index.js";
import { filterDevDisabledEntries } from "../state/devtools.js";
import { createElement } from "./dom.js";

const ANIMATED_ENCOUNTER_TYPES = new Set(["combat", "elite", "boss"]);

function titleCaseFromKey(key = "") {
  const normalized = key.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ");
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function buildEncounterFromSprite(type, sprite) {
  if (!sprite) {
    return null;
  }
  const normalizedType = type || sprite.type || null;
  const encounterType = normalizedType || "combat";
  const kind =
    encounterType === "merchant"
      ? "merchant"
      : encounterType === "boss"
      ? "boss"
      : "enemy";
  return {
    sprite,
    type: encounterType,
    kind,
    animate: ANIMATED_ENCOUNTER_TYPES.has(encounterType),
    enterDelay: 2000,
  };
}

function getBackgroundOptions() {
  const options = [];
  const seen = new Set();
  ROOM_DEFINITIONS.forEach((room) => {
    if (room?.background && !seen.has(room.background)) {
      options.push({
        value: room.background,
        label: `${room.name} — ${room.background}`,
      });
      seen.add(room.background);
    }
  });
  Object.entries(backgrounds || {}).forEach(([key, value]) => {
    if (!value || seen.has(value)) {
      return;
    }
    options.push({
      value,
      label: `${titleCaseFromKey(key)} — ${value}`,
    });
    seen.add(value);
  });
  return options;
}

function createSelectField({
  label,
  options = [],
  includeRandomOption = false,
  randomLabel = "Random",
  name,
}) {
  const field = createElement("label", "dev-room-builder__field");
  if (name) {
    field.setAttribute("data-field", name);
  }
  const fieldLabel = createElement("span", "dev-room-builder__label", label);
  field.appendChild(fieldLabel);
  const select = document.createElement("select");
  select.className = "dev-room-builder__select";
  select.name = name || "";
  if (includeRandomOption) {
    select.appendChild(createOption("", randomLabel));
  }
  options.forEach((option) => {
    select.appendChild(createOption(option.value, option.label));
  });
  field.appendChild(select);
  return { field, select };
}

function createDescription(description) {
  if (!description) {
    return null;
  }
  return createElement("p", "dev-room-builder__description", description);
}

export function createDevRoomBuilder(ctx, options = {}) {
  if (!ctx?.state?.devMode) {
    return null;
  }

  const onEnterRoom = typeof options.onEnterRoom === "function"
    ? options.onEnterRoom
    : null;

  const availableRoomKeys = Array.isArray(options.availableRoomKeys)
    ? new Set(options.availableRoomKeys)
    : null;

  const layoutOptions = ROOM_DEFINITIONS.filter((room) => {
    if (!room) {
      return false;
    }
    if (!availableRoomKeys || availableRoomKeys.size === 0) {
      return true;
    }
    return availableRoomKeys.has(room.key);
  });

  if (layoutOptions.length === 0) {
    return null;
  }

  const enemyOptions = filterDevDisabledEntries("enemy", enemySprites);
  const bossOptions = filterDevDisabledEntries("boss", bossSprites);
  const merchantOptions = filterDevDisabledEntries("merchant", merchantSprites);
  const eventOptions = filterDevDisabledEntries("event", EVENT_DEFINITIONS);

  const enemyMap = new Map(enemyOptions.map((enemy) => [enemy.key, enemy]));
  const bossMap = new Map(bossOptions.map((boss) => [boss.key, boss]));
  const merchantMap = new Map(
    merchantOptions.map((merchant) => [merchant.key, merchant])
  );

  const container = createElement("div", "corridor-dev-tools");
  const toggleButton = createElement(
    "button",
    "button button--ghost corridor-dev-tools__toggle",
    "Room Builder"
  );
  toggleButton.type = "button";
  toggleButton.setAttribute("aria-haspopup", "true");
  toggleButton.setAttribute("aria-expanded", "false");
  container.appendChild(toggleButton);

  const panel = createElement("div", "corridor-dev-builder panel");
  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
  panel.tabIndex = -1;

  const title = createElement("h3", "dev-room-builder__title", "Room Builder");
  panel.appendChild(title);

  const subtitle = createElement(
    "p",
    "dev-room-builder__subtitle",
    "Assemble the next chamber for playtesting."
  );
  panel.appendChild(subtitle);

  const form = document.createElement("form");
  form.className = "dev-room-builder__form";
  panel.appendChild(form);

  const layoutField = createSelectField({
    label: "Room Layout",
    name: "room",
    options: layoutOptions.map((room) => ({
      value: room.key,
      label: room.name,
    })),
  });
  form.appendChild(layoutField.field);

  const layoutDescription = createDescription(layoutOptions[0]?.description);
  if (layoutDescription) {
    layoutDescription.classList.add("dev-room-builder__room-description");
    form.appendChild(layoutDescription);
  }

  const backgroundField = createSelectField({
    label: "Background",
    name: "background",
    options: getBackgroundOptions(),
    includeRandomOption: true,
    randomLabel: "Use layout background",
  });
  backgroundField.select.value = "";
  form.appendChild(backgroundField.field);

  const backgroundHint = createElement(
    "p",
    "dev-room-builder__hint",
    layoutOptions[0]
      ? `Default background: ${layoutOptions[0].background}`
      : ""
  );
  backgroundField.field.appendChild(backgroundHint);

  const typeField = createSelectField({
    label: "Room Type",
    name: "roomType",
    options: DOOR_CATEGORIES.map((category) => ({
      value: category.key,
      label: category.label,
    })),
  });
  form.appendChild(typeField.field);

  const variantContainer = createElement(
    "div",
    "dev-room-builder__variant"
  );
  form.appendChild(variantContainer);

  const actions = createElement("div", "dev-room-builder__actions");
  const enterButton = createElement(
    "button",
    "button button--primary dev-room-builder__submit",
    "Enter Built Room"
  );
  enterButton.type = "submit";
  actions.appendChild(enterButton);

  const closeButton = createElement(
    "button",
    "button button--ghost dev-room-builder__close",
    "Close"
  );
  closeButton.type = "button";
  actions.appendChild(closeButton);
  form.appendChild(actions);

  container.appendChild(panel);

  let currentVariantSelect = null;

  function updateLayoutDetails() {
    const selectedKey = layoutField.select.value;
    const selectedRoom = layoutOptions.find((room) => room.key === selectedKey);
    if (layoutDescription) {
      layoutDescription.textContent = selectedRoom?.description || "";
      layoutDescription.toggleAttribute(
        "hidden",
        !(selectedRoom && selectedRoom.description)
      );
    }
    if (backgroundHint) {
      backgroundHint.textContent = selectedRoom
        ? `Default background: ${selectedRoom.background}`
        : "";
    }
  }

  function updateVariantField() {
    currentVariantSelect = null;
    variantContainer.replaceChildren();
    const selectedType = typeField.select.value;

    if (selectedType === "combat" || selectedType === "elite") {
      if (enemyOptions.length === 0) {
        variantContainer.appendChild(
          createElement(
            "p",
            "dev-room-builder__hint dev-room-builder__hint--warning",
            "No eligible enemies available; random selection will be used."
          )
        );
        return;
      }
      const { field, select } = createSelectField({
        label: selectedType === "elite" ? "Elite Enemy" : "Enemy",
        name: "enemy",
        options: enemyOptions.map((enemy) => ({
          value: enemy.key,
          label: enemy.name,
        })),
        includeRandomOption: true,
        randomLabel: "Random enemy",
      });
      variantContainer.appendChild(field);
      currentVariantSelect = select;
      return;
    }

    if (selectedType === "boss") {
      if (bossOptions.length === 0) {
        variantContainer.appendChild(
          createElement(
            "p",
            "dev-room-builder__hint dev-room-builder__hint--warning",
            "No eligible bosses available; random selection will be used."
          )
        );
        return;
      }
      const { field, select } = createSelectField({
        label: "Boss",
        name: "boss",
        options: bossOptions.map((boss) => ({
          value: boss.key,
          label: boss.name,
        })),
        includeRandomOption: true,
        randomLabel: "Random boss",
      });
      variantContainer.appendChild(field);
      currentVariantSelect = select;
      return;
    }

    if (selectedType === "merchant") {
      if (merchantOptions.length === 0) {
        variantContainer.appendChild(
          createElement(
            "p",
            "dev-room-builder__hint dev-room-builder__hint--warning",
            "No merchants available; random selection will be used."
          )
        );
        return;
      }
      const { field, select } = createSelectField({
        label: "Merchant",
        name: "merchant",
        options: merchantOptions.map((merchant) => ({
          value: merchant.key,
          label: merchant.name,
        })),
        includeRandomOption: true,
        randomLabel: "Random merchant",
      });
      variantContainer.appendChild(field);
      currentVariantSelect = select;
      return;
    }

    if (selectedType === "event") {
      if (eventOptions.length === 0) {
        variantContainer.appendChild(
          createElement(
            "p",
            "dev-room-builder__hint dev-room-builder__hint--warning",
            "No events available; random selection will be used."
          )
        );
        return;
      }
      const { field, select } = createSelectField({
        label: "Event",
        name: "event",
        options: eventOptions.map((event) => ({
          value: event.key,
          label: event.name,
        })),
        includeRandomOption: true,
        randomLabel: "Random event",
      });
      variantContainer.appendChild(field);
      currentVariantSelect = select;
      return;
    }

    variantContainer.appendChild(
      createElement(
        "p",
        "dev-room-builder__hint",
        "No additional configuration for this room type."
      )
    );
  }

  function togglePanel(forceState) {
    const willOpen =
      typeof forceState === "boolean" ? forceState : panel.hidden;
    panel.hidden = !willOpen;
    panel.setAttribute("aria-hidden", String(!willOpen));
    toggleButton.setAttribute("aria-expanded", String(willOpen));
    toggleButton.textContent = willOpen ? "Close Room Builder" : "Room Builder";
    if (willOpen) {
      panel.focus?.();
    }
  }

  toggleButton.addEventListener("click", () => {
    togglePanel();
  });

  closeButton.addEventListener("click", () => {
    togglePanel(false);
  });

  layoutField.select.addEventListener("change", () => {
    updateLayoutDetails();
  });

  typeField.select.addEventListener("change", () => {
    updateVariantField();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!onEnterRoom) {
      return;
    }
    const roomKey = layoutField.select.value;
    if (!roomKey) {
      ctx?.showToast?.("Select a room layout before continuing.");
      return;
    }
    const optionsToUse = {
      enhanced: false,
    };

    const selectedType = typeField.select.value;
    if (selectedType) {
      optionsToUse.encounterType = selectedType;
    }

    const backgroundOverride = backgroundField.select.value;
    if (backgroundOverride) {
      optionsToUse.backgroundOverride = backgroundOverride;
    }

    if (selectedType === "event") {
      const eventKey = currentVariantSelect?.value;
      if (eventKey) {
        optionsToUse.eventOptions = { eventKey };
      }
    } else {
      const variantKey = currentVariantSelect?.value;
      if (variantKey) {
        let sprite = null;
        if (selectedType === "combat" || selectedType === "elite") {
          sprite = enemyMap.get(variantKey);
        } else if (selectedType === "boss") {
          sprite = bossMap.get(variantKey);
        } else if (selectedType === "merchant") {
          sprite = merchantMap.get(variantKey);
        }
        const encounterOverride = buildEncounterFromSprite(selectedType, sprite);
        if (encounterOverride) {
          optionsToUse.encounterOverride = encounterOverride;
        }
      }
    }

    try {
      toggleButton.disabled = true;
      enterButton.disabled = true;
      togglePanel(false);
      await onEnterRoom(roomKey, optionsToUse);
    } finally {
      toggleButton.disabled = false;
      enterButton.disabled = false;
    }
  });

  updateLayoutDetails();
  updateVariantField();

  return { element: container };
}
