import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Share,
  Modal,
  StatusBar,
} from 'react-native';
import { COLORS, getTimeAgo } from '../utils/constants';

const NewsDetailModal = ({ article, visible, onClose }) => {
  if (!article) return null;

  const handleOpenArticle = async () => {
    if (article.link) {
      await Linking.openURL(article.link);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.description || ''}\n\nRead more: ${article.link}`,
        url: article.link,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const imageUri = article.image_url || article.image;
  const hasImage = imageUri && imageUri.startsWith('http');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Image */}
          {hasImage && (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          )}

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Meta */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🔗</Text>
              <Text style={styles.source} numberOfLines={1}>
                {article.source_id || article.source?.name || 'Unknown Source'}
              </Text>
            </View>
            <Text style={styles.timeAgo}>{getTimeAgo(article.pubDate || article.publishedAt)}</Text>
          </View>

          {/* Description / Full Content */}
          <View style={styles.articleContent}>
            <Text style={styles.description}>
              {article.description || article.content || 'No description available.'}
            </Text>

            {/* Keywords/Tags */}
            {article.keywords && (
              <View style={styles.tagsContainer}>
                {article.keywords.slice(0, 5).map((keyword, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Read more link if available */}
            {article.link && (
              <TouchableOpacity style={styles.readMoreButton} onPress={handleOpenArticle}>
                <Text style={styles.readMoreText}>Read Full Article →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.cardBackground,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    padding: 16,
    lineHeight: 30,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  source: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  articleContent: {
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  readMoreButton: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default NewsDetailModal;
