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
  DEFAULT_LOCATIONS,
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

test('Default Locations - validity and completeness', () => {
  assert.ok(DEFAULT_LOCATIONS.length >= 5);
  for (const loc of DEFAULT_LOCATIONS) {
    assert.ok(loc.name, 'Location missing name');
    assert.ok(loc.country, 'Location missing country');
    assert.equal(typeof loc.latitude, 'number');
    assert.equal(typeof loc.longitude, 'number');
    assert.ok(loc.latitude >= -90 && loc.latitude <= 90);
    assert.ok(loc.longitude >= -180 && loc.longitude <= 180);
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

