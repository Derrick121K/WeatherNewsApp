// API Configuration
export const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
export const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || '';

// API Base URLs
export const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const NEWS_BASE_URL = 'https://newsdata.io/api/1';

// Default Location (Johannesburg, South Africa)
export const DEFAULT_LOCATION = {
  latitude: -26.2041,
  longitude: 28.0473,
  city: 'Johannesburg',
};

// Theme Colors
export const COLORS = {
  background: '#0F0F23',
  cardBackground: '#1A1A2E',
  accent: '#E94560',
  accentLight: '#FF6B8A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#6B6B6B',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  border: '#2A2A40',
  gradient: {
    start: '#16213E',
    end: '#0F0F23',
  },
};

// Weather Background Images (Unsplash)
export const WEATHER_BACKGROUNDS = {
  clear: {
    day: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
  },
  clouds: {
    day: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80',
  },
  rain: {
    day: 'https://images.unsplash.com/photo-1519692959666-452df757e2a7?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  },
  thunderstorm: {
    day: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1508000960247-f4b8d2a9b7e3?w=800&q=80',
  },
  snow: {
    day: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1483664852095-d6cc68707056?w=800&q=80',
  },
  mist: {
    day: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1518733493807-86a3e49b7d49?w=800&q=80',
  },
  default: {
    day: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    night: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  },
};

export const getWeatherBackground = (condition, isDay = true) => {
  const mainCondition = condition.toLowerCase();

  if (mainCondition.includes('clear') || mainCondition.includes('sunny')) {
    return WEATHER_BACKGROUNDS.clear[isDay ? 'day' : 'night'];
  }
  if (mainCondition.includes('cloud')) {
    return WEATHER_BACKGROUNDS.clouds[isDay ? 'day' : 'night'];
  }
  if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) {
    return WEATHER_BACKGROUNDS.rain[isDay ? 'day' : 'night'];
  }
  if (mainCondition.includes('thunderstorm') || mainCondition.includes('storm')) {
    return WEATHER_BACKGROUNDS.thunderstorm[isDay ? 'day' : 'night'];
  }
  if (mainCondition.includes('snow') || mainCondition.includes('sleet')) {
    return WEATHER_BACKGROUNDS.snow[isDay ? 'day' : 'night'];
  }
  if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze')) {
    return WEATHER_BACKGROUNDS.mist[isDay ? 'day' : 'night'];
  }

  return WEATHER_BACKGROUNDS.default[isDay ? 'day' : 'night'];
};

export const getTimeOfDay = (timestamp = null) => {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
};

export const WEATHER_ICONS = {
  '01d': '☀️', // clear sky day
  '01n': '🌙', // clear sky night
  '02d': '⛅', // few clouds day
  '02n': '☁️', // few clouds night
  '03d': '☁️', // scattered clouds
  '03n': '☁️',
  '04d': '☁️', // broken clouds
  '04n': '☁️',
  '09d': '🌧️', // shower rain
  '09n': '🌧️',
  '10d': '🌦️', // rain day
  '10n': '🌧️', // rain night
  '11d': '⛈️', // thunderstorm
  '11n': '⛈️',
  '13d': '❄️', // snow
  '13n': '❄️',
  '50d': '🌫️', // mist
  '50n': '🌫️',
};

// Temperature Conversion
export const kelvinToCelsius = (kelvin) => {
  return Math.round(kelvin - 273.15);
};

export const celsiusToFahrenheit = (celsius) => {
  return Math.round((celsius * 9/5) + 32);
};

export const convertTemperature = (kelvin, unit = 'celsius') => {
  const celsius = kelvinToCelsius(kelvin);
  if (unit === 'fahrenheit') {
    return celsiusToFahrenheit(celsius);
  }
  return celsius;
};

export const getTemperatureUnitSymbol = (unit = 'celsius') => {
  return unit === 'fahrenheit' ? '°F' : '°C';
};

export const getWeatherIcon = (iconCode) => {
  return WEATHER_ICONS[iconCode] || '🌡️';
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
