import { backgrounds } from "../../data/index.js";
import { createElement } from "../dom.js";
import { updateState } from "../../state/state.js";

const wellScreen = {
  key: "well",
  background: backgrounds.well,
  ariaLabel: "The Styx well inside Cebarti Manor.",
  checkpoint: true,
  render(ctx) {
    updateState({ currentEncounterType: null, currentEncounter: null });

    const wrapper = createElement("div", "screen screen--well");
    const title = createElement("h2", "screen__title", "The Styx Well");
    const subtitle = createElement(
      "p",
      "screen__subtitle",
      "Draft three memories to define this run's starting action pool."
    );

    const wellScene = ctx.helpers?.createWellScene?.();
    const draftPanel = ctx.helpers?.renderMemoryDraft?.(ctx);

    const footer = createElement("div", "screen-footer");
    const continueButton = createElement(
      "button",
      "button button--primary",
      "Continue"
    );
    continueButton.disabled =
      ctx.state.playerMemories.length !== ctx.state.draftPacks.length;
    continueButton.addEventListener("click", async () => {
      if (ctx.state.playerMemories.length !== ctx.state.draftPacks.length) {
        ctx.showToast("Choose one memory from each set to proceed.");
        return;
      }
      updateState({ corridorRefreshes: 0, lastRunScreen: "corridor" });
      await ctx.transitionTo("corridor");
      ctx.showToast("You ascend into the corridor.");
    });
    footer.appendChild(continueButton);

    wrapper.append(title, subtitle);
    if (wellScene) {
      wrapper.append(wellScene);
    }
    if (draftPanel) {
      wrapper.append(draftPanel);
    }
    wrapper.append(footer);

    window.requestAnimationFrame(() => {
      ctx.helpers?.updateMemoryDraftSelection?.(ctx);
    });

    return wrapper;
  },
};

export default wellScreen;
