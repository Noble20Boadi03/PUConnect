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
  /** Edges to apply safe area insets */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Apply standard responsive padding */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Max width for the content area on large screens (tablets/foldables) */
  maxWidth?: number;
  /** Props to pass to the ScrollView if scrollable is true */
  scrollViewProps?: ScrollViewProps;
  /** Whether to wrap in a KeyboardAvoidingView */
  keyboardAvoiding?: boolean;
  /** Background color token */
  colorName?: keyof typeof Colors.light;
  /** Content container style */
  contentContainerStyle?: any;
}

export function ScreenLayout({
  children,
  scrollable = false,
  withSafeArea = true,
  edges = ['top', 'bottom', 'left', 'right'],
  padding = 'none',
  maxWidth = 840,
  scrollViewProps,
  keyboardAvoiding = false,
  colorName = 'background',
  style,
  contentContainerStyle,
  ...props
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { isPhone, spacingMultiplier, width } = useResponsive();

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

  // Calculate dynamic padding based on safe area and requested edges
  const pt = (withSafeArea && edges.includes('top') ? insets.top : 0) + basePadding;
  const pb = (withSafeArea && edges.includes('bottom') ? insets.bottom : 0) + basePadding;
  const pl = (withSafeArea && edges.includes('left') ? insets.left : 0) + basePadding;
  const pr = (withSafeArea && edges.includes('right') ? insets.right : 0) + basePadding;

  // On large screens, we constrain the max width and center it
  // This creates a beautiful letterboxed layout on tablets and desktops
  const isConstrained = !isPhone && maxWidth > 0 && width > maxWidth;
  
  const innerContentStyle = [
    {
      paddingTop: pt,
      paddingBottom: pb,
      paddingLeft: pl,
      paddingRight: pr,
    },
    isConstrained && { 
      maxWidth, 
      width: '100%', 
      alignSelf: 'center' as const 
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
      >
        {Content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <ThemedView style={[styles.container, !scrollable && !isConstrained ? style : undefined]} colorName={colorName}>
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
