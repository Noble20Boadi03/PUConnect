import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks';
import { Spacing, Typography } from '../../constants';

export default function ExploreScreen() {
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const screenBg = colorScheme === 'dark' ? '#09090B' : '#F4F4F5';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Explore</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="compass-outline" size={48} color={Colors.icon + '50'} />
        <Text style={[styles.emptyText, { color: Colors.icon }]}>Discover campus services</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
  },
});
