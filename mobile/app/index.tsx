import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Image,
} from "react-native";
import { router } from "expo-router";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { useResponsive } from "@/hooks/use-responsive";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);
const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

export default function LandingScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const { width, height, isTablet, spacingMultiplier } = useResponsive();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.replace("/login");
  };

  if (showSplash) {
    return (
      <AnimatedThemedView exiting={FadeOut.duration(500)} style={styles.splashContainer}>
        <Animated.Image
          entering={FadeIn.duration(800)}
          source={require("../assets/images/puconnect_logo.png")}
          style={[styles.splashLogo, { width: width * 0.6 }]}
          resizeMode="contain"
        />
      </AnimatedThemedView>
    );
  }

  return (
    <ScreenLayout padding="none">
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: Spacing.xl * spacingMultiplier }]}>
        <Image
          source={require("../assets/images/puconnect_logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Pressable style={[styles.languageButton, { backgroundColor: theme.surfaceVariant }]}>
          <ThemedIcon name="translate" size={16} colorName="textSecondary" />
          <ThemedText variant="labelMedium" colorName="textSecondary">English</ThemedText>
        </Pressable>
      </View>

      {/* Illustration */}
      <Animated.View 
        entering={FadeInDown.delay(200).duration(800)}
        style={styles.illustrationContainer}
      >
        <Image
          source={require("../assets/images/puconnect_illustration.png")}
          style={[styles.illustration, { width: width * (isTablet ? 0.6 : 0.85), height: height * 0.35 }]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Content */}
      <View style={[styles.content, { paddingHorizontal: Spacing.xl * spacingMultiplier }]}>
        <AnimatedThemedText 
          entering={FadeInDown.delay(400).duration(800)}
          variant="headlineLarge"
          align="center"
          style={styles.title}
        >
          Welcome to PuConnect!
        </AnimatedThemedText>
        <AnimatedThemedText 
          entering={FadeInDown.delay(500).duration(800)}
          variant="bodyLarge"
          colorName="textSecondary"
          align="center"
          style={styles.subtitle}
        >
          The campus marketplace for university students to collaborate, earn, and build together.
        </AnimatedThemedText>

        {/* Carousel indicators */}
        <View style={styles.carouselContainer}>
          <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.outlineVariant }]} />
          <View style={[styles.dot, { backgroundColor: theme.outlineVariant }]} />
          <View style={[styles.dot, { backgroundColor: theme.outlineVariant }]} />
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingHorizontal: Spacing.xl * spacingMultiplier }]}>
        <PrimaryButton
          title="Access Your Account"
          onPress={handleGetStarted}
          size="large"
          delay={700}
        />
        
        <Animated.View 
          entering={FadeInDown.delay(900).duration(800)}
          style={styles.footerLinks}
        >
          <ThemedText variant="bodyMedium" colorName="textSecondary">Don't have an account? </ThemedText>
          <Pressable onPress={() => router.replace("/register")}>
            <ThemedText variant="labelLarge" colorName="primary">Signup</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    height: 100,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    height: 60,
  },
  headerLogo: {
    width: 100,
    height: 30,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  illustration: {
    // width/height set dynamically
  },
  content: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  title: {
    fontWeight: "800",
    marginBottom: Spacing.md,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  carouselContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingBottom: Spacing.xl,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
});
