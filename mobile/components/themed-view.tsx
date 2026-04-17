import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors, Shadows } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: keyof typeof Colors.light;
  elevation?: 0 | 1 | 2 | 3;
  glass?: boolean;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  colorName = 'background',
  elevation = 0,
  glass = false,
  ...otherProps 
}: ThemedViewProps) {
  const themedBgColor = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  const glassColor = useThemeColor({}, 'glass');
  const glassBorderColor = useThemeColor({}, 'glassBorder');

  const backgroundColor = glass ? glassColor : themedBgColor;

  return (
    <View 
      style={[
        { backgroundColor }, 
        glass && {
          borderWidth: 1,
          borderColor: glassBorderColor,
        },
        elevation > 0 ? getShadowStyle(elevation as 1 | 2 | 3) : undefined,
        style
      ]} 
      {...otherProps} 
    />
  );
}

function getShadowStyle(elevation: 1 | 2 | 3) {
  switch (elevation) {
    case 1: return Shadows.level1;
    case 2: return Shadows.level2;
    case 3: return Shadows.level3;
    default: return undefined;
  }
}
