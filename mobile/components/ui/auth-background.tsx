import React, { memo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/context/theme-context';

export const AuthBackground = memo(function AuthBackground() {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // Create topographical looking intersecting rings dynamically
  const BaseRing = ({ size, top, left, right, bottom, opacity = 0.05 }: any) => (
    <View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
        top,
        left,
        right,
        bottom,
        opacity,
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* --- TOP LEFT WAVE CASCADE --- */}
      
      {/* 1. Translucent Drop-Shadow Blob */}
      <View style={{
          position: 'absolute',
          top: -height * 0.15,
          left: -width * 0.40,
          width: width * 1.0,
          height: height * 0.35,
          borderRadius: width * 0.5,
          backgroundColor: theme.primary,
          opacity: 0.15,
          transform: [{ rotate: '-30deg' }]
      }} />

      {/* 2. Solid Primary Blob */}
      <View style={{
          position: 'absolute',
          top: -height * 0.20,
          left: -width * 0.45,
          width: width * 1.0,
          height: height * 0.35,
          borderRadius: width * 0.5,
          backgroundColor: theme.primary,
          transform: [{ rotate: '-30deg' }]
      }} />

      {/* --- BOTTOM RIGHT WAVE CASCADE --- */}
      
      {/* 3. Translucent Drop-Shadow Blob */}
      <View style={{
          position: 'absolute',
          bottom: -height * 0.15,
          right: -width * 0.50,
          width: width * 1.2,
          height: height * 0.30,
          borderRadius: width * 0.6,
          backgroundColor: theme.primary,
          opacity: 0.15,
          transform: [{ rotate: '-30deg' }]
      }} />

      {/* 4. Solid Primary Blob */}
      <View style={{
          position: 'absolute',
          bottom: -height * 0.20,
          right: -width * 0.55,
          width: width * 1.2,
          height: height * 0.30,
          borderRadius: width * 0.6,
          backgroundColor: theme.primary,
          transform: [{ rotate: '-30deg' }]
      }} />

    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});
