const MAX_HISTORY = 200;

const history = [];
const listeners = new Set();
let initialized = false;

function clampHistory() {
  while (history.length > MAX_HISTORY) {
    history.shift();
  }
}

function formatArgument(argument) {
  if (argument instanceof Error) {
    const message = `${argument.name || "Error"}: ${argument.message || ""}`.trim();
    const stack = argument.stack && typeof argument.stack === "string" ? argument.stack : "";
    return { text: message, details: stack && stack !== message ? stack : "" };
  }

  if (typeof argument === "string") {
    return { text: argument, details: "" };
  }

  if (typeof argument === "number" || typeof argument === "boolean" || argument === null) {
    return { text: String(argument), details: "" };
  }

  try {
    return { text: JSON.stringify(argument, null, 2), details: "" };
  } catch (error) {
    return { text: Object.prototype.toString.call(argument), details: "" };
  }
}

function createEntry(level, args, meta = {}) {
  const processed = args.map((arg) => formatArgument(arg));
  const text = processed.map((item) => item.text).join(" ").trim();
  const extraDetails = processed
    .map((item) => item.details)
    .filter((item) => typeof item === "string" && item.trim().length > 0);

  if (typeof meta.details === "string" && meta.details.trim().length > 0) {
    extraDetails.push(meta.details.trim());
  }

  const timestamp = Date.now();

  return {
    id: `${timestamp}-${Math.random().toString(16).slice(2)}`,
    level,
    timestamp,
    text: text || level.toUpperCase(),
    details: extraDetails.join("\n\n"),
    meta,
    rawArgs: args,
  };
}

function emit(entry) {
  history.push(entry);
  clampHistory();
  listeners.forEach((listener) => {
    try {
      listener(entry);
    } catch (error) {
      // Suppress listener errors so they do not break logging.
    }
  });
}

function emitFromConsole(level, args, meta) {
  const entry = createEntry(level, args, meta);
  emit(entry);
}

export function subscribeToDebugLog(listener, { replay = true } = {}) {
  if (typeof listener !== "function") {
    return () => {};
  }
  if (replay) {
    history.forEach((entry) => {
      try {
        listener(entry);
      } catch (error) {
        // Ignore listener replay errors.
      }
    });
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDebugHistory() {
  return history.slice();
}

export function clearDebugHistory() {
  history.splice(0, history.length);
  listeners.forEach((listener) => {
    try {
      listener({ type: "clear" });
    } catch (error) {
      // Ignore listener errors when clearing history.
    }
  });
}

function attachErrorListeners() {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("error", (event) => {
    const meta = {
      source: event?.filename,
      line: event?.lineno,
      column: event?.colno,
    };
    const args = [event?.message || "Uncaught error"];
    if (event?.error instanceof Error && event.error.stack) {
      meta.details = event.error.stack;
    }
    emitFromConsole("error", args, meta);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const meta = {};
    if (reason instanceof Error && reason.stack) {
      meta.details = reason.stack;
    }
    emitFromConsole("error", ["Unhandled promise rejection", reason], meta);
  });
}

export function initializeDebugLogging() {
  if (initialized) {
    return;
  }
  initialized = true;

  const original = {};
  const levels = ["debug", "log", "info", "warn", "error"];

  levels.forEach((level) => {
    if (typeof console?.[level] === "function") {
      original[level] = console[level].bind(console);
      console[level] = (...args) => {
        try {
          emitFromConsole(level, args);
        } catch (error) {
          // If emitting fails we still want to call the original console method.
        }
        return original[level](...args);
      };
    }
  });

  attachErrorListeners();
  emitFromConsole("info", ["Debug logging initialized"]);
}

