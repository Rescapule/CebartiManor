import { TOTAL_ROOMS_PER_RUN } from "../../data/index.js";
import {
  applyRecoveryRoomBenefits,
  createMerchantPanel,
  createRewardsPanel,
} from "../../combat/engine.js";
import { createCombatExperience } from "../combat.js";
import { createElement } from "../dom.js";
import { updateState } from "../../state/state.js";

const roomScreen = {
  key: "room",
  render(ctx) {
    const roomData = ctx.options?.room;
    const encounterType =
      ctx.options?.encounterType || ctx.state.currentEncounterType;
    const encounter = ctx.options?.encounter || ctx.state.currentEncounter;
    const wrapper = createElement("div", "screen screen--room");
    const roomNumber = Math.max(ctx.state.currentRoomNumber, 1);
    const tracker = ctx.helpers?.createRunTracker?.(
      ctx,
      `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
    );

    if (tracker) {
      wrapper.appendChild(tracker);
    }

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
        updateState({ currentRoomKey: null, lastRunScreen: "corridor" });
        await ctx.transitionTo("corridor", { refresh: true });
      });
      footer.appendChild(backButton);
      updateState({ currentEncounterType: null, currentEncounter: null });
      wrapper.append(title, subtitle, footer);
      return wrapper;
    }

    const title = createElement("h2", "screen__title", roomData.name);
    const subtitle = createElement(
      "p",
      "screen__subtitle",
      roomData.description
    );

    wrapper.append(title, subtitle);

    if (ctx.helpers?.isCombatEncounter?.(encounterType)) {
      const combatExperience = createCombatExperience(ctx, {
        room: roomData,
        encounterType,
        encounter,
      });
      wrapper.append(combatExperience.container, combatExperience.footer);
      return wrapper;
    }

    const encounterScene = ctx.helpers?.createEncounterScene?.({ encounter });
    if (encounterScene) {
      wrapper.append(encounterScene.scene);
    }
    const prompt = createElement(
      "p",
      "screen__subtitle",
      ctx.helpers?.getEncounterPrompt?.(encounterType, encounter) || ""
    );
    const footer = createElement("div", "screen-footer");
    const continueButton = createElement(
      "button",
      "button button--primary",
      "Return to the Corridor"
    );
    continueButton.addEventListener("click", async () => {
      updateState({
        currentRoomKey: null,
        lastRunScreen: "corridor",
        corridorRefreshes: 0,
        currentEncounterType: null,
        currentEncounter: null,
      });
      await ctx.transitionTo("corridor", { fromRoom: true });
      ctx.showToast("You slip back into the corridor.");
    });
    footer.appendChild(continueButton);

    wrapper.append(prompt);

    if (encounterType === "recovery") {
      const recoveryResult = applyRecoveryRoomBenefits(ctx, roomData.key);
      const detailText = recoveryResult
        ? `You absorb the chamber's lingering calm. Maximum Essence increases by ${recoveryResult.essenceIncrease} and your essence is fully restored.`
        : "The chamber's restorative energies have already been spent.";
      wrapper.appendChild(createElement("p", "combat-rewards__detail", detailText));
      if (recoveryResult) {
        ctx.showToast(
          `Your essence deepens by ${recoveryResult.essenceIncrease}.`
        );
      } else {
        ctx.showToast("You feel as renewed as this chamber allows.");
      }
      wrapper.appendChild(footer);
      return wrapper;
    }

    if (encounterType === "treasure") {
      const { panel: rewardsPanel } = createRewardsPanel(ctx, {
        encounterType: "treasure",
        continueButton,
      });
      if (rewardsPanel) {
        wrapper.appendChild(rewardsPanel);
      }
      wrapper.appendChild(footer);
      return wrapper;
    }

    if (encounterType === "merchant") {
      const merchantPanel = createMerchantPanel(ctx, continueButton);
      wrapper.append(merchantPanel, footer);
      return wrapper;
    }

    wrapper.appendChild(footer);
    return wrapper;
  },
};

export default roomScreen;
