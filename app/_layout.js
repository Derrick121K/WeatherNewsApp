import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DatabaseReadyContext from '../contexts/DatabaseReadyContext';
import { COLORS } from '../utils/constants';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Dynamically import services to avoid blocking splash screen
        const { initDatabase } = await import('../services/storageService');
        const {
          configureNotifications,
          requestNotificationPermissions,
          registerBackgroundFetch,
        } = await import('../services/notificationService');

        // Initialize database with timeout
        const dbPromise = initDatabase();
        const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
        await Promise.race([dbPromise, timeout]).catch(console.error);
        setDbReady(true);

        // Configure notifications (non-blocking)
        configureNotifications().catch(console.error);

        // Request permissions with timeout
        const permPromise = requestNotificationPermissions();
        const permTimeout = new Promise((resolve) => setTimeout(resolve, 2000));
        const granted = await Promise.race([permPromise, permTimeout]).catch(() => false);

        if (granted) {
          registerBackgroundFetch().catch(console.error);
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    // Delay initialization so splash screen doesn't hang
    const timer = setTimeout(initializeApp, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DatabaseReadyContext.Provider value={{ ready: dbReady, setReady: setDbReady }}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </DatabaseReadyContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
