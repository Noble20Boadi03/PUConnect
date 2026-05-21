import React, { useEffect, useState } from 'react';
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
  Easing,
  runOnJS,
  withSpring,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LOGO_SIZE_INITIAL = 120;
const LOGO_SIZE_FINAL = 40;

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
    highlight: "Skills",
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
  
  const [currentIndex, setCurrentIndex] = useState(slide === 'last' ? ONBOARDING_DATA.length - 1 : 0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(skipSplash === 'true');

  // Animation shared values
  const logoX = useSharedValue(skipSplash === 'true' ? Spacing.lg : width / 2 - 22);
  const logoY = useSharedValue(skipSplash === 'true' ? insets.top + Spacing.md : height / 2 - 22);
  const logoScale = useSharedValue(skipSplash === 'true' ? 1 : 2.5);
  const contentOpacity = useSharedValue(skipSplash === 'true' ? 1 : 0);

  useEffect(() => {
    const startAnimation = async () => {
      // Hide native splash screen immediately to reveal our custom solid-color splash
      await SplashScreen.hideAsync();

      if (skipSplash === 'true') {
        return;
      }

      // Hold the logo in the perfect center for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      const targetX = Spacing.lg;
      const targetY = insets.top + Spacing.md; 

      logoX.value = withTiming(targetX, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      logoY.value = withTiming(targetY, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      logoScale.value = withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, (finished) => {
        if (finished) {
          runOnJS(setIsAnimationComplete)(true);
        }
      });

      // Fade in the images and content while the logo is moving
      contentOpacity.value = withTiming(1, { duration: 800 });
    };

    startAnimation();
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      top: 0,
      left: 0,
      transform: [
        { translateX: logoX.value },
        { translateY: logoY.value },
        { scale: logoScale.value },
      ],
      position: 'absolute',
      zIndex: 100,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.background + 'E6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
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

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastSlide) {
      router.push('/(auth)/login' as any);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Appearance.setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

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

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={animatedLogoStyle}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={animatedContentStyle}>
          <View style={styles.header}>
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
    height: height * 0.55,
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

