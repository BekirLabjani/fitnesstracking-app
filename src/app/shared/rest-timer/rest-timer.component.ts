import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="timer-overlay" (click)="$event.stopPropagation()">
        <div class="timer-card">
          <div class="timer-header">
            <span>⏱️ Pause</span>
            <button class="close-t" (click)="hide()">✕</button>
          </div>

          <div class="timer-circle" [class.warning]="seconds() <= 10" [class.done]="seconds() === 0">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" class="track"/>
              <circle cx="50" cy="50" r="44" class="progress"
                [style.stroke-dashoffset]="dashOffset()"/>
            </svg>
            <span class="time-text">{{ displayTime() }}</span>
          </div>

          <div class="presets">
            <button (click)="start(30)">30s</button>
            <button (click)="start(60)">60s</button>
            <button (click)="start(90)">90s</button>
            <button (click)="start(120)">2min</button>
          </div>

          <div class="controls">
            <button class="ctrl-btn" (click)="toggle()">
              {{ running() ? '⏸ Pause' : '▶ Start' }}
            </button>
            <button class="ctrl-btn reset" (click)="reset()">↺ Reset</button>
          </div>
        </div>
      </div>
    }

    <button class="timer-fab" (click)="show()" title="Rest Timer">⏱️</button>
  `,
  styles: [`
    .timer-fab {
      position: fixed;
      bottom: 90px;
      right: 16px;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: 1px solid rgba(59,130,246,0.3);
      background: rgba(17,30,53,0.95);
      color: white;
      font-size: 20px;
      cursor: pointer;
      z-index: 200;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: transform 0.15s;
      backdrop-filter: blur(8px);
      &:hover { transform: scale(1.08); }
    }
    .timer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(6px);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .timer-card {
      background: #111E35;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 24px 20px;
      width: 100%;
      max-width: 320px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    }
    .timer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 700;
      color: #F1F5F9;
    }
    .close-t {
      background: rgba(255,255,255,0.08);
      border: none;
      color: #94A3B8;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
    }
    .timer-circle {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 0 auto 20px;
      svg { width: 100%; height: 100%; transform: rotate(-90deg); }
      .track    { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
      .progress {
        fill: none;
        stroke: #3B82F6;
        stroke-width: 8;
        stroke-linecap: round;
        stroke-dasharray: 276.46;
        transition: stroke-dashoffset 1s linear, stroke 0.3s;
      }
      &.warning .progress { stroke: #F59E0B; }
      &.done    .progress { stroke: #10B981; }
    }
    .time-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 38px;
      font-weight: 900;
      color: #F1F5F9;
      letter-spacing: -2px;
    }
    .presets {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 16px;
      button {
        background: rgba(59,130,246,0.1);
        border: 1px solid rgba(59,130,246,0.2);
        color: #60A5FA;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        &:hover { background: rgba(59,130,246,0.2); }
      }
    }
    .controls { display: flex; gap: 10px; }
    .ctrl-btn {
      flex: 1;
      height: 44px;
      border-radius: 12px;
      border: none;
      background: #3B82F6;
      color: white;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      &:hover { background: #2563EB; }
      &:active { transform: scale(0.96); }
      &.reset {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        color: #94A3B8;
        &:hover { background: rgba(255,255,255,0.12); }
      }
    }
  `]
})
export class RestTimerComponent implements OnDestroy {
  visible   = signal(false);
  running   = signal(false);
  seconds   = signal(60);
  maxSecs   = signal(60);
  private interval: any;

  displayTime = computed(() => {
    const s = this.seconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${s}`;
  });

  dashOffset = computed(() => {
    const ratio = this.maxSecs() > 0 ? this.seconds() / this.maxSecs() : 0;
    return 276.46 * (1 - ratio);
  });

  show()  { this.visible.set(true); }
  hide()  { this.visible.set(false); this.pause(); }

  start(secs: number) {
    this.pause();
    this.seconds.set(secs);
    this.maxSecs.set(secs);
    this.running.set(true);
    this.tick();
  }

  toggle() { this.running() ? this.pause() : this.resume(); }

  pause() {
    clearInterval(this.interval);
    this.running.set(false);
  }

  resume() {
    if (this.seconds() === 0) return;
    this.running.set(true);
    this.tick();
  }

  reset() {
    this.pause();
    this.seconds.set(this.maxSecs());
  }

  private tick() {
    this.interval = setInterval(() => {
      const s = this.seconds();
      if (s <= 0) {
        this.pause();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        return;
      }
      this.seconds.set(s - 1);
    }, 1000);
  }

  ngOnDestroy() { clearInterval(this.interval); }
}
