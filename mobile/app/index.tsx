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

export default function LandingPage() {
  const router = useRouter();
  const Colors = useThemeColor();
  const colorScheme = useColorScheme();
  
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const insets = useSafeAreaInsets();

  // Animation shared values
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
            source={require('../assets/images/welcome-hero.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={[styles.gradientOverlay, { backgroundColor: Colors.background + '20' }]} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: Colors.text }]}>
            {"Welcome to\n"}
            <Text style={{ color: Colors.primary }}>PuConnect!</Text>
          </Text>
          <Text style={[styles.subtitle, { color: Colors.icon }]}>
            The campus marketplace to collaborate, earn, and build together.
          </Text>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {[1, 2, 3, 4].map((i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: i === 1 ? Colors.primary : Colors.border }
                  ]} 
                />
              ))}
            </View>

            <Button
              title="Next"
              variant="ghost"
              rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.primary} />}
              onPress={() => {
                // Navigation logic
              }}
            />
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
    height: 80, // Explicit height to match animation target
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
