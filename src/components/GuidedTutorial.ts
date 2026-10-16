import { tutorialPages, type GuidedTutorialPage, type TutorialTarget } from '../tutorialContent';

interface TutorialActions {
  start(): void;
  page(page: GuidedTutorialPage): void;
  finish(): HTMLElement | null;
  syncPause(): void;
  completed?(): void;
}

export class GuidedTutorial {
  private index = 0;
  private active = false;
  private frame = 0;
  private resizeObserver: ResizeObserver;
  private targets: Record<TutorialTarget, HTMLElement>;

  constructor(private dialog: HTMLDialogElement, private actions: TutorialActions) {
    this.targets = {
      editor: document.getElementById('code-editor')!,
      expected: document.querySelector<HTMLElement>('.expected-pane')!,
      actual: document.querySelector<HTMLElement>('.actual-pane')!,
      comparison: document.getElementById('output-rail')!,
    };
    this.resizeObserver = new ResizeObserver(() => this.keepTargetVisible());
    dialog.querySelector('#tour-next')!.addEventListener('click', () => {
      if (this.index < tutorialPages.length - 1) { this.index++; this.render(); }
      else this.finish();
    });
    dialog.querySelector('#tour-back')!.addEventListener('click', () => { if (this.index) { this.index--; this.render(); } });
    dialog.querySelector('#tour-skip')!.addEventListener('click', () => this.finish());
    dialog.addEventListener('cancel', event => { event.preventDefault(); this.finish(); });
    dialog.addEventListener('close', () => { if (this.active) this.finish(); });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button:not([hidden]):not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize', () => this.keepTargetVisible());
    window.visualViewport?.addEventListener('resize', () => this.keepTargetVisible());
    document.addEventListener('scroll', () => this.scheduleSpotlight(), true);
  }

  start(): void {
    if (this.active) return;
    this.active = true;
    this.index = 0;
    this.actions.start();
    this.dialog.showModal();
    this.actions.syncPause();
    this.resizeObserver.observe(document.getElementById('code-panel')!);
    for (const target of Object.values(this.targets)) this.resizeObserver.observe(target);
    this.render();
  }

  private render(): void {
    const page = tutorialPages[this.index];
    this.dialog.querySelector('#tour-title')!.textContent = page.title;
    this.dialog.querySelector('#tour-message')!.textContent = page.message;
    this.dialog.querySelector('#tour-count')!.textContent = `${this.index + 1} / ${tutorialPages.length}`;
    (this.dialog.querySelector('#tour-back') as HTMLButtonElement).hidden = this.index === 0;
    this.dialog.querySelector('#tour-next')!.textContent = this.index < tutorialPages.length - 1 ? 'Next' : 'Continue';
    this.actions.page(page);
    this.dialog.dataset.target = page.target ?? 'none';
    if (page.target) this.targets[page.target].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    this.scheduleSpotlight();
    (this.dialog.querySelector('#tour-next') as HTMLButtonElement).focus({ preventScroll: true });
  }

  private scheduleSpotlight(): void {
    if (!this.active) return;
    window.cancelAnimationFrame(this.frame);
    this.frame = window.requestAnimationFrame(() => this.updateSpotlight());
  }

  private keepTargetVisible(): void {
    if (!this.active) return;
    const target = tutorialPages[this.index].target;
    if (target) this.targets[target].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    this.scheduleSpotlight();
  }

  private updateSpotlight(): void {
    const page = tutorialPages[this.index];
    const cutout = this.dialog.querySelector<SVGRectElement>('#tour-cutout')!;
    const outline = this.dialog.querySelector<HTMLElement>('#tour-outline')!;
    const svg = this.dialog.querySelector<SVGElement>('.tour-dimmer')!;
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    if (!page.target) { cutout.setAttribute('width', '0'); outline.hidden = true; return; }
    const rect = this.targets[page.target].getBoundingClientRect();
    const panel = document.getElementById('code-panel')!.getBoundingClientRect();
    const left = Math.max(8, panel.left + 1, rect.left - 5), top = Math.max(8, panel.top + 1, rect.top - 5);
    const right = Math.min(window.innerWidth - 8, panel.right - 1, rect.right + 5), bottom = Math.min(window.innerHeight - 8, panel.bottom - 1, rect.bottom + 5);
    const width = Math.max(0, right - left), height = Math.max(0, bottom - top);
    cutout.setAttribute('x', String(left)); cutout.setAttribute('y', String(top));
    cutout.setAttribute('width', String(width)); cutout.setAttribute('height', String(height));
    outline.hidden = width < 1 || height < 1;
    Object.assign(outline.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
  }

  private finish(): void {
    if (!this.active) return;
    this.active = false;
    window.cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    const returnFocus = this.actions.finish();
    if (this.dialog.open) this.dialog.close();
    this.actions.syncPause();
    this.actions.completed?.();
    window.requestAnimationFrame(() => { if (returnFocus?.isConnected&&!document.querySelector('dialog[open]')) returnFocus.focus({ preventScroll: true }); });
  }
}
