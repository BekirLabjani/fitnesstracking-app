import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" *ngFor="let i of items">
      <div class="sk-header">
        <div class="sk-line wide"></div>
        <div class="sk-line short"></div>
      </div>
      <div class="sk-line medium"></div>
      <div class="sk-line slim"></div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: #1e2a4a;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .sk-header { display: flex; justify-content: space-between; align-items: center; }
    .sk-line {
      height: 14px;
      border-radius: 8px;
      background: linear-gradient(90deg, #1e2a4a 25%, #2a3a5e 50%, #1e2a4a 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .wide   { width: 55%; }
    .short  { width: 20%; }
    .medium { width: 70%; }
    .slim   { width: 40%; height: 10px; }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() count = 3;
  get items() { return Array(this.count); }
}
