import { clearDebugHistory, subscribeToDebugLog } from "../utils/debug.js";
import { createElement, ensureGameShell } from "./dom.js";

const MAX_RENDERED_ENTRIES = 200;

let container = null;
let listElement = null;
let emptyStateElement = null;
let toggleButtonElement = null;
let unsubscribe = null;
let initialized = false;

function formatTimestamp(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
  const shouldCollapse =
    typeof nextCollapsed === "boolean" ? nextCollapsed : !currentlyCollapsed;
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

export function initializeDebugLogUI() {
  if (initialized) {
    return;
  }
  initialized = true;
  ensureContainer();
}

function updateToggleLabel() {
  if (!toggleButtonElement || !container) {
    return;
  }
  const collapsed = container.classList.contains("debug-log--collapsed");
  toggleButtonElement.textContent = collapsed ? "Show" : "Hide";
}

