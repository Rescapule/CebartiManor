import { createElement } from "../dom.js";

const settingsScreen = {
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
};

export default settingsScreen;
