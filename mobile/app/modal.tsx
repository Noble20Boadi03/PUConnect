import React from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Spacing } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <ScreenLayout scrollable={false} padding="medium">
      <ThemedText variant="headlineMedium">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText variant="bodyLarge" colorName="primary">Go to home screen</ThemedText>
      </Link>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
  },
});
