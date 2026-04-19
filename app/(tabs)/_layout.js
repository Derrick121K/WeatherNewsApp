import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../utils/constants';

const TabIcon = ({ emoji, focused, label }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
      {emoji}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Weather',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌤️" focused={focused} label="Weather" />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📰" focused={focused} label="News" />
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📈" focused={focused} label="Trends" />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" focused={focused} label="Calendar" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} label="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.cardBackground,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 24,
    opacity: 0.6,
  },
  tabEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 7,
    marginTop: 4,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});
