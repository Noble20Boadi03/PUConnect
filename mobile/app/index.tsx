import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, useColorScheme, Dimensions, Appearance, ImageSourcePropType } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppRouter, useThemeColor } from '../hooks';
import { Spacing, Typography } from '../constants';
import { Button } from '../components';
import { LandingPageSearchParams } from '../types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  withSpring,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, useProfileStore, useMarketStore, useExploreStore } from '../store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  highlight: string;
  subtitle: string;
  image: ImageSourcePropType;
}

const ONBOARDING_DATA: OnboardingSlide[] = [
  {
    id: 1,
    title: "Welcome to",
    highlight: "PuConnect!",
    subtitle: "The campus marketplace to collaborate, earn, and build together.",
    image: require('../assets/images/welcome-hero.jpg'),
  },
  {
    id: 2,
    title: "Find the Help",
    highlight: "You Need",
    subtitle: "Easily browse and request services from talented peers around campus.",
    image: require('../assets/images/onboarding-2.jpg'),
  },
  {
    id: 3,
    title: "Offer Your",
    highlight: "Services",
    subtitle: "Upgrade your account to provide services, build your portfolio, and earn.",
    image: require('../assets/images/onboarding-3.jpg'),
  },
  {
    id: 4,
    title: "Ready?",
    highlight: "",
    subtitle: "Join the community and start connecting today.",
    image: require('../assets/images/onboarding-4.jpg'),
  },
];

interface PaginationDotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

const PaginationDot = ({ isActive, activeColor, inactiveColor }: PaginationDotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 28 : 8, { damping: 15, stiffness: 150 }),
      backgroundColor: withTiming(isActive ? activeColor : inactiveColor, { duration: 250 }),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export default function LandingPage() {
  const router = useAppRouter();
  const { slide, skipSplash } = useLocalSearchParams() as unknown as LandingPageSearchParams;
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading, hasCompletedOnboarding, user } = useAuthStore();
  const { hydrated: profileHydrated } = useProfileStore();
  const { isLoading: marketLoading } = useMarketStore();
  const { isLoading: exploreLoading } = useExploreStore();

  const [currentIndex, setCurrentIndex] = useState(slide === 'last' ? ONBOARDING_DATA.length - 1 : 0);
  const safeAreaRef = useRef<View>(null);
  const safeAreaY = useSharedValue(0);

  // Animation shared values
  const initialLogoSize = 88;
  const targetLogoSize = 44;

  const logoScale = useSharedValue(skipSplash === 'true' ? 0.5 : 1);
  const logoX = useSharedValue(0);
  const logoY = useSharedValue(0);
  const logoOpacity = useSharedValue(1);
  const headerCenterY = useSharedValue(0);
  const screenOpacity = useSharedValue(skipSplash === 'true' ? 0 : 1);
  const contentOpacity = useSharedValue(skipSplash === 'true' ? 1 : 0);

  // All hooks must be called before early return!
  const animatedLogoStyle = useAnimatedStyle(() => {
    // Initial centered position
    const initialCenterX = screenWidth / 2;
    const initialCenterY = screenHeight / 2;
    
    // Current center position
    const currentCenterX = initialCenterX + logoX.value;
    const currentCenterY = initialCenterY + logoY.value;
    
    // Current top-left position
    const currentLeft = currentCenterX - (initialLogoSize * logoScale.value) / 2;
    const currentTop = currentCenterY - (initialLogoSize * logoScale.value) / 2;
    
    return {
      left: currentLeft,
      top: currentTop,
      transform: [
        { scale: logoScale.value },
      ],
      opacity: logoOpacity.value,
      position: 'absolute',
      zIndex: 100,
      width: initialLogoSize,
      height: initialLogoSize,
      borderRadius: initialLogoSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    };
  });

  const animatedScreenStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      flex: 1,
    };
  });

  const animatedImageWrapperStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const currentData = ONBOARDING_DATA[currentIndex];
  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  useEffect(() => {
    const startAnimation = async () => {
      if (skipSplash === 'true') {
        return;
      }

      if (isAuthenticated && hasCompletedOnboarding) {
        // Wait for data to load
        while (isLoading || profileHydrated === false || marketLoading || exploreLoading) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Fade out the entire screen
        screenOpacity.value = withTiming(0, {
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // After fade completes, navigate to appropriate module based on role
        await new Promise(resolve => setTimeout(resolve, 500));
        const redirectPath = user?.role === 'admin' ? '/(admin)/dashboard' : '/(tabs)/market';
        router.replace(redirectPath as any);
      } else {
        // Unauthenticated onboarding animation sequence
        // 0ms → App opens, logo centered, content invisible
        // 200ms → Brief pause (logo visible centered)
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 200ms → Logo starts animating to top-left (600ms duration)
        // Calculate target positions
        // Target logo center at:
        // X: left edge + Spacing.lg + (targetLogoSize / 2)
        // Y: same vertical center as theme switch (headerCenterY)
        const targetLogoCenterX = Spacing.lg + (targetLogoSize / 2);
        const targetLogoCenterY = headerCenterY.value;
        
        // Initial logo center is at screen center
        const initialCenterX = screenWidth / 2;
        const initialCenterY = screenHeight / 2;
        
        // Delta X and Y are target minus initial
        const targetX = targetLogoCenterX - initialCenterX;
        const targetY = targetLogoCenterY - initialCenterY;
        
        logoX.value = withTiming(targetX, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        });
        logoY.value = withTiming(targetY, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        });
        logoScale.value = withTiming(0.5, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        });
        
        // 800ms → Onboarding content starts fading in (400ms duration)
        contentOpacity.value = withDelay(
          500,
          withTiming(1, { duration: 400 })
        );
      }
    };

    if (!isLoading) {
      startAnimation();
    }
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, skipSplash, insets, router, profileHydrated, marketLoading, exploreLoading, headerCenterY, initialLogoSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render nothing while loading
  if (isLoading) {
    return null;
  }

  const handleNext = () => {
    
    if (isLastSlide) {
      router.push('/(auth)/login' as any);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleTheme = () => {
    
    Appearance.setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  if (isAuthenticated && hasCompletedOnboarding) {
    // Simple screen for authenticated users with just the centered logo that fades out
    return (
      <Animated.View style={[styles.container, { backgroundColor: Colors.background }, animatedScreenStyle]}>
        <Animated.View style={animatedLogoStyle}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    );
  }

  // Original onboarding screen for non-authenticated users
  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Immersive Top Background Images with Crossfade */}
      <Animated.View style={[styles.imageWrapper, animatedImageWrapperStyle]}>
        {ONBOARDING_DATA.map((data, index) => {
          const isActive = index === currentIndex;
          return isActive ? (
            <Animated.Image
              key={data.id}
              source={data.image}
              style={styles.heroImage}
              resizeMode="cover"
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
            />
          ) : null;
        })}
        {/* Top Gradient for header visibility */}
        <LinearGradient
          colors={[Colors.background + 'CC', 'transparent']}
          locations={[0, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 1 }}
        />
        {/* Modern Deep Gradient Overlay blending into background */}
        <LinearGradient
          colors={['transparent', Colors.background]}
          locations={[0.4, 1]}
          style={[StyleSheet.absoluteFillObject, { zIndex: 2 }]}
        />
      </Animated.View>

      <Animated.View style={animatedLogoStyle}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: 64, height: 64 }}
          resizeMode="contain"
        />
      </Animated.View>

      <SafeAreaView 
        style={styles.safeArea}
        ref={safeAreaRef}
        onLayout={(e) => {
          safeAreaY.value = e.nativeEvent.layout.y;
        }}
      >
        <Animated.View style={animatedContentStyle}>
          <View 
            style={styles.header}
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              headerCenterY.value = safeAreaY.value + y + height / 2;
            }}
          >
            <View style={{ width: 44 }} />
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: Colors.background + 'E6' }]}
              activeOpacity={0.7}
              onPress={toggleTheme}
            >
              <Ionicons
                name={colorScheme === 'dark' ? 'sunny' : 'moon'}
                size={20}
                color={Colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.contentWrapper}>
            {/* Animated Content Area */}
            <View style={styles.textContainer}>
              <Animated.View
                key={`title-${currentIndex}`}
                entering={FadeIn.delay(100).duration(400).springify()}
              >
                <Text style={[styles.title, { color: Colors.text }]}>
                  {currentData.title}
                  {currentData.highlight ? (
                    <Text style={{ color: Colors.primary }}>{`\n${currentData.highlight}`}</Text>
                  ) : null}
                </Text>
              </Animated.View>

              <Animated.View
                key={`subtitle-${currentIndex}`}
                entering={FadeIn.delay(200).duration(400).springify()}
              >
                <Text style={[styles.subtitle, { color: Colors.icon }]}>
                  {currentData.subtitle}
                </Text>
              </Animated.View>
            </View>

            {isLastSlide && (
              <Animated.View entering={FadeIn.delay(300).duration(400)}>
                <Button
                  title="Let's Go"
                  variant="primary"
                  size="lg"
                  style={styles.ctaButton}
                  onPress={handleNext}
                />
              </Animated.View>
            )}

            <View style={styles.footer}>
              <View style={styles.footerAction}>
                {currentIndex > 0 && (
                  <TouchableOpacity onPress={handleBack} style={styles.actionButton}>
                    <Ionicons name="chevron-back" size={20} color={Colors.text} />
                    <Text style={[styles.actionText, { color: Colors.text }]}>Back</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.pagination}>
                {ONBOARDING_DATA.map((_, i) => (
                  <PaginationDot
                    key={i}
                    isActive={i === currentIndex}
                    activeColor={Colors.primary}
                    inactiveColor={Colors.border}
                  />
                ))}
              </View>

              <View style={[styles.footerAction, { alignItems: 'flex-end' }]}>
                {!isLastSlide && (
                  <TouchableOpacity onPress={handleNext} style={styles.actionButton}>
                    <Text style={[styles.actionText, { color: Colors.primary }]}>Next</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.55,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
    height: 80,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xxl,
  },
  textContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.size.title,
    fontWeight: '800',
    lineHeight: 42,
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.lg,
    lineHeight: 28,
    fontWeight: '400',
    opacity: 0.9,
  },
  ctaButton: {
    marginBottom: Spacing.lg,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  footerAction: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.size.md,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
