import type { Challenge } from '../types';

export function previewDocument(markup: string): string {
  const document = new DOMParser().parseFromString(markup, 'text/html');
  document.querySelectorAll('script,iframe,object,embed,link,meta,base,style,svg,math').forEach(element => element.remove());
  document.querySelectorAll('*').forEach(element => {
    for (const attribute of [...element.attributes]) {
      if (/^on/i.test(attribute.name) || ['srcdoc', 'action', 'formaction', 'src', 'srcset', 'poster'].includes(attribute.name)) element.removeAttribute(attribute.name);
    }
    if (element instanceof HTMLAnchorElement) element.removeAttribute('href');
  });
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;"><style>body{font:14px/1.5 system-ui,sans-serif;background:#eaece8;color:#243138;margin:14px;overflow-wrap:anywhere}h1,h2,h3,p,ul,ol{margin:.4em 0}h1{font-size:23px}h2{font-size:20px}button,input,select,textarea{font:inherit;max-width:100%;box-sizing:border-box}img{display:inline-block;min-width:40px;min-height:22px}table{border-collapse:collapse}th,td{border:1px solid #8d9b9f;padding:3px 8px}a{color:#245b73}label{margin-right:6px}header,main,footer,section{padding:3px}*{max-width:100%}</style></head><body>${document.body.innerHTML}</body></html>`;
}

export class PreviewComparison {
  constructor(private expected: HTMLIFrameElement, private actual: HTMLIFrameElement, private expectedHint: HTMLElement, private actualHint: HTMLElement) {}
  setChallenge(challenge: Challenge): void {
    this.expected.srcdoc = previewDocument(challenge.solution);
    this.expectedHint.textContent = `Target: ${challenge.concept}.`;
    this.actualHint.textContent = 'Updates as you type.';
  }
  render(markup: string): void {
    this.actual.srcdoc = previewDocument(markup);
    this.actualHint.textContent = markup.trim() ? 'Compare the text and order.' : 'Type HTML to see the result.';
  }
  feedback(_message: string, valid: boolean): void {
    this.actualHint.textContent = valid ? 'HTML requirements met.' : 'Check the task and your tags.';
  }
}
