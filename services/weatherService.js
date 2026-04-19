import axios from 'axios';
import { WEATHER_API_KEY, WEATHER_BASE_URL } from '../utils/constants';
import { getCachedWeather, cacheWeather } from './storageService';

const weatherApi = axios.create({
  baseURL: WEATHER_BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

export const getCurrentWeather = async (lat, lon, forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const cached = await getCachedWeather(lat, lon);
      if (cached) {
        return cached.weather;
      }
    }

    const response = await weatherApi.get('/weather', {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    // Cache will be populated by the calling function after forecast is also fetched
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    // Return cached data if available even if expired
    const cached = await getCachedWeather(lat, lon);
    if (cached) {
      return cached.weather;
    }
    throw error;
  }
};

export const getForecast = async (lat, lon, forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const cached = await getCachedWeather(lat, lon);
      if (cached) {
        return cached.forecast;
      }
    }

    const response = await weatherApi.get('/forecast', {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    const cached = await getCachedWeather(lat, lon);
    if (cached) {
      return cached.forecast;
    }
    throw error;
  }
};

export const getWeatherByCity = async (city, forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      // Generate a pseudo lat/lon from city string for cache key
      const cacheKey = city.toLowerCase().replace(/\s+/g, '_');
      // For city-based searches, we skip cache for simplicity, but could implement
    }

    const response = await weatherApi.get('/weather', {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    throw error;
  }
};

export const getForecastByCity = async (city, forceRefresh = false) => {
  try {
    const response = await weatherApi.get('/forecast', {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast by city:', error);
    throw error;
  }
};

// Helper to cache weather and forecast together
export const fetchAndCacheWeather = async (lat, lon) => {
  try {
    const [weatherData, forecastData] = await Promise.all([
      getCurrentWeather(lat, lon, true),
      getForecast(lat, lon, true),
    ]);

    await cacheWeather(lat, lon, weatherData, forecastData);
    return { weather: weatherData, forecast: forecastData };
  } catch (error) {
    console.error('Error fetching and caching weather:', error);
    throw error;
  }
};

export const fetchAndCacheWeatherByCity = async (city) => {
  try {
    const weather = await getWeatherByCity(city, true);
    const forecast = await getForecastByCity(city, true);

    // Cache with lat/lon from response if available
    if (weather.coord) {
      await cacheWeather(weather.coord.lat, weather.coord.lon, weather, forecast);
    }

    return { weather, forecast };
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    throw error;
  }
};
