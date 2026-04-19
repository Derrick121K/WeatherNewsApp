import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, getTimeAgo } from '../utils/constants';
import NewsDetailModal from './NewsDetailModal';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const NewsCard = ({ article, index, onPress }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress(article);
    } else {
      setShowDetail(true);
    }
  };

  const imageUri = article.image_url || article.image;
  const hasImage = imageUri && imageUri.startsWith('http');

  return (
    <>
      <AnimatedTouchable
        entering={FadeInUp.delay(index * 80).duration(400)}
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Image or Placeholder */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>📰</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {article.title}
          </Text>

          {article.description && (
            <Text style={styles.description} numberOfLines={2}>
              {article.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceIcon}>🔗</Text>
              <Text style={styles.source} numberOfLines={1}>
                {article.source_id || article.source?.name || 'News'}
              </Text>
            </View>
            <Text style={styles.timeAgo}>
              {getTimeAgo(article.pubDate || article.publishedAt)}
            </Text>
          </View>

          <TouchableOpacity style={styles.readMoreButton} onPress={(e) => { e.stopPropagation(); setShowDetail(true); }}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        </View>
      </AnimatedTouchable>

      <NewsDetailModal
        visible={showDetail}
        article={article}
        onClose={() => setShowDetail(false)}
      />
    </>
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
  imageContainer: {
    height: 160,
    backgroundColor: COLORS.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
  },
  placeholderEmoji: {
    fontSize: 48,
    opacity: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  sourceIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  source: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
    flex: 1,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  readMoreButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
});

export default NewsCard;
