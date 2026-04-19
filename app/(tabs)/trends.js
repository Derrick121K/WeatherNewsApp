import { useCallback, useContext, useEffect, useState } from 'react';
import {
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatabaseReadyContext from '../../contexts/DatabaseReadyContext';
import { fetchAllTrends, formatEngagement } from '../../services/trendsService';
import { COLORS } from '../../utils/constants';

const TrendCard = ({ trend, index }) => {
  const handlePress = async () => {
    const url = trend.url || trend.permalink;
    if (url) {
      await Linking.openURL(url);
    }
  };

  const getTrendIcon = () => {
    switch (trend.source) {
      case 'reddit':
        return '🔺';
      case 'hackernews':
        return '🚀';
      case 'newsdata':
        return '📰';
      case 'openweather':
        return '🌦️';
      case 'itunes':
        return '🎵';
      default:
        return '📈';
    }
  };

  const getScoreText = () => {
    if (trend.source === 'reddit') {
      return `${formatEngagement(trend.score)} points • ${trend.numComments} comments`;
    }
    if (trend.source === 'hackernews') {
      return `${formatEngagement(trend.points)} points • ${trend.numComments} comments`;
    }
    if (trend.source === 'newsdata') {
      return trend.sourceName;
    }
    if (trend.source === 'openweather') {
      return trend.sourceName;
    }
    if (trend.source === 'itunes') {
      return trend.description;
    }
    return '';
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceIcon}>{getTrendIcon()}</Text>
            <Text style={styles.sourceName}>{trend.sourceName}</Text>
          </View>
          <Text style={styles.timeAgo}>{trend.timeAgo}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {trend.title}
        </Text>
        {trend.image && (
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Animated.Image
              source={{ uri: trend.image }}
              style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#eee' }}
              resizeMode="cover"
              entering={FadeIn.duration(400)}
            />
          </View>
        )}
        {trend.description && (
          <Text style={styles.description} numberOfLines={3}>{trend.description}</Text>
        )}

        <View style={styles.footer}>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{getScoreText()}</Text>
          </View>
          {trend.subreddit && (
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>r/{trend.subreddit}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function TrendsScreen() {
    const { ready: dbReady } = useContext(DatabaseReadyContext);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrends = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const data = await fetchAllTrends();
      setTrends(data);
    } catch (err) {
      // Trends from public APIs rarely fail silently, but handle it
      setError('Failed to fetch trends. Pull down to retry.');
      console.error('Trends fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrends(false);
  }, [fetchTrends]);

  useEffect(() => {
    if (dbReady) {
      fetchTrends();
    }
  }, [dbReady, fetchTrends]);

  const renderEmpty = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyText}>No trends available</Text>
      <Text style={styles.emptySubtext}>Pull down to refresh</Text>
    </Animated.View>
  );

  if (!dbReady) {
    return <LoadingSpinner message="Preparing app..." />;
  }
  if (error && trends.length === 0) {
    return <ErrorMessage message={error} onRetry={() => fetchTrends()} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={trends}
        keyExtractor={(item, index) => `${item.source}-${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <TrendCard trend={item} index={index} />
        )}
        ListHeaderComponent={
          <Animated.View entering={FadeIn.duration(500)}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Trending</Text>
              <Text style={styles.headerSubtitle}>Hot topics from social media</Text>
            </View>
          </Animated.View>
        }
        ListEmptyComponent={loading ? <LoadingSpinner message="Loading trends..." /> : renderEmpty}
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
    paddingBottom: 16,
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
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    textTransform: 'uppercase',
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaContainer: {
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tagContainer: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tag: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
