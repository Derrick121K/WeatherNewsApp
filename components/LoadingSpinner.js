import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.5, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/gossipaNewWeather.png')}
        style={{ width: 80, height: 80, marginBottom: 16 }}
        resizeMode="contain"
        accessibilityLabel="App Logo"
      />
      <Animated.View style={[styles.emojiContainer, animatedStyle]}>
        <Text style={styles.emoji}>🌤️</Text>
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emojiContainer: {
    marginBottom: 20,
  },
  emoji: {
    fontSize: 60,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingSpinner;
