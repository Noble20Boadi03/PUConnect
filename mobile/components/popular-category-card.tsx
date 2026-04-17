import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ThemedIcon } from './ui/themed-icon';
import { LinearGradient } from 'expo-linear-gradient';

interface PopularCategoryCardProps {
  title: string;
  icon: string;
  colors: readonly [string, string, ...string[]];
  onPress: () => void;
  width?: number;
}

export function PopularCategoryCard({ title, icon, colors, onPress, width = 140 }: PopularCategoryCardProps) {
  return (
    <ThemedView
      elevation={1}
      colorName="surface"
      style={[styles.container, { width }]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={onPress}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imageSection}
        >
          <ThemedIcon name={icon as any} size={40} lightColor="#ffffff" darkColor="#ffffff" />
        </LinearGradient>
        <View style={styles.content}>
          <ThemedText variant="labelLarge" style={styles.title} numberOfLines={1}>
            {title}
          </ThemedText>
        </View>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    aspectRatio: 1,
    marginBottom: Spacing.md,
  },
  pressable: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  imageSection: {
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
