import { previewDocument } from './PreviewComparison';

export interface RifkyChoice { label: string; action(): void; disabled?: boolean; }
export interface RifkyPage { title: string; message: string; example?: string; source?: string; choices?: RifkyChoice[]; }

export class RifkyDialogue {
  private pages: RifkyPage[] = [];
  private index = 0;
  private onFinish?: () => void;
  private returnFocus: HTMLElement | null = null;
  private lockClose = false;
  private onDismiss?: () => void;

  constructor(private dialog: HTMLDialogElement, private openChange: () => void) {
    this.get<HTMLButtonElement>('rifky-next').addEventListener('click', () => {
      if (this.index < this.pages.length - 1) { this.index++; this.render(); }
      else if (this.onFinish) this.onFinish();
      else this.close();
    });
    this.get<HTMLButtonElement>('rifky-back').addEventListener('click', () => { if (this.index) { this.index--; this.render(); } });
    this.get<HTMLButtonElement>('rifky-close').addEventListener('click', () => this.close());
    dialog.addEventListener('close', () => this.openChange());
    dialog.addEventListener('cancel', event => { if(this.lockClose||this.onDismiss){event.preventDefault();if(!this.lockClose)this.close();} });
  }

  private get<T extends HTMLElement = HTMLElement>(id: string): T { return this.dialog.querySelector<T>(`#${id}`)!; }

  show(pages: RifkyPage[], onFinish?: () => void, options:{lockClose?:boolean;onDismiss?:()=>void}={}): void {
    if (!pages.length) return;
    this.pages = pages;
    this.index = 0;
    this.onFinish = onFinish;
    this.lockClose = !!options.lockClose;
    this.onDismiss = options.onDismiss;
    this.get('rifky-close').hidden = this.lockClose;
    this.render();
    if (!this.dialog.open) {
      this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.dialog.showModal();
    }
    this.openChange();
    this.focusAction();
  }

  close(force=false): void {
    if(!force&&this.lockClose)return;
    if(!force&&this.onDismiss){const dismiss=this.onDismiss;this.onDismiss=undefined;dismiss();return;}
    this.lockClose=false;this.onDismiss=undefined;
    this.dialog.close();
    this.openChange();
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
  }

  private focusAction(): void {
    const choice = this.get('rifky-choices').querySelector<HTMLButtonElement>('button:not(:disabled)');
    (choice ?? this.get<HTMLButtonElement>('rifky-next')).focus();
  }

  private render(): void {
    const page = this.pages[this.index];
    this.get('rifky-title').textContent = page.title;
    this.get('rifky-message').textContent = page.message;
    this.get('rifky-page').textContent = this.pages.length > 1 ? `${this.index + 1} / ${this.pages.length}` : 'Battle paused';
    this.get('rifky-example').hidden = !page.example;
    if (page.example) {
      this.get('rifky-code').textContent = page.example;
      this.get<HTMLIFrameElement>('rifky-preview').srcdoc = previewDocument(page.example);
    }
    const source = this.get<HTMLAnchorElement>('rifky-source');
    source.hidden = !page.source;
    if (page.source) source.href = page.source;
    this.get('rifky-choices').replaceChildren(...(page.choices ?? []).map(choice => {
      const button = document.createElement('button');
      button.textContent = choice.label;
      button.disabled = !!choice.disabled;
      button.addEventListener('click', choice.action);
      return button;
    }));
    this.get('rifky-back').hidden = this.index === 0;
    this.get('rifky-next').hidden = !!page.choices?.length;
    this.get('rifky-next').textContent = this.index < this.pages.length - 1 ? 'Next' : 'Continue';
    this.focusAction();
  }
}
