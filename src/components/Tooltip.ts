export class Tooltip {
  private active: HTMLElement | null = null;
  private touchArmed: HTMLElement | null = null;
  private blockTouchClick: HTMLElement | null = null;
  private element: HTMLElement;
  private message = '';

  constructor(private root: HTMLElement) {
    this.element = document.createElement('div');
    this.element.id = 'game-tooltip';
    this.element.className = 'game-tooltip';
    this.element.setAttribute('role', 'tooltip');
    this.element.hidden = true;
    (root.querySelector<HTMLElement>('#play-layout') ?? root).append(this.element);
    root.addEventListener('pointerover', event => { const target = this.target(event.target); if (target && event.pointerType !== 'touch') this.show(target); });
    root.addEventListener('pointerout', event => { if (this.active && !this.active.contains(event.relatedTarget as Node | null)) this.hide(); });
    root.addEventListener('focusin', event => { const target = this.target(event.target); if (target) this.show(target); });
    root.addEventListener('focusout', () => this.hide());
    root.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      const target = this.target(event.target);
      if (!target) { this.touchArmed = null; this.hide(); return; }
      if (this.touchArmed !== target) {
        this.touchArmed = target;
        this.blockTouchClick = target;
        event.preventDefault();
        this.show(target);
      } else this.blockTouchClick = null;
    }, true);
    root.addEventListener('click', event => {
      const target = this.target(event.target);
      if (target && this.blockTouchClick === target && event.detail !== 0) {
        event.preventDefault(); event.stopImmediatePropagation(); this.blockTouchClick = null;
      }
    }, true);
    root.addEventListener('keydown', event => { if (event.key === 'Escape') this.hide(); });
    window.addEventListener('resize', () => this.hide());
  }

  private target(target: EventTarget | null): HTMLElement | null {
    return target instanceof Element ? target.closest<HTMLElement>('[data-tooltip]') : null;
  }

  private show(target: HTMLElement): void {
    if (this.active !== target) this.hide();
    this.active = target;
    target.setAttribute('aria-describedby', this.element.id);
    this.message = '';
    this.refresh();
  }

  refresh(): void {
    if (!this.active || !this.active.isConnected) return;
    const message = this.active.dataset.tooltip ?? this.active.getAttribute('aria-label') ?? '';
    if (!message || message === this.message) return;
    this.message = message;
    this.element.textContent = message;
    this.element.hidden = false;
    const target = this.active.getBoundingClientRect(), size = this.element.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - size.width - 8, target.left + target.width / 2 - size.width / 2));
    const top = target.top - size.height - 9 >= 8 ? target.top - size.height - 9 : Math.min(window.innerHeight - size.height - 8, target.bottom + 9);
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  hide(): void {
    this.active?.removeAttribute('aria-describedby');
    this.active = null;
    this.message = '';
    this.element.hidden = true;
  }
}
