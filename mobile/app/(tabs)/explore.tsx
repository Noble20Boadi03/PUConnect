import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';

export default function ExploreScreen() {
  return (
    <ScreenLayout scrollable padding="medium">
      <ThemedView style={styles.headerContainer}>
        <IconSymbol
          size={160}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerIcon}
        />
        <ThemedText
          variant="headlineMedium"
          style={styles.title}
        >
          Explore
        </ThemedText>
      </ThemedView>

      <View style={styles.content}>
        <ThemedText style={styles.introText}>
          This app includes example code to help you get started with building your campus talent marketplace.
        </ThemedText>

        <Collapsible title="File-based routing">
          <ThemedText>
            This app has two screens:{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>app/(tabs)/index.tsx</ThemedText> and{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>app/(tabs)/explore.tsx</ThemedText>
          </ThemedText>
          <ThemedText>
            The layout file in <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>app/(tabs)/_layout.tsx</ThemedText>{' '}
            sets up the tab navigator.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/router/introduction">
            <ThemedText variant="bodyLarge" colorName="primary">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>

        <Collapsible title="Android, iOS, and web support">
          <ThemedText>
            You can open this project on Android, iOS, and the web. To open the web version, press{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>w</ThemedText> in the terminal running this project.
          </ThemedText>
        </Collapsible>

        <Collapsible title="Images">
          <ThemedText>
            For static images, you can use the <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>@2x</ThemedText> and{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>@3x</ThemedText> suffixes to provide files for
            different screen densities
          </ThemedText>
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={styles.reactLogo}
          />
          <ExternalLink href="https://reactnative.dev/docs/images">
            <ThemedText variant="bodyLarge" colorName="primary">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>

        <Collapsible title="Light and dark mode support">
          <ThemedText>
            This template has light and dark mode support. The{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>useColorScheme()</ThemedText> hook lets you inspect
            what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
          </ThemedText>
          <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
            <ThemedText variant="bodyLarge" colorName="primary">Learn more</ThemedText>
          </ExternalLink>
        </Collapsible>

        <Collapsible title="Animations">
          <ThemedText>
            This template includes an example of an animated component. The{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>components/HelloWave.tsx</ThemedText> component uses
            the powerful{' '}
            <ThemedText variant="bodyLarge" style={{ fontWeight: '600', fontFamily: Fonts.mono }}>
              react-native-reanimated
            </ThemedText>{' '}
            library to create a waving hand animation.
          </ThemedText>
          {Platform.select({
            ios: (
              <ThemedText>
                The <ThemedText variant="bodyLarge" style={{ fontWeight: '600' }}>components/ParallaxScrollView.tsx</ThemedText>{' '}
                component provides a parallax effect for the header image.
              </ThemedText>
            ),
          })}
        </Collapsible>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.md,
  },
  headerIcon: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.sans,
    fontWeight: '800',
  },
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  introText: {
    marginBottom: Spacing.md,
  },
  reactLogo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: Spacing.md,
  },
});
