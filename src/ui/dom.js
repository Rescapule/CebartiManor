const doc = typeof document === "undefined" ? null : document;

let cachedStructure = null;

function getElementById(id) {
  if (!doc) {
    return null;
  }
  return doc.getElementById(id);
}

function ensureElement({
  id,
  className,
  parent,
  insertBefore = null,
  attributes = {},
}) {
  if (!doc || !parent || !id) {
    return null;
  }
  let element = getElementById(id);
  if (!element) {
    element = doc.createElement("div");
    element.id = id;
    if (className) {
      element.className = className;
    }
    Object.entries(attributes).forEach(([name, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      element.setAttribute(name, String(value));
    });
    if (insertBefore && parent.contains(insertBefore)) {
      parent.insertBefore(element, insertBefore);
    } else {
      parent.appendChild(element);
    }
  } else {
    if (className) {
      element.classList.add(...className.split(/\s+/g).filter(Boolean));
    }
    Object.entries(attributes).forEach(([name, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (element.getAttribute(name) !== String(value)) {
        element.setAttribute(name, String(value));
      }
    });
    if (!parent.contains(element)) {
      if (insertBefore && parent.contains(insertBefore)) {
        parent.insertBefore(element, insertBefore);
      } else {
        parent.appendChild(element);
      }
    } else if (insertBefore && insertBefore !== element && parent.contains(insertBefore)) {
      parent.insertBefore(element, insertBefore);
    }
  }
  return element;
}

function ensureGameRoot() {
  if (!doc || !doc.body) {
    return null;
  }
  let root = getElementById("game");
  if (!root) {
    root = doc.createElement("div");
    root.id = "game";
    root.className = "game";
    doc.body.appendChild(root);
  } else {
    root.classList.add("game");
  }
  return root;
}

function ensureGameStructure() {
  const root = ensureGameRoot();
  if (!root) {
    cachedStructure = null;
    return null;
  }

  const background = ensureElement({
    id: "background",
    className: "game__background",
    parent: root,
    insertBefore: root.firstChild,
    attributes: { role: "img", "aria-label": "" },
  });

  const content = ensureElement({
    id: "content",
    className: "game__content",
    parent: root,
    attributes: { "aria-live": "polite" },
  });

  const fadeOverlay = ensureElement({
    id: "fade-overlay",
    className: "fade-overlay",
    parent: root,
    attributes: { "aria-hidden": "true" },
  });

  const toast = ensureElement({
    id: "toast",
    className: "toast",
    parent: root,
    attributes: {
      role: "status",
      "aria-live": "polite",
      "aria-atomic": "true",
    },
  });

  cachedStructure = { game: root, background, content, fadeOverlay, toast };
  return cachedStructure;
}

function getBackgroundElement() {
  const structure = ensureGameStructure();
  return structure ? structure.background : null;
}

function getContentElement() {
  const structure = ensureGameStructure();
  return structure ? structure.content : null;
}

function getFadeOverlayElement() {
  const structure = ensureGameStructure();
  return structure ? structure.fadeOverlay : null;
}

function getToastElement() {
  const structure = ensureGameStructure();
  return structure ? structure.toast : null;
}

export function ensureGameShell() {
  return ensureGameStructure();
}

function getRequiredElement(getter, id) {
  const element = typeof getter === "function" ? getter() : null;
  if (!element) {
    if (!doc || !doc.body) {
      return null;
    }
    throw new Error(`Element with id "${id}" was not found in the DOM.`);
  }
  return element;
}

let toastTimeout = null;

export function createElement(tag, className, textContent) {
  if (!doc) {
    return null;
  }
  const element = doc.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

export function replaceContent(...nodes) {
  const contentElement = getRequiredElement(getContentElement, "content");
  if (!contentElement) {
    return;
  }
  contentElement.replaceChildren(...nodes);
}

export function appendContent(...nodes) {
  const contentElement = getRequiredElement(getContentElement, "content");
  if (!contentElement) {
    return;
  }
  contentElement.append(...nodes);
}

export function updateBackground(image, ariaLabel) {
  const backgroundElement = getRequiredElement(getBackgroundElement, "background");
  if (!backgroundElement) {
    return;
  }
  if (typeof image === "string" && backgroundElement.dataset.bg !== image) {
    backgroundElement.style.backgroundImage = `url("${image}")`;
    backgroundElement.dataset.bg = image;
  }
  if (ariaLabel) {
    backgroundElement.setAttribute("aria-label", ariaLabel);
  } else {
    backgroundElement.removeAttribute("aria-label");
  }
}

export function showToast(message, { duration = 3600 } = {}) {
  const toastElement = getRequiredElement(getToastElement, "toast");
  if (!toastElement) {
    return;
  }
  toastElement.textContent = message;
  toastElement.classList.add("toast--visible");
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastTimeout = window.setTimeout(() => {
    toastElement.classList.remove("toast--visible");
  }, duration);
}

export function fadeToBlack() {
  return new Promise((resolve) => {
    const fadeOverlayElement = getFadeOverlayElement();
    if (!fadeOverlayElement) {
      resolve();
      return;
    }
    fadeOverlayElement.classList.add("visible");
    requestAnimationFrame(() => {
      fadeOverlayElement.classList.add("opaque");
    });

    const cleanup = () => {
      window.clearTimeout(fallback);
      fadeOverlayElement.removeEventListener("transitionend", onTransitionEnd);
      resolve();
    };

    const onTransitionEnd = (event) => {
      if (event.target === fadeOverlayElement) {
        cleanup();
      }
    };

    const fallback = window.setTimeout(cleanup, 650);
    fadeOverlayElement.addEventListener("transitionend", onTransitionEnd);
  });
}

export function fadeFromBlack() {
  return new Promise((resolve) => {
    const fadeOverlayElement = getFadeOverlayElement();
    if (!fadeOverlayElement) {
      resolve();
      return;
    }

    const cleanup = () => {
      window.clearTimeout(fallback);
      fadeOverlayElement.removeEventListener("transitionend", onTransitionEnd);
      fadeOverlayElement.classList.remove("visible");
      resolve();
    };

    const onTransitionEnd = (event) => {
      if (event.target === fadeOverlayElement) {
        cleanup();
      }
    };

    const fallback = window.setTimeout(cleanup, 650);
    fadeOverlayElement.classList.remove("opaque");
    fadeOverlayElement.addEventListener("transitionend", onTransitionEnd);
  });
}
