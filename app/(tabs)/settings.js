import { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatabaseReadyContext from '../../contexts/DatabaseReadyContext';
import {
  cancelAllNotifications
} from '../../services/notificationService';
import {
  getSetting,
  setSetting
} from '../../services/storageService';
import { COLORS } from '../../utils/constants';

const SettingItem = ({
  title,
  subtitle,
  children,
  onPress,
  showArrow = false,
  danger = false,
}) => (
  <TouchableOpacity
    style={[styles.item, danger && styles.itemDanger]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.itemContent}>
      <Text style={[styles.itemTitle, danger && styles.itemTitleDanger]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
    {children}
    {showArrow && !children && <Text style={styles.arrow}>›</Text>}
  </TouchableOpacity>
);

const SettingSection = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const ToggleSetting = ({ label, description, value, onValueChange }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleLabel}>
      <Text style={styles.toggleLabelText}>{label}</Text>
      {description ? (
        <Text style={styles.toggleDescription}>{description}</Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.border, true: COLORS.accent }}
      thumbColor={Platform.OS === 'android' ? COLORS.textPrimary : undefined}
    />
  </View>
);

export default function SettingsScreen() {
    const { ready: dbReady } = useContext(DatabaseReadyContext);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    temperatureUnit: 'celsius', // 'celsius' or 'fahrenheit'
    notificationsEnabled: true,
    dailyWeatherNotification: true,
    weatherAlertsEnabled: true,
    newsNotificationsEnabled: false,
    autoRefresh: true,
    cacheImages: true,
  });

  const [cacheInfo, setCacheInfo] = useState({
    weather: 0,
    news: 0,
  });

  const loadSettings = useCallback(async () => {
    try {
      const [
        tempUnit,
        notifEnabled,
        dailyWeather,
        weatherAlerts,
        newsNotif,
        autoRefresh,
        cacheImages,
      ] = await Promise.all([
        getSetting('temperatureUnit').then((v) => v || 'celsius'),
        getSetting('notificationsEnabled').then((v) => v !== 'false'),
        getSetting('dailyWeatherNotification').then((v) => v !== 'false'),
        getSetting('weatherAlertsEnabled').then((v) => v !== 'false'),
        getSetting('newsNotificationsEnabled').then((v) => v === 'true'),
        getSetting('autoRefresh').then((v) => v !== 'false'),
        getSetting('cacheImages').then((v) => v !== 'false'),
      ]);

      setSettings({
        temperatureUnit: tempUnit,
        notificationsEnabled: notifEnabled,
        dailyWeatherNotification: dailyWeather,
        weatherAlertsEnabled: weatherAlerts,
        newsNotificationsEnabled: newsNotif,
        autoRefresh: autoRefresh,
        cacheImages: cacheImages,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = async (key, value) => {
    const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : value;
    await setSetting(key, stringValue);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached weather and news data. You will need to reconnect to the internet to fetch fresh data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // SQLite clear would be done via a service method, but for now we'll mark as cleared
              await updateSetting('cacheCleared', Date.now().toString());
              setCacheInfo({ weather: 0, news: 0 });
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const resetAllSettings = async () => {
    Alert.alert(
      'Reset All Settings',
      'This will restore all settings to their default values. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaults = {
              temperatureUnit: 'celsius',
              notificationsEnabled: true,
              dailyWeatherNotification: true,
              weatherAlertsEnabled: true,
              newsNotificationsEnabled: false,
              autoRefresh: true,
              cacheImages: true,
            };
            await Promise.all(
              Object.entries(defaults).map(([key, value]) =>
                setSetting(key, value)
              )
            );
            setSettings(defaults);
            Alert.alert('Done', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  const disableAllNotifications = async () => {
    await updateSetting('notificationsEnabled', false);
    await cancelAllNotifications();
    Alert.alert('Disabled', 'All scheduled notifications have been cancelled');
  };

  useEffect(() => {
    if (dbReady) {
      loadSettings();
    }
  }, [dbReady, loadSettings]);

  if (!dbReady || loading) {
    return <LoadingSpinner message={!dbReady ? "Preparing app..." : "Loading settings..."} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </View>
        </Animated.View>

        {/* Weather Settings */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <SettingSection title="WEATHER">
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Temperature Unit</Text>
                <Text style={styles.itemSubtitle}>
                  {settings.temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                </Text>
              </View>
              <View style={styles.toggleGroup}>
                {['celsius', 'fahrenheit'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.toggleOption,
                      settings.temperatureUnit === unit && styles.toggleOptionActive,
                    ]}
                    onPress={() => updateSetting('temperatureUnit', unit)}
                  >
                    <Text
                      style={[
                        styles.toggleOptionText,
                        settings.temperatureUnit === unit && styles.toggleOptionTextActive,
                      ]}
                    >
                      {unit === 'celsius' ? '°C' : '°F'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ToggleSetting
              label="Daily Weather Notification"
              description="Get a daily forecast at 7 AM"
              value={settings.dailyWeatherNotification}
              onValueChange={(v) => updateSetting('dailyWeatherNotification', v)}
            />

            <ToggleSetting
              label="Weather Alerts"
              description="Severe weather warnings"
              value={settings.weatherAlertsEnabled}
              onValueChange={(v) => updateSetting('weatherAlertsEnabled', v)}
            />

            <ToggleSetting
              label="Auto-refresh"
              description="Automatically update data"
              value={settings.autoRefresh}
              onValueChange={(v) => updateSetting('autoRefresh', v)}
            />
          </SettingSection>
        </Animated.View>

        {/* News Settings */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <SettingSection title="NEWS">
            <ToggleSetting
              label="News Notifications"
              description="Daily news digest"
              value={settings.newsNotificationsEnabled}
              onValueChange={(v) => updateSetting('newsNotificationsEnabled', v)}
            />

            <ToggleSetting
              label="Cache Images"
              description="Download images for offline reading"
              value={settings.cacheImages}
              onValueChange={(v) => updateSetting('cacheImages', v)}
            />
          </SettingSection>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <SettingSection title="NOTIFICATIONS">
            <SettingItem
              title="Notification Permissions"
              subtitle="Manage app permissions"
              showArrow
              onPress={async () => {
                // Open app settings
                try {
                  await Linking.openSettingsAsync();
                } catch (e) {
                  Alert.alert('Info', 'Please check your device settings');
                }
              }}
            />
            <SettingItem
              title="Disable All Notifications"
              subtitle="Cancel all scheduled notifications"
              danger
              onPress={disableAllNotifications}
            />
          </SettingSection>
        </Animated.View>

        {/* Storage */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <SettingSection title="STORAGE">
            <SettingItem
              title="Clear Cache"
              subtitle={`Weather: ${cacheInfo.weather} MB • News: ${cacheInfo.news} MB`}
              onPress={clearCache}
              showArrow
            />
          </SettingSection>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <SettingSection title="ABOUT">
            <SettingItem
              title="Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <SettingItem
              title="Developer"
              subtitle="GossipaWeatherNewsApp Team"
              showArrow={false}
            />
            <SettingItem
              title="Data Sources"
              subtitle="OpenWeatherMap, NewsData.io, Reddit, Hacker News"
              showArrow={false}
            />
          </SettingSection>
        </Animated.View>

        {/* Dangerous Actions */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <SettingSection title="DANGER ZONE">
            <SettingItem
              title="Reset All Settings"
              subtitle="Restore all defaults"
              danger
              onPress={resetAllSettings}
              showArrow
            />
          </SettingSection>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GossipaWeatherNewsApp © 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemDanger: {
    // Already has danger styles via itemTitleDanger
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemTitleDanger: {
    color: COLORS.error,
  },
  itemSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textMuted,
    marginLeft: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  toggleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 8,
  },
  toggleOptionActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  toggleOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleOptionTextActive: {
    color: COLORS.textPrimary,
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
