# SkyPulse — Real-Time Weather Dashboard ⛅

[![Prodigy InfoTech](https://img.shields.io/badge/Prodigy_InfoTech-Task--05-blue.svg)](https://prodigyinfotech.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Verification: Passed](https://img.shields.io/badge/Tests-8%20Passed-success.svg)](test/weather.test.js)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-brightgreen.svg)](#accessibility)

**SkyPulse** is a responsive, feature-rich, accessible real-time weather dashboard web application built for **Prodigy InfoTech Web Development Internship Task-05**. It dynamically fetches live atmospheric conditions, 24-hour hourly projections, 7-day extended forecasts, and air quality metrics based either on the user's geographic location or any user-inputted city worldwide using the **Open-Meteo Global Forecasting API**.

---

## 🌟 Key Features

### 📍 1. Intelligent Location & Search Engine
* **Automated Geolocation Detection**: One-click *"My Location"* detection via the HTML5 `navigator.geolocation` API paired with client-safe reverse geocoding.
* **Debounced Autocomplete Search**: Real-time city search powered by Open-Meteo Geocoding API with administrative region and country flags.
* **Accessible Combobox Navigation**: Full keyboard accessibility (`ArrowUp`, `ArrowDown`, `Enter` to select, `Escape` to close).
* **Saved Favorites & Recent History**: Bookmark favourite cities and revisit recent queries stored in `localStorage`.
* **Quick Pick Presets**: Instant 1-click access to major world cities (London, Tokyo, New York, Paris, Dubai, Sydney, Cairo).

### 🌡️ 2. Comprehensive Weather Conditions & Metrics
* **Current Hero Overview**: Real-time temperature, feels-like temperature, high/low range, and dynamic WMO weather condition descriptions.
* **High-Definition Animated Weather Icons**: Hand-crafted vector SVGs with gentle CSS keyframe animations (sun rotation, floating clouds, falling raindrops).
* **Wind & Compass Dial**: Real-time wind speed, gusts, and an interactive 360° rotating compass needle pointing in the true wind direction with 16-point cardinal labels.
* **UV Index & Sun Protection**: Accurate UV index rating (Low to Extreme) with dynamic color bar indicator and sun protection health advice.
* **Air Quality Index (US AQI)**: Atmospheric quality rating with PM2.5, PM10, CO, NO2, and ozone monitoring.
* **Solar Daylight Arc**: Visual progress representation of the sun's trajectory across the sky from sunrise to sunset.
* **Atmospheric Pressure, Dew Point & Visibility**: Barometric pressure in hPa / inHg, calculated dew point, and visibility distance.

### 📈 3. Hourly & 7-Day Extended Forecasting
* **24-Hour Hourly Forecast**: Horizontal swipeable/scrollable cards displaying temperature, weather condition icon, and precipitation probabilities.
* **Interactive Hourly Temperature Graph**: Custom lightweight SVG cubic bezier curve chart visualizing the 24-hour thermal progression with rain probability indicators.
* **7-Day Extended Forecast**: Daily high/low temperature bars with normalized range sliders, weather condition summaries, and rain chances.

### 🎨 4. Modern UX & Ambient Experience
* **Dynamic Canvas Weather Atmosphere**: Lightweight GPU-accelerated HTML5 canvas rendering realistic weather particle effects (falling rain, gentle snow, golden sunbeams, starry night skies, drifting clouds). Automatically respects `prefers-reduced-motion` and user settings.
* **Web Audio Ambient Soundscapes**: Synthesizes soothing weather soundscapes (gentle breeze, rain patter) using native Web Audio API oscillators and filters (zero external audio dependencies).
* **Zero-FOUC Theme Switcher**: Conforms to `modern-web-guidance` (`<meta name="color-scheme">` synchronized with CSS cascade, `localStorage`, and OS media queries).
* **Metric (°C, km/h) / Imperial (°F, mph) Unit Switcher**: Instant reactive conversion across all temperature and wind metrics without extra network roundtrips.
* **Pure Live Mode & User-Friendly Errors**: Strictly fetches real-time data from Open-Meteo with zero mock/demo data. Detects network loss or service interruptions and displays clear, user-friendly error banners and retry prompts.

---

## 🏗️ Architecture & File Structure

```text
PRODIGY_WD_05/
├── index.html               # Semantic, accessible HTML5 entry point
├── styles.css               # Master stylesheet import cascade
├── app.js                   # Main application controller
├── package.json             # NPM package scripts and configuration
├── .gitignore               # Git ignored assets
├── css/
│   ├── variables.css        # Design tokens, color-scheme, and CSS variables
│   ├── base.css             # CSS reset, skip link, and accessibility utilities
│   ├── components.css       # Cards, search hub, compass, solar arc, dials
│   ├── animations.css       # Weather SVG animations and reduced-motion rules
│   └── responsive.css       # Mobile, tablet, and desktop breakpoints
├── js/
│   ├── wmo-codes.js         # WMO code dictionary, icon mapping, unit conversions
│   ├── weather-api.js       # Open-Meteo API client, reverse geocoding, caching
│   ├── weather-canvas.js    # Canvas particle engine (rain, snow, sun, stars)
│   ├── audio.js             # Web Audio API ambient soundscape generator
│   ├── chart.js             # Interactive SVG hourly temperature curve chart
│   ├── icons.js             # HD scalable SVG icons library
│   ├── favorites.js         # LocalStorage store for favorites, history & units
│   └── theme.js             # Dark/Light theme manager conforming to web standards
├── scripts/
│   ├── build-check.js       # Asset integrity and build verification script
│   └── lint.js              # Syntax and code integrity lint script
└── test/
    └── weather.test.js      # Automated unit tests (Node.js test runner)
```

---

## 🧪 Verification & Testing

The project includes an automated test and verification suite powered by Node.js native test runner:

```bash
# Run unit tests
npm test

# Run syntax and file linting
npm run lint

# Run asset integrity check
npm run build

# Run complete verification suite
npm run check
```

### Test Suite Coverage:
1. `WMO Code Interpreter`: Maps codes 0–99 to semantic categories, icons, and recommendations.
2. `UV Index Calculator`: Verifies risk boundaries and color tokens.
3. `AQI Calculator`: Evaluates US AQI thresholds and health ratings.
4. `Wind Cardinal Compass`: Validates 360° to 16-point cardinal compass conversion.
5. `Unit Conversions`: Verifies mathematical accuracy of Celsius to Fahrenheit, km/h to mph, and hPa to inHg.
6. `Default Locations`: Validates coordinates and metadata for all city presets.
7. `Live Weather API Rejection`: Confirms API rejects network failures cleanly without returning mock data.
8. `Icons Library`: Confirms all SVG icon strings render valid vector markup.
9. `StorageManager`: Verifies user location persistence and retrieval.

---

## ♿ Accessibility Compliance

* **WCAG 2.1 AA Conformant**: High-contrast ratios across light and dark color schemes.
* **Screen Reader Announcer**: Live `aria-live="polite"` region communicates location updates, errors, and state changes.
* **Skip Link**: Allows keyboard users to bypass navigation and jump straight to the weather dashboard.
* **Keyboard Navigation**: Full tab order, `:focus-visible` focus rings, and arrow-key combobox navigation.
* **Reduced Motion**: Disables particle canvas and CSS animations when `prefers-reduced-motion: reduce` is detected.

---

## 🌐 API Attribution

Weather data is provided by [Open-Meteo](https://open-meteo.com/), an open-source weather API offering global weather forecasts under Creative Commons Attribution 4.0 International (CC BY 4.0).

---

## 👤 Author

* **Husam Abdulraheem**
* Email: [ht93297@gmail.com](mailto:ht93297@gmail.com)
* GitHub: [@Husam-Abdulraheem](https://github.com/Husam-Abdulraheem)
* Repository: [PRODIGY_WD_05](https://github.com/Husam-Abdulraheem/PRODIGY_WD_05)
