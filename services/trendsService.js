// --- Free Public APIs for Trends ---
// NewsData.io trending news (requires free API key)
const NEWSDATA_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
export const fetchNewsDataTrends = async (limit = 10) => {
  if (!NEWSDATA_API_KEY) return [];
  try {
    const response = await axios.get(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&country=us&language=en&category=top`);
    const articles = response.data.results || [];
    return articles.slice(0, limit).map(article => ({
      id: article.article_id,
      title: article.title,
      url: article.link,
      source: 'newsdata',
      sourceName: article.source_id || 'NewsData.io',
      created: new Date(article.pubDate),
      timeAgo: getTimeAgo(new Date(article.pubDate)),
      description: article.description,
      image: article.image_url,
    }));
  } catch (error) {
    console.error('Error fetching NewsData trends:', error);
    return [];
  }
};

// OpenWeatherMap trending weather alerts (requires free API key)
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
export const fetchWeatherAlerts = async (lat = 40.7128, lon = -74.0060) => {
  if (!OPENWEATHER_API_KEY) return [];
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`);
    const alerts = response.data.alerts || [];
    return alerts.map(alert => ({
      id: alert.event + alert.start,
      title: alert.event,
      url: '',
      source: 'openweather',
      sourceName: 'OpenWeatherMap',
      created: new Date(alert.start * 1000),
      timeAgo: getTimeAgo(new Date(alert.start * 1000)),
      description: alert.description,
    }));
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return [];
  }
};

// iTunes Music Charts (no API key required)
export const fetchITunesMusicTrends = async (limit = 10) => {
  try {
    const response = await axios.get('https://itunes.apple.com/us/rss/topsongs/limit=10/json');
    const entries = response.data.feed.entry || [];
    return entries.slice(0, limit).map(entry => ({
      id: entry.id.label,
      title: entry['im:name'].label,
      url: entry.link[0]?.attributes?.href || entry.link?.attributes?.href || '',
      source: 'itunes',
      sourceName: 'iTunes Music',
      created: new Date(),
      timeAgo: 'Now',
      description: entry['im:artist'].label,
      image: entry['im:image']?.[2]?.label,
    }));
  } catch (error) {
    console.error('Error fetching iTunes music trends:', error);
    return [];
  }
};
// --- Social Media Trend Fetchers ---
// Twitter/X trending (using public trends endpoint, placeholder for demo)
export const fetchTwitterTrends = async (limit = 10) => {
  // No public API for Twitter trends without auth; placeholder
  return [];
};

// YouTube Music trending (using YouTube Data API, placeholder for demo)
export const fetchYouTubeMusicTrends = async (limit = 10) => {
  // No public API for YouTube Music trending without API key; placeholder
  return [];
};

// TikTok trending (no public API, placeholder)
export const fetchTikTokTrends = async (limit = 10) => {
  // No public API for TikTok trending; placeholder
  return [];
};

// Instagram trending (no public API, placeholder)
export const fetchInstagramTrends = async (limit = 10) => {
  // No public API for Instagram trending; placeholder
  return [];
};
import axios from 'axios';

// Using Reddit's public JSON API (no auth required)
const REDDIT_BASE_URL = 'https://www.reddit.com/r';

// Fetch trending from Reddit
export const fetchRedditTrends = async (subreddit = 'popular', limit = 10) => {
  try {
    const response = await axios.get(`${REDDIT_BASE_URL}/${subreddit}/hot.json?limit=${limit}`, {
      headers: {
        'User-Agent': 'WeatherNewsApp/1.0',
      },
    });

    const posts = response.data.data?.children || [];
    return posts
      .filter(post => !post.data.over_18) // Filter adult content
      .map(post => ({
        id: post.data.id,
        title: post.data.title,
        score: post.data.score,
        numComments: post.data.num_comments,
        url: post.data.url,
        permalink: `https://reddit.com${post.data.permalink}`,
        subreddit: post.data.subreddit,
        author: post.data.author,
        created: new Date(post.data.created_utc * 1000),
        isVideo: post.data.is_video,
        thumbnail: post.data.thumbnail?.startsWith('http') ? post.data.thumbnail : null,
      }));
  } catch (error) {
    console.error('Error fetching Reddit trends:', error);
    return [];
  }
};

// Fetch trending from Hacker News (via Algolia API)
const HN_BASE_URL = 'https://hn.algolia.com/api/v1';

export const fetchHackerNewsTrends = async (limit = 10) => {
  try {
    const response = await axios.get(`${HN_BASE_URL}/search?tags=front_page&hitsPerPage=${limit}`);

    return response.data.hits.map(hit => ({
      id: hit.objectID,
      title: hit.title,
      url: hit.url,
      points: hit.points,
      numComments: hit.num_comments,
      author: hit.author,
      created: new Date(hit.created_at),
      storyText: hit.story_text,
    }));
  } catch (error) {
    console.error('Error fetching Hacker News trends:', error);
    return [];
  }
};

// Fetch trending topics from multiple sources
export const fetchAllTrends = async () => {
  try {
    const [reddit, hn, newsdata, weather, itunes] = await Promise.all([
      fetchRedditTrends('popular', 8),
      fetchHackerNewsTrends(5),
      fetchNewsDataTrends(5),
      fetchWeatherAlerts(),
      fetchITunesMusicTrends(5),
    ]);

    // Combine and sort by recency/importance
    const combined = [
      ...reddit.map(item => ({
        ...item,
        source: 'reddit',
        sourceName: 'Reddit',
        timeAgo: getTimeAgo(new Date(item.created)),
      })),
      ...hn.map(item => ({
        ...item,
        source: 'hackernews',
        sourceName: 'Hacker News',
        timeAgo: getTimeAgo(new Date(item.created)),
      })),
      ...newsdata,
      ...weather,
      ...itunes,
    ];

    // Sort by created date (most recent first)
    combined.sort((a, b) => b.created - a.created);

    return combined.slice(0, 20);
  } catch (error) {
    console.error('Error fetching all trends:', error);
    return [];
  }
};

// Helper function for time ago
const getTimeAgo = (date) => {
  const now = new Date();
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

// Format engagement numbers
export const formatEngagement = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};
