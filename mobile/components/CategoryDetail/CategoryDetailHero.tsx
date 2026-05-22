import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { MarketIconName } from '../../types';

export interface CategoryDetailHeroProps {
  iconName: MarketIconName;
  accentColor: string;
}

export const CategoryDetailHero: React.FC<CategoryDetailHeroProps> = ({
  iconName,
  accentColor,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 700, easing: Easing.out(Easing.cubic) }),
        withTiming(0.88, { duration: 700, easing: Easing.in(Easing.cubic) })
      ),
      -1,
      false
    );
    rotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 800, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 800 }),
        withTiming(0.25, { duration: 800 })
      ),
      -1,
      false
    );
  }, [scale, rotation, glowScale, glowOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.glowRing,
          { backgroundColor: accentColor + '44' },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.iconCircle,
          { backgroundColor: accentColor },
          iconStyle,
        ]}
      >
        <Ionicons name={iconName} size={32} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 22,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default CategoryDetailHero;
