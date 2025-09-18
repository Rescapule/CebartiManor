import { FOYER_ROOM, TOTAL_ROOMS_PER_RUN, backgrounds } from "../../data/index.js";
import { createElement } from "../dom.js";
import { updateState } from "../../state/state.js";

const foyerScreen = {
  key: "foyer",
  background: backgrounds.foyer,
  ariaLabel: FOYER_ROOM.ariaLabel,
  checkpoint: true,
  render(ctx) {
    const wrapper = createElement("div", "screen screen--room screen--foyer");
    const roomNumber = Math.max(ctx.state.currentRoomNumber, TOTAL_ROOMS_PER_RUN);
    const tracker = ctx.helpers?.createRunTracker?.(
      ctx,
      `Room ${Math.min(roomNumber, TOTAL_ROOMS_PER_RUN)} of ${TOTAL_ROOMS_PER_RUN}`
    );

    const title = createElement("h2", "screen__title", FOYER_ROOM.name);
    const subtitle = createElement("p", "screen__subtitle", FOYER_ROOM.description);
    const encounter = ctx.options?.encounter || ctx.state.currentEncounter;
    const encounterScene = ctx.helpers?.createEncounterScene?.({ encounter });
    const prompt = createElement(
      "p",
      "screen__subtitle",
      ctx.helpers?.getEncounterPrompt?.("boss", encounter) || ""
    );

    const footer = createElement("div", "screen-footer");
    const continueButton = createElement(
      "button",
      "button button--primary",
      "Challenge the Foyer"
    );
    continueButton.addEventListener("click", async () => {
      continueButton.disabled = true;
      updateState({
        hasSave: false,
        lastRunScreen: null,
        inRun: false,
        currentEncounterType: null,
        currentEncounter: null,
      });
      await ctx.transitionTo("victory");
    });
    footer.appendChild(continueButton);

    if (tracker) {
      wrapper.append(tracker);
    }
    wrapper.append(title, subtitle);
    if (encounterScene) {
      wrapper.append(encounterScene.scene);
    }
    wrapper.append(prompt, footer);
    return wrapper;
  },
};

export default foyerScreen;
