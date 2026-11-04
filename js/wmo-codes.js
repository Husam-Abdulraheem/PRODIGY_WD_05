/**
 * WMO (World Meteorological Organization) Weather Code Interpreter
 * Maps code numbers to rich metadata, semantic icons, advice, and categories.
 */

export const WMO_CODES = {
  0: {
    description: 'Clear Sky',
    dayIcon: 'sun',
    nightIcon: 'moon',
    category: 'clear',
    clothingAdvice: 'Light, comfortable clothing. Sunglasses recommended.',
    umbrellaNeeded: false,
    activityRating: 10
  },
  1: {
    description: 'Mainly Clear',
    dayIcon: 'sun-cloud',
    nightIcon: 'moon-cloud',
    category: 'clear',
    clothingAdvice: 'Comfortable everyday casual wear.',
    umbrellaNeeded: false,
    activityRating: 9
  },
  2: {
    description: 'Partly Cloudy',
    dayIcon: 'cloud-sun',
    nightIcon: 'cloud-moon',
    category: 'clouds',
    clothingAdvice: 'Pleasant weather, ideal for layers.',
    umbrellaNeeded: false,
    activityRating: 8
  },
  3: {
    description: 'Overcast',
    dayIcon: 'clouds',
    nightIcon: 'clouds',
    category: 'clouds',
    clothingAdvice: 'Cooler feel under cloud cover. A light jacket is handy.',
    umbrellaNeeded: false,
    activityRating: 7
  },
  45: {
    description: 'Foggy',
    dayIcon: 'fog',
    nightIcon: 'fog',
    category: 'fog',
    clothingAdvice: 'Moist and cool air. Wear a warm jacket and exercise caution driving.',
    umbrellaNeeded: false,
    activityRating: 5
  },
  48: {
    description: 'Depositing Rime Fog',
    dayIcon: 'fog',
    nightIcon: 'fog',
    category: 'fog',
    clothingAdvice: 'Chilly, freezing conditions. Insulated outerwear advised.',
    umbrellaNeeded: false,
    activityRating: 4
  },
  51: {
    description: 'Light Drizzle',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
    clothingAdvice: 'Water-resistant windbreaker recommended.',
    umbrellaNeeded: true,
    activityRating: 5
  },
  53: {
    description: 'Moderate Drizzle',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
    clothingAdvice: 'Raincoat or umbrella needed.',
    umbrellaNeeded: true,
    activityRating: 4
  },
  55: {
    description: 'Dense Drizzle',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
    category: 'rain',
    clothingAdvice: 'Full waterproof jacket and sturdy boots.',
    umbrellaNeeded: true,
    activityRating: 4
  },
  56: {
    description: 'Light Freezing Drizzle',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    category: 'snow',
    clothingAdvice: 'Watch out for black ice! Warm winter coat and slip-resistant footwear.',
    umbrellaNeeded: true,
    activityRating: 3
  },
  57: {
    description: 'Dense Freezing Drizzle',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    category: 'snow',
    clothingAdvice: 'Hazardous icy surfaces. Heavy winter gear.',
    umbrellaNeeded: true,
    activityRating: 2
  },
  61: {
    description: 'Slight Rain',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
    clothingAdvice: 'Light rain jacket or compact umbrella.',
    umbrellaNeeded: true,
    activityRating: 5
  },
  63: {
    description: 'Moderate Rain',
    dayIcon: 'rain',
    nightIcon: 'rain',
    category: 'rain',
    clothingAdvice: 'Waterproof raincoat and water-repellent footwear.',
    umbrellaNeeded: true,
    activityRating: 4
  },
  65: {
    description: 'Heavy Rain',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    category: 'rain',
    clothingAdvice: 'Heavy downpour! Waterproof gear and stay dry indoors if possible.',
    umbrellaNeeded: true,
    activityRating: 3
  },
  66: {
    description: 'Light Freezing Rain',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    category: 'snow',
    clothingAdvice: 'Freezing rain hazard. Heavy thermal layers required.',
    umbrellaNeeded: true,
    activityRating: 2
  },
  67: {
    description: 'Heavy Freezing Rain',
    dayIcon: 'sleet',
    nightIcon: 'sleet',
    category: 'snow',
    clothingAdvice: 'Severe icy conditions. Stay warm and minimize outdoor travel.',
    umbrellaNeeded: true,
    activityRating: 1
  },
  71: {
    description: 'Slight Snow Fall',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
    clothingAdvice: 'Crisp winter snow. Parka, beanie, and warm gloves.',
    umbrellaNeeded: false,
    activityRating: 6
  },
  73: {
    description: 'Moderate Snow Fall',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
    clothingAdvice: 'Insulated winter boots, thermal base layers, and snow gear.',
    umbrellaNeeded: false,
    activityRating: 5
  },
  75: {
    description: 'Heavy Snow Fall',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
    clothingAdvice: 'Heavy blizzard conditions. Extreme winter thermal protection.',
    umbrellaNeeded: false,
    activityRating: 2
  },
  77: {
    description: 'Snow Grains',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
    clothingAdvice: 'Warm winter jacket and face covering.',
    umbrellaNeeded: false,
    activityRating: 4
  },
  80: {
    description: 'Slight Rain Showers',
    dayIcon: 'rain-showers',
    nightIcon: 'rain-showers',
    category: 'rain',
    clothingAdvice: 'Passing rain showers. Keep an umbrella handy.',
    umbrellaNeeded: true,
    activityRating: 6
  },
  81: {
    description: 'Moderate Rain Showers',
    dayIcon: 'rain-showers',
    nightIcon: 'rain-showers',
    category: 'rain',
    clothingAdvice: 'Frequent wet showers. Waterproof outerwear advised.',
    umbrellaNeeded: true,
    activityRating: 5
  },
  82: {
    description: 'Violent Rain Showers',
    dayIcon: 'heavy-rain',
    nightIcon: 'heavy-rain',
    category: 'rain',
    clothingAdvice: 'Sudden torrential showers! Seek shelter or carry heavy-duty rain gear.',
    umbrellaNeeded: true,
    activityRating: 2
  },
  85: {
    description: 'Slight Snow Showers',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
    clothingAdvice: 'Winter coat and boots recommended.',
    umbrellaNeeded: false,
    activityRating: 5
  },
  86: {
    description: 'Heavy Snow Showers',
    dayIcon: 'snow',
    nightIcon: 'snow',
    category: 'snow',
    clothingAdvice: 'Heavy snowsquall warning. Full winter insulation required.',
    umbrellaNeeded: false,
    activityRating: 2
  },
  95: {
    description: 'Thunderstorm',
    dayIcon: 'thunderstorm',
    nightIcon: 'thunderstorm',
    category: 'thunder',
    clothingAdvice: 'Thunderstorm alert! Avoid open fields; stay safe indoors.',
    umbrellaNeeded: true,
    activityRating: 2
  },
  96: {
    description: 'Thunderstorm with Hail',
    dayIcon: 'thunderstorm-hail',
    nightIcon: 'thunderstorm-hail',
    category: 'thunder',
    clothingAdvice: 'Severe hail hazard. Protect parked vehicles and stay inside.',
    umbrellaNeeded: true,
    activityRating: 1
  },
  99: {
    description: 'Severe Thunderstorm & Hail',
    dayIcon: 'thunderstorm-hail',
    nightIcon: 'thunderstorm-hail',
    category: 'thunder',
    clothingAdvice: 'Dangerous severe weather. Take emergency shelter immediately.',
    umbrellaNeeded: true,
    activityRating: 1
  }
};

/**
 * Returns weather metadata for a given WMO code.
 * Falls back to generic clear/cloud info if code is unrecognized.
 */
export function getWeatherInfo(code, isDay = 1) {
  const info = WMO_CODES[code] || {
    description: 'Variable Weather',
    dayIcon: 'cloud-sun',
    nightIcon: 'cloud-moon',
    category: 'clouds',
    clothingAdvice: 'Dress comfortably for changing outdoor conditions.',
    umbrellaNeeded: false,
    activityRating: 6
  };

  const icon = isDay ? info.dayIcon : info.nightIcon;

  return {
    ...info,
    icon,
    isDay: Boolean(isDay)
  };
}

/**
 * Calculates UV Risk category and recommendation
 */
export function getUVInfo(uvIndex) {
  if (uvIndex < 3) {
    return { level: 'Low', color: '#10b981', advice: 'No protection required for most people.' };
  }
  if (uvIndex < 6) {
    return { level: 'Moderate', color: '#f59e0b', advice: 'Wear sunscreen, hat, and sunglasses during midday.' };
  }
  if (uvIndex < 8) {
    return { level: 'High', color: '#f97316', advice: 'Protection required. Seek shade during peak afternoon hours.' };
  }
  if (uvIndex < 11) {
    return { level: 'Very High', color: '#ef4444', advice: 'Extra protection essential. Avoid midday sun exposure.' };
  }
  return { level: 'Extreme', color: '#8b5cf6', advice: 'Take full precautions. Stay indoors if possible.' };
}

/**
 * Calculates Air Quality qualitative rating from US AQI
 */
export function getAQIInfo(aqi) {
  if (!aqi || aqi <= 50) {
    return { rating: 'Good', color: '#10b981', advice: 'Air quality is satisfactory with minimal health risk.' };
  }
  if (aqi <= 100) {
    return { rating: 'Moderate', color: '#f59e0b', advice: 'Air quality is acceptable; sensitive groups may feel minor effects.' };
  }
  if (aqi <= 150) {
    return { rating: 'Unhealthy for Sensitive Groups', color: '#f97316', advice: 'Sensitive individuals should reduce prolonged outdoor exertion.' };
  }
  if (aqi <= 200) {
    return { rating: 'Unhealthy', color: '#ef4444', advice: 'Everyone may begin to experience health effects; limit outdoor exercise.' };
  }
  if (aqi <= 300) {
    return { rating: 'Very Unhealthy', color: '#8b5cf6', advice: 'Health alert: increased risk of health effects for everyone.' };
  }
  return { rating: 'Hazardous', color: '#7f1d1d', advice: 'Health warning of emergency conditions. Keep windows closed.' };
}

/**
 * Converts wind degrees to 16-point cardinal direction
 */
export function getWindDirectionCardinal(degrees) {
  if (degrees == null || isNaN(degrees)) return 'N/A';
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

/**
 * Unit conversion utilities
 */
export function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

export function kmhToMph(kmh) {
  return kmh * 0.621371;
}

export function hPaToInHg(hpa) {
  return hpa * 0.02953;
}

export function mmToInches(mm) {
  return mm * 0.0393701;
}
