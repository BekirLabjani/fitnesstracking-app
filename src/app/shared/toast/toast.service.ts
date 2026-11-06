import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'pr';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'success', duration = 3000) {
    // A counter, not Date.now(): two toasts fired in the same millisecond
    // (e.g. two quick successive saves) would otherwise get the same id,
    // and dismissing one would dismiss both.
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error'); }
  pr(msg: string)      { this.show(msg, 'pr', 4000); }
}
