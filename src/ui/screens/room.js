import { TOTAL_ROOMS_PER_RUN } from "../../data/index.js";
import {
  applyRecoveryRoomBenefits,
  createMerchantPanel,
  createRewardsPanel,
} from "../../combat/engine.js";
import { createCombatExperience } from "../combat.js";
import { createElement } from "../dom.js";
import { updateState } from "../../state/state.js";
import {
  awardRandomRelicFromEvent,
  describeEventOutcome,
  getEventSacrificeOptions,
  sacrificeEventOffering,
} from "../../state/events.js";

function formatList(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  const head = items.slice(0, -1);
  const tail = items[items.length - 1];
  return `${head.join(", ")} and ${tail}`;
}

function createEventEncounterUI(ctx, encounter) {
  const container = createElement("div", "event-encounter");
  const definition = encounter?.definition;
  const flavor = encounter?.flavor;
  const summaryText =
    flavor?.description ||
    definition?.summary ||
    "The manor stirs in response to your presence.";
  container.appendChild(createElement("p", "screen__subtitle", summaryText));

  if (Array.isArray(definition?.detailParagraphs)) {
    definition.detailParagraphs
      .filter((text) => typeof text === "string" && text.trim().length > 0)
      .forEach((text) => {
        container.appendChild(
          createElement("p", "combat-rewards__detail", text)
        );
      });
  }

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

  const effectType = definition?.effect?.type;
  if (effectType === "awardRandomRelic") {
    let encounterState = encounter;
    let outcome = encounterState?.result;
    if (!encounterState?.resolved) {
      outcome = awardRandomRelicFromEvent(encounterState, ctx);
      encounterState = {
        ...encounterState,
        resolved: true,
        result: outcome,
      };
      updateState({ currentEncounter: encounterState });
    }

    const resultWrapper = createElement("div", "event-encounter__results");
    if (outcome?.success) {
      const relicNames = Array.isArray(outcome.relics)
        ? outcome.relics
            .map((relic) => relic?.name)
            .filter((name) => typeof name === "string" && name)
        : [];
      const rewardText = relicNames.length
        ? `The manor grants you ${formatList(relicNames)}.`
        : "The manor grants you a relic.";
      resultWrapper.appendChild(
        createElement("p", "combat-rewards__detail", rewardText)
      );
      const flavorText = describeEventOutcome(encounterState, outcome);
      if (flavorText) {
        resultWrapper.appendChild(
          createElement("p", "combat-rewards__detail", flavorText)
        );
      }
    } else {
      const failureText =
        describeEventOutcome(encounterState, outcome) ||
        definition?.ui?.noEligibleText ||
        "The manor has no further boons to share.";
      resultWrapper.appendChild(
        createElement("p", "combat-rewards__detail", failureText)
      );
    }
    container.appendChild(resultWrapper);
    continueButton.disabled = false;
    return { container, footer };
  }

  if (effectType === "sacrificeRelicOrMemory") {
    let encounterState = encounter;
    const resultWrapper = createElement("div", "event-encounter__results");
    const selectionNotice = definition?.ui?.choosePrompt;
    if (!encounterState?.resolved) {
      const options = getEventSacrificeOptions();
      const combined = [...options.relics, ...options.memories];
      if (combined.length === 0) {
        const failureOutcome = { success: false, reason: "noOptions" };
        const failureText =
          describeEventOutcome(encounterState, failureOutcome) ||
          definition?.ui?.nothingToLoseText ||
          "The manor finds nothing to claim.";
        resultWrapper.appendChild(
          createElement("p", "combat-rewards__detail", failureText)
        );
        encounterState = {
          ...encounterState,
          resolved: true,
          result: failureOutcome,
        };
        updateState({ currentEncounter: encounterState });
        continueButton.disabled = false;
        container.appendChild(resultWrapper);
        return { container, footer };
      }

      if (selectionNotice) {
        container.appendChild(
          createElement("p", "combat-rewards__detail", selectionNotice)
        );
      }

      const form = createElement("form", "event-encounter__form");
      const list = createElement("ul", "event-encounter__choices");
      let selectedKey = null;
      let selectedType = null;

      combined.forEach((option, index) => {
        const item = createElement("li", "event-encounter__choice");
        const inputId = `event-choice-${option.type}-${option.key}`;
        const label = createElement("label", "event-encounter__label");
        label.setAttribute("for", inputId);
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "eventOffering";
        input.id = inputId;
        input.value = option.key;
        input.dataset.type = option.type;
        if (index === 0) {
          input.checked = true;
          selectedKey = option.key;
          selectedType = option.type;
        }
        input.addEventListener("change", () => {
          selectedKey = input.value;
          selectedType = input.dataset.type;
        });
        const labelText =
          option.type === "memory"
            ? `Memory: ${option.name}`
            : `Relic: ${option.name}`;
        label.appendChild(input);
        label.appendChild(document.createTextNode(labelText));
        item.appendChild(label);
        list.appendChild(item);
      });

      form.appendChild(list);
      const confirmButton = createElement(
        "button",
        "button button--primary",
        definition?.ui?.confirmLabel || "Offer This Tribute"
      );
      confirmButton.type = "button";
      confirmButton.addEventListener("click", () => {
        if (!selectedKey || !selectedType) {
          ctx.showToast?.("Select an offering for the manor.");
          return;
        }
        const outcome = sacrificeEventOffering(
          { key: selectedKey, type: selectedType },
          ctx
        );
        if (!outcome?.success) {
          ctx.showToast?.("The manor rejects your attempt.");
          return;
        }
        encounterState = {
          ...encounterState,
          resolved: true,
          result: outcome,
        };
        updateState({ currentEncounter: encounterState });
        confirmButton.disabled = true;
        form.querySelectorAll("input").forEach((input) => {
          input.disabled = true;
        });
        continueButton.disabled = false;
        const sacrificeLabel =
          outcome.type === "memory" ? "memory" : "relic";
        resultWrapper.appendChild(
          createElement(
            "p",
            "combat-rewards__detail",
            `You surrender the ${sacrificeLabel}: ${outcome.name}.`
          )
        );
        const flavorText = describeEventOutcome(encounterState, outcome);
        if (flavorText) {
          resultWrapper.appendChild(
            createElement("p", "combat-rewards__detail", flavorText)
          );
        }
      });

      form.appendChild(confirmButton);
      container.appendChild(form);
      container.appendChild(resultWrapper);
      continueButton.disabled = true;
      return { container, footer };
    }

    const finalOutcome = encounterState?.result;
    if (finalOutcome?.success) {
      const sacrificeLabel =
        finalOutcome.type === "memory" ? "memory" : "relic";
      resultWrapper.appendChild(
        createElement(
          "p",
          "combat-rewards__detail",
          `You surrender the ${sacrificeLabel}: ${finalOutcome.name}.`
        )
      );
      const flavorText = describeEventOutcome(encounterState, finalOutcome);
      if (flavorText) {
        resultWrapper.appendChild(
          createElement("p", "combat-rewards__detail", flavorText)
        );
      }
    } else {
      const failureText =
        describeEventOutcome(encounterState, finalOutcome) ||
        definition?.ui?.nothingToLoseText ||
        "The manor finds nothing to claim.";
      resultWrapper.appendChild(
        createElement("p", "combat-rewards__detail", failureText)
      );
    }
    container.appendChild(resultWrapper);
    continueButton.disabled = false;
    return { container, footer };
  }

  container.appendChild(
    createElement(
      "p",
      "combat-rewards__detail",
      "The manor hesitates, unsure of how to proceed."
    )
  );
  continueButton.disabled = false;
  return { container, footer };
}

const roomScreen = {
  key: "room",
  render(ctx) {
    const roomData = ctx.options?.room;
    const encounterType =
      ctx.options?.encounterType || ctx.state.currentEncounterType;
    const encounter =
      ctx.state.currentEncounter || ctx.options?.encounter || null;
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

    if (encounterType === "event") {
      const eventExperience = createEventEncounterUI(ctx, encounter);
      if (eventExperience?.container) {
        wrapper.appendChild(eventExperience.container);
      }
      if (eventExperience?.footer) {
        wrapper.appendChild(eventExperience.footer);
      }
      return wrapper;
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
