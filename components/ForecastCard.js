import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { COLORS, convertTemperature, getTemperatureUnitSymbol, getWeatherIcon, formatDate } from '../utils/constants';

const ForecastCard = ({ forecast, index, temperatureUnit = 'celsius' }) => {
  const temp = convertTemperature(forecast.main.temp, temperatureUnit);
  const tempMin = convertTemperature(forecast.main.temp_min, temperatureUnit);
  const tempMax = convertTemperature(forecast.main.temp_max, temperatureUnit);
  const icon = getWeatherIcon(forecast.weather[0].icon);
  const description = forecast.weather[0].description;
  const date = formatDate(forecast.dt);
  const time = new Date(forecast.dt * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const unitSymbol = getTemperatureUnitSymbol(temperatureUnit);

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={styles.card}
    >
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      
      <Text style={styles.icon}>{icon}</Text>
      
      <View style={styles.tempContainer}>
        <Text style={styles.temp}>{temp}{unitSymbol}</Text>
        <View style={styles.tempRange}>
          <Text style={styles.tempHigh}>↑{tempMax}{unitSymbol}</Text>
          <Text style={styles.tempLow}>↓{tempMin}{unitSymbol}</Text>
        </View>
      </View>
      
      <Text style={styles.description}>{description}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateContainer: {
    width: 70,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  icon: {
    fontSize: 36,
    marginHorizontal: 12,
  },
  tempContainer: {
    flex: 1,
    alignItems: 'center',
  },
  temp: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tempRange: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  tempHigh: {
    fontSize: 12,
    color: COLORS.accent,
  },
  tempLow: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  description: {
    width: 80,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
});

export default ForecastCard;
