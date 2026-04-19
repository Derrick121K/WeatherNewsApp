import { useCallback, useContext, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../../components/ErrorMessage';
import NewsCard from '../../components/NewsCard';
import NewsSkeleton from '../../components/NewsSkeleton';
import DatabaseReadyContext from '../../contexts/DatabaseReadyContext';
import { fetchAfricanNews, fetchTrendingNews } from '../../services/newsService';
import { COLORS } from '../../utils/constants';

const TABS = [
  { id: 'african', label: '🌍 African News' },
  { id: 'trending', label: '🔥 Trending' },
];

export default function NewsScreen() {
    const { ready: dbReady } = useContext(DatabaseReadyContext);
  const [activeTab, setActiveTab] = useState('african');
  const [africanNews, setAfricanNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const [african, trending] = await Promise.all([
        fetchAfricanNews(),
        fetchTrendingNews(),
      ]);

      setAfricanNews(african);
      setTrendingNews(trending);
    } catch (err) {
      setError('Failed to fetch news. Please check your connection.');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews(false);
  }, [fetchNews]);

  useEffect(() => {
    if (dbReady) {
      fetchNews();
    }
  }, [dbReady, fetchNews]);

  const currentNews = activeTab === 'african' ? africanNews : trendingNews;

  const renderHeader = () => (
    <Animated.View entering={FadeIn.duration(500)}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News</Text>
        <Text style={styles.headerSubtitle}>Stay informed around the world</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderEmpty = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyText}>No news available</Text>
      <Text style={styles.emptySubtext}>Pull down to refresh</Text>
    </Animated.View>
  );

  if (!dbReady) {
    return <NewsSkeleton />;
  }
  if (error && !africanNews.length && !trendingNews.length) {
    return <ErrorMessage message={error} onRetry={() => fetchNews()} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={loading ? [] : currentNews}
        keyExtractor={(item, index) => item.article_id || index.toString()}
        renderItem={({ item, index }) => (
          <NewsCard article={item} index={index} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? <NewsSkeleton /> : renderEmpty}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.textPrimary,
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
