/**
 * SkyPulse Weather Application Controller
 * Orchestrates API calls, UI rendering, search autocomplete, geolocation, and user interactions.
 */

import {
  searchLocations,
  reverseGeocode,
  fetchWeatherData
} from './js/weather-api.js';

import {
  getWeatherInfo,
  getUVInfo,
  getAQIInfo,
  getWindDirectionCardinal,
  celsiusToFahrenheit,
  kmhToMph,
  hPaToInHg,
  mmToInches
} from './js/wmo-codes.js';

import { themeManager } from './js/theme.js';
import { StorageManager } from './js/favorites.js';
import { WeatherCanvas } from './js/weather-canvas.js';
import { weatherAudio } from './js/audio.js';
import { HourlyChart } from './js/chart.js';
import { getIcon } from './js/icons.js';

class SkyPulseApp {
  constructor() {
    const savedUserLoc = StorageManager.getUserLocation();
    this.detectedUserLocation = savedUserLoc;
    this.currentLocation = savedUserLoc || null;
    this.weatherData = null;
    this.unit = StorageManager.getUnit();
    this.hourlyView = 'cards';
    this.searchDebounceTimer = null;
    this.selectedResultIndex = -1;
    this.searchResults = [];

    this.initDOMElements();
    this.initCanvasAndAudio();
    this.initHourlyChart();
    this.initEventListeners();
    this.initClock();
    this.renderQuickPills();

    // Load initial weather
    if (this.currentLocation) {
      this.loadWeatherForLocation(this.currentLocation);
    } else {
      this.handleDetectLocation();
    }
  }

  initDOMElements() {
    // Announcer
    this.announcer = document.getElementById('aria-status');

    // Controls
    this.unitToggleBtn = document.getElementById('unit-toggle-btn');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.animToggleBtn = document.getElementById('anim-toggle-btn');
    this.liveClock = document.getElementById('live-clock');

    // Search Hub
    this.searchForm = document.getElementById('search-form');
    this.searchInput = document.getElementById('search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
    this.geoBtn = document.getElementById('geo-btn');
    this.autocompleteList = document.getElementById('autocomplete-list');
    this.quickPills = document.getElementById('quick-pills');

    // Hero Section
    this.heroCityTitle = document.getElementById('hero-city-title');
    this.heroRegionMeta = document.getElementById('hero-region-meta');
    this.heroTemperature = document.getElementById('hero-temperature');
    this.heroFeelsLike = document.getElementById('hero-feels-like');
    this.heroHighLow = document.getElementById('hero-high-low');
    this.heroWeatherIcon = document.getElementById('hero-weather-icon');
    this.heroConditionTitle = document.getElementById('hero-condition-title');
    this.heroConditionSummary = document.getElementById('hero-condition-summary');
    this.heroLastUpdated = document.getElementById('hero-last-updated');
    this.refreshBtn = document.getElementById('refresh-btn');
    this.favoriteBtn = document.getElementById('favorite-btn');
    this.shareBtn = document.getElementById('share-btn');

    // Metrics
    this.humidityVal = document.getElementById('metric-humidity-val');
    this.humiditySub = document.getElementById('metric-humidity-sub');
    this.windVal = document.getElementById('metric-wind-val');
    this.windSub = document.getElementById('metric-wind-sub');
    this.compassNeedle = document.getElementById('compass-needle');
    this.uvVal = document.getElementById('metric-uv-val');
    this.uvBadge = document.getElementById('metric-uv-badge');
    this.uvPin = document.getElementById('metric-uv-pin');
    this.pressureVal = document.getElementById('metric-pressure-val');
    this.pressureSub = document.getElementById('metric-pressure-sub');
    this.visibilityVal = document.getElementById('metric-visibility-val');
    this.visibilitySub = document.getElementById('metric-visibility-sub');
    this.cloudVal = document.getElementById('metric-cloud-val');
    this.cloudSub = document.getElementById('metric-cloud-sub');
    this.sunriseTime = document.getElementById('sunrise-time');
    this.sunsetTime = document.getElementById('sunset-time');
    this.sunArcPath = document.getElementById('sun-arc-progress');
    this.sunArcDot = document.getElementById('sun-arc-dot');
    this.aqiVal = document.getElementById('metric-aqi-val');
    this.aqiBadge = document.getElementById('metric-aqi-badge');
    this.aqiSub = document.getElementById('metric-aqi-sub');

    // Forecasts
    this.hourlyCardsContainer = document.getElementById('hourly-cards-container');
    this.hourlyChartContainer = document.getElementById('hourly-chart-container');
    this.hourlyCardsToggle = document.getElementById('hourly-cards-toggle');
    this.hourlyChartToggle = document.getElementById('hourly-chart-toggle');
    this.dailyForecastList = document.getElementById('daily-forecast-list');

    // Lifestyle
    this.clothingAdvice = document.getElementById('lifestyle-clothing');
    this.umbrellaAdvice = document.getElementById('lifestyle-umbrella');
    this.outdoorAdvice = document.getElementById('lifestyle-outdoor');

    // Status Banner
    this.statusBanner = document.getElementById('status-banner');
    this.bannerText = document.getElementById('banner-text');
    this.bannerRetryBtn = document.getElementById('banner-retry-btn');
  }

  initCanvasAndAudio() {
    const canvas = document.getElementById('weather-canvas');
    if (canvas) {
      this.ambientCanvas = new WeatherCanvas(canvas);
      this.ambientCanvas.setTheme(themeManager.currentResolvedTheme);
      const enabled = StorageManager.getAnimationsEnabled();
      this.ambientCanvas.setEnabled(enabled);
      if (this.animToggleBtn) {
        this.animToggleBtn.setAttribute('aria-pressed', String(enabled));
      }
    }
  }

  initHourlyChart() {
    if (this.hourlyChartContainer) {
      this.hourlyChart = new HourlyChart(this.hourlyChartContainer);
    }
  }

  initEventListeners() {
    // Theme toggle
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        themeManager.toggleTheme();
      });
      themeManager.onThemeChange(({ resolved }) => {
        this.themeToggleBtn.title = `Switch Theme (Currently ${resolved})`;
        this.themeToggleBtn.setAttribute('aria-label', `Switch Theme (Currently ${resolved})`);
        if (this.ambientCanvas) {
          this.ambientCanvas.setTheme(resolved);
        }
      });
    }

    // Unit toggle (°C / °F)
    if (this.unitToggleBtn) {
      this.unitToggleBtn.addEventListener('click', () => {
        this.unit = this.unit === 'metric' ? 'imperial' : 'metric';
        StorageManager.setUnit(this.unit);
        this.updateUnitButtonText();
        this.renderAllWeatherData();
        this.announce(`Switched temperature units to ${this.unit === 'metric' ? 'Celsius' : 'Fahrenheit'}`);
      });
      this.updateUnitButtonText();
    }

    // Sound toggle
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const isPlaying = weatherAudio.toggle();
        StorageManager.setSoundEnabled(isPlaying);
        this.soundToggleBtn.setAttribute('aria-pressed', String(isPlaying));
        this.soundToggleBtn.innerHTML = `${isPlaying ? getIcon('sound-on') : getIcon('sound-off')} <span>${isPlaying ? 'Sound On' : 'Sound Off'}</span>`;
        this.announce(isPlaying ? 'Ambient weather audio enabled' : 'Ambient weather audio muted');
      });
    }

    // Animation toggle
    if (this.animToggleBtn) {
      this.animToggleBtn.addEventListener('click', () => {
        const current = StorageManager.getAnimationsEnabled();
        const next = !current;
        StorageManager.setAnimationsEnabled(next);
        if (this.ambientCanvas) {
          this.ambientCanvas.setEnabled(next);
        }
        this.animToggleBtn.setAttribute('aria-pressed', String(next));
        this.announce(`Weather particle animations ${next ? 'enabled' : 'disabled'}`);
      });
    }

    // Search input typing & debounce
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (this.searchClearBtn) {
          this.searchClearBtn.style.display = query ? 'flex' : 'none';
        }
        clearTimeout(this.searchDebounceTimer);
        if (query.length >= 2) {
          this.searchDebounceTimer = setTimeout(() => this.handleSearch(query), 280);
        } else {
          this.closeAutocomplete();
        }
      });

      this.searchInput.addEventListener('keydown', (e) => {
        this.handleSearchKeyboardNavigation(e);
      });
    }

    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.searchClearBtn.style.display = 'none';
        this.closeAutocomplete();
        this.searchInput.focus();
      });
    }

    if (this.searchForm) {
      this.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query) {
          this.handleDirectSearchSubmit(query);
        }
      });
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (this.autocompleteList && !this.autocompleteList.contains(e.target) && e.target !== this.searchInput) {
        this.closeAutocomplete();
      }
    });

    // Geolocation button
    if (this.geoBtn) {
      this.geoBtn.addEventListener('click', () => this.handleDetectLocation());
    }

    // Refresh weather button
    if (this.refreshBtn) {
      this.refreshBtn.addEventListener('click', () => {
        this.refreshBtn.classList.add('spinning');
        this.loadWeatherForLocation(this.currentLocation).finally(() => {
          setTimeout(() => this.refreshBtn.classList.remove('spinning'), 600);
        });
      });
    }

    // Favorite button
    if (this.favoriteBtn) {
      this.favoriteBtn.addEventListener('click', () => {
        if (!this.currentLocation) return;
        const { isAdded } = StorageManager.toggleFavorite(this.currentLocation);
        this.updateFavoriteButtonState();
        this.renderQuickPills();
        this.announce(isAdded ? `Added ${this.currentLocation.name} to favorite cities` : `Removed ${this.currentLocation.name} from favorite cities`);
      });
    }

    // Share button
    if (this.shareBtn) {
      this.shareBtn.addEventListener('click', () => this.handleShare());
    }

    // Hourly toggle view (Cards vs Chart)
    if (this.hourlyCardsToggle && this.hourlyChartToggle) {
      this.hourlyCardsToggle.addEventListener('click', () => {
        this.hourlyView = 'cards';
        this.hourlyCardsToggle.classList.add('active');
        this.hourlyChartToggle.classList.remove('active');
        this.hourlyCardsContainer.style.display = 'flex';
        this.hourlyChartContainer.classList.remove('active');
      });

      this.hourlyChartToggle.addEventListener('click', () => {
        this.hourlyView = 'chart';
        this.hourlyChartToggle.classList.add('active');
        this.hourlyCardsToggle.classList.remove('active');
        this.hourlyCardsContainer.style.display = 'none';
        this.hourlyChartContainer.classList.add('active');
        if (this.hourlyChart && this.weatherData) {
          this.hourlyChart.render(this.weatherData.hourly, this.unit);
        }
      });
    }

    // Offline / Online detection
    window.addEventListener('online', () => {
      this.hideStatusBanner();
      this.announce('Back online. Weather data updated.');
      this.loadWeatherForLocation(this.currentLocation);
    });

    window.addEventListener('offline', () => {
      this.showStatusBanner('You appear to be offline. An internet connection is required to fetch live weather data.', 'error');
    });

    if (this.bannerRetryBtn) {
      this.bannerRetryBtn.addEventListener('click', () => {
        this.loadWeatherForLocation(this.currentLocation);
      });
    }
  }

  initClock() {
    const updateTime = () => {
      if (!this.liveClock) return;
      const now = new Date();
      const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      this.liveClock.textContent = now.toLocaleTimeString([], options);
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  updateUnitButtonText() {
    if (!this.unitToggleBtn) return;
    this.unitToggleBtn.textContent = this.unit === 'metric' ? '°C, km/h' : '°F, mph';
    this.unitToggleBtn.setAttribute('aria-label', `Temperature unit: currently ${this.unit}. Click to toggle.`);
  }

  updateFavoriteButtonState() {
    if (!this.favoriteBtn || !this.currentLocation) return;
    const isFav = StorageManager.isFavorite(this.currentLocation.latitude, this.currentLocation.longitude);
    this.favoriteBtn.innerHTML = isFav ? getIcon('star-filled') : getIcon('star-outline');
    this.favoriteBtn.setAttribute('aria-label', isFav ? 'Remove from favorite locations' : 'Add to favorite locations');
    this.favoriteBtn.classList.toggle('favorited', isFav);
  }

  announce(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  showStatusBanner(message, type = 'error') {
    if (!this.statusBanner || !this.bannerText) return;
    this.bannerText.textContent = message;
    this.statusBanner.className = `status-banner ${type}`;
  }

  hideStatusBanner() {
    if (this.statusBanner) {
      this.statusBanner.style.display = 'none';
      this.statusBanner.className = 'status-banner';
    }
  }

  // Geolocation handling
  handleDetectLocation() {
    if (!navigator.geolocation) {
      this.showStatusBanner('Geolocation is not supported by your browser.', 'error');
      return;
    }

    this.geoBtn.disabled = true;
    this.geoBtn.innerHTML = `${getIcon('refresh')} <span>Locating...</span>`;
    this.announce('Requesting device location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        this.announce('Location identified. Fetching weather details...');
        const locInfo = await reverseGeocode(latitude, longitude);
        locInfo.isDeviceLocation = true;
        this.detectedUserLocation = locInfo;
        StorageManager.setUserLocation(locInfo);
        this.currentLocation = locInfo;
        StorageManager.addToHistory(locInfo);
        await this.loadWeatherForLocation(locInfo);
        this.geoBtn.disabled = false;
        this.geoBtn.innerHTML = `${getIcon('location')} <span>My Location</span>`;
      },
      (err) => {
        console.warn('Geolocation error:', err);
        let errorMsg = 'Could not access device location. Using default location.';
        if (err.code === 1) {
          errorMsg = 'Location permission denied. Please search for a city or allow location access.';
        } else if (err.code === 2) {
          errorMsg = 'Location unavailable. Please search for your city.';
        }
        this.showStatusBanner(errorMsg, 'error');
        this.announce(errorMsg);
        this.geoBtn.disabled = false;
        this.geoBtn.innerHTML = `${getIcon('location')} <span>My Location</span>`;
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Search logic
  async handleSearch(query) {
    try {
      const results = await searchLocations(query);
      this.searchResults = results;
      this.selectedResultIndex = -1;

      if (!this.autocompleteList) return;

      if (results.length === 0) {
        this.autocompleteList.innerHTML = `
          <div class="autocomplete-item" style="cursor: default; color: var(--text-muted);">
            No matching cities found. Try another spelling.
          </div>
        `;
        this.autocompleteList.classList.add('open');
        return;
      }

      this.autocompleteList.innerHTML = results.map((item, idx) => {
        const region = [item.admin1, item.country].filter(Boolean).join(', ');
        return `
          <div class="autocomplete-item" role="option" data-index="${idx}" id="geo-opt-${idx}">
            <div class="autocomplete-main">${item.name}</div>
            <div class="autocomplete-sub">${region}</div>
          </div>
        `;
      }).join('');

      this.autocompleteList.classList.add('open');

      // Click handler for items
      this.autocompleteList.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = Number(el.dataset.index);
          const selected = this.searchResults[idx];
          if (selected) {
            this.selectLocation(selected);
          }
        });
      });
    } catch (err) {
      if (this.autocompleteList) {
        this.autocompleteList.innerHTML = `
          <div class="autocomplete-item" style="cursor: default; color: var(--status-danger);">
            ⚠️ Live search service unavailable. Please check your internet connection.
          </div>
        `;
        this.autocompleteList.classList.add('open');
      }
    }
  }

  handleSearchKeyboardNavigation(e) {
    if (!this.autocompleteList.classList.contains('open') || this.searchResults.length === 0) {
      return;
    }

    const items = this.autocompleteList.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedResultIndex = (this.selectedResultIndex + 1) % this.searchResults.length;
      this.updateSelectedItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedResultIndex = (this.selectedResultIndex - 1 + this.searchResults.length) % this.searchResults.length;
      this.updateSelectedItem(items);
    } else if (e.key === 'Enter') {
      if (this.selectedResultIndex >= 0 && this.searchResults[this.selectedResultIndex]) {
        e.preventDefault();
        this.selectLocation(this.searchResults[this.selectedResultIndex]);
      }
    } else if (e.key === 'Escape') {
      this.closeAutocomplete();
    }
  }

  updateSelectedItem(items) {
    items.forEach((item, idx) => {
      const isSelected = idx === this.selectedResultIndex;
      item.classList.toggle('selected', isSelected);
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest' });
        this.searchInput.setAttribute('aria-activedescendant', `geo-opt-${idx}`);
      }
    });
  }

  closeAutocomplete() {
    if (this.autocompleteList) {
      this.autocompleteList.classList.remove('open');
      this.autocompleteList.innerHTML = '';
    }
    this.selectedResultIndex = -1;
  }

  async handleDirectSearchSubmit(query) {
    const results = await searchLocations(query);
    if (results.length > 0) {
      this.selectLocation(results[0]);
    } else {
      this.showStatusBanner(`City "${query}" not found. Please try a different name.`, 'error');
    }
  }

  selectLocation(loc) {
    this.currentLocation = loc;
    this.searchInput.value = '';
    if (this.searchClearBtn) this.searchClearBtn.style.display = 'none';
    this.closeAutocomplete();
    StorageManager.addToHistory(loc);
    this.loadWeatherForLocation(loc);
  }

  async loadWeatherForLocation(location) {
    this.setSkeletonState(true);
    this.announce(`Fetching live weather for ${location.name}...`);
    this.hideErrorCard();

    try {
      const data = await fetchWeatherData(location);
      this.weatherData = data;
      this.hideStatusBanner();

      this.renderAllWeatherData();
      this.updateFavoriteButtonState();
      this.renderQuickPills();

      const weatherInfo = getWeatherInfo(data.current.weather_code, data.current.is_day);
      this.announce(`Live weather loaded for ${location.name}: ${Math.round(data.current.temperature_2m)} degrees Celsius, ${weatherInfo.description}`);

      // Set document semantic weather state
      document.documentElement.setAttribute('data-weather', weatherInfo.category);
      document.documentElement.setAttribute('data-is-day', String(Boolean(data.current.is_day)));

      // Update ambient canvas and audio
      if (this.ambientCanvas) {
        this.ambientCanvas.setWeather(weatherInfo.category, data.current.is_day, themeManager.currentResolvedTheme);
      }
      weatherAudio.setWeatherMode(weatherInfo.category);

    } catch (err) {
      console.error('Failed to load live weather:', err);
      const friendlyMsg = `Unable to retrieve live weather for "${location.name}". Please check your internet connection and try again.`;
      this.showStatusBanner(friendlyMsg, 'error');
      this.showErrorCard(location, err.message);
      this.announce(friendlyMsg);
    } finally {
      this.setSkeletonState(false);
    }
  }

  showErrorCard(location, detail) {
    let errorCard = document.getElementById('weather-error-card');
    if (!errorCard) {
      errorCard = document.createElement('div');
      errorCard.id = 'weather-error-card';
      errorCard.className = 'weather-error-card';
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.insertBefore(errorCard, mainContent.firstChild);
      }
    }

    errorCard.style.display = 'flex';
    errorCard.innerHTML = `
      <div class="error-icon-circle" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 class="error-title">Live Weather Unavailable</h3>
      <p class="error-message">
        We could not retrieve live weather information for <strong>${location.name}</strong> from the weather service.<br>
        <span style="font-size: 0.85rem; opacity: 0.85; margin-top: 6px; display: inline-block;">${detail || 'Network connection issue or service timeout.'}</span>
      </p>
      <div class="error-actions">
        <button id="error-retry-btn" class="geo-btn" type="button" aria-label="Retry loading live weather">
          ${getIcon('refresh')}
          <span>Retry Live Fetch</span>
        </button>
      </div>
    `;

    const retryBtn = document.getElementById('error-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadWeatherForLocation(location);
      });
    }
  }

  hideErrorCard() {
    const errorCard = document.getElementById('weather-error-card');
    if (errorCard) {
      errorCard.style.display = 'none';
    }
  }

  setSkeletonState(isLoading) {
    const elementsToSkeleton = [
      this.heroTemperature,
      this.heroFeelsLike,
      this.heroHighLow,
      this.heroConditionTitle,
      this.humidityVal,
      this.windVal,
      this.uvVal,
      this.pressureVal,
      this.visibilityVal,
      this.cloudVal,
      this.aqiVal
    ];

    elementsToSkeleton.forEach(el => {
      if (el) el.classList.toggle('skeleton', isLoading);
    });
  }

  renderAllWeatherData() {
    if (!this.weatherData) return;
    const { current, daily, hourly, air_quality, location } = this.weatherData;
    const isMetric = this.unit === 'metric';

    // Temperature formatting
    const rawTemp = current.temperature_2m;
    const displayTemp = isMetric ? Math.round(rawTemp) : Math.round(celsiusToFahrenheit(rawTemp));
    const rawFeels = current.apparent_temperature;
    const displayFeels = isMetric ? Math.round(rawFeels) : Math.round(celsiusToFahrenheit(rawFeels));

    // High / Low today
    const rawMax = daily.temperature_2m_max[0];
    const rawMin = daily.temperature_2m_min[0];
    const displayMax = isMetric ? Math.round(rawMax) : Math.round(celsiusToFahrenheit(rawMax));
    const displayMin = isMetric ? Math.round(rawMin) : Math.round(celsiusToFahrenheit(rawMin));

    const tempUnitSymbol = isMetric ? '°C' : '°F';
    const speedUnit = isMetric ? 'km/h' : 'mph';

    // 1. Hero Card
    this.heroCityTitle.textContent = location.name;
    const regionParts = [location.admin1, location.country].filter(Boolean);
    this.heroRegionMeta.textContent = regionParts.join(', ') || 'Global';

    this.heroTemperature.textContent = `${displayTemp}${tempUnitSymbol}`;
    this.heroFeelsLike.textContent = `Feels like ${displayFeels}${tempUnitSymbol}`;
    this.heroHighLow.textContent = `H: ${displayMax}°  •  L: ${displayMin}°`;

    const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);
    this.heroWeatherIcon.innerHTML = getIcon(weatherInfo.icon);
    this.heroConditionTitle.textContent = weatherInfo.description;
    this.heroConditionSummary.textContent = weatherInfo.clothingAdvice;

    const updatedDate = new Date();
    this.heroLastUpdated.textContent = `Updated ${updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // 2. Metrics Grid
    // Humidity
    this.humidityVal.textContent = `${current.relative_humidity_2m}%`;
    const dewPoint = Math.round(rawTemp - ((100 - current.relative_humidity_2m) / 5));
    const dewDisplay = isMetric ? `${dewPoint}°C` : `${Math.round(celsiusToFahrenheit(dewPoint))}°F`;
    this.humiditySub.textContent = `The dew point is ${dewDisplay} right now.`;

    // Wind
    const rawWind = current.wind_speed_10m;
    const displayWind = isMetric ? Math.round(rawWind) : Math.round(kmhToMph(rawWind));
    const cardinal = getWindDirectionCardinal(current.wind_direction_10m);
    this.windVal.textContent = `${displayWind} ${speedUnit}`;
    this.windSub.textContent = `Wind from ${cardinal} (${current.wind_direction_10m}°). Gusts to ${Math.round(isMetric ? current.wind_gusts_10m : kmhToMph(current.wind_gusts_10m))} ${speedUnit}.`;
    if (this.compassNeedle) {
      this.compassNeedle.style.transform = `rotate(${current.wind_direction_10m}deg)`;
    }

    // UV Index
    const uv = current.uv_index || 0;
    const uvInfo = getUVInfo(uv);
    this.uvVal.textContent = `${uv.toFixed(1)}`;
    this.uvBadge.textContent = uvInfo.level;
    this.uvBadge.style.backgroundColor = `${uvInfo.color}22`;
    this.uvBadge.style.color = uvInfo.color;
    if (this.uvPin) {
      const pinPercent = Math.min(100, (uv / 12) * 100);
      this.uvPin.style.left = `${pinPercent}%`;
    }

    // Pressure
    const pressureHpa = current.pressure_msl;
    if (isMetric) {
      this.pressureVal.textContent = `${Math.round(pressureHpa)} hPa`;
    } else {
      this.pressureVal.textContent = `${hPaToInHg(pressureHpa).toFixed(2)} inHg`;
    }
    this.pressureSub.textContent = pressureHpa >= 1013 ? 'Normal atmospheric pressure' : 'Lower pressure system';

    // Visibility
    const visMeters = (hourly.visibility && hourly.visibility[0]) || 10000;
    const visKm = visMeters / 1000;
    const visDisplay = isMetric ? `${visKm.toFixed(1)} km` : `${(visKm * 0.621371).toFixed(1)} mi`;
    this.visibilityVal.textContent = visDisplay;
    this.visibilitySub.textContent = visKm >= 10 ? 'Perfect, clear horizon' : 'Moderate haze or mist';

    // Cloud cover
    this.cloudVal.textContent = `${current.cloud_cover}%`;
    this.cloudSub.textContent = current.cloud_cover < 20 ? 'Mostly clear skies' : current.cloud_cover < 70 ? 'Scattered cloud coverage' : 'Dense cloud blanket';

    // Sunrise & Sunset + Arc
    const sunriseIso = daily.sunrise[0];
    const sunsetIso = daily.sunset[0];
    const sunriseDate = new Date(sunriseIso);
    const sunsetDate = new Date(sunsetIso);

    this.sunriseTime.textContent = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.sunsetTime.textContent = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.renderSunArcProgress(sunriseDate, sunsetDate);

    // Air Quality
    if (air_quality) {
      const aqi = Math.round(air_quality.us_aqi || 35);
      const aqiInfo = getAQIInfo(aqi);
      this.aqiVal.textContent = `${aqi}`;
      this.aqiBadge.textContent = aqiInfo.rating;
      this.aqiBadge.style.backgroundColor = `${aqiInfo.color}22`;
      this.aqiBadge.style.color = aqiInfo.color;
      this.aqiSub.textContent = aqiInfo.advice;
    }

    // 3. Hourly Forecast
    this.renderHourlyForecast(hourly, isMetric, tempUnitSymbol, speedUnit);

    // 4. Daily Forecast (7-Day)
    this.renderDailyForecast(daily, isMetric, tempUnitSymbol);

    // 5. Lifestyle Insights
    this.renderLifestyleInsights(weatherInfo, current, daily);
  }

  renderSunArcProgress(sunriseDate, sunsetDate) {
    if (!this.sunArcDot || !this.sunArcPath) return;

    const now = new Date();
    const totalDaylightMs = sunsetDate.getTime() - sunriseDate.getTime();
    const elapsedMs = now.getTime() - sunriseDate.getTime();

    let ratio = elapsedMs / totalDaylightMs;
    ratio = Math.max(0, Math.min(1, ratio));

    // Parametric coordinates on an arc: x from 20 to 180, y arched
    // Arc svg viewBox="0 0 200 60"
    const startX = 20;
    const endX = 180;
    const currentX = startX + ratio * (endX - startX);
    // Parabolic arc: peak at ratio = 0.5 where y = 10; at ends y = 50
    const currentY = 50 - Math.sin(ratio * Math.PI) * 40;

    this.sunArcDot.setAttribute('cx', String(currentX));
    this.sunArcDot.setAttribute('cy', String(currentY));
  }

  renderHourlyForecast(hourly, isMetric, tempUnitSymbol, speedUnit) {
    if (!this.hourlyCardsContainer || !hourly || !hourly.time) return;

    const count = Math.min(24, hourly.time.length);
    let html = '';

    for (let i = 0; i < count; i++) {
      const timeIso = hourly.time[i];
      const date = new Date(timeIso);
      const timeLabel = i === 0 ? 'Now' : date.toLocaleTimeString([], { hour: 'numeric' });

      const rawTemp = hourly.temperature_2m[i];
      const tempDisplay = isMetric ? Math.round(rawTemp) : Math.round(celsiusToFahrenheit(rawTemp));

      const code = hourly.weather_code[i];
      const isDay = (date.getHours() >= 6 && date.getHours() < 19) ? 1 : 0;
      const info = getWeatherInfo(code, isDay);

      const precipProb = (hourly.precipitation_probability && hourly.precipitation_probability[i]) || 0;

      html += `
        <div class="hourly-card" role="group" aria-label="Forecast for ${timeLabel}: ${tempDisplay} degrees, ${info.description}">
          <span class="hourly-time">${timeLabel}</span>
          <div class="hourly-icon">${getIcon(info.icon)}</div>
          <span class="hourly-temp">${tempDisplay}°</span>
          ${precipProb >= 15 ? `<span class="hourly-precip">💧 ${precipProb}%</span>` : '<span class="hourly-precip" style="opacity:0">—</span>'}
        </div>
      `;
    }

    this.hourlyCardsContainer.innerHTML = html;

    // Also update hourly chart if active
    if (this.hourlyChart) {
      const convertedHourly = {
        ...hourly,
        temperature_2m: isMetric ? hourly.temperature_2m : hourly.temperature_2m.map(c => celsiusToFahrenheit(c))
      };
      this.hourlyChart.render(convertedHourly, this.unit);
    }
  }

  renderDailyForecast(daily, isMetric, tempUnitSymbol) {
    if (!this.dailyForecastList || !daily || !daily.time) return;

    // Find global min and max for range bar scaling
    const allMin = daily.temperature_2m_min.slice(0, 7);
    const allMax = daily.temperature_2m_max.slice(0, 7);
    const globalMin = Math.min(...allMin);
    const globalMax = Math.max(...allMax);
    const globalRange = Math.max(1, globalMax - globalMin);

    let html = '';
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const dateObj = new Date(daily.time[i] + 'T12:00:00');
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdays[dateObj.getDay()];
      const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const rawMin = daily.temperature_2m_min[i];
      const rawMax = daily.temperature_2m_max[i];
      const minDisplay = isMetric ? Math.round(rawMin) : Math.round(celsiusToFahrenheit(rawMin));
      const maxDisplay = isMetric ? Math.round(rawMax) : Math.round(celsiusToFahrenheit(rawMax));

      const code = daily.weather_code[i];
      const info = getWeatherInfo(code, 1);
      const precipChance = (daily.precipitation_probability_max && daily.precipitation_probability_max[i]) || 0;

      // Range bar percentages
      const leftPercent = ((rawMin - globalMin) / globalRange) * 100;
      const widthPercent = Math.max(6, ((rawMax - rawMin) / globalRange) * 100);

      html += `
        <div class="daily-row" role="group" aria-label="${dayName}, ${dateStr}: High ${maxDisplay} degrees, Low ${minDisplay} degrees, ${info.description}">
          <div>
            <div class="daily-day-label">${dayName}</div>
            <div class="daily-date-sub">${dateStr}</div>
          </div>
          <div class="daily-icon-wrapper">${getIcon(info.icon)}</div>
          <div class="daily-condition-desc">
            ${info.description}
            ${precipChance >= 20 ? `<span style="color: var(--accent-secondary); margin-left: 6px; font-weight: 600;">💧 ${precipChance}%</span>` : ''}
          </div>
          <div class="daily-range-wrapper">
            <span class="daily-min-temp">${minDisplay}°</span>
            <div class="daily-range-bar">
              <div class="daily-range-fill" style="left: ${leftPercent.toFixed(1)}%; width: ${widthPercent.toFixed(1)}%;"></div>
            </div>
            <span class="daily-max-temp">${maxDisplay}°</span>
          </div>
        </div>
      `;
    }

    this.dailyForecastList.innerHTML = html;
  }

  renderLifestyleInsights(weatherInfo, current, daily) {
    if (this.clothingAdvice) {
      this.clothingAdvice.textContent = weatherInfo.clothingAdvice;
    }

    if (this.umbrellaAdvice) {
      const precipProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 0;
      if (weatherInfo.umbrellaNeeded || precipProb >= 50) {
        this.umbrellaAdvice.textContent = `High chance of rain (${precipProb}%). Don't forget your umbrella today!`;
      } else if (precipProb >= 25) {
        this.umbrellaAdvice.textContent = `Slight chance of showers (${precipProb}%). Keeping a compact umbrella handy is wise.`;
      } else {
        this.umbrellaAdvice.textContent = `Zero to low precipitation expected today. No umbrella required.`;
      }
    }

    if (this.outdoorAdvice) {
      const temp = current.temperature_2m;
      const wind = current.wind_speed_10m;
      if (weatherInfo.activityRating >= 8 && temp >= 15 && temp <= 26 && wind < 20) {
        this.outdoorAdvice.textContent = `Excellent conditions for jogging, cycling, hiking, or dining outdoors! Rating: ${weatherInfo.activityRating}/10.`;
      } else if (weatherInfo.activityRating >= 5) {
        this.outdoorAdvice.textContent = `Fair outdoor conditions. Rating: ${weatherInfo.activityRating}/10.`;
      } else {
        this.outdoorAdvice.textContent = `Unfavorable outdoor weather (${weatherInfo.description}). Indoor activities recommended.`;
      }
    }
  }

  renderQuickPills() {
    if (!this.quickPills) return;

    const favorites = StorageManager.getFavorites();
    const history = StorageManager.getHistory();

    // Check if the current location is the user's device location
    const isMyLocationActive = Boolean(
      this.currentLocation &&
      (this.currentLocation.isDeviceLocation ||
        (this.detectedUserLocation &&
          Math.abs(this.currentLocation.latitude - this.detectedUserLocation.latitude) < 0.05 &&
          Math.abs(this.currentLocation.longitude - this.detectedUserLocation.longitude) < 0.05))
    );

    const locationName = this.detectedUserLocation ? this.detectedUserLocation.name : 'My Location';

    // 1. User Location Pill (Always at the very beginning with location icon)
    const myLocationPillHtml = `
      <button class="city-pill location-pill ${isMyLocationActive ? 'active' : ''}" id="quick-my-location-pill" type="button" aria-label="Use current location (${locationName})">
        ${getIcon('location')}
        <span>${locationName}</span>
      </button>
    `;

    // 2. Combine distinct locations for subsequent pills
    const allPills = [];
    const seen = new Set();

    if (this.detectedUserLocation) {
      seen.add(`${this.detectedUserLocation.name}_${this.detectedUserLocation.country}`);
    }

    favorites.forEach(f => {
      const key = `${f.name}_${f.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        allPills.push({ ...f, isFav: true });
      }
    });

    history.forEach(h => {
      const key = `${h.name}_${h.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        allPills.push({ ...h, isFav: false });
      }
    });


    const otherPillsHtml = allPills.slice(0, 7).map(loc => {
      const isActive = !isMyLocationActive && this.currentLocation && loc.name === this.currentLocation.name;
      const star = loc.isFav ? '★ ' : '';
      return `
        <button class="city-pill ${isActive ? 'active' : ''}" data-name="${loc.name}" type="button">
          ${star}${loc.name}
        </button>
      `;
    }).join('');

    this.quickPills.innerHTML = myLocationPillHtml + otherPillsHtml;

    // Attach click listener to My Location pill
    const locPill = document.getElementById('quick-my-location-pill');
    if (locPill) {
      locPill.addEventListener('click', () => {
        if (this.detectedUserLocation) {
          this.loadWeatherForLocation(this.detectedUserLocation);
        } else {
          this.handleDetectLocation();
        }
      });
    }

    // Attach click listeners to other city pills
    this.quickPills.querySelectorAll('.city-pill:not(.location-pill)').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const target = allPills.find(p => p.name === name);
        if (target) {
          this.loadWeatherForLocation(target);
        }
      });
    });
  }

  async handleShare() {
    if (!this.weatherData) return;
    const { location, current } = this.weatherData;
    const temp = this.unit === 'metric' ? Math.round(current.temperature_2m) : Math.round(celsiusToFahrenheit(current.temperature_2m));
    const info = getWeatherInfo(current.weather_code, current.is_day);
    const text = `Current weather in ${location.name}: ${temp}${this.unit === 'metric' ? '°C' : '°F'}, ${info.description}! Checked via SkyPulse.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${location.name}`,
          text,
          url: window.location.href
        });
        return;
      } catch {
        // User cancelled share
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      this.announce('Weather summary copied to clipboard!');
      this.showStatusBanner('Weather summary copied to clipboard!', 'offline');
      setTimeout(() => this.hideStatusBanner(), 3000);
    } catch {
      alert(text);
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.__skyPulseApp = new SkyPulseApp();
});
