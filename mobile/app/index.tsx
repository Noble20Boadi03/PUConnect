import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedIcon } from "@/components/ui/themed-icon";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ScreenLayout } from "@/components/ui/screen-layout";
import { useResponsive } from "@/hooks/use-responsive";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";


const AnimatedThemedText = Animated.createAnimatedComponent(ThemedText);

const slides = [
  {
    id: 'welcome',
    title: 'Welcome to PuConnect!',
    subtitle: 'The campus marketplace to collaborate, earn, and build together.',
    image: require('../assets/images/carousel_1.jpg')
  },
  {
    id: 'seek',
    title: 'Find the Help You Need',
    subtitle: 'Easily browse and request services from talented peers around campus.',
    image: require('../assets/images/carousel_2.jpg')
  },
  {
    id: 'offer',
    title: 'Offer Your Skills',
    subtitle: 'Upgrade your account to provide services, build your portfolio, and earn.',
    image: require('../assets/images/carousel_3.jpg')
  },
  {
    id: 'start',
    title: 'Ready?',
    subtitle: 'Join the community and start connecting today.',
    image: require('../assets/images/carousel_4.jpg')
  }
];

export default function LandingScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const { width, height, contentPaddingLeft, contentPaddingRight } = useResponsive();
  const horizontalPadding = { paddingLeft: contentPaddingLeft, paddingRight: contentPaddingRight };
  const { theme, isDark, setMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex && roundIndex >= 0 && roundIndex < slides.length) {
      setActiveIndex(roundIndex);
    }
  };

  const scrollNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    }
  };

  const scrollBack = () => {
    if (activeIndex > 0) {
      scrollRef.current?.scrollTo({ x: (activeIndex - 1) * width, animated: true });
    }
  };

  const isNavigating = useRef(false);

  const handleGetStarted = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push({ pathname: "/login" });
    setTimeout(() => {
        isNavigating.current = false;
    }, 500);
  };

  if (showSplash) {
    return (
      <Animated.View exiting={FadeOut.duration(500)} style={[styles.splashContainer, { backgroundColor: '#e8f0fb' }]}>
        <Animated.Image
          entering={FadeIn.duration(800)}
          source={require("../assets/images/puconnect_logo.png")}
          style={[
            styles.splashLogo, 
            { width: width * 0.6 }
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  return (
    <ScreenLayout padding="none">
      {/* Header */}
      <View style={[styles.header, horizontalPadding]}>
        <Image
          source={require("../assets/images/puconnect_logo.png")}
          style={[styles.headerLogo, isDark && { tintColor: '#ffffff' }]}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="PuConnect logo"
        />
        <View style={styles.headerActions}>
          <Pressable 
            onPress={() => setMode(isDark ? 'light' : 'dark')}
            style={[styles.iconButton, { backgroundColor: theme.surfaceVariant }]}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            <ThemedIcon 
              name={isDark ? "white-balance-sunny" : "moon-waning-crescent"} 
              size={20} 
              colorName="textSecondary" 
            />
          </Pressable>
        </View>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={[styles.carouselContainer, { marginTop: height * 0.05 }]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <Animated.View 
              entering={FadeInDown.delay(200).duration(800)}
              style={styles.illustrationContainer}
            >
              <Image
                source={slide.image}
                style={[styles.illustration, { width: width, height: height * 0.45, borderRadius: BorderRadius.lg }]}
                resizeMode="cover"
                accessible={true}
                accessibilityLabel={`Illustration for ${slide.title}`}
              />
              <LinearGradient
                colors={[theme.background, 'transparent']}
                style={styles.topGradient}
              />
              <LinearGradient
                colors={['transparent', theme.background]}
                style={styles.bottomGradient}
              />
            </Animated.View>

            <View style={[styles.content, horizontalPadding]}>
              <AnimatedThemedText 
                entering={FadeInDown.delay(400).duration(800)}
                variant="headlineLarge"
                align="center"
                style={styles.title}
              >
                {slide.title}
              </AnimatedThemedText>
              <AnimatedThemedText 
                entering={FadeInDown.delay(500).duration(800)}
                variant="bodyLarge"
                colorName="textSecondary"
                align="center"
                style={styles.subtitle}
              >
                {slide.subtitle}
              </AnimatedThemedText>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, horizontalPadding]}>
        {/* Navigation row with buttons and indicators */}
        <View style={styles.navigationRow}>
          {activeIndex > 0 ? (
            <Pressable 
              onPress={scrollBack} 
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Previous slide"
            >
              <ThemedIcon name="chevron-left" size={20} colorName="primary" />
              <ThemedText variant="labelLarge" colorName="primary">Back</ThemedText>
            </Pressable>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}

          {/* Carousel indicators */}
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => (
              <Pressable 
                key={index} 
                onPress={() => {
                  scrollRef.current?.scrollTo({ x: index * width, animated: true });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${index + 1}`}
                accessibilityState={{ selected: activeIndex === index }}
              >
                <View 
                  style={[
                    styles.dot, 
                    { backgroundColor: activeIndex === index ? theme.primary : theme.outlineVariant }
                  ]} 
                />
              </Pressable>
            ))}
          </View>

          {activeIndex < slides.length - 1 ? (
            <Pressable 
              onPress={scrollNext} 
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel="Next slide"
            >
              <ThemedText variant="labelLarge" colorName="primary">Next</ThemedText>
              <ThemedIcon name="chevron-right" size={20} colorName="primary" />
            </Pressable>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}
        </View>

        <View style={styles.buttonContainer}>
          {activeIndex === slides.length - 1 ? (
             <Animated.View entering={FadeInDown.duration(400)}>
               <PrimaryButton
                 title="Let's Go"
                 onPress={handleGetStarted}
                 size="large"
               />
             </Animated.View>
          ) : (
             <View style={{ height: 56 }} />
          )}
        </View>
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
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  iconButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  carouselContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  illustrationContainer: {
    width: "100%",
    marginBottom: Spacing.md,
    overflow: "hidden",
    position: "relative",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 1,
  },
  illustration: {
    // width/height set dynamically
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: Spacing.xl,
  },
  title: {
    fontWeight: "800",
    marginBottom: Spacing.md,
  },
  subtitle: {
    lineHeight: 22,
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 64,
  },
  navButtonPlaceholder: {
    minWidth: 64,
  },
  indicatorContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingBottom: Spacing.md,
    marginTop: "auto",
  },
  buttonContainer: {
    minHeight: 56,
  },
});
