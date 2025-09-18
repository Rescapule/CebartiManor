import { backgrounds } from "../../data/index.js";
import { createElement } from "../dom.js";

const splashScreen = {
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
};

export default splashScreen;
