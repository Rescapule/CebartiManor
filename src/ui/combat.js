import { ACTION_DEFINITIONS } from '../combat/actions-data.js';
import { ACTION_SEQUENCES } from '../combat/actions.js';
import {
  createCombatState,
  startCombat,
  endPlayerTurn,
  performPlayerAction,
  getActionApCost,
  getActionEssenceCost,
  burnActionSlot,
} from '../combat/engine.js';
import { playerCharacter } from '../data/index.js';
import { setActiveCombat, updateState } from '../state/state.js';
import { isDevEntryDisabled } from '../state/devtools.js';
import { createElement } from './dom.js';

function createCombatantDisplay(combatant, role, encounter) {
  const container = createElement(
    'div',
    `combatant-card combatant-card--${role}`
  );
  const avatar = createElement('div', 'combatant-card__avatar');
  avatar.title = combatant.name;
  avatar.dataset.role = role;
  container.appendChild(avatar);

  const spriteSource =
    role === 'enemy'
      ? encounter?.sprite
      : role === 'player'
      ? playerCharacter
      : null;
  if (spriteSource?.src) {
    const image = document.createElement('img');
    image.className = 'combatant-card__sprite';
    image.src = spriteSource.src;
    image.alt = spriteSource.alt || combatant.name;
    image.loading = role === 'player' ? 'eager' : 'lazy';
    image.decoding = 'async';
    avatar.appendChild(image);
  }

  const name = createElement('div', 'combatant-card__name', combatant.name);
  container.appendChild(name);

  const stats = createElement('div', 'combatant-card__stats');
  container.appendChild(stats);

  if (role === 'enemy' && encounter?.sprite) {
    avatar.dataset.sprite = encounter.sprite.key || 'enemy';
  }

  const statusList = createElement('div', 'combatant-card__statuses');
  container.appendChild(statusList);

  return { container, avatar, stats, statusList };
}

function createCombatExperience(ctx, { room, encounterType, encounter }) {
  const combat = createCombatState(ctx, { room, encounterType, encounter });
  combat.devBurnMode = false;
  const container = createElement('div', 'combat');
  const sidebar = createElement('aside', 'combat__sidebar');
  const statsPanel = createElement('div', 'combat-sidebar__summary');
  const statsText = createElement('div', 'combat-sidebar__summary-text');
  statsPanel.appendChild(statsText);
  let devApButton = null;
  if (ctx.state?.devMode) {
    devApButton = createElement('button', 'combat-dev-button');
    devApButton.type = 'button';
    devApButton.setAttribute('aria-label', 'Grant 3 AP');
    devApButton.title = 'Developer tool: grant 3 AP.';
    const icon = document.createElement('img');
    icon.src = 'logofull.png';
    icon.alt = '';
    icon.loading = 'lazy';
    icon.decoding = 'async';
    icon.className = 'combat-dev-button__icon';
    devApButton.appendChild(icon);
    devApButton.addEventListener('click', () => {
      if (!combat.ctx?.state?.devMode) {
        combat.ctx?.showToast?.('Developer mode is required for this tool.');
        return;
      }
      combat.player.ap = Math.min(
        combat.player.ap + 3,
        combat.player.apCarryoverMax
      );
      updateStatsSummary(combat);
      updateActionButtons(combat);
      combat.ctx?.showToast?.('Developer grant: +3 AP.');
    });
    statsPanel.appendChild(devApButton);
  }
  const actionBarSection = createElement('div', 'combat-action-bar');
  const actionBar = createElement('div', 'action-bar');
  actionBarSection.appendChild(actionBar);
  let devBurnButton = null;
  if (ctx.state?.devMode) {
    devBurnButton = createElement(
      'button',
      'combat-dev-button combat-dev-button--burn'
    );
    devBurnButton.type = 'button';
    devBurnButton.setAttribute('aria-label', 'Toggle burn mode');
    devBurnButton.title = 'Developer tool: replace actions from the soup.';
    const burnIcon = document.createElement('img');
    burnIcon.src = 'logofull.png';
    burnIcon.alt = '';
    burnIcon.loading = 'lazy';
    burnIcon.decoding = 'async';
    burnIcon.className = 'combat-dev-button__icon';
    devBurnButton.appendChild(burnIcon);
    devBurnButton.addEventListener('click', () => {
      if (!combat.ctx?.state?.devMode) {
        combat.devBurnMode = false;
        combat.ctx?.showToast?.('Developer mode is required for burn mode.');
        updateActionButtons(combat);
        return;
      }
      combat.devBurnMode = !combat.devBurnMode;
      devBurnButton.classList.toggle('is-active', combat.devBurnMode);
      updateActionButtons(combat);
    });
    actionBarSection.appendChild(devBurnButton);
  }
  sidebar.append(statsPanel, actionBarSection);

  const endTurnButton = createElement(
    'button',
    'button action-bar__end-turn',
    'End Turn'
  );
  endTurnButton.addEventListener('click', () => {
    if (combat.turn === 'player' && combat.status === 'inProgress') {
      endPlayerTurn(combat);
    }
  });
  sidebar.appendChild(endTurnButton);

  const main = createElement('div', 'combat__main');
  const board = createElement('div', 'combat__board');
  const playerDisplay = createCombatantDisplay(combat.player, 'player');
  const enemyDisplay = createCombatantDisplay(combat.enemy, 'enemy', encounter);
  board.append(playerDisplay.container, enemyDisplay.container);
  const floatLayer = createElement('div', 'combat__float-layer');
  const logElement = createCombatLogElement();
  main.append(board, floatLayer, logElement);

  container.append(sidebar, main);

  const footer = createElement('div', 'combat__footer');
  const continueButton = createElement(
    'button',
    'button button--primary',
    'Return to the Corridor'
  );
  continueButton.disabled = true;
  footer.appendChild(continueButton);

  continueButton.addEventListener('click', async () => {
    if (combat.status === 'victory') {
      updateState({
        currentEncounterType: null,
        currentEncounter: null,
        lastRunScreen: 'corridor',
      });
      await ctx.transitionTo('corridor', { fromRoom: true });
      ctx.showToast('You slip back into the corridor.');
    } else if (combat.status === 'defeat') {
      updateState({ inRun: false });
      await ctx.transitionTo('mainMenu');
      ctx.showToast("Defeat drives you back to the manor's entry hall.");
    }
  });

  combat.dom = {
    container,
    sidebar,
    statsPanel,
    statsText,
    actionBar,
    actionBarSection,
    endTurnButton,
    main,
    board,
    floatLayer,
    logElement,
    logBody: logElement.querySelector('.combat-log__body'),
    playerPanel: playerDisplay.container,
    playerStats: playerDisplay.stats,
    playerStatuses: playerDisplay.statusList,
    enemyPanel: enemyDisplay.container,
    enemyStats: enemyDisplay.stats,
    enemyStatuses: enemyDisplay.statusList,
    footer,
    continueButton,
    devBurnButton: devBurnButton,
    devApButton,
  };

  setActiveCombat(combat);
  startCombat(combat);
  return { container, footer, combat };
}

function createCombatLogElement() {
  const details = createElement('details', 'combat-log');
  details.open = false;
  const summary = createElement('summary', 'combat-log__summary', 'Combat Log');
  const body = createElement('div', 'combat-log__body');
  details.append(summary, body);
  return details;
}

function updateCombatLog(combat) {
  if (!combat.dom || !combat.dom.logBody) {
    return;
  }
  const body = combat.dom.logBody;
  body.replaceChildren();
  combat.log.slice(-40).forEach((entry) => {
    const item = createElement('p', 'combat-log__entry', entry);
    body.appendChild(item);
  });
}

function updateCombatUI(combat) {
  if (!combat.dom) {
    return;
  }
  updateActionButtons(combat);
  updateStatsSummary(combat);
  updateCombatantPanel(
    combat,
    combat.player,
    combat.dom.playerStats,
    combat.dom.playerStatuses
  );
  updateCombatantPanel(
    combat,
    combat.enemy,
    combat.dom.enemyStats,
    combat.dom.enemyStatuses
  );
}

function updateStatsSummary(combat) {
  if (!combat.dom || !combat.dom.statsPanel) {
    return;
  }
  const gold = combat.ctx?.state?.playerGold || 0;
  const target = combat.dom.statsText || combat.dom.statsPanel;
  target.textContent =
    `Essence ${combat.player.essence}/${combat.player.maxEssence} • AP ${combat.player.ap}/${combat.player.apCarryoverMax} • Gold ${gold}`;
}

function updateCombatantPanel(combat, combatant, statsElement, statusElement) {
  if (!statsElement || !statusElement) {
    return;
  }
  const apText =
    combatant.side === 'player'
      ? `AP ${combatant.ap}`
      : '';
  statsElement.textContent = `Essence ${combatant.essence}/${combatant.maxEssence}${apText ? ` • ${apText}` : ''}`;
  statusElement.replaceChildren();
  if (combatant.block) {
    statusElement.appendChild(
      createElement('span', 'status-chip', `Block ${combatant.block}`)
    );
  }
  if (combatant.armor) {
    statusElement.appendChild(
      createElement('span', 'status-chip', `Armor ${combatant.armor}`)
    );
  }
  if (!combatant.statuses) {
    return;
  }
  Object.entries(combatant.statuses).forEach(([key, status]) => {
    const label = formatStatusLabel(key, status);
    if (!label) {
      return;
    }
    const chip = createElement('span', 'status-chip', label);
    chip.dataset.status = key;
    statusElement.appendChild(chip);
  });
}

function formatStatusLabel(key, status) {
  const value = status?.stacks || 0;
  switch (key) {
    case 'bleed':
      return `Bleed ${value}`;
    case 'vulnerable':
      return `Vulnerable ${value}`;
    case 'critBuff':
      return `Crit +${value}%`;
    case 'restrained':
      return 'Restrained';
    case 'fatigue':
      return `Fatigue ${value}`;
    case 'dazed':
      return `Dazed ${value}`;
    default:
      return '';
  }
}

function updateActionButtons(combat) {
  if (!combat.dom || !combat.dom.actionBar) {
    return;
  }
  const bar = combat.dom.actionBar;
  bar.replaceChildren();
  const burnModeActive = Boolean(combat.devBurnMode && combat.ctx?.state?.devMode);
  bar.classList.toggle('action-bar--burn-mode', burnModeActive);
  if (combat.dom.devBurnButton) {
    combat.dom.devBurnButton.classList.toggle('is-active', burnModeActive);
    combat.dom.devBurnButton.disabled = !combat.ctx?.state?.devMode;
  }
  if (combat.dom.actionBarSection) {
    combat.dom.actionBarSection.classList.toggle(
      'combat-action-bar--burn-mode',
      burnModeActive
    );
  }
  if (!burnModeActive && combat.devBurnMode && !combat.ctx?.state?.devMode) {
    combat.devBurnMode = false;
  }
  combat.actionSlots.forEach((slot, index) => {
    const button = createActionButton(combat, slot, index);
    bar.appendChild(button);
  });
}

function createActionButton(combat, slot, index) {
  const button = createElement('button', 'action-button');
  button.type = 'button';
  if (!slot) {
    button.disabled = true;
    button.textContent = 'Empty';
    return button;
  }
  const action = ACTION_DEFINITIONS[slot.actionKey];
  if (!action) {
    button.disabled = true;
    button.textContent = 'Unknown';
    return button;
  }
  const devDisabled = isDevEntryDisabled('action', action.key);
  const apCost = getActionApCost(combat, action);
  const essenceCost = getActionEssenceCost(combat, action);
  const header = createElement('div', 'action-button__header');
  const icon = createElement('span', 'action-button__icon');
  icon.dataset.emotion = action.emotion || 'neutral';
  const name = createElement('span', 'action-button__name', action.name);
  const cost = createElement(
    'span',
    'action-button__cost',
    [apCost ? `${apCost} AP` : null, essenceCost ? `${essenceCost} Ess` : null]
      .filter(Boolean)
      .join(' • ') || 'Free'
  );
  header.append(icon, name, cost);
  button.appendChild(header);

  const description = createElement(
    'p',
    'action-button__description',
    action.description || ''
  );
  button.appendChild(description);

  if (action.chain) {
    const sequence = ACTION_SEQUENCES[action.chain.key] || [];
    const chainText = sequence.map((key) => ACTION_DEFINITIONS[key]?.name || key).join(' → ');
    const chain = createElement('p', 'action-button__chain', `Chain: ${chainText}`);
    button.appendChild(chain);
  }

  const burnMode = combat.devBurnMode && combat.ctx?.state?.devMode;
  if (burnMode) {
    button.classList.add('action-button--dev-burn');
    button.disabled = false;
    button.title = 'Burn this action to draw a new one.';
    button.addEventListener('click', () => {
      burnActionSlot(combat, index);
    });
    return button;
  }

  const canUse =
    !devDisabled &&
    combat.turn === 'player' &&
    combat.status === 'inProgress' &&
    combat.player.ap >= apCost &&
    combat.player.essence >= essenceCost;
  if (devDisabled) {
    button.classList.add('action-button--dev-disabled');
    button.disabled = true;
    button.title = `${action.name} is disabled in developer mode.`;
  } else {
    button.disabled = !canUse;
    button.title = `${action.name} — ${action.description}`;
  }
  if (canUse) {
    button.addEventListener('click', () => performPlayerAction(combat, index));
  }
  return button;
}

function showFloatingText(combat, targetElement, text, type) {
  if (!combat.dom || !combat.dom.floatLayer || !targetElement) {
    return;
  }
  const layer = combat.dom.floatLayer;
  const boardRect = combat.dom.board.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  const bubble = createElement(
    'span',
    `floating-text floating-text--${type || 'info'}`,
    text
  );
  bubble.style.left = `${targetRect.left - boardRect.left + targetRect.width / 2}px`;
  bubble.style.top = `${targetRect.top - boardRect.top}px`;
  layer.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add('is-visible'));
  window.setTimeout(() => {
    bubble.remove();
  }, 1200);
}

export {
  createCombatExperience,
  createCombatantDisplay,
  createCombatLogElement,
  createActionButton,
  showFloatingText,
  updateCombatLog,
  updateCombatUI,
};
