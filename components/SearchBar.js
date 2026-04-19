import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SearchBar = ({ onSearch, placeholder = 'Search city...', isLoading }) => {
  const [query, setQuery] = useState('');
  const buttonScale = useSharedValue(1);
  const inputWidth = useSharedValue(1);

  const handleSearch = () => {
    if (query.trim() && !isLoading) {
      buttonScale.value = withSpring(0.9, {}, () => {
        buttonScale.value = withSpring(1);
      });
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputWidth.value = withTiming(1.02, { duration: 100 }, () => {
      inputWidth.value = withTiming(1);
    });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: inputWidth.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, animatedInputStyle]}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          editable={!isLoading}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      <AnimatedTouchable
        style={[styles.searchButton, animatedButtonStyle, isLoading && styles.searchButtonDisabled]}
        onPress={handleSearch}
        disabled={isLoading}
      >
        <Text style={styles.searchIcon}>{isLoading ? '⏳' : '🔍'}</Text>
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: COLORS.accent,
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  searchIcon: {
    fontSize: 22,
  },
});

export default SearchBar;
