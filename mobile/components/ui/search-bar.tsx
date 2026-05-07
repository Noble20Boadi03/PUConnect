import React from 'react';
import { StyleSheet, TextInput, ViewStyle, StyleProp } from 'react-native';
import { ThemedView } from '../themed-view';
import { ThemedIcon } from './themed-icon';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';

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
      elevation={2}
      colorName="surface"
      style={[
        styles.searchContainer,
        containerStyle,
      ]}
    >
      <ThemedIcon name="magnify" size={20} colorName="textSecondary" />
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
});
