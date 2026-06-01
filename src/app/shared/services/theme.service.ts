import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark = signal(true);

  constructor() {
    const saved = localStorage.getItem('theme');
    const dark = saved !== 'light';
    this._isDark.set(dark);
    this.applyTheme(dark);
  }

  get isDark() { return this._isDark(); }

  toggle() {
    const next = !this._isDark();
    this._isDark.set(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private applyTheme(dark: boolean) {
    document.body.classList.toggle('light-mode', !dark);
  }
}
