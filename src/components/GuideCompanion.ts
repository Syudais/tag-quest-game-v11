import type { GameState } from '../types';

export class GuideCompanion {
  constructor(private toggle: HTMLButtonElement, talk: () => void) {
    toggle.addEventListener('click', () => {
      if (!toggle.disabled) talk();
    });
  }

  update(_state: GameState, canOpen: boolean): void {
    this.toggle.disabled = !canOpen;
    this.toggle.title = canOpen ? 'Call Mr. Rifky. Reading pauses the fight.' : 'Finish this attack or defense first.';
    this.toggle.dataset.tooltip = this.toggle.title;
  }
}
