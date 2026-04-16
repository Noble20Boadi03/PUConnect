import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';


export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
export type IconSize = 'small' | 'medium' | 'large' | number;

export interface ThemedIconProps {
  name: IconName;
  size?: IconSize;
  colorName?: keyof typeof Colors.light;
  lightColor?: string;
  darkColor?: string;
  style?: any;
}

const SIZE_MAP = {
  small: 18,
  medium: 24,
  large: 32,
};

export function ThemedIcon({
  name,
  size = 'medium',
  colorName = 'icon',
  lightColor,
  darkColor,
  style,
}: ThemedIconProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  
  const iconSize = typeof size === 'string' ? SIZE_MAP[size] : size;

  return (
    <MaterialCommunityIcons
      name={name}
      size={iconSize}
      color={color}
      style={style}
    />
  );
}
