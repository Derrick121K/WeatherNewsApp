// Ensure the settings table exists (moved to async initDatabase below)
// Storage service with lazy-loaded SQLite for web/Expo Snack compatibility
const isNative = () => {
  return !(typeof window !== 'undefined' && window.document && window.document.body);
};

let SQLite = null;
let db = null;

const getDB = async () => {
  if (!isNative()) {
    return {
      execAsync: async () => {},
      runAsync: async () => ({ lastInsertRowId: 0 }),
      getFirstAsync: async () => null,
      getAllAsync: async () => [],
    };
  }

  if (db) return db;

  try {
    if (!SQLite) {
      SQLite = await import('expo-sqlite');
    }
    db = await SQLite.openDatabaseAsync('weathernews.db');
    return db;
  } catch (error) {
    console.error('Failed to open database:', error);
    return null;
  }
};

export const initDatabase = async () => {
  if (!isNative()) {
    console.log('Running in web/Expo Snack mode - skipping SQLite init');
    return;
  }

  try {
    const database = await getDB();
    if (!database) return;

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS weather_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        weather_data TEXT NOT NULL,
        forecast_data TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        UNIQUE(lat, lon)
      );
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS news_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        articles TEXT NOT NULL,
        cached_at INTEGER NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        all_day INTEGER DEFAULT 0,
        location TEXT,
        reminder_offset INTEGER,
        created_at INTEGER NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Helper to safely query DB
const safeDb = async () => {
  if (!isNative()) {
    return {
      runAsync: async () => ({ changes: 0 }),
      getFirstAsync: async () => null,
      getAllAsync: async () => [],
      getLastInsertRowId: () => 0,
    };
  }
  return await getDB();
};

// Weather Cache
export const cacheWeather = async (lat, lon, weather, forecast) => {
  if (!isNative()) return;
  const database = await safeDb();
  if (!database) return;

  const cached_at = Date.now();
  await database.runAsync(
    `INSERT OR REPLACE INTO weather_cache (lat, lon, weather_data, forecast_data, cached_at)
     VALUES (?, ?, ?, ?, ?)`,
    [lat, lon, JSON.stringify(weather), JSON.stringify(forecast), cached_at]
  );
};

export const getCachedWeather = async (lat, lon, maxAge = 30 * 60 * 1000) => {
  if (!isNative()) return null;
  const database = await safeDb();
  if (!database) return null;

  try {
    const cached = await database.getFirstAsync(
      `SELECT weather_data, forecast_data, cached_at FROM weather_cache WHERE lat = ? AND lon = ?`,
      [lat, lon]
    );

    if (cached && (Date.now() - cached.cached_at) < maxAge) {
      return {
        weather: JSON.parse(cached.weather_data),
        forecast: JSON.parse(cached.forecast_data),
      };
    }
  } catch (error) {
    console.error('Error getting cached weather:', error);
  }
  return null;
};

// News Cache
export const cacheNews = async (type, articles) => {
  if (!isNative()) return;
  const database = await safeDb();
  if (!database) return;

  const cached_at = Date.now();
  await database.runAsync(
    `INSERT INTO news_cache (type, articles, cached_at) VALUES (?, ?, ?)`,
    [type, JSON.stringify(articles), cached_at]
  );
};

export const getCachedNews = async (type, maxAge = 15 * 60 * 1000) => {
  if (!isNative()) return null;
  const database = await safeDb();
  if (!database) return null;

  try {
    const cached = await database.getFirstAsync(
      `SELECT articles, cached_at FROM news_cache WHERE type = ? ORDER BY cached_at DESC LIMIT 1`,
      [type]
    );

    if (cached && (Date.now() - cached.cached_at) < maxAge) {
      return JSON.parse(cached.articles);
    }
  } catch (error) {
    console.error('Error getting cached news:', error);
  }
  return null;
};

// Calendar Events (SQLite backup)
export const addCalendarEvent = async (event) => {
  if (!isNative()) return 0;
  const database = await safeDb();
  if (!database) return 0;

  const created_at = Date.now();
  try {
    const result = await database.runAsync(
      `INSERT INTO calendar_events (title, description, start_date, end_date, all_day, location, reminder_offset, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.description,
        event.startDate,
        event.endDate || null,
        event.allDay ? 1 : 0,
        event.location || null,
        event.reminderOffset || null,
        created_at,
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding calendar event to cache:', error);
    return 0;
  }
};

export const getCalendarEvents = async (upcomingOnly = true) => {
  if (!isNative()) return [];
  const database = await safeDb();
  if (!database) return [];

  try {
    let query = `SELECT * FROM calendar_events`;
    if (upcomingOnly) {
      query += ` WHERE start_date >= datetime('now')`;
    }
    query += ` ORDER BY start_date ASC`;

    const events = await database.getAllAsync(query);
    return events.map(e => ({
      ...e,
      allDay: e.allDay === 1,
    }));
  } catch (error) {
    console.error('Error getting calendar events from cache:', error);
    return [];
  }
};

export const deleteCalendarEvent = async (id) => {
  if (!isNative()) return;
  const database = await safeDb();
  if (!database) return;

  try {
    await database.runAsync(`DELETE FROM calendar_events WHERE id = ?`, [id]);
  } catch (error) {
    console.error('Error deleting calendar event from cache:', error);
  }
};

// Settings
export const setSetting = async (key, value) => {
  if (!isNative()) return;
  const database = await safeDb();
  if (!database) return;

  try {
    await database.runAsync(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      [key, value]
    );
  } catch (error) {
    console.error('Error setting value:', error);
  }
};

export const getSetting = async (key) => {
  if (!isNative()) {
    // Return default values for common settings in web mode
    const defaults = {
      temperatureUnit: 'celsius',
      notificationsEnabled: 'true',
      dailyWeatherNotification: 'true',
      weatherAlertsEnabled: 'true',
      newsNotificationsEnabled: 'false',
      autoRefresh: 'true',
      cacheImages: 'true',
    };
    return defaults[key] || null;
  }

  const database = await safeDb();
  if (!database) return null;

  try {
    const setting = await database.getFirstAsync(`SELECT value FROM settings WHERE key = ?`, [key]);
    return setting ? setting.value : null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
};

// Cleanup
export const cleanupOldCache = async () => {
  if (!isNative()) return;
  const database = await safeDb();
  if (!database) return;

  try {
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    await database.runAsync(`DELETE FROM weather_cache WHERE cached_at < ?`, [dayAgo]);
    await database.runAsync(`DELETE FROM news_cache WHERE cached_at < ?`, [dayAgo]);
  } catch (error) {
    console.error('Error cleaning old cache:', error);
  }
};

export default {
  initDatabase,
  cacheWeather,
  getCachedWeather,
  cacheNews,
  getCachedNews,
  addCalendarEvent,
  getCalendarEvents,
  deleteCalendarEvent,
  setSetting,
  getSetting,
  cleanupOldCache,
};
