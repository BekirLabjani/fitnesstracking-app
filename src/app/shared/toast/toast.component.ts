import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else if (toast.type === 'pr') { 🏆 }
            @else { ℹ }
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
      pointer-events: none;
      width: calc(100% - 32px);
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      pointer-events: all;
      cursor: pointer;
      backdrop-filter: blur(12px);
      animation: slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);

      &.success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34D399; }
      &.error   { background: rgba(244,63,94,0.15);  border: 1px solid rgba(244,63,94,0.3);  color: #FB7185; }
      &.pr      { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #FBBF24; }
      &.info    { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #60A5FA; }
    }
    .toast-icon { font-size: 16px; flex-shrink: 0; }
    .toast-msg  { flex: 1; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px) scale(0.92); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
