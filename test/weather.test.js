/**
 * Automated Unit Test Suite for SkyPulse Weather Application
 * Executed via Node.js native test runner: node --test test/weather.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WMO_CODES,
  getWeatherInfo,
  getUVInfo,
  getAQIInfo,
  getWindDirectionCardinal,
  celsiusToFahrenheit,
  kmhToMph,
  hPaToInHg,
  mmToInches
} from '../js/wmo-codes.js';

import {
  fetchWeatherData
} from '../js/weather-api.js';

import { StorageManager } from '../js/favorites.js';
import { ICONS, getIcon } from '../js/icons.js';

test('WMO Code Interpreter - maps known codes accurately', () => {
  // Clear sky
  const clearDay = getWeatherInfo(0, 1);
  assert.equal(clearDay.description, 'Clear Sky');
  assert.equal(clearDay.category, 'clear');
  assert.equal(clearDay.icon, 'sun');
  assert.equal(clearDay.umbrellaNeeded, false);

  const clearNight = getWeatherInfo(0, 0);
  assert.equal(clearNight.icon, 'moon');

  // Moderate rain
  const rain = getWeatherInfo(63, 1);
  assert.equal(rain.category, 'rain');
  assert.equal(rain.umbrellaNeeded, true);

  // Thunderstorm
  const storm = getWeatherInfo(95, 1);
  assert.equal(storm.category, 'thunder');
  assert.equal(storm.umbrellaNeeded, true);

  // Unknown fallback code
  const unknown = getWeatherInfo(999, 1);
  assert.ok(unknown.description);
  assert.ok(unknown.icon);
  assert.equal(typeof unknown.activityRating, 'number');
});

test('UV Index Calculator - assigns proper categories and colors', () => {
  assert.equal(getUVInfo(1.5).level, 'Low');
  assert.equal(getUVInfo(4.0).level, 'Moderate');
  assert.equal(getUVInfo(6.8).level, 'High');
  assert.equal(getUVInfo(9.2).level, 'Very High');
  assert.equal(getUVInfo(12.0).level, 'Extreme');
});

test('AQI Calculator - correctly evaluates US AQI scores', () => {
  assert.equal(getAQIInfo(25).rating, 'Good');
  assert.equal(getAQIInfo(75).rating, 'Moderate');
  assert.equal(getAQIInfo(130).rating, 'Unhealthy for Sensitive Groups');
  assert.equal(getAQIInfo(180).rating, 'Unhealthy');
  assert.equal(getAQIInfo(250).rating, 'Very Unhealthy');
  assert.equal(getAQIInfo(350).rating, 'Hazardous');
});

test('Wind Cardinal Compass - correctly maps 360 degrees to 16-point directions', () => {
  assert.equal(getWindDirectionCardinal(0), 'N');
  assert.equal(getWindDirectionCardinal(360), 'N');
  assert.equal(getWindDirectionCardinal(90), 'E');
  assert.equal(getWindDirectionCardinal(180), 'S');
  assert.equal(getWindDirectionCardinal(270), 'W');
  assert.equal(getWindDirectionCardinal(45), 'NE');
  assert.equal(getWindDirectionCardinal(225), 'SW');
  assert.equal(getWindDirectionCardinal(315), 'NW');
  assert.equal(getWindDirectionCardinal(null), 'N/A');
});

test('Unit Conversions - mathematical precision', () => {
  // Celsius to Fahrenheit
  assert.equal(celsiusToFahrenheit(0), 32);
  assert.equal(celsiusToFahrenheit(20), 68);
  assert.equal(celsiusToFahrenheit(100), 212);
  assert.equal(Math.round(celsiusToFahrenheit(-10)), 14);

  // km/h to mph
  assert.equal(Math.round(kmhToMph(100)), 62);

  // hPa to inHg
  assert.equal(Number(hPaToInHg(1013.25).toFixed(2)), 29.92);

  // mm to inches
  assert.equal(Number(mmToInches(25.4).toFixed(1)), 1.0);
});

test('Live Weather API - parses successful live response correctly', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (url.includes('air-quality')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ current: { us_aqi: 45 } })
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        current: { temperature_2m: 22.5, weather_code: 1, is_day: 1 },
        hourly: { time: ['2026-11-05T12:00:00Z'], temperature_2m: [22.5] },
        daily: { time: ['2026-11-05'], temperature_2m_max: [25], temperature_2m_min: [18] }
      })
    };
  };

  try {
    const data = await fetchWeatherData({ latitude: 51.5, longitude: -0.1, name: 'London' });
    assert.equal(data.current.temperature_2m, 22.5);
    assert.equal(data.air_quality.us_aqi, 45);
    assert.equal(data.location.name, 'London');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Live Weather API - rejects on network failure without returning mock data', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return { ok: false, status: 503 };
  };

  try {
    await assert.rejects(
      async () => {
        await fetchWeatherData({ latitude: 12.34, longitude: 56.78, name: 'TestCity' });
      },
      /Unable to retrieve live forecast|Network connection error/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Icons Library - returns valid SVG strings', () => {
  assert.ok(ICONS['sun'].includes('<svg'));
  assert.ok(ICONS['moon'].includes('<svg'));
  assert.ok(ICONS['rain'].includes('<svg'));
  assert.ok(ICONS['thunderstorm'].includes('<svg'));
  assert.ok(getIcon('sun').includes('<svg'));
  assert.ok(getIcon('non-existent-key').includes('<svg')); // Fallback icon
});

test('StorageManager - handles user location persistence', () => {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  assert.equal(StorageManager.getUserLocation(), null);
  const sampleLoc = { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 };
  StorageManager.setUserLocation(sampleLoc);

  const retrieved = StorageManager.getUserLocation();
  assert.equal(retrieved.name, 'Riyadh');
  assert.equal(retrieved.latitude, 24.7136);

  StorageManager.setUserLocation(null);
  assert.equal(StorageManager.getUserLocation(), null);

  delete globalThis.localStorage;
});

test('WeatherCanvas - initializes and adapts to weather states and themes', async () => {
  const { WeatherCanvas } = await import('../js/weather-canvas.js');

  // Mock DOM environment for Node test runner
  globalThis.window = {
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    addEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
  };
  globalThis.document = {
    hidden: false,
    addEventListener: () => {},
    documentElement: {
      getAttribute: () => 'dark',
      setAttribute: () => {}
    },
    querySelector: () => null
  };

  const mockCtx = {
    scale: () => {},
    clearRect: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    beginPath: () => {},
    arc: () => {},
    ellipse: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {}
  };

  const mockCanvas = {
    getContext: () => mockCtx,
    width: 0,
    height: 0
  };

  const wc = new WeatherCanvas(mockCanvas);
  assert.equal(wc.theme, 'dark');

  // Test Sunny Day
  wc.setWeather('clear', true, 'light');
  assert.equal(wc.weatherType, 'clear');
  assert.equal(wc.isDay, true);
  assert.equal(wc.theme, 'light');
  assert.ok(wc.particles.length > 0);

  // Test Theme Switch to Dark
  wc.setTheme('dark');
  assert.equal(wc.theme, 'dark');

  // Test Rain
  wc.setWeather('rain', false, 'dark');
  assert.equal(wc.weatherType, 'rain');
  assert.equal(wc.isDay, false);
  assert.ok(wc.particles.length > 0);

  // Test Thunder
  wc.setWeather('thunder', true, 'light');
  assert.equal(wc.weatherType, 'thunder');

  // Test Snow
  wc.setWeather('snow', true, 'light');
  assert.equal(wc.weatherType, 'snow');
  assert.ok(wc.particles.length > 0);

  // Test Clouds
  wc.setWeather('clouds', true, 'light');
  assert.equal(wc.weatherType, 'clouds');
  assert.ok(wc.clouds.length > 0);

  // Test Fog
  wc.setWeather('fog', true, 'dark');
  assert.equal(wc.weatherType, 'fog');

  // Clean up globals
  delete globalThis.window;
  delete globalThis.document;
});

test('index.html - pure live mode with no mock metric data', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const htmlPath = path.resolve('index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Verify metric cards contain no hardcoded demo values
  assert.ok(html.includes('id="metric-humidity-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="metric-wind-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="metric-uv-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="metric-aqi-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="metric-pressure-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="metric-visibility-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="metric-cloud-val" class="metric-card-value">--<'));
  assert.ok(html.includes('id="sunrise-time">--:--<'));
  assert.ok(html.includes('id="sunset-time">--:--<'));

  // Verify lifestyle contains waiting messages, not mock advice
  assert.ok(html.includes('id="lifestyle-clothing" class="lifestyle-advice">Awaiting live weather data...<'));
  assert.ok(html.includes('id="lifestyle-umbrella" class="lifestyle-advice">Awaiting live weather data...<'));
  assert.ok(html.includes('id="lifestyle-outdoor" class="lifestyle-advice">Awaiting live weather data...<'));
});



