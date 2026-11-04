/**
 * Open-Meteo Weather and Geocoding API Client
 * Includes caching, reverse geocoding, air quality metrics, and offline mock fallbacks.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Built-in mock locations for offline / demo mode
 */
export const DEFAULT_LOCATIONS = [
  {
    name: 'London',
    country: 'United Kingdom',
    country_code: 'GB',
    admin1: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    country_code: 'JP',
    admin1: 'Tokyo Prefecture',
    latitude: 35.6895,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo'
  },
  {
    name: 'New York',
    country: 'United States',
    country_code: 'US',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York'
  },
  {
    name: 'Paris',
    country: 'France',
    country_code: 'FR',
    admin1: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris'
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    country_code: 'AE',
    admin1: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai'
  },
  {
    name: 'Sydney',
    country: 'Australia',
    country_code: 'AU',
    admin1: 'New South Wales',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney'
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    country_code: 'EG',
    admin1: 'Cairo Governorate',
    latitude: 30.0444,
    longitude: 31.2357,
    timezone: 'Africa/Cairo'
  }
];

/**
 * Generates deterministic mock weather payload for offline / fallback scenarios
 */
export function generateMockWeather(location) {
  const now = new Date();
  const currentHour = now.getHours();
  const isDay = currentHour >= 6 && currentHour < 19 ? 1 : 0;

  // Base temperatures depending on latitude
  const lat = Math.abs(location.latitude || 40);
  const baseTemp = Math.round(28 - (lat * 0.28));

  // 24 hour forecast
  const hourlyTimes = [];
  const hourlyTemps = [];
  const hourlyHumidity = [];
  const hourlyPrecipProb = [];
  const hourlyCodes = [];
  const hourlyWind = [];

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    hourlyTimes.push(time.toISOString());
    const hourMod = Math.sin((i / 24) * Math.PI * 2);
    hourlyTemps.push(Math.round((baseTemp + hourMod * 4) * 10) / 10);
    hourlyHumidity.push(Math.round(55 + Math.sin(i) * 15));
    hourlyPrecipProb.push(Math.max(0, Math.round(15 + Math.cos(i) * 20)));
    hourlyCodes.push(i % 5 === 0 ? 2 : (i % 7 === 0 ? 61 : 1));
    hourlyWind.push(Math.round(12 + Math.sin(i * 0.5) * 6));
  }

  // 7 day daily forecast
  const dailyDates = [];
  const dailyCodes = [1, 2, 0, 61, 3, 2, 0];
  const dailyMax = [];
  const dailyMin = [];
  const dailyPrecipProb = [10, 25, 0, 75, 40, 20, 5];
  const dailyRainSum = [0, 0.4, 0, 4.8, 1.2, 0, 0];
  const sunrises = [];
  const sunsets = [];

  for (let d = 0; d < 7; d++) {
    const dayDate = new Date(now.getTime() + d * 86400000);
    const dateStr = dayDate.toISOString().split('T')[0];
    dailyDates.push(dateStr);
    dailyMax.push(baseTemp + 3 + (d % 3));
    dailyMin.push(baseTemp - 4 - (d % 2));
    sunrises.push(`${dateStr}T06:18:00`);
    sunsets.push(`${dateStr}T18:42:00`);
  }

  return {
    isMock: true,
    location,
    current: {
      temperature_2m: baseTemp,
      apparent_temperature: baseTemp - 1,
      relative_humidity_2m: 62,
      is_day: isDay,
      precipitation: 0,
      weather_code: 1,
      cloud_cover: 25,
      pressure_msl: 1014.2,
      surface_pressure: 1010.5,
      wind_speed_10m: 14.8,
      wind_direction_10m: 240,
      wind_gusts_10m: 22.1,
      uv_index: isDay ? 5.4 : 0.0,
      time: now.toISOString()
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTemps,
      relative_humidity_2m: hourlyHumidity,
      apparent_temperature: hourlyTemps.map(t => t - 0.5),
      precipitation_probability: hourlyPrecipProb,
      weather_code: hourlyCodes,
      wind_speed_10m: hourlyWind,
      uv_index: hourlyTimes.map((_, i) => {
        const h = (currentHour + i) % 24;
        return (h >= 8 && h <= 17) ? Math.round(Math.sin((h - 8) / 9 * Math.PI) * 7 * 10) / 10 : 0;
      }),
      visibility: hourlyTimes.map(() => 10000)
    },
    daily: {
      time: dailyDates,
      weather_code: dailyCodes,
      temperature_2m_max: dailyMax,
      temperature_2m_min: dailyMin,
      apparent_temperature_max: dailyMax.map(t => t - 0.5),
      apparent_temperature_min: dailyMin.map(t => t - 1),
      sunrise: sunrises,
      sunset: sunsets,
      uv_index_max: [6.2, 5.8, 7.1, 4.0, 5.2, 6.5, 7.0],
      precipitation_sum: dailyRainSum,
      precipitation_probability_max: dailyPrecipProb,
      wind_speed_10m_max: [18, 22, 14, 28, 19, 15, 12]
    },
    air_quality: {
      us_aqi: 38,
      pm2_5: 9.2,
      pm10: 16.5,
      carbon_monoxide: 240,
      nitrogen_dioxide: 18.2,
      ozone: 42.1
    }
  };
}

/**
 * Searches locations using Open-Meteo Geocoding API
 */
export async function searchLocations(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const cacheKey = `geo_${cleanQuery.toLowerCase()}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch {
    // Session storage unavailable
  }

  try {
    const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=10&language=en&format=json`;
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Geocoding HTTP error: ${res.status}`);

    const data = await res.json();
    const results = (data.results || []).map(item => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      country_code: item.country_code || '',
      admin1: item.admin1 || '',
      timezone: item.timezone || 'UTC',
      elevation: item.elevation || 0
    }));

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: results,
        timestamp: Date.now()
      }));
    } catch {
      // Ignore cache store failure
    }

    return results;
  } catch (err) {
    console.warn('Geocoding API network issue, matching against local presets:', err);
    // Filter from default locations
    return DEFAULT_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(cleanQuery.toLowerCase())
    );
  }
}

/**
 * Reverse geocodes coordinates to a city/area name
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    // Use Open-Meteo reverse or BigDataCloud client-safe reverse geocoding API
    const endpoint = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      const name = data.locality || data.city || data.principalSubdivision || 'Current Location';
      return {
        name,
        country: data.countryName || '',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
        latitude,
        longitude
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }

  return {
    name: 'Current Location',
    country: '',
    country_code: '',
    admin1: '',
    latitude,
    longitude
  };
}

/**
 * Fetches current weather, hourly forecast, 7-day daily forecast, and air quality
 */
export async function fetchWeatherData(location) {
  const { latitude, longitude } = location;
  const cacheKey = `weather_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return { ...parsed.data, location };
      }
    }
  } catch {
    // Ignore storage failure
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone`;

    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ]);

    if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherRes.value.json();
    let aqiData = null;

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      const aqiJson = await aqiRes.value.json();
      aqiData = aqiJson.current || null;
    }

    const payload = {
      isMock: false,
      location,
      current: weatherData.current,
      hourly: weatherData.hourly,
      daily: weatherData.daily,
      air_quality: aqiData || {
        us_aqi: 32,
        pm2_5: 7.5,
        pm10: 14.1,
        carbon_monoxide: 210,
        nitrogen_dioxide: 14.0,
        ozone: 38.0
      }
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: payload,
        timestamp: Date.now()
      }));
    } catch {
      // Ignore storage errors
    }

    return payload;
  } catch (error) {
    console.warn('Network error or API limit reached, using resilient fallback data:', error);
    return generateMockWeather(location);
  }
}
