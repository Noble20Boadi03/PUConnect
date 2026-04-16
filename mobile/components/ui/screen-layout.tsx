import React from 'react';
import { View, StyleSheet, ViewProps, ScrollView, KeyboardAvoidingView, Platform, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { Spacing, Colors } from '@/constants/theme';

export interface ScreenLayoutProps extends ViewProps {
  children: React.ReactNode;
  /** Whether the screen should scroll */
  scrollable?: boolean;
  /** Whether to apply safe area insets as padding */
  withSafeArea?: boolean;
  /** Edges to apply safe area insets. Horizontal edges are auto-managed in landscape. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Apply standard responsive padding */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /**
   * Max width for the content area on large screens (tablets/foldables in landscape).
   * Defaults to contentMaxWidth from useResponsive. Pass 0 to disable.
   */
  maxWidth?: number;
  /** Props to pass to the ScrollView if scrollable is true */
  scrollViewProps?: ScrollViewProps;
  /** Whether to wrap in a KeyboardAvoidingView */
  keyboardAvoiding?: boolean;
  /** Background color token */
  colorName?: keyof typeof Colors.light;
  /** Pass true to forcefully omit root color fills */
  transparent?: boolean;
  /** Content container style */
  contentContainerStyle?: any;
}

export function ScreenLayout({
  children,
  scrollable = false,
  withSafeArea = true,
  edges = ['top', 'bottom', 'left', 'right'],
  padding = 'none',
  maxWidth,
  scrollViewProps,
  keyboardAvoiding = false,
  colorName = 'background',
  transparent = false,
  style,
  contentContainerStyle,
  ...props
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { isLandscape, spacingMultiplier, contentMaxWidth, width } = useResponsive();

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return Spacing.sm * spacingMultiplier;
      case 'large': return Spacing.xl * spacingMultiplier;
      case 'medium':
      default: return Spacing.md * spacingMultiplier;
    }
  };

  const basePadding = getPadding();

  // ── Safe-area inset calculation ───────────────────────────────────────
  // In landscape on phones, the side insets cover the notch/camera.
  // We always apply left/right safe area if the edge is requested —
  // this is essential for correct layout in landscape.
  const pt = (withSafeArea && edges.includes('top') ? insets.top : 0) + basePadding;
  const pb = (withSafeArea && edges.includes('bottom') ? insets.bottom : 0) + basePadding;
  const pl = (withSafeArea && edges.includes('left') ? insets.left : 0) + basePadding;
  const pr = (withSafeArea && edges.includes('right') ? insets.right : 0) + basePadding;

  // ── Max-width constraint ──────────────────────────────────────────────
  // On larger screens OR in landscape, constrain the content width.
  // This prevents content from stretching uncomfortably wide.
  const resolvedMaxWidth = maxWidth !== undefined ? maxWidth : contentMaxWidth;
  const isConstrained = resolvedMaxWidth > 0 && width > resolvedMaxWidth;

  const innerContentStyle = [
    {
      paddingTop: pt,
      paddingBottom: pb,
      paddingLeft: pl,
      paddingRight: pr,
    },
    isConstrained && {
      maxWidth: resolvedMaxWidth,
      width: '100%',
      alignSelf: 'center' as const,
    },
    contentContainerStyle,
  ];

  let Content;

  if (scrollable) {
    Content = (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { flexGrow: 1 },
          innerContentStyle
        ]}
        style={styles.container}
        // In landscape, horizontal scroll indicator also not needed
        showsHorizontalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  } else {
    Content = (
      <View style={[styles.innerContent, innerContentStyle, style]} {...props}>
        {children}
      </View>
    );
  }

  if (keyboardAvoiding) {
    Content = (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // In landscape on iOS, padding mode works better
        keyboardVerticalOffset={isLandscape && Platform.OS === 'ios' ? 20 : 0}
      >
        {Content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <ThemedView 
      style={[
        styles.container, 
        !scrollable && !isConstrained ? style : undefined,
        transparent ? { backgroundColor: 'transparent' } : undefined
      ]} 
      colorName={transparent ? undefined : colorName}
    >
      {Content}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
  },
});
