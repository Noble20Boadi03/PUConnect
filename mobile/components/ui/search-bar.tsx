import React from 'react';
import { StyleSheet, TextInput, ViewStyle, StyleProp } from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedIcon } from './themed-icon';
import { useTheme } from '@/context/theme-context';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search...',
  containerStyle,
}: SearchBarProps) {
  const { theme } = useTheme();

  return (
    <ThemedView
      colorName="surface"
      elevation={2}
      style={[
        styles.searchContainer,
        containerStyle,
      ]}
    >
      <ThemedIcon name="magnify" size={20} colorName="textMuted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[styles.searchInput, { color: theme.text }]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm, // Matching the more rectangular but rounded Fiverr look
    marginVertical: Spacing.sm, // Also reduce margin
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
});
