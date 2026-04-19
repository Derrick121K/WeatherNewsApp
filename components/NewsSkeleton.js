import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

const NewsSkeleton = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderSkeletonCard = (index) => (
    <Animated.View key={index} style={[styles.card, animatedStyle]}>
      <View style={styles.imageSkeleton} />
      <View style={styles.content}>
        <View style={styles.titleSkeleton} />
        <View style={styles.titleSkeletonShort} />
        <View style={styles.descSkeleton} />
        <View style={styles.footerSkeleton}>
          <View style={styles.sourceSkeleton} />
          <View style={styles.timeSkeleton} />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View>
      {[0, 1, 2].map(renderSkeletonCard)}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageSkeleton: {
    height: 160,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: 16,
  },
  titleSkeleton: {
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  titleSkeletonShort: {
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 12,
    width: '70%',
  },
  descSkeleton: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 12,
    width: '90%',
  },
  footerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sourceSkeleton: {
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    width: 80,
  },
  timeSkeleton: {
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    width: 50,
  },
});

export default NewsSkeleton;
