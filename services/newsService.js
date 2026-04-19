import axios from 'axios';
import { NEWS_API_KEY, NEWS_BASE_URL } from '../utils/constants';
import { getCachedNews, cacheNews } from './storageService';

const newsApi = axios.create({
  baseURL: NEWS_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

export const fetchAfricanNews = async (forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const cached = await getCachedNews('african');
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    const response = await newsApi.get('/news', {
      params: {
        apikey: NEWS_API_KEY,
        country: 'ng,za,ke,gh,eg',
        language: 'en',
        category: 'top',
      },
    });

    const articles = response.data.results || [];

    // Cache the results
    await cacheNews('african', articles);

    return articles;
  } catch (error) {
    console.error('Error fetching African news:', error);
    // Return cached data if available
    const cached = await getCachedNews('african');
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const fetchTrendingNews = async (forceRefresh = false) => {
  try {
    if (!forceRefresh) {
      const cached = await getCachedNews('trending');
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    const response = await newsApi.get('/news', {
      params: {
        apikey: NEWS_API_KEY,
        language: 'en',
        category: 'top',
      },
    });

    const articles = response.data.results || [];

    // Cache the results
    await cacheNews('trending', articles);

    return articles;
  } catch (error) {
    console.error('Error fetching trending news:', error);
    const cached = await getCachedNews('trending');
    if (cached) {
      return cached;
    }
    throw error;
  }
};
