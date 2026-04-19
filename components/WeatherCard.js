import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, kelvinToCelsius, convertTemperature, getTemperatureUnitSymbol, getWeatherIcon, getWeatherBackground, getTimeOfDay } from '../utils/constants';

const WeatherCard = ({ weather, isCompact = false, temperatureUnit = 'celsius' }) => {
  if (!weather) return null;

  const temp = convertTemperature(weather.main.temp, temperatureUnit);
  const icon = getWeatherIcon(weather.weather[0].icon);
  const condition = weather.weather[0].main;
  const description = weather.weather[0].description;
  const humidity = weather.main.humidity;
  const wind = Math.round(weather.wind.speed * 3.6);
  const pressure = weather.main.pressure;
  const feelsLike = convertTemperature(weather.main.feels_like, temperatureUnit);
  const isDay = weather.sys?.pod === 'day' || getTimeOfDay(weather.dt) === 'day';

  const backgroundUrl = getWeatherBackground(condition, isDay);
  const unitSymbol = getTemperatureUnitSymbol(temperatureUnit);

  const cardContent = (
    <>
      {/* Live Indicator */}
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.cityName}>{weather.name}</Text>
      </View>

      {/* Main Weather */}
      <View style={styles.mainWeather}>
        <Text style={styles.weatherIcon}>{icon}</Text>
        <Text style={styles.temperature}>{temp}{unitSymbol}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>
      <Text style={styles.feelsLike}>Feels like {feelsLike}°C</Text>

      {/* Weather Details */}
      <View style={styles.detailsContainer}>
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.detailItem}
        >
          <Text style={styles.detailIcon}>💧</Text>
          <Text style={styles.detailValue}>{humidity}%</Text>
          <Text style={styles.detailLabel}>Humidity</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.detailItem}
        >
          <Text style={styles.detailIcon}>💨</Text>
          <Text style={styles.detailValue}>{wind} km/h</Text>
          <Text style={styles.detailLabel}>Wind</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.detailItem}
        >
          <Text style={styles.detailIcon}>🔵</Text>
          <Text style={styles.detailValue}>{pressure}</Text>
          <Text style={styles.detailLabel}>Pressure</Text>
        </Animated.View>
      </View>
    </>
  );

  if (isCompact) {
    return (
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.compactCard}
      >
        <Text style={styles.compactIcon}>{icon}</Text>
        <Text style={styles.compactTemp}>{temp}{unitSymbol}</Text>
        <Text style={styles.compactDesc}>{description}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(600)}>
      <ImageBackground
        source={{ uri: backgroundUrl }}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        <View style={styles.overlay}>
          {cardContent}
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 25,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
    minHeight: 380,
  },
  cardImage: {
    borderRadius: 25,
  },
  overlay: {
    flex: 1,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 15, 35, 0.75)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  liveText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  cityName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  weatherIcon: {
    fontSize: 72,
    marginRight: 16,
  },
  temperature: {
    fontSize: 64,
    fontWeight: '300',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  compactCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  compactTemp: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  compactDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
    marginTop: 4,
  },
});

export default WeatherCard;
