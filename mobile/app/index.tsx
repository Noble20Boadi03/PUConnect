import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../hooks';
import { Spacing, Typography } from '../constants';
import { Button } from '../components';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

const LOGO_SIZE_INITIAL = 120;
const LOGO_SIZE_FINAL = 40;

const ONBOARDING_DATA = [
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

export default function LandingPage() {
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // ... animation shared values
  const logoX = useSharedValue(width / 2 - LOGO_SIZE_INITIAL / 2);
  const logoY = useSharedValue(height / 2 - LOGO_SIZE_INITIAL / 2);
  const logoScale = useSharedValue(2.5);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animation after a short delay
    const startAnimation = async () => {
      // Wait for 2 seconds to show splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Hide native splash screen
      await SplashScreen.hideAsync();

      // Animate logo to header position
      const targetX = Spacing.lg;
      const targetY = insets.top + Spacing.md; // Align with header content

      logoX.value = withTiming(targetX, {
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      logoY.value = withTiming(targetY, {
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      logoScale.value = withTiming(1, {
        duration: 650,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, (finished) => {
        if (finished) {
          runOnJS(setIsAnimationComplete)(true);
          contentOpacity.value = withTiming(1, { duration: 400 });
        }
      });
    };

    startAnimation();
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: logoX.value },
        { translateY: logoY.value },
        { scale: logoScale.value },
      ],
      position: 'absolute',
      zIndex: 100,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      flex: 1,
    };
  });

  const currentData = ONBOARDING_DATA[currentIndex];
  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      // router.replace('/(auth)/login' as any);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <Animated.View style={animatedLogoStyle}>
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: LOGO_SIZE_FINAL, height: LOGO_SIZE_FINAL }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={animatedContentStyle}>
        <View style={styles.header}>
          <View style={{ width: LOGO_SIZE_FINAL }} />
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: Colors.border + '40' }]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={colorScheme === 'dark' ? 'sunny' : 'moon'} 
              size={22} 
              color={Colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.heroContainer}>
          <Image
            source={currentData.image}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={[styles.gradientOverlay, { backgroundColor: Colors.background + '20' }]} />
        </View>

        <View style={styles.contentContainer}>
          <View>
            <Text style={[styles.title, { color: Colors.text }]}>
              {`${currentData.title}\n`}
              <Text style={{ color: Colors.primary }}>{currentData.highlight}</Text>
            </Text>
            <Text style={[styles.subtitle, { color: Colors.icon }]}>
              {currentData.subtitle}
            </Text>
          </View>

          {isLastSlide && (
            <Button
              title="Let's Go"
              variant="primary"
              size="lg"
              style={styles.ctaButton}
              onPress={handleNext}
            />
          )}

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {currentIndex > 0 && (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={18} color={Colors.primary} />
                  <Text style={[styles.backText, { color: Colors.primary }]}>Back</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.pagination}>
              {ONBOARDING_DATA.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: i === currentIndex ? Colors.primary : Colors.border }
                  ]} 
                />
              ))}
            </View>

            <View style={styles.footerRight}>
              {!isLastSlide && (
                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                  <Text style={[styles.nextText, { color: Colors.primary }]}>Next</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    width: '100%',
    height: '45%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.size.title,
    fontWeight: Typography.weight.bold as any,
    lineHeight: 40,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.size.md,
    lineHeight: 24,
    fontWeight: Typography.weight.regular as any,
  },
  ctaButton: {
    marginTop: Spacing.xl,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    height: 40,
  },
  footerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold as any,
    marginLeft: 4,
  },
  nextText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold as any,
    marginRight: 4,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
