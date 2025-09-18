import { createElement } from "../dom.js";
import { updateState } from "../../state/state.js";
import { initializeRunState } from "../../state/run.js";

const mainMenuScreen = {
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
      updateState({ inRun: true });
      ctx.transitionTo(ctx.state.lastRunScreen);
    });

    const newRunBtn = createElement(
      "button",
      "button menu__button",
      "New Run"
    );
    newRunBtn.addEventListener("click", () => {
      initializeRunState({ closeCodexOverlay: ctx.helpers?.closeCodexOverlay });
      updateState({ inRun: true, hasSave: false, lastRunScreen: "well" });
      ctx.transitionTo("well");
    });

    const bestiaryBtn = createElement(
      "button",
      "button menu__button",
      "Bestiary"
    );
    bestiaryBtn.addEventListener("click", () => {
      ctx.helpers?.showBestiary?.(ctx);
    });

    const settingsBtn = createElement(
      "button",
      "button menu__button",
      "Settings"
    );
    settingsBtn.addEventListener("click", () => ctx.transitionTo("settings"));

    const exitBtn = createElement("button", "button menu__button", "Exit");
    exitBtn.addEventListener("click", () => {
      ctx.exitGame();
    });

    menu.append(continueBtn, newRunBtn, bestiaryBtn, settingsBtn, exitBtn);
    panel.append(title, subtitle, menu);
    wrapper.append(panel);
    return wrapper;
  },
};

export default mainMenuScreen;
