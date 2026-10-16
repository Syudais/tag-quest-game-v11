import { SKILLS } from '../combat';
import type { GameState, SkillId } from '../types';
import { icon } from './icons';

export class SkillBar {
  private buttons: HTMLButtonElement[];
  constructor(private element: HTMLElement, onSelect: (skill: SkillId) => void) {
    element.innerHTML = SKILLS.map((skill, index) => `<button type="button" class="skill-tile skill-${skill.id}" data-move="${skill.id}" aria-label="${skill.name}" aria-pressed="false" data-tooltip="${skill.name}: ${skill.description}" title="${skill.name}"><span class="skill-art">${icon(skill.id)}</span><kbd>${index + 1}</kbd><span class="skill-availability" aria-hidden="true"></span></button>`).join('');
    this.buttons = [...element.querySelectorAll<HTMLButtonElement>('[data-move]')];
    this.buttons.forEach(button => button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') !== 'true') onSelect(button.dataset.move as SkillId);
    }));
  }
  update(state: GameState, selected: SkillId, busy: boolean): void {
    this.buttons.forEach((button, index) => {
      const skill = SKILLS[index];
      const locked = state.level < skill.unlockLevel;
      const cooldown = state.skillCooldowns[skill.id] ?? 0;
      const unavailable = busy || locked || cooldown > 0 || state.chakra < skill.cost;
      button.setAttribute('aria-disabled', String(unavailable));
      button.classList.toggle('selected', selected === skill.id);
      button.setAttribute('aria-pressed', String(selected === skill.id));
      const reason = locked ? `Unlocks at level ${skill.unlockLevel}.` : cooldown ? `${cooldown} turn cooldown remaining.` : state.chakra < skill.cost ? 'Not enough chakra.' : busy ? 'Choose a technique when your turn is ready.' : 'Ready to select.';
      const description = `${skill.name} · ${skill.cost} chakra · key ${index + 1}. ${skill.description} ${reason}`;
      button.dataset.tooltip = description;
      button.title = description;
      button.setAttribute('aria-label', skill.name);
      const availability = button.querySelector<HTMLElement>('.skill-availability')!;
      availability.innerHTML = locked ? icon('lock') : cooldown ? String(cooldown) : '';
    });
    const skill = SKILLS.find(item => item.id === selected)!;
    const detail = this.element.nextElementSibling;
    if (detail?.id === 'skill-detail') detail.textContent = `${skill.name}: ${skill.description}`;
  }
}
