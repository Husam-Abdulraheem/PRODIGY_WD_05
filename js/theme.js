/**
 * Modern Theme Switcher Module
 * Conforms to modern-web-guidance dark-mode-toggle:
 * Synchronizes <meta name="color-scheme">, localStorage, and CSS cascade.
 */

const STORAGE_KEY = 'color-scheme';

export class ThemeManager {
  constructor() {
    this.meta = document.querySelector('meta[name="color-scheme"]');
    if (!this.meta) {
      this.meta = document.createElement('meta');
      this.meta.name = 'color-scheme';
      this.meta.content = 'light dark';
      document.head.appendChild(this.meta);
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.listeners = new Set();

    // Listen to OS preference changes
    this.mediaQuery.addEventListener('change', () => {
      this.notifyListeners();
    });

    // Listen to cross-tab storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this.applyStoredTheme();
      }
    });

    this.applyStoredTheme();
  }

  get storedPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  set storedPreference(val) {
    try {
      if (val === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, val);
      }
    } catch {
      // Storage unavailable
    }
  }

  get currentResolvedTheme() {
    const stored = this.storedPreference;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  get currentSetting() {
    return this.storedPreference || 'system';
  }

  applyStoredTheme() {
    const stored = this.storedPreference;
    if (stored === 'light' || stored === 'dark') {
      this.meta.content = stored;
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      this.meta.content = 'light dark';
      document.documentElement.removeAttribute('data-theme');
    }
    this.notifyListeners();
  }

  setTheme(theme) {
    if (theme === 'system') {
      this.storedPreference = null;
      this.meta.content = 'light dark';
      document.documentElement.removeAttribute('data-theme');
    } else if (theme === 'light' || theme === 'dark') {
      this.storedPreference = theme;
      this.meta.content = theme;
      document.documentElement.setAttribute('data-theme', theme);
    }
    this.notifyListeners();
  }

  toggleTheme() {
    const current = this.currentResolvedTheme;
    const next = current === 'dark' ? 'light' : 'dark';
    
    // If target equals the system preference, clear the override so it reverts cleanly to system
    const systemScheme = this.mediaQuery.matches ? 'dark' : 'light';
    if (next === systemScheme) {
      this.setTheme('system');
    } else {
      this.setTheme(next);
    }
  }

  onThemeChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyListeners() {
    const state = {
      setting: this.currentSetting,
      resolved: this.currentResolvedTheme
    };
    for (const fn of this.listeners) {
      fn(state);
    }
  }
}

export const themeManager = new ThemeManager();
