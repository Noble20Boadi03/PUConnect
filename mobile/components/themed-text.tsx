import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography, Colors } from '@/constants/theme';

export type TypographyVariant = 
  | 'displayLarge' | 'displayMedium' | 'displaySmall'
  | 'headlineLarge' | 'headlineMedium' | 'headlineSmall'
  | 'titleLarge' | 'titleMedium' | 'titleSmall'
  | 'bodyLarge' | 'bodyMedium' | 'bodySmall'
  | 'labelLarge' | 'labelMedium' | 'labelSmall';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TypographyVariant;
  colorName?: keyof typeof Colors.light;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'bodyLarge',
  colorName = 'text',
  align = 'auto',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return (
    <Text
      style={[
        { color, textAlign: align },
        getTypographyStyle(variant) as any,
        style,
      ]}
      {...rest}
    />
  );
}

function getTypographyStyle(variant: TypographyVariant) {
  switch (variant) {
    case 'displayLarge': return Typography.display.large;
    case 'displayMedium': return Typography.display.medium;
    case 'displaySmall': return Typography.display.small;
    case 'headlineLarge': return Typography.headline.large;
    case 'headlineMedium': return Typography.headline.medium;
    case 'headlineSmall': return Typography.headline.small;
    case 'titleLarge': return Typography.title.large;
    case 'titleMedium': return Typography.title.medium;
    case 'titleSmall': return Typography.title.small;
    case 'bodyLarge': return Typography.body.large;
    case 'bodyMedium': return Typography.body.medium;
    case 'bodySmall': return Typography.body.small;
    case 'labelLarge': return Typography.label.large;
    case 'labelMedium': return Typography.label.medium;
    case 'labelSmall': return Typography.label.small;
    default: return Typography.body.large;
  }
}
