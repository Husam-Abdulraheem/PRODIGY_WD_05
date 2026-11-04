/**
 * SVG Icons Library
 * High-definition, scalable, accessible SVG icons for weather conditions and UI elements.
 */

export const ICONS = {
  // Weather Conditions
  'sun': `
    <svg class="weather-icon-svg icon-sun" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor">
      <circle cx="32" cy="32" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="2.5" />
      <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="6" x2="32" y2="12" />
        <line x1="32" y1="52" x2="32" y2="58" />
        <line x1="6" y1="32" x2="12" y2="32" />
        <line x1="52" y1="32" x2="58" y2="32" />
        <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
        <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
        <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
        <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
      </g>
    </svg>`,

  'moon': `
    <svg class="weather-icon-svg icon-moon" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M42 46C27.6 46 16 34.4 16 20c0-3.6.7-7 2-10 1.2 1.8 1.8 4 1.8 6.4 0 11.2 9.1 20.3 20.3 20.3 3.6 0 6.9-1 9.9-2.7-2.3 7-8.9 12-16.7 12z" fill="#93c5fd" stroke="#60a5fa" stroke-width="2" />
      <circle cx="48" cy="16" r="1.5" fill="#e0f2fe" />
      <circle cx="52" cy="24" r="1" fill="#e0f2fe" />
      <circle cx="24" cy="48" r="1.2" fill="#e0f2fe" />
    </svg>`,

  'sun-cloud': `
    <svg class="weather-icon-svg icon-sun-cloud" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <circle cx="24" cy="24" r="10" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" />
      <g stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round">
        <line x1="24" y1="6" x2="24" y2="10" />
        <line x1="6" y1="24" x2="10" y2="24" />
        <line x1="11" y1="11" x2="14" y2="14" />
        <line x1="37" y1="11" x2="34" y2="14" />
      </g>
      <path d="M46 50H24a12 12 0 0 1-2.4-23.8 14 14 0 0 1 26.8-3.2A11 11 0 0 1 46 50z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
    </svg>`,

  'cloud-sun': `
    <svg class="weather-icon-svg icon-cloud-sun" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <circle cx="42" cy="22" r="9" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" />
      <g stroke="#f59e0b" stroke-width="2" stroke-linecap="round">
        <line x1="42" y1="6" x2="42" y2="10" />
        <line x1="56" y1="16" x2="53" y2="18" />
        <line x1="58" y1="26" x2="54" y2="26" />
      </g>
      <path d="M44 48H22a11 11 0 0 1-2-21.8A13 13 0 0 1 44.5 24 10 10 0 0 1 44 48z" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
    </svg>`,

  'cloud-moon': `
    <svg class="weather-icon-svg icon-cloud-moon" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M42 32c-6.6 0-12-5.4-12-12 0-2.4.7-4.6 2-6.5C28 15 25 19 25 24c0 7.2 5.8 13 13 13 3.5 0 6.6-1.4 8.9-3.7-1.5.5-3.2.7-4.9.7z" fill="#93c5fd" />
      <path d="M44 48H22a11 11 0 0 1-2-21.8A13 13 0 0 1 44.5 24 10 10 0 0 1 44 48z" fill="#94a3b8" stroke="#475569" stroke-width="2" />
    </svg>`,

  'clouds': `
    <svg class="weather-icon-svg icon-clouds" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M48 38a9 9 0 0 0-8.5-6 9 9 0 0 0-4.5 1.2A11 11 0 0 0 15 35a8 8 0 0 0 2 15h31a8 8 0 0 0 0-12z" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
      <path d="M42 50H18a10 10 0 0 1-2-19.8A12 12 0 0 1 38 27a9 9 0 0 1 9 9 9 9 0 0 1-5 14z" fill="#94a3b8" stroke="#475569" stroke-width="2" />
    </svg>`,

  'fog': `
    <svg class="weather-icon-svg icon-fog" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round">
      <path d="M44 32H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 10a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
      <line x1="14" y1="40" x2="50" y2="40" />
      <line x1="18" y1="46" x2="46" y2="46" stroke="#64748b" />
      <line x1="22" y1="52" x2="42" y2="52" stroke="#94a3b8" />
    </svg>`,

  'drizzle': `
    <svg class="weather-icon-svg icon-drizzle" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 34H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 12a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
      <g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="42" x2="20" y2="47" />
        <line x1="32" y1="42" x2="30" y2="47" />
        <line x1="42" y1="42" x2="40" y2="47" />
      </g>
    </svg>`,

  'rain': `
    <svg class="weather-icon-svg icon-rain" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 34H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 12a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#94a3b8" stroke="#475569" stroke-width="2" />
      <g stroke="#0284c7" stroke-width="3" stroke-linecap="round">
        <line x1="22" y1="42" x2="18" y2="52" />
        <line x1="32" y1="42" x2="28" y2="52" />
        <line x1="42" y1="42" x2="38" y2="52" />
      </g>
    </svg>`,

  'rain-showers': `
    <svg class="weather-icon-svg icon-rain-showers" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <circle cx="20" cy="18" r="8" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.8" />
      <path d="M46 36H24a9 9 0 0 1-2-17.8A11 11 0 0 1 43 16a8 8 0 0 1 7 8 8 8 0 0 1-4 12z" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
      <g stroke="#0284c7" stroke-width="2.5" stroke-linecap="round">
        <line x1="26" y1="44" x2="22" y2="54" />
        <line x1="36" y1="44" x2="32" y2="54" />
        <line x1="46" y1="44" x2="42" y2="54" />
      </g>
    </svg>`,

  'heavy-rain': `
    <svg class="weather-icon-svg icon-heavy-rain" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 32H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 10a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#64748b" stroke="#334155" stroke-width="2.5" />
      <g stroke="#0369a1" stroke-width="3.5" stroke-linecap="round">
        <line x1="18" y1="40" x2="13" y2="54" />
        <line x1="28" y1="40" x2="23" y2="54" />
        <line x1="38" y1="40" x2="33" y2="54" />
        <line x1="48" y1="40" x2="43" y2="54" />
      </g>
    </svg>`,

  'snow': `
    <svg class="weather-icon-svg icon-snow" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 34H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 12a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
      <g stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round">
        <path d="M22 43v8M18 47h8M19 44l6 6M25 44l-6 6" />
        <path d="M38 45v8M34 49h8M35 46l6 6M41 46l-6 6" />
      </g>
    </svg>`,

  'sleet': `
    <svg class="weather-icon-svg icon-sleet" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 34H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 12a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#cbd5e1" stroke="#64748b" stroke-width="2" />
      <line x1="20" y1="42" x2="16" y2="52" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="34" cy="46" r="2.5" fill="#38bdf8" />
      <circle cx="44" cy="50" r="2.5" fill="#38bdf8" />
    </svg>`,

  'thunderstorm': `
    <svg class="weather-icon-svg icon-thunderstorm" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 32H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 10a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#475569" stroke="#1e293b" stroke-width="2" />
      <polygon points="32,34 24,46 32,46 28,58 42,42 34,42 38,34" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" />
    </svg>`,

  'thunderstorm-hail': `
    <svg class="weather-icon-svg icon-thunderstorm-hail" viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <path d="M44 30H20a10 10 0 0 1-2-19.8A12 12 0 0 1 40 8a9 9 0 0 1 8 8 9 9 0 0 1-4 14z" fill="#334155" stroke="#0f172a" stroke-width="2" />
      <polygon points="30,32 24,42 30,42 27,52 38,40 32,40 35,32" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.2" />
      <circle cx="44" cy="44" r="2.5" fill="#e2e8f0" stroke="#94a3b8" />
      <circle cx="40" cy="52" r="2.5" fill="#e2e8f0" stroke="#94a3b8" />
    </svg>`,

  // UI Icons
  'search': `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>`,

  'cross': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`,

  'location': `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
    </svg>`,

  'pin': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>`,

  'refresh': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>`,

  'star-outline': `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>`,

  'star-filled': `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>`,

  'wind': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
    </svg>`,

  'droplet': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>`,

  'uv': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
    </svg>`,

  'pressure': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"></circle>
      <line x1="12" y1="12" x2="16" y2="8"></line>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
    </svg>`,

  'eye': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`,

  'sunrise': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17 18a5 5 0 0 0-10 0"></path>
      <line x1="12" y1="2" x2="12" y2="9"></line>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
      <line x1="1" y1="18" x2="3" y2="18"></line>
      <line x1="21" y1="18" x2="23" y2="18"></line>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
      <line x1="23" y1="22" x2="1" y2="22"></line>
      <polyline points="8 6 12 2 16 6"></polyline>
    </svg>`,

  'sunset': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17 18a5 5 0 0 0-10 0"></path>
      <line x1="12" y1="9" x2="12" y2="2"></line>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line>
      <line x1="1" y1="18" x2="3" y2="18"></line>
      <line x1="21" y1="18" x2="23" y2="18"></line>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line>
      <line x1="23" y1="22" x2="1" y2="22"></line>
      <polyline points="16 5 12 9 8 5"></polyline>
    </svg>`,

  'leaf': `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
    </svg>`,

  'sound-on': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`,

  'sound-off': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>`,

  'sparkles': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3v4"></path>
      <path d="M19 17v4"></path>
      <path d="M3 5h4"></path>
      <path d="M17 19h4"></path>
    </svg>`,

  'umbrella': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 12a10.06 10.06 0 0 0-20 0Z"></path>
      <path d="M12 12v8a2 2 0 0 0 4 0"></path>
      <path d="M12 2v1"></path>
    </svg>`,

  'share': `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>`
};

/**
 * Helper to safely get an SVG icon string by key
 */
export function getIcon(key) {
  return ICONS[key] || ICONS['sun-cloud'];
}
