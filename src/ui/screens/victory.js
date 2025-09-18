import { FOYER_ROOM, ROOMS_BEFORE_BOSS, backgrounds } from "../../data/index.js";
import { createElement } from "../dom.js";
import { clearRunState } from "../../state/run.js";

const victoryScreen = {
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
      ctx.state.roomHistory.filter((key) => key !== FOYER_ROOM.key).length,
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
      clearRunState({ closeCodexOverlay: ctx.helpers?.closeCodexOverlay });
      await ctx.transitionTo("mainMenu");
      ctx.showToast("You breathe freely in the manor's entry hall.");
    });
    footer.appendChild(menuButton);

    wrapper.append(title, subtitle, summary, footer);
    return wrapper;
  },
};

export default victoryScreen;
