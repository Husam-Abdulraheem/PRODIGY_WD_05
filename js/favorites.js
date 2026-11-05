/**
 * User Preferences, Saved Favorite Cities, and Search History Store
 */

const FAVORITES_KEY = 'sky_pulse_favs';
const HISTORY_KEY = 'sky_pulse_history';
const UNIT_KEY = 'sky_pulse_unit';
const ANIMATIONS_KEY = 'sky_pulse_animations';
const SOUND_KEY = 'sky_pulse_sound';
const USER_LOC_KEY = 'sky_pulse_user_loc';

export class StorageManager {
  static getFavorites() {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static isFavorite(lat, lon) {
    const favs = this.getFavorites();
    return favs.some(f => Math.abs(f.latitude - lat) < 0.05 && Math.abs(f.longitude - lon) < 0.05);
  }

  static toggleFavorite(location) {
    let favs = this.getFavorites();
    const index = favs.findIndex(f =>
      Math.abs(f.latitude - location.latitude) < 0.05 &&
      Math.abs(f.longitude - location.longitude) < 0.05
    );

    let isAdded = false;
    if (index >= 0) {
      favs.splice(index, 1);
    } else {
      favs.unshift({
        name: location.name,
        country: location.country || '',
        country_code: location.country_code || '',
        admin1: location.admin1 || '',
        latitude: location.latitude,
        longitude: location.longitude
      });
      isAdded = true;
    }

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    } catch {
      // Storage unavailable
    }
    return { isAdded, favorites: favs };
  }

  static getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addToHistory(location) {
    if (!location || !location.name) return;
    let history = this.getHistory();
    // Remove if already exists
    history = history.filter(h =>
      !(Math.abs(h.latitude - location.latitude) < 0.05 && Math.abs(h.longitude - location.longitude) < 0.05)
    );
    // Add to front
    history.unshift({
      name: location.name,
      country: location.country || '',
      country_code: location.country_code || '',
      admin1: location.admin1 || '',
      latitude: location.latitude,
      longitude: location.longitude
    });
    // Keep max 8
    if (history.length > 8) history.pop();

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Storage unavailable
    }
    return history;
  }

  static clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Storage unavailable
    }
    return [];
  }

  static getUnit() {
    try {
      return localStorage.getItem(UNIT_KEY) || 'metric';
    } catch {
      return 'metric';
    }
  }

  static setUnit(unit) {
    try {
      localStorage.setItem(UNIT_KEY, unit);
    } catch {
      // Storage unavailable
    }
  }

  static getAnimationsEnabled() {
    try {
      const val = localStorage.getItem(ANIMATIONS_KEY);
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  }

  static setAnimationsEnabled(enabled) {
    try {
      localStorage.setItem(ANIMATIONS_KEY, String(enabled));
    } catch {
      // Storage unavailable
    }
  }

  static getSoundEnabled() {
    try {
      return localStorage.getItem(SOUND_KEY) === 'true';
    } catch {
      return false;
    }
  }

  static setSoundEnabled(enabled) {
    try {
      localStorage.setItem(SOUND_KEY, String(enabled));
    } catch {
      // Storage unavailable
    }
  }

  static getUserLocation() {
    try {
      const data = localStorage.getItem(USER_LOC_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setUserLocation(location) {
    try {
      if (location) {
        localStorage.setItem(USER_LOC_KEY, JSON.stringify(location));
      } else {
        localStorage.removeItem(USER_LOC_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }
}
