/**
 * Open-Meteo Live Weather & Geocoding API Client
 * Pure live-only mode: Zero mock data, zero hardcoded locations.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache to avoid rate limits

/**
 * Searches real locations worldwide using the Open-Meteo Geocoding API
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

  const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=10&language=en&format=json`;

  let res;
  try {
    res = await fetch(endpoint);
  } catch {
    throw new Error('Unable to reach geocoding service. Please check your internet connection.');
  }

  if (!res.ok) {
    throw new Error(`Geocoding service error: HTTP ${res.status}`);
  }

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
    // Ignore cache write errors
  }

  return results;
}

/**
 * Reverse geocodes coordinates to a live city / area name
 */
export async function reverseGeocode(latitude, longitude) {
  try {
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
    console.warn('Reverse geocoding network error:', err);
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
 * Fetches real-time live weather conditions, hourly projections, 7-day forecast, and air quality.
 * Throws clean error if network request fails. Pure live-only mode (zero mock data).
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
    // Ignore session storage errors
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone`;

  let weatherRes;
  let aqiRes;

  try {
    [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ]);
  } catch {
    throw new Error('Network connection error: Unable to contact live weather API. Please verify your internet connection.');
  }

  if (!weatherRes || weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    const statusMsg = weatherRes?.value?.status ? `HTTP ${weatherRes.value.status}` : 'Connection failed';
    throw new Error(`Unable to retrieve live forecast from Open-Meteo (${statusMsg}). Please verify your connection or try again.`);
  }

  const weatherData = await weatherRes.value.json();
  let aqiData = null;

  if (aqiRes && aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    try {
      const aqiJson = await aqiRes.value.json();
      aqiData = aqiJson.current || null;
    } catch {
      // Optional air quality parse failed
    }
  }

  const payload = {
    location,
    current: weatherData.current,
    hourly: weatherData.hourly,
    daily: weatherData.daily,
    air_quality: aqiData
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
}
