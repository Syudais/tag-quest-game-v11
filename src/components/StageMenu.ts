import type { GameState } from '../types';
import { chapterOverviews, stages } from '../stageContent';
import { stageTiming } from '../stageTiming';
import { pressureBase, pressureLimit } from '../combat';
import { icon } from './icons';

interface StageMenuActions {
  start(index: number): void;
  admin(enabled: boolean): boolean;
  close(): void;
  overview(): void;
  tutorial(): void;
  difficulty(): void;
  credits(): void;
  artwork(biome: number): string;
}

export class StageMenu {
  private state!: GameState;
  private selected = 0;
  private chapter = 0;
  private canClose = true;
  private emblemClicks = 0;
  private renderKey = '';
  private tested = new Set<number>();
  private cleared = new Set<number>();

  constructor(private dialog: HTMLDialogElement, private actions: StageMenuActions) {
    try {
      const saved = JSON.parse(sessionStorage.getItem('tag-quest-admin-stage-tests-v1') ?? '{}');
      this.tested = new Set((saved.tested ?? []).filter((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 24));
      this.cleared = new Set((saved.cleared ?? []).filter((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) < 24));
    } catch {}
    dialog.innerHTML = `<img id="stage-menu-art" class="stage-menu-art" alt=""><div class="stage-menu-content"><header class="stage-menu-header"><div><button id="stage-admin-emblem" class="stage-title-button" aria-label="Tag Quest">${icon('book')}<span>Tag Quest</span></button><p>The Fractured Codex · choose your next stage</p></div><div class="stage-menu-header-actions"><strong id="stage-admin-label" hidden>ADMIN TEST MODE</strong><button id="stage-exit-admin" class="secondary-action" hidden>Exit admin</button><button id="stage-menu-close" class="icon-button" aria-label="Back to game" title="Back to game" data-tooltip="Back to game">${icon('close')}</button></div></header><nav id="stage-chapter-tabs" class="stage-chapter-tabs" aria-label="Choose a chapter"></nav><div class="stage-menu-body"><section class="stage-chapter-story"><img class="stage-menu-portrait" src="${import.meta.env.BASE_URL}assets/mentor/portrait.png" alt="Mr. Rifky"><div><strong>Mr. Rifky</strong><h2 id="stage-chapter-title"></h2><p id="stage-chapter-copy"></p><p id="stage-menu-status" role="status"></p></div></section><section class="stage-selection" aria-label="Chapter stages"><div id="stage-cards" class="stage-cards"></div><div class="stage-selected-copy"><h2 id="stage-selected-title"></h2><p id="stage-selected-material"></p><p id="stage-lock-note"></p></div></section></div><footer class="stage-menu-footer"><div class="stage-menu-links"><button id="stage-overview" class="secondary-action">Game overview</button><button id="stage-tutorial" class="secondary-action">Replay tutorial</button><button id="stage-difficulty" class="secondary-action">Difficulty</button><button id="stage-credits" class="icon-button" aria-label="Art and credits" title="Art and credits" data-tooltip="Art and credits">${icon('info')}</button></div><button id="stage-start" class="execute-button">Start stage</button></footer></div>`;
    const source = document.createElement('a');
    source.id = 'stage-selected-source'; source.textContent = 'Read this W3Schools chapter';
    source.target = '_blank'; source.rel = 'noopener noreferrer';
    this.get('stage-selected-material').after(source);
    const timing = document.createElement('p');
    timing.id = 'stage-selected-timing';
    this.get('stage-selected-material').after(timing);
    this.get('stage-admin-emblem').addEventListener('click', () => { if (++this.emblemClicks >= 5) { this.emblemClicks = 0; actions.admin(!this.state.adminMode); } });
    this.get('stage-exit-admin').addEventListener('click', () => actions.admin(false));
    this.get('stage-menu-close').addEventListener('click', () => { if (this.canClose) actions.close(); });
    this.get('stage-start').addEventListener('click', () => { if (this.unlocked(this.selected)) actions.start(this.selected); });
    this.get('stage-overview').addEventListener('click', actions.overview);
    this.get('stage-tutorial').addEventListener('click', actions.tutorial);
    this.get('stage-difficulty').addEventListener('click', actions.difficulty);
    this.get('stage-credits').addEventListener('click', actions.credits);
    dialog.addEventListener('cancel', event => { event.preventDefault(); if (this.canClose) actions.close(); });
    document.addEventListener('keydown', event => {
      if (!dialog.open || event.repeat || !event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== 'a') return;
      if ((event.target as HTMLElement).closest('input,textarea,[contenteditable=true]')) return;
      event.preventDefault(); actions.admin(!this.state.adminMode);
    });
  }

  private get<T extends HTMLElement = HTMLElement>(id: string): T { return this.dialog.querySelector<T>(`#${id}`)!; }
  private unlocked(index: number): boolean { return this.state.adminMode || index <= Math.min(23, this.state.completed); }

  show(state: GameState, canClose: boolean, message = ''): void {
    this.state = state; this.canClose = canClose; this.selected = state.activeStageIndex;
    this.chapter = Math.floor(this.selected / 6); this.emblemClicks = 0;
    this.get('stage-menu-status').textContent = message;
    this.renderKey = ''; this.update(state);
    if (!this.dialog.open) this.dialog.showModal();
    this.get<HTMLButtonElement>('stage-start').focus();
  }

  hide(): void { if (this.dialog.open) this.dialog.close(); }

  update(state: GameState): void {
    this.state = state;
    if (!this.dialog.open && this.renderKey) return;
    const key = `${state.completed}:${state.activeStageIndex}:${state.adminMode}:${state.difficulty}:${this.selected}:${this.chapter}:${[...this.tested]}:${[...this.cleared]}`;
    if (key === this.renderKey) return;
    const focused = document.activeElement instanceof HTMLElement && this.dialog.contains(document.activeElement)
      ? document.activeElement : null;
    const focusKey = focused?.dataset.stageFocus;
    const focusId = focused?.id;
    this.renderKey = key;
    this.get('stage-admin-label').hidden = !state.adminMode;
    this.get('stage-exit-admin').hidden = !state.adminMode;
    this.get('stage-menu-close').hidden = !this.canClose;
    this.get('stage-chapter-tabs').replaceChildren(...chapterOverviews.map(chapter => {
      const button = document.createElement('button'); button.textContent = `${chapter.biome + 1}. ${chapter.title}`;
      button.dataset.stageFocus = `chapter-${chapter.biome}`;
      button.setAttribute('aria-pressed', String(this.chapter === chapter.biome));
      button.addEventListener('click', () => { this.chapter = chapter.biome; this.selected = this.chapter * 6; this.update(this.state); });
      return button;
    }));
    const chapter = chapterOverviews[this.chapter];
    const art = this.actions.artwork(this.chapter); this.get<HTMLImageElement>('stage-menu-art').src = art;
    this.get('stage-chapter-title').textContent = chapter.title;
    this.get('stage-chapter-copy').textContent = chapter.pages.map(page => page.message).join(' ');
    this.get('stage-cards').replaceChildren(...stages.filter(stage => stage.biome === this.chapter).map(stage => {
      const button = document.createElement('button'); const unlocked = this.unlocked(stage.index);
      const status = stage.index < state.completed ? 'Campaign clear' : stage.index === state.completed && state.completed < 24 ? 'Next stage' : unlocked ? 'Admin test' : 'Locked';
      const reason = unlocked ? stage.material : `Clear stage ${stage.index} to unlock this stage.`;
      button.className = `stage-card ${this.selected === stage.index ? 'selected' : ''}`;
      button.dataset.stageFocus = `stage-${stage.index}`;
      button.setAttribute('aria-pressed', String(this.selected === stage.index)); button.setAttribute('aria-disabled', String(!unlocked));
      button.title = `${stage.index + 1}. ${stage.title}. ${reason}`; button.dataset.tooltip = button.title;
      const number = document.createElement('span'); number.className = 'stage-card-number'; number.textContent = String(stage.index + 1);
      const title = document.createElement('strong'); title.textContent = stage.title;
      const badge = document.createElement('span'); badge.className = 'stage-card-status'; badge.textContent = status;
      button.append(number, title, badge);
      if (this.tested.has(stage.index)) { const test = document.createElement('span'); test.className = 'stage-test-badge'; test.textContent = this.cleared.has(stage.index) ? 'Test clear · session' : 'Tested · session'; button.append(test); }
      button.addEventListener('click', () => { this.selected = stage.index; this.update(this.state); });
      return button;
    }));
    const selected = stages[this.selected], available = this.unlocked(this.selected);
    this.get('stage-selected-title').textContent = `Stage ${selected.index + 1}: ${selected.title}`;
    this.get('stage-selected-material').textContent = selected.material;
    const timing = stageTiming(selected.index), baseSeconds = pressureBase(state.difficulty) / 1000;
    const allottedSeconds = Number((pressureLimit(state.difficulty, selected.index) / 1000).toFixed(2));
    this.get('stage-selected-timing').textContent = `${state.difficulty === 'easy' ? 'Easy' : 'Normal'}: ${baseSeconds} s base × ${timing.multiplier} = ${allottedSeconds} s per coding turn. ${timing.reason}`;
    this.get('stage-selected-timing').title = this.get('stage-selected-timing').textContent ?? '';
    this.get<HTMLAnchorElement>('stage-selected-source').href = selected.source;
    this.get('stage-lock-note').textContent = available ? state.adminMode ? 'Test battle: campaign progress and XP will not change.' : this.selected < state.completed ? 'Replay practice: campaign progress and XP will not change.' : 'Start in the field. Approach the sentry and press E to fight.' : `Locked. Clear stage ${selected.index} first.`;
    const start = this.get<HTMLButtonElement>('stage-start'); start.disabled = !available;
    start.textContent = state.adminMode ? `Test stage ${this.selected + 1}` : this.selected === state.activeStageIndex ? `Continue stage ${this.selected + 1}` : `Start stage ${this.selected + 1}`;
    this.get('stage-difficulty').textContent = `Difficulty: ${state.difficulty === 'easy' ? 'Easy' : 'Normal'}`;
    if (focused && this.dialog.open) {
      const replacement = focusKey
        ? this.dialog.querySelector<HTMLElement>(`[data-stage-focus="${focusKey}"]`)
        : focusId ? this.dialog.querySelector<HTMLElement>(`#${focusId}`) : null;
      const availableFocus = replacement && !replacement.hidden && !replacement.closest('[hidden]')
        && !(replacement instanceof HTMLButtonElement && replacement.disabled);
      (availableFocus ? replacement : this.get('stage-admin-emblem')).focus({ preventScroll: true });
    }
  }

  recordTest(index: number, cleared: boolean): void {
    this.tested.add(index); if (cleared) this.cleared.add(index);
    try { sessionStorage.setItem('tag-quest-admin-stage-tests-v1', JSON.stringify({ tested: [...this.tested], cleared: [...this.cleared] })); } catch {}
    this.renderKey = ''; this.update(this.state);
  }
}
