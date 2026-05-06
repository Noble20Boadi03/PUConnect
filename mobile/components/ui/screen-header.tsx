import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../themed-view';
import { ThemedText } from '../themed-text';
import { ThemedIcon } from './themed-icon';
import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

interface ScreenHeaderProps {
  title?: string | React.ReactNode;
  onBack?: () => void;
  backIcon?: 'chevron-left' | 'close';
  right?: React.ReactNode;
  showBack?: boolean;
}

export function ScreenHeader({ title, onBack, backIcon = 'chevron-left', right, showBack = true }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  const handleBack = onBack || (() => {
      if (router.canGoBack()) {
          router.back();
      } else {
          router.replace('/(tabs)/home');
      }
  });

  return (
    <ThemedView style={[styles.header, { paddingTop: insets.top + Spacing.xs, ...horizontalPadding }]}>
      {showBack ? (
        <Pressable onPress={handleBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <ThemedIcon name={backIcon} size={28} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      
      <View style={styles.titleContainer}>
        {typeof title === 'string' ? (
          <ThemedText variant="headlineSmall" style={styles.headerTitle} numberOfLines={1}>
            {title}
          </ThemedText>
        ) : (
          title
        )}
      </View>
      
      {right ? (
        <View style={styles.rightContainer}>{right}</View>
      ) : showBack ? (
        <View style={styles.spacer} />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
    width: 40,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  }
});
