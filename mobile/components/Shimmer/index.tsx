import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '../../hooks';

interface ShimmerProps {
  style?: ViewStyle;
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const Shimmer: React.FC<ShimmerProps> = ({
  style,
  width,
  height,
  borderRadius = 8,
}) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: `${-100 + progress.value * 200}%`,
        },
      ],
    };
  });

  const Colors = useThemeColor();

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: Colors.background,
        },
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Colors.card,
          },
        ]}
      />
      <AnimatedLinearGradient
        colors={[
          Colors.card,
          Colors.shimmer,
          Colors.card,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, animatedStyle, { width: '200%' }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Shimmer;
