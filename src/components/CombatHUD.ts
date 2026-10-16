import type { GameState } from '../types';
import { icon } from './icons';
import { PARRY_MS, REACTION_MS } from '../combat';

export class CombatHUD {
  constructor(private element: HTMLElement, private defenseElement: HTMLElement, defend: (kind: 'dodge' | 'parry') => void) {
    element.innerHTML = '<div class="enemy-vitality"><span>Enemy</span><strong id="enemy-hp"></strong><div class="resource-track"><i id="enemy-hp-fill"></i></div></div><div class="enemy-intent"><strong id="enemy-intent"></strong></div>';
    defenseElement.innerHTML = `<div class="reaction-actions"><button id="dodge-button" class="reaction-button" aria-label="Dodge" data-tooltip="Dodge · 15 stamina · Alt + Q. Avoid an incoming strike." title="Dodge">${icon('dodge')}</button><button id="parry-button" class="reaction-button" aria-label="Parry" data-tooltip="Parry · Alt + F. Deflect a strike in its final 0.35 seconds." title="Parry">${icon('parry')}</button></div><div class="reaction-track"><i id="reaction-fill"></i></div><p id="reaction-status" aria-live="polite">Watch the enemy</p>`;
    defenseElement.querySelector<HTMLButtonElement>('#dodge-button')!.addEventListener('click', event => {
      if ((event.currentTarget as HTMLButtonElement).getAttribute('aria-disabled') !== 'true') defend('dodge');
    });
    defenseElement.querySelector<HTMLButtonElement>('#parry-button')!.addEventListener('click', event => {
      if ((event.currentTarget as HTMLButtonElement).getAttribute('aria-disabled') !== 'true') defend('parry');
    });
  }
  update(state: GameState): void {
    const $ = (id: string) => (this.element.querySelector<HTMLElement>(`#${id}`) ?? this.defenseElement.querySelector<HTMLElement>(`#${id}`))!;
    $('enemy-hp').textContent = `${Math.max(0, state.enemyHp)} / ${state.enemyMaxHp}`;
    $('enemy-hp-fill').style.width = `${Math.max(0, state.enemyHp / state.enemyMaxHp * 100)}%`;
    $('enemy-intent').textContent = state.enemyIntent || 'Waiting for your move';
    this.defenseElement.classList.toggle('reaction-open', state.defenseWindow);
    this.defenseElement.classList.toggle('parry-ready', state.defenseWindow && state.reactionRemainingMs <= PARRY_MS);
    $('dodge-button').setAttribute('aria-disabled', String(!state.defenseWindow || state.stamina < 15 || state.learningPaused));
    $('parry-button').setAttribute('aria-disabled', String(!state.defenseWindow || state.learningPaused));
    $('reaction-fill').style.width = `${Math.max(0, state.reactionRemainingMs / REACTION_MS * 100)}%`;
    $('reaction-status').textContent = state.defenseWindow ? state.reactionRemainingMs <= PARRY_MS ? 'Parry now' : `Incoming · ${(state.reactionRemainingMs / 1000).toFixed(1)} s` : 'Dodge / Parry';
  }
}
