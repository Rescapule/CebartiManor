const doc = typeof document === "undefined" ? null : document;

function getElementById(id) {
  if (!doc) {
    return null;
  }
  return doc.getElementById(id);
}

const backgroundElement = getElementById("background");
const contentElement = getElementById("content");
const fadeOverlayElement = getElementById("fade-overlay");
const toastElement = getElementById("toast");

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
  if (!contentElement) {
    return;
  }
  contentElement.replaceChildren(...nodes);
}

export function appendContent(...nodes) {
  if (!contentElement) {
    return;
  }
  contentElement.append(...nodes);
}

export function updateBackground(image, ariaLabel) {
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
