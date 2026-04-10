import { useWindowDimensions } from 'react-native';

export type ScreenType = 'phone' | 'tablet' | 'desktop';

export interface ResponsiveConfig {
  screenType: ScreenType;
  isLandscape: boolean;
  width: number;
  height: number;
  isTablet: boolean;
  isPhone: boolean;
  isDesktop: boolean;
  spacingMultiplier: number;
}

/**
 * Breakpoints following Material Design guidelines
 */
const BREAKPOINTS = {
  phone: 600,
  tablet: 840,
};

export function useResponsive(): ResponsiveConfig {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  
  let screenType: ScreenType = 'phone';
  if (width >= BREAKPOINTS.tablet) {
    screenType = 'desktop';
  } else if (width >= BREAKPOINTS.phone) {
    screenType = 'tablet';
  }

  const isPhone = screenType === 'phone';
  const isTablet = screenType === 'tablet';
  const isDesktop = screenType === 'desktop';

  // Spacing multiplier for larger screens
  const spacingMultiplier = isPhone ? 1 : isTablet ? 1.5 : 2;

  return {
    screenType,
    isLandscape,
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    spacingMultiplier,
  };
}
