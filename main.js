(function () {
  const backgrounds = {
    splash: "bg_cebartimanor_ext.png",
    menu: "bg_wallpaper.png",
    well: "bg_room_well.png",
    corridor: "bg_corridor.png",
  };

  const state = {
    currentScreen: null,
    hasSave: false,
    inRun: false,
    lastRunScreen: null,
    corridorRefreshes: 0,
  };

  const backgroundEl = document.getElementById("background");
  const contentEl = document.getElementById("content");
  const fadeOverlay = document.getElementById("fade-overlay");
  const toastEl = document.getElementById("toast");

  let toastTimeout = null;

  const screens = {
    splash: {
      key: "splash",
      background: backgrounds.splash,
      ariaLabel: "Exterior view of Cebarti Manor at night.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--splash");
        const panel = createElement("div", "panel panel--splash");

        const title = createElement("h1", "screen__title", "Cebarti Manor");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "A haunted roguelike prototype set within Helen Cebarti's cursed manor."
        );
        const prompt = createElement(
          "button",
          "button button--primary splash__cta",
          "Click to Continue"
        );

        prompt.addEventListener("click", () => ctx.transitionTo("mainMenu"));
        wrapper.addEventListener("click", (event) => {
          if (event.target === wrapper) {
            ctx.transitionTo("mainMenu");
          }
        });

        panel.append(title, subtitle, prompt);
        wrapper.append(panel);
        return wrapper;
      },
    },
    mainMenu: {
      key: "mainMenu",
      type: "menu",
      ariaLabel: "Wallpaper from inside Cebarti Manor, used for menus.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--menu");
        const panel = createElement("div", "panel panel--menu");

        const title = createElement("h1", "screen__title", "Cebarti Manor");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Choose how you will haunt the manor."
        );

        const menu = createElement("div", "menu");

        const continueBtn = createElement(
          "button",
          "button menu__button",
          "Continue Run"
        );
        continueBtn.style.display = ctx.state.hasSave ? "block" : "none";
        continueBtn.addEventListener("click", () => {
          if (!ctx.state.hasSave || !ctx.state.lastRunScreen) {
            ctx.showToast("No run to continue yet.");
            return;
          }
          ctx.transitionTo(ctx.state.lastRunScreen);
        });

        const newRunBtn = createElement(
          "button",
          "button menu__button",
          "New Run"
        );
        newRunBtn.addEventListener("click", () => {
          ctx.state.inRun = true;
          ctx.state.hasSave = false;
          ctx.state.corridorRefreshes = 0;
          ctx.transitionTo("well");
        });

        const bestiaryBtn = createElement(
          "button",
          "button menu__button",
          "Beastiary"
        );
        bestiaryBtn.addEventListener("click", () => ctx.transitionTo("bestiary"));

        const settingsBtn = createElement(
          "button",
          "button menu__button",
          "Settings"
        );
        settingsBtn.addEventListener("click", () => ctx.transitionTo("settings"));

        const exitBtn = createElement("button", "button menu__button", "Exit");
        exitBtn.addEventListener("click", () => {
          ctx.showToast("Exit will be available in the desktop build.");
        });

        menu.append(continueBtn, newRunBtn, bestiaryBtn, settingsBtn, exitBtn);
        panel.append(title, subtitle, menu);
        wrapper.append(panel);
        return wrapper;
      },
    },
    bestiary: {
      key: "bestiary",
      type: "menu",
      ariaLabel: "Wallpaper from inside Cebarti Manor, used for menus.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--menu");
        const panel = createElement("div", "panel panel--menu");

        const title = createElement("h2", "screen__title", "Beastiary");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Catalog the manor's residents. Bestiary entries will unlock as development continues."
        );

        const backButton = createElement(
          "button",
          "button",
          "Back to Menu"
        );
        backButton.addEventListener("click", () => ctx.transitionTo("mainMenu"));

        panel.append(title, subtitle, backButton);
        wrapper.append(panel);
        return wrapper;
      },
    },
    settings: {
      key: "settings",
      type: "menu",
      ariaLabel: "Wallpaper from inside Cebarti Manor, used for menus.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--menu");
        const panel = createElement("div", "panel panel--menu");

        const title = createElement("h2", "screen__title", "Settings");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Configure your haunting experience. Options will arrive in future updates."
        );

        const backButton = createElement(
          "button",
          "button",
          "Back to Menu"
        );
        backButton.addEventListener("click", () => ctx.transitionTo("mainMenu"));

        panel.append(title, subtitle, backButton);
        wrapper.append(panel);
        return wrapper;
      },
    },
    well: {
      key: "well",
      background: backgrounds.well,
      ariaLabel: "The Styx well inside Cebarti Manor.",
      checkpoint: true,
      render(ctx) {
        const wrapper = createElement("div", "screen screen--well");

        const title = createElement("h2", "screen__title", "The Styx Well");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Draft three memories to define this run's starting action pool."
        );

        const buttonRow = createElement("div", "button-row");
        for (let i = 0; i < 3; i += 1) {
          const draftButton = createElement(
            "button",
            "button",
            "Draft a Memory"
          );
          draftButton.addEventListener("click", () => {
            ctx.showToast("Memory drafting will be implemented soon.");
          });
          buttonRow.appendChild(draftButton);
        }

        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Continue"
        );
        continueButton.addEventListener("click", async () => {
          ctx.state.corridorRefreshes = 0;
          ctx.state.lastRunScreen = "corridor";
          await ctx.transitionTo("corridor");
          ctx.showToast("You ascend into the corridor.");
        });
        footer.appendChild(continueButton);

        wrapper.append(title, subtitle, buttonRow, footer);
        return wrapper;
      },
    },
    corridor: {
      key: "corridor",
      background: backgrounds.corridor,
      ariaLabel: "A corridor within Cebarti Manor awaiting door choices.",
      checkpoint: true,
      render(ctx) {
        const wrapper = createElement("div", "screen screen--corridor");

        const title = createElement("h2", "screen__title", "The Corridor");
        const refreshCount = ctx.state.corridorRefreshes;
        const descriptionText =
          refreshCount === 0
            ? "Three doors shimmer ahead. Choose your path or continue down the corridor."
            : `The manor shifts around you. Corridor reshaped ${refreshCount} time${
                refreshCount === 1 ? "" : "s"
              }.`;
        const subtitle = createElement("p", "screen__subtitle", descriptionText);

        const doorMap = createElement("div", "door-map");
        const placeholders = [
          {
            label: "Future yellow door",
            classes: "door-slot door-slot--yellow door-slot--left",
          },
          {
            label: "Future blue door",
            classes: "door-slot door-slot--blue door-slot--center",
          },
          {
            label: "Future red door",
            classes: "door-slot door-slot--red door-slot--right",
          },
        ];
        placeholders.forEach((placeholder) => {
          const slot = createElement("div", placeholder.classes);
          slot.dataset.label = placeholder.label;
          const hiddenLabel = createElement("span", "sr-only", placeholder.label);
          slot.appendChild(hiddenLabel);
          doorMap.appendChild(slot);
        });

        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Continue Down the Corridor"
        );
        continueButton.addEventListener("click", async () => {
          ctx.state.corridorRefreshes += 1;
          ctx.state.lastRunScreen = "corridor";
          await ctx.transitionTo("corridor", { refresh: true });
          ctx.showToast("The corridor rearranges itself.");
        });
        footer.appendChild(continueButton);

        wrapper.append(title, subtitle, doorMap, footer);
        return wrapper;
      },
    },
  };

  function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  function getBackgroundForScreen(screenDef) {
    if (screenDef.background) {
      return screenDef.background;
    }
    if (screenDef.type === "menu") {
      return backgrounds.menu;
    }
    return backgrounds.menu;
  }

  function setBackground(screenDef) {
    const image = getBackgroundForScreen(screenDef);
    if (backgroundEl.dataset.bg !== image) {
      backgroundEl.style.backgroundImage = `url("${image}")`;
      backgroundEl.dataset.bg = image;
    }
    if (screenDef.ariaLabel) {
      backgroundEl.setAttribute("aria-label", screenDef.ariaLabel);
    }
  }

  function showToast(message, { duration = 3600 } = {}) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("toast--visible");
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(() => {
      toastEl.classList.remove("toast--visible");
    }, duration);
  }

  function fadeToBlack() {
    return new Promise((resolve) => {
      if (!fadeOverlay) {
        resolve();
        return;
      }
      fadeOverlay.classList.add("visible");
      requestAnimationFrame(() => {
        fadeOverlay.classList.add("opaque");
      });

      const cleanup = () => {
        window.clearTimeout(fallback);
        fadeOverlay.removeEventListener("transitionend", onTransitionEnd);
        resolve();
      };

      const onTransitionEnd = (event) => {
        if (event.target === fadeOverlay) {
          cleanup();
        }
      };

      const fallback = window.setTimeout(cleanup, 650);
      fadeOverlay.addEventListener("transitionend", onTransitionEnd);
    });
  }

  function fadeFromBlack() {
    return new Promise((resolve) => {
      if (!fadeOverlay) {
        resolve();
        return;
      }

      const cleanup = () => {
        window.clearTimeout(fallback);
        fadeOverlay.removeEventListener("transitionend", onTransitionEnd);
        fadeOverlay.classList.remove("visible");
        resolve();
      };

      const onTransitionEnd = (event) => {
        if (event.target === fadeOverlay) {
          cleanup();
        }
      };

      const fallback = window.setTimeout(cleanup, 650);
      fadeOverlay.classList.remove("opaque");
      fadeOverlay.addEventListener("transitionend", onTransitionEnd);
    });
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

    const context = {
      state,
      transitionTo,
      showToast,
      options,
    };

    const screenContent = screenDef.render(context);
    contentEl.replaceChildren(screenContent);
    setBackground(screenDef);

    state.currentScreen = screenKey;
    if (screenDef.checkpoint) {
      state.hasSave = true;
      state.lastRunScreen = screenKey;
    }

    if (screenKey === "corridor") {
      state.inRun = true;
    }
  }

  function preloadImages(imageList) {
    imageList.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  function initialize() {
    const initialScreen = screens.splash;
    setBackground(initialScreen);
    const splashContent = initialScreen.render({
      state,
      transitionTo,
      showToast,
      options: {},
    });
    contentEl.appendChild(splashContent);
    state.currentScreen = "splash";

    const imagesToPreload = new Set();
    Object.values(screens).forEach((screen) => {
      imagesToPreload.add(getBackgroundForScreen(screen));
    });
    preloadImages(Array.from(imagesToPreload));
  }

  initialize();
})();
