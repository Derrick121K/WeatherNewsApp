import axios from 'axios';
import { Platform } from 'react-native';
import { cacheWeather, getCachedWeather } from './storageService';

// Check if running on native
const isNative = () => {
  return !(typeof window !== 'undefined' && window.document && window.document.body);
};

let Notifications = null;
let TaskManager = null;
let BackgroundFetch = null;

// Lazy load native modules
const loadNativeModules = async () => {
  if (!isNative()) return false;
  try {
    const [notif, task, bg] = await Promise.all([
      import('expo-notifications'),
      import('expo-task-manager'),
      import('expo-background-fetch'),
    ]);
    Notifications = notif;
    TaskManager = task;
    BackgroundFetch = bg;
    return true;
  } catch (error) {
    console.error('Failed to load native modules:', error);
    return false;
  }
};

// Configure notification handler and channels
export const configureNotifications = async () => {
  if (!isNative()) return;
  const loaded = await loadNativeModules();
  if (!loaded || !Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('weather-alerts', {
        name: 'Weather Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B8A',
      });
      await Notifications.setNotificationChannelAsync('news-updates', {
        name: 'News Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200],
        lightColor: '#E94560',
      });
      await Notifications.setNotificationChannelAsync('calendar-reminders', {
        name: 'Calendar Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }
  } catch (error) {
    console.error('Notification config error:', error);
  }
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (!isNative()) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    await configureNotifications();
    return true;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

// Schedule daily weather notification
export const scheduleDailyWeatherNotification = async (weatherData) => {
  if (!isNative() || !weatherData) return;

  try {
    await loadNativeModules();
    if (!Notifications) return;

    const { name: city, main, weather } = weatherData;
    const temp = Math.round(main.temp - 273.15);
    const condition = weather[0]?.description || 'clear';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Today's Weather in ${city}`,
        body: `Temperature: ${temp}°C, ${condition}`,
        data: { type: 'weather', city, temp, condition },
        sound: true,
      },
      trigger: {
        type: 'daily',
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling daily notification:', error);
  }
};

// Send immediate notification
export const sendNotification = async (title, body, data = {}) => {
  if (!isNative()) return;
  try {
    await loadNativeModules();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: { type: 'immediate' },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Schedule weather alert
export const scheduleWeatherAlert = async (condition, city) => {
  if (!isNative()) return;

  const alerts = {
    thunderstorm: {
      title: 'Thunderstorm Alert',
      body: `Severe thunderstorm warning for ${city}. Stay safe indoors!`,
    },
    rain: {
      title: 'Rain Alert',
      body: `Heavy rain expected in ${city}. Don't forget your umbrella!`,
    },
    snow: {
      title: 'Snow Alert',
      body: `Snowfall expected in ${city}. Drive carefully!`,
    },
    extreme: {
      title: 'Extreme Weather Alert',
      body: `Extreme weather conditions in ${city}. Check for updates!`,
    },
  };

  const lower = condition.toLowerCase();
  let alert = null;
  if (lower.includes('thunderstorm')) alert = alerts.thunderstorm;
  else if (lower.includes('rain') || lower.includes('drizzle')) alert = alerts.rain;
  else if (lower.includes('snow')) alert = alerts.snow;
  else if (lower.includes('extreme') || lower.includes('tornado') || lower.includes('hurricane')) alert = alerts.extreme;

  if (alert) {
    await sendNotification(alert.title, alert.body, { type: 'weather-alert', city, condition });
  }
};

// Background fetch task
const BACKGROUND_FETCH_TASK = 'background-weather-fetch';

if (isNative()) {
  // Define task only on native
  const defineTask = async () => {
    await loadNativeModules();
    if (!TaskManager || !BackgroundFetch) return;

    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      try {
        const cached = await getCachedWeather(-26.2041, 28.0473, 60 * 60 * 1000);
        if (cached) return BackgroundFetch.BackgroundFetchResult.NoData;

        const response = await axios.get(`${process.env.EXPO_PUBLIC_WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5'}/weather`, {
          params: {
            lat: -26.2041,
            lon: 28.0473,
            appid: process.env.EXPO_PUBLIC_WEATHER_API_KEY,
          },
        });

        if (response.data) {
          const forecastResponse = await axios.get(`${process.env.EXPO_PUBLIC_WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5'}/forecast`, {
            params: {
              lat: -26.2041,
              lon: 28.0473,
              appid: process.env.EXPO_PUBLIC_WEATHER_API_KEY,
            },
          });

          await cacheWeather(-26.2041, 28.0473, response.data, forecastResponse.data);
          await scheduleWeatherAlert(response.data.weather[0]?.description || '', response.data.name);
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }
        return BackgroundFetch.BackgroundFetchResult.NoData;
      } catch (error) {
        console.error('Background fetch error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
  };

  // Execute defineTask immediately
  defineTask().catch(console.error);
}

// Register background fetch
export const registerBackgroundFetch = async () => {
  if (!isNative()) return;
  try {
    await loadNativeModules();
    if (!BackgroundFetch) return;
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 60 * 1000,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (err) {
    console.error('Failed to register background fetch:', err);
  }
};

// Cancel notifications
export const cancelAllNotifications = async () => {
  if (!isNative()) return;
  await loadNativeModules();
  if (Notifications) {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};

// Get notification settings
export const getNotificationSettings = async () => {
  if (!isNative()) return [];
  await loadNativeModules();
  if (Notifications) {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
  return [];
};

export default {
  requestNotificationPermissions,
  configureNotifications,
  scheduleDailyWeatherNotification,
  sendNotification,
  scheduleWeatherAlert,
  registerBackgroundFetch,
  cancelAllNotifications,
  getNotificationSettings,
};
