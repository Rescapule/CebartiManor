import {
  ENHANCED_DOOR_CHANCE,
  ROOMS_BEFORE_BOSS,
  backgrounds,
  MANOR_KEY_CONSUMABLE_KEY,
} from "../../data/index.js";
import { sampleWithoutReplacement } from "../../state/random.js";
import { clearRunState, getDoorCategoryOptions, goToFoyer, goToRoom } from "../../state/run.js";
import { updateState } from "../../state/state.js";
import { createElement } from "../dom.js";

const corridorScreen = {
  key: "corridor",
  background: backgrounds.corridor,
  ariaLabel: "A corridor within Cebarti Manor awaiting door choices.",
  checkpoint: true,
  render(ctx) {
    if (ctx.options && ctx.options.fromRoom) {
      updateState({ currentRoomKey: null });
    }

    updateState({ currentEncounterType: null, currentEncounter: null });

    const wrapper = createElement("div", "screen screen--corridor");
    const availableRooms = Array.isArray(ctx.state.roomPool)
      ? ctx.state.roomPool
      : [];
    const roomsRemaining = Math.max(availableRooms.length, 0);
    const roomsCleared = Math.min(
      ROOMS_BEFORE_BOSS - roomsRemaining,
      ROOMS_BEFORE_BOSS
    );

    const tracker = ctx.helpers?.createRunTracker?.(
      ctx,
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

    updateState({ currentRoomIsEnhanced: false });

    const doorMap = createElement("div", "door-map");
    if (roomsRemaining === 0) {
      const { element: foyerDoor, button: foyerButton } =
        ctx.helpers?.createDoorChoice?.("Door to the Foyer", ["door-button--umbra"], {
          ariaDescription: "Leads directly to the foyer and the final encounter.",
          displayLabel: "Foyer",
          detail: "Face Helen Cebarti's final challenge.",
        }) || {};
      if (foyerDoor && foyerButton) {
        foyerButton.addEventListener("click", async () => {
          foyerButton.disabled = true;
          await goToFoyer(ctx);
        });
        doorMap.appendChild(foyerDoor);
      }
    } else {
      const doorCount = Math.min(3, roomsRemaining);
      const roomsForDoors = sampleWithoutReplacement(availableRooms, doorCount);
      const categories = getDoorCategoryOptions(doorCount);
      const doors = roomsForDoors.map((roomKey, index) => {
        const category = categories[index] || {};
        const enhanced =
          doorCount <= 1 ? false : Math.random() < ENHANCED_DOOR_CHANCE;
        return { roomKey, category, enhanced };
      });

      if (doors.length > 0 && doors.every((door) => door.enhanced)) {
        const randomIndex = Math.floor(Math.random() * doors.length);
        doors[randomIndex].enhanced = false;
      }

      doors.forEach(({ roomKey, category, enhanced }, index) => {
        const extraClasses = [];
        if (typeof category.colorClass === "string" && category.colorClass) {
          extraClasses.push(category.colorClass);
        }
        if (enhanced) {
          extraClasses.push("door-button--enhanced");
        }

        const detailParts = [];
        if (category.detail) {
          detailParts.push(category.detail);
        }
        if (enhanced) {
          detailParts.push("Locked — requires a Manor Key.");
        }

        const doorLabel = category.label || `Door ${index + 1}`;
        const detailText = detailParts.join(" ").trim();
        const ariaDescriptionParts = [
          category.ariaDescription || "Leads to an unknown chamber.",
        ];
        if (enhanced) {
          ariaDescriptionParts.push("Locked — requires a Manor Key.");
        }

        const choice = ctx.helpers?.createDoorChoice?.(doorLabel, extraClasses, {
          ariaDescription: ariaDescriptionParts.join(" "),
          detail: detailText.length > 0 ? detailText : undefined,
          displayLabel: doorLabel,
          dataset:
            typeof category.key === "string"
              ? { category: category.key }
              : undefined,
          iconSrc: category.icon,
        });

        if (!choice) {
          return;
        }

        const {
          element: doorChoice,
          button: doorButton,
          iconElement,
          labelElement,
          lockElement,
          frame,
        } = choice;

        if (iconElement) {
          iconElement.title = category.label || doorLabel;
        }

        if (labelElement && enhanced) {
          labelElement.classList.add("door-option__label--locked");
          const lockBadge = createElement("span", "door-option__badge", "Locked");
          labelElement.appendChild(lockBadge);
        }

        if (lockElement) {
          lockElement.loading = "lazy";
        }

        let isLocked = enhanced;
        if (isLocked) {
          doorButton.classList.add("door-button--locked");
        }
        doorButton.dataset.locked = isLocked ? "true" : "false";
        doorButton.dataset.enhanced = enhanced ? "true" : "false";
        if (category.key) {
          doorButton.dataset.roomType = category.key;
        }

        if (ctx.state?.devMode && isLocked && frame) {
          const devButton = createElement(
            "button",
            "door-button__dev-toggle",
            ""
          );
          devButton.type = "button";
          devButton.setAttribute("aria-label", "Unlock door in developer mode");
          devButton.title = "Developer override: unlock without a key.";
          const logo = document.createElement("img");
          logo.src = "logofull.png";
          logo.alt = "";
          logo.loading = "lazy";
          logo.decoding = "async";
          logo.className = "door-button__dev-icon";
          devButton.appendChild(logo);
          devButton.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (!isLocked) {
              return;
            }
            isLocked = false;
            doorButton.dataset.locked = "false";
            doorButton.classList.remove("door-button--locked");
            devButton.disabled = true;
            devButton.classList.add("door-button__dev-toggle--used");
            ctx.showToast?.("Developer override unlocks the door.");
          });
          frame.appendChild(devButton);
        }

        doorButton.addEventListener("click", async () => {
          if (isLocked) {
            const hasKey =
              (ctx.helpers?.getConsumableCount?.(MANOR_KEY_CONSUMABLE_KEY) || 0) > 0;
            if (!hasKey) {
              ctx.showToast("The lock refuses to budge. You'll need a Manor Key.");
              doorButton.classList.add("door-button--shake");
              window.setTimeout(() => {
                doorButton.classList.remove("door-button--shake");
              }, 360);
              return;
            }
            const spent = ctx.helpers?.spendConsumableCharge?.(
              MANOR_KEY_CONSUMABLE_KEY,
              ctx
            );
            if (!spent) {
              ctx.showToast(
                "The key slips from your grasp before the lock yields."
              );
              return;
            }
            ctx.showToast("The Manor Key clicks open the lock.");
            isLocked = false;
            doorButton.dataset.locked = "false";
            doorButton.classList.remove("door-button--locked");
          }
          doorButton.disabled = true;
          await goToRoom(ctx, roomKey, {
            encounterType: category.key,
            enhanced,
          });
        });
        doorMap.appendChild(doorChoice);
      });
    }

    const footer = createElement("div", "screen-footer");
    if (roomsRemaining > 0) {
      const continueButton = createElement(
        "button",
        "button button--primary",
        "Continue Down the Corridor"
      );
      continueButton.addEventListener("click", async () => {
        const corridorRefreshes = (ctx.state.corridorRefreshes || 0) + 1;
        updateState({
          corridorRefreshes,
          lastRunScreen: "corridor",
        });
        await ctx.transitionTo("corridor", { refresh: true });
        ctx.showToast("The corridor rearranges itself.");
      });
      footer.appendChild(continueButton);
    }

    const returnButton = createElement(
      "button",
      "button",
      "Return to Main Menu"
    );
    returnButton.addEventListener("click", async () => {
      const confirmReturn = window.confirm(
        "Abandon this run and return to the main menu?"
      );
      if (!confirmReturn) {
        return;
      }
      clearRunState({ closeCodexOverlay: ctx.helpers?.closeCodexOverlay });
      await ctx.transitionTo("mainMenu");
      ctx.showToast(
        "You withdraw from the corridor and return to the manor's entry hall."
      );
    });
    footer.appendChild(returnButton);

    if (tracker) {
      wrapper.append(tracker);
    }
    wrapper.append(title, subtitle, doorMap, footer);
    return wrapper;
  },
};

export default corridorScreen;
