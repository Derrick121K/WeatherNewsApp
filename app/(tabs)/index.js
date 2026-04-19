import * as Location from 'expo-location';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../../components/ErrorMessage';
import ForecastCard from '../../components/ForecastCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchBar from '../../components/SearchBar';
import WeatherCard from '../../components/WeatherCard';
import DatabaseReadyContext from '../../contexts/DatabaseReadyContext';
import { requestNotificationPermissions, scheduleDailyWeatherNotification, scheduleWeatherAlert } from '../../services/notificationService';
import { getSetting } from '../../services/storageService';
import { fetchAndCacheWeather, fetchAndCacheWeatherByCity } from '../../services/weatherService';
import { COLORS, DEFAULT_LOCATION, getTimeOfDay, getWeatherBackground } from '../../utils/constants';

// Check if running on native
const isNative = () => {
  return !(typeof window !== 'undefined' && window.document && window.document.body);
};

export default function WeatherScreen() {
    const { ready: dbReady } = useContext(DatabaseReadyContext);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundUri, setBackgroundUri] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');

  useEffect(() => {
    if (dbReady) {
      loadSettings();
    }
  }, [dbReady]);

  const loadSettings = async () => {
    const unit = await getSetting('temperatureUnit');
    if (unit) {
      setTemperatureUnit(unit);
    }
  };

  const updateBackground = (weatherData) => {
    if (weatherData) {
      const condition = weatherData.weather[0]?.main || 'Clear';
      const isDay = weatherData.sys?.pod === 'day' || getTimeOfDay(weatherData.dt) === 'day';
      const bgUrl = getWeatherBackground(condition, isDay);
      setBackgroundUri(bgUrl);
    }
  };

  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      setError(null);
      const data = await fetchAndCacheWeather(lat, lon);

      setWeather(data.weather);

      // Get one forecast per day (every 8th item = 24 hours)
      const dailyForecast = data.forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5);
      setForecast(dailyForecast);

      // Update background
      updateBackground(data.weather);

      // Setup notifications on first successful fetch
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleDailyWeatherNotification(data.weather);
        await scheduleWeatherAlert(data.weather.weather[0]?.main, data.weather.name);
      }
    } catch (err) {
      setError('Failed to fetch weather data. Showing cached data if available.');
      console.error('Weather fetch error:', err);
    }
  }, []);

  const getLocationAndFetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // On web/Expo Snack, skip location and use default
      if (!isNative()) {
        await fetchWeatherData(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        await fetchWeatherData(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await fetchWeatherData(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      await fetchWeatherData(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    } finally {
      setLoading(false);
    }
  }, [fetchWeatherData]);

  const handleSearch = async (city) => {
    try {
      setSearchLoading(true);
      setError(null);

      const response = await fetchAndCacheWeatherByCity(city);
      setWeather(response.weather);

      const dailyForecast = response.forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5);
      setForecast(dailyForecast);

      updateBackground(response.weather);
    } catch (err) {
      setError(`City "${city}" not found. Please check the spelling.`);
    } finally {
      setSearchLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getLocationAndFetch();
    setRefreshing(false);
  }, [getLocationAndFetch]);

  useEffect(() => {
    if (dbReady) {
      getLocationAndFetch();
    }
  }, [dbReady, getLocationAndFetch]);

  const renderHeader = () => (
    <Animated.View entering={FadeIn.duration(500)}>
      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weather</Text>
        <Text style={styles.headerSubtitle}>Stay updated with the latest</Text>
      </View>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} isLoading={searchLoading} />

      {/* Weather Card */}
      {weather && <WeatherCard weather={weather} temperatureUnit={temperatureUnit} />}

      {/* Forecast Title */}
      {forecast.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>5-Day Forecast</Text>
        </View>
      )}
    </Animated.View>
  );

  if (!dbReady || loading) {
    return <LoadingSpinner message={!dbReady ? "Preparing app..." : "Getting your weather..."} />;
  }

  if (error && !weather) {
    return <ErrorMessage message={error} onRetry={getLocationAndFetch} />;
  }

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
          data={forecast}
          keyExtractor={(item) => item.dt.toString()}
          renderItem={({ item, index }) => (
            <ForecastCard forecast={item} index={index} temperatureUnit={temperatureUnit} />
          )}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

