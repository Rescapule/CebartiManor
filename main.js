(function () {
  const backgrounds = {
    splash: "bg_cebartimanor_ext.png",
    menu: "bg_wallpaper.png",
    well: "bg_room_well.png",
    corridor: "bg_corridor.png",
    foyer: "bg_room_foyer.png",
    victory: "bg_victoryscreen.png",
  };

  const roomDefinitions = [
    {
      key: "well",
      name: "Submerged Reliquary",
      background: "bg_room_well.png",
      description:
        "The well chamber opens into a circular antechamber, its waters thrumming with residual whispers that tug at your memory.",
      ariaLabel: "A flooded reliquary chamber branching from the manor's Styx well.",
    },
    {
      key: "atrium",
      name: "Flooded Atrium",
      background: "bg_room_atrium.png",
      description:
        "Collapsed skylights spill moonlight across the atrium's reflecting pool. Spectral vines curl toward the rippling surface.",
      ariaLabel: "A decayed manor atrium filled with water and moonlight.",
    },
    {
      key: "bedroom",
      name: "Forsaken Bedroom",
      background: "bg_room_bedroom.png",
      description:
        "Antique furniture floats inches above the ground, swaying in time with a lullaby no mortal voice should sing.",
      ariaLabel: "An abandoned bedroom with haunted furnishings suspended midair.",
    },
    {
      key: "closet",
      name: "Locksmith's Closet",
      background: "bg_room_closet.png",
      description:
        "Walls of keys clatter like chimes. One of them pulses with a heartbeat in sync with your own.",
      ariaLabel: "A cramped closet overflowing with shimmering keys.",
    },
    {
      key: "counsel",
      name: "Counsel Chamber",
      background: "bg_room_counsel.png",
      description:
        "Couches circle a darkened fireplace. The ashes whisper fractured therapy sessions from lifetimes ago.",
      ariaLabel: "A dim counseling chamber lined with couches and a smoldering hearth.",
    },
    {
      key: "kitchen",
      name: "Haunted Kitchen",
      background: "bg_room_kitchen.png",
      description:
        "Copper pots rattle without touch. Aromas of impossible feasts pull at your hunger and your soul alike.",
      ariaLabel: "A spectral kitchen with floating utensils and lingering aromas.",
    },
    {
      key: "studio",
      name: "Painter's Studio",
      background: "bg_room_studio.png",
      description:
        "Unfinished canvases watch you. Fresh paint crawls across them, forming scenes of your past lives.",
      ariaLabel: "An artist's studio where the paintings appear to move on their own.",
    },
    {
      key: "study",
      name: "Occult Study",
      background: "bg_room_study.png",
      description:
        "Books flutter from shelves as if anxious birds. Glyphs glow along the desk, cataloging every decision you've made tonight.",
      ariaLabel: "A study filled with floating books and glowing occult glyphs.",
    },
    {
      key: "washroom",
      name: "Mirror Washroom",
      background: "bg_room_washroom.png",
      description:
        "Steam coats the mirrors, yet silhouettes stare back from beyond the glass waiting to trade places.",
      ariaLabel: "A misty washroom with haunted mirrors.",
    },
    {
      key: "winecellar",
      name: "Cursed Wine Cellar",
      background: "bg_room_winecellar.png",
      description:
        "Barrels hum with the voices of bottled celebrations. A single cork trembles, eager to release something old.",
      ariaLabel: "A wine cellar where barrels glow with spectral light.",
    },
  ];

  const foyerRoom = {
    key: "foyer",
    name: "The Foyer",
    background: backgrounds.foyer,
    description:
      "Helen Cebarti's foyer waits in stillness. The manor itself holds its breath for the coming confrontation.",
    ariaLabel: "The foyer of Cebarti Manor prepared for the final confrontation.",
  };

  const TOTAL_ROOMS_PER_RUN = roomDefinitions.length + 1;

  const state = {
    currentScreen: null,
    hasSave: false,
    inRun: false,
    lastRunScreen: null,
    corridorRefreshes: 0,
    roomPool: [],
    roomHistory: [],
    currentRoomNumber: 0,
    currentRoomKey: null,
  };

  const ROOMS_BEFORE_BOSS = roomDefinitions.length;
  const roomMap = roomDefinitions.reduce((map, room) => {
    map.set(room.key, room);
    return map;
  }, new Map());

  const doorCategories = [
    {
      key: "combat",
      label: "Combat",
      colorClass: "door-button--crimson",
      ariaDescription: "Engage in a standard combat encounter.",
      detail: "Battle restless shades.",
    },
    {
      key: "elite",
      label: "Elite Combat",
      colorClass: "door-button--violet",
      ariaDescription: "Challenge a formidable elite opponent.",
      detail: "Face a formidable elite.",
    },
    {
      key: "boss",
      label: "Boss Combat",
      colorClass: "door-button--umbra",
      ariaDescription: "Confront a boss-tier adversary.",
      detail: "Challenge a boss-tier foe.",
    },
    {
      key: "recovery",
      label: "Recovery",
      colorClass: "door-button--verdant",
      ariaDescription: "Recover resources and gather your strength.",
      detail: "Recover your strength.",
    },
    {
      key: "treasure",
      label: "Treasure",
      colorClass: "door-button--amber",
      ariaDescription: "Search for rare rewards hidden within the manor.",
      detail: "Seek hidden rewards.",
    },
    {
      key: "merchant",
      label: "Merchant",
      colorClass: "door-button--azure",
      ariaDescription: "Trade with a spectral merchant.",
      detail: "Barter with a spectral vendor.",
    },
    {
      key: "event",
      label: "Event",
      colorClass: "door-button--aether",
      ariaDescription: "Trigger an unpredictable manor event.",
      detail: "Stumble into a strange event.",
    },
  ];

  function buildInitialRoomPool() {
    return roomDefinitions.map((room) => room.key);
  }

  function initializeRunState() {
    state.roomPool = buildInitialRoomPool();
    state.roomHistory = [];
    state.currentRoomNumber = 0;
    state.currentRoomKey = null;
    state.corridorRefreshes = 0;
  }

  function clearRunState() {
    state.roomPool = [];
    state.roomHistory = [];
    state.currentRoomNumber = 0;
    state.currentRoomKey = null;
    state.corridorRefreshes = 0;
    state.lastRunScreen = null;
    state.hasSave = false;
    state.inRun = false;
  }

  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function sampleWithoutReplacement(source, count) {
    if (!Array.isArray(source) || source.length === 0 || count <= 0) {
      return [];
    }
    const pool = shuffle(source);
    return pool.slice(0, Math.min(count, pool.length));
  }

  function getDoorCategoryOptions(count) {
    const categories = sampleWithoutReplacement(doorCategories, count);
    return categories.map((category) => ({ ...category }));
  }

  async function goToRoom(ctx, roomKey) {
    const room = roomMap.get(roomKey);
    if (!room) {
      ctx.showToast("That path is sealed.");
      return;
    }

    ctx.state.roomPool = ctx.state.roomPool.filter((key) => key !== roomKey);
    if (ctx.state.roomHistory[ctx.state.roomHistory.length - 1] !== roomKey) {
      ctx.state.roomHistory.push(roomKey);
    }
    ctx.state.currentRoomNumber = ctx.state.roomHistory.length;
    ctx.state.currentRoomKey = roomKey;
    ctx.state.lastRunScreen = "room";
    ctx.state.corridorRefreshes = 0;

    await ctx.transitionTo("room", {
      room,
      background: room.background,
      ariaLabel: room.ariaLabel,
    });
    ctx.showToast(`You enter ${room.name}.`);
  }

  async function goToFoyer(ctx) {
    ctx.state.roomPool = [];
    if (ctx.state.roomHistory[ctx.state.roomHistory.length - 1] !== foyerRoom.key) {
      ctx.state.roomHistory.push(foyerRoom.key);
    }
    ctx.state.currentRoomNumber = ctx.state.roomHistory.length;
    ctx.state.currentRoomKey = foyerRoom.key;
    ctx.state.lastRunScreen = "foyer";
    ctx.state.corridorRefreshes = 0;

    await ctx.transitionTo("foyer");
    ctx.showToast("The foyer looms ahead.");
  }

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
          ctx.state.inRun = true;
          ctx.transitionTo(ctx.state.lastRunScreen);
        });

        const newRunBtn = createElement(
          "button",
          "button menu__button",
          "New Run"
        );
        newRunBtn.addEventListener("click", () => {
          initializeRunState();
          ctx.state.inRun = true;
          ctx.state.hasSave = false;
          ctx.state.lastRunScreen = "well";
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
        if (ctx.options && ctx.options.fromRoom) {
          ctx.state.currentRoomKey = null;
        }

        const wrapper = createElement("div", "screen screen--corridor");
        const availableRooms = Array.isArray(ctx.state.roomPool)
          ? ctx.state.roomPool
          : [];
        const roomsRemaining = Math.max(availableRooms.length, 0);
        const roomsCleared = Math.min(
          ROOMS_BEFORE_BOSS - roomsRemaining,
          ROOMS_BEFORE_BOSS
        );

        const tracker = createRunTracker(
          `Rooms Cleared ${roomsCleared}/${ROOMS_BEFORE_BOSS}`
        );

        const title = createElement("h2", "screen__title", "The Corridor");
        const refreshCount = ctx.state.corridorRefreshes;
        let descriptionText;

        if (roomsRemaining === 0) {
          descriptionText =
            "Only the foyer remains. Steel yourself before the final confrontation.";
        } else if (roomsRemaining === 1) {
          descriptionText =
            "Only a single chamber stands between you and the foyer. Choose with care.";
        } else {
          descriptionText = `${roomsRemaining} chambers remain before the foyer.`;
        }

        if (roomsRemaining > 0) {
          if (refreshCount === 0) {
            descriptionText += " Three doors shimmer ahead.";
          } else {
            descriptionText += ` The manor has reshaped itself ${refreshCount} time${
              refreshCount === 1 ? "" : "s"
            }.`;
          }
        }

        const subtitle = createElement("p", "screen__subtitle", descriptionText);

        const doorMap = createElement("div", "door-map");
        if (roomsRemaining === 0) {
          const { element: foyerDoor, button: foyerButton } = createDoorChoice(
            "Door to the Foyer",
            ["door-button--umbra"],
            {
              ariaDescription:
                "Leads directly to the foyer and the final encounter.",
              displayLabel: "Foyer",
              detail: "Face Helen Cebarti's final challenge.",
            }
          );
          foyerButton.addEventListener("click", async () => {
            foyerButton.disabled = true;
            await goToFoyer(ctx);
          });
          doorMap.appendChild(foyerDoor);
        } else {
          const doorCount = Math.min(3, roomsRemaining);
          const roomsForDoors = sampleWithoutReplacement(availableRooms, doorCount);
          const categories = getDoorCategoryOptions(doorCount);

          roomsForDoors.forEach((roomKey, index) => {
            const category = categories[index] || {};
            const extraClasses = [];
            if (typeof category.colorClass === "string" && category.colorClass) {
              extraClasses.push(category.colorClass);
            }
            const { element: doorChoice, button: doorButton } = createDoorChoice(
              category.label || `Door ${index + 1}`,
              extraClasses,
              {
                ariaDescription:
                  category.ariaDescription || "Leads to an unknown chamber.",
                detail: category.detail,
                dataset:
                  typeof category.key === "string"
                    ? { category: category.key }
                    : undefined,
              }
            );
            doorButton.addEventListener("click", async () => {
              doorButton.disabled = true;
              await goToRoom(ctx, roomKey);
            });
            doorMap.appendChild(doorChoice);
          });
        }

        let footer = null;
        if (roomsRemaining > 0) {
          footer = createElement("div", "screen-footer");
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
        }

        wrapper.append(tracker, title, subtitle, doorMap);
        if (footer) {
          wrapper.appendChild(footer);
        }
        return wrapper;
      },
    },
    room: {
      key: "room",
      render(ctx) {
        const roomData = ctx.options?.room;
        const wrapper = createElement("div", "screen screen--room");
        const roomNumber = Math.max(ctx.state.currentRoomNumber, 1);
        const tracker = createRunTracker(
          `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
        );

        if (!roomData) {
          const title = createElement("h2", "screen__title", "The Manor Resists");
          const subtitle = createElement(
            "p",
            "screen__subtitle",
            "The chosen doorway seals shut. You retreat to the corridor."
          );
          const footer = createElement("div", "screen-footer");
          const backButton = createElement(
            "button",
            "button button--primary",
            "Return to the Corridor"
          );
          backButton.addEventListener("click", async () => {
            ctx.state.currentRoomKey = null;
            ctx.state.lastRunScreen = "corridor";
            await ctx.transitionTo("corridor", { refresh: true });
          });
          footer.appendChild(backButton);
          wrapper.append(tracker, title, subtitle, footer);
          return wrapper;
        }

        const title = createElement("h2", "screen__title", roomData.name);
        const subtitle = createElement("p", "screen__subtitle", roomData.description);
        const prompt = createElement(
          "p",
          "screen__subtitle",
          "You secure what you can from the chamber before returning to the corridor."
        );
        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Return to the Corridor"
        );
        continueButton.addEventListener("click", async () => {
          ctx.state.currentRoomKey = null;
          ctx.state.lastRunScreen = "corridor";
          ctx.state.corridorRefreshes = 0;
          await ctx.transitionTo("corridor", { fromRoom: true });
          ctx.showToast("You slip back into the corridor.");
        });
        footer.appendChild(continueButton);

        wrapper.append(tracker, title, subtitle, prompt, footer);
        return wrapper;
      },
    },
    foyer: {
      key: "foyer",
      background: backgrounds.foyer,
      ariaLabel: foyerRoom.ariaLabel,
      checkpoint: true,
      render(ctx) {
        const wrapper = createElement("div", "screen screen--room screen--foyer");
        const roomNumber = Math.max(ctx.state.currentRoomNumber, TOTAL_ROOMS_PER_RUN);
        const tracker = createRunTracker(
          `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
        );

        const title = createElement("h2", "screen__title", foyerRoom.name);
        const subtitle = createElement("p", "screen__subtitle", foyerRoom.description);
        const prompt = createElement(
          "p",
          "screen__subtitle",
          "Helen Cebarti gathers her strength. This is the final stand."
        );

        const footer = createElement("div", "screen-footer");
        const continueButton = createElement(
          "button",
          "button button--primary",
          "Challenge the Foyer"
        );
        continueButton.addEventListener("click", async () => {
          continueButton.disabled = true;
          ctx.state.hasSave = false;
          ctx.state.lastRunScreen = null;
          ctx.state.inRun = false;
          await ctx.transitionTo("victory");
        });
        footer.appendChild(continueButton);

        wrapper.append(tracker, title, subtitle, prompt, footer);
        return wrapper;
      },
    },
    victory: {
      key: "victory",
      background: backgrounds.victory,
      ariaLabel: "Sunlight pours through an open archway as the manor releases you.",
      render(ctx) {
        const wrapper = createElement("div", "screen screen--victory");

        const title = createElement("h2", "screen__title", "You Escape the Well");
        const subtitle = createElement(
          "p",
          "screen__subtitle",
          "Congratulations! You have escaped the well and step once more into the realm of the living."
        );
        const clearedRooms = Math.min(
          ctx.state.roomHistory.filter((key) => key !== foyerRoom.key).length,
          ROOMS_BEFORE_BOSS
        );
        const summary = createElement(
          "p",
          "screen__subtitle",
          `You endured ${clearedRooms} haunted chamber${clearedRooms === 1 ? "" : "s"} before confronting the foyer.`
        );

        const footer = createElement("div", "screen-footer");
        const menuButton = createElement(
          "button",
          "button button--primary",
          "Return to Main Menu"
        );
        menuButton.addEventListener("click", async () => {
          clearRunState();
          await ctx.transitionTo("mainMenu");
          ctx.showToast("You breathe freely in the manor's entry hall.");
        });
        footer.appendChild(menuButton);

        wrapper.append(title, subtitle, summary, footer);
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

    const hiddenLabel = createElement(
      "span",
      "sr-only",
      `${label}. ${ariaDescription}`
    );
    button.appendChild(hiddenLabel);
    return button;
  }

  function createDoorChoice(label, extraClasses = [], options = {}) {
    const button = createDoorButton(label, extraClasses, options);
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

    return { element: wrapper, button, labelElement };
  }

  function createRunTracker(text) {
    return createElement("div", "run-tracker", text);
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
    if (backgroundEl.dataset.bg !== image) {
      backgroundEl.style.backgroundImage = `url("${image}")`;
      backgroundEl.dataset.bg = image;
    }
    const ariaLabel = options.ariaLabel || screenDef.ariaLabel;
    if (ariaLabel) {
      backgroundEl.setAttribute("aria-label", ariaLabel);
    } else {
      backgroundEl.removeAttribute("aria-label");
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
    setBackground(screenDef, options);

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
    setBackground(initialScreen, {});
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
    roomDefinitions.forEach((room) => {
      imagesToPreload.add(room.background);
    });
    imagesToPreload.add(foyerRoom.background);
    preloadImages(Array.from(imagesToPreload));
  }

  initialize();
})();
