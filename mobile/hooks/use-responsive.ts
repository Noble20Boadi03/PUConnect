import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenType = 'phone' | 'tablet' | 'desktop';

/**
 * The orientation-aware layout mode.
 * - 'single': Phone portrait – one-column, full-width layout.
 * - 'side-by-side': Landscape phone or small tablet – wider content, possible split views.
 * - 'multi-column': Tablet/desktop – multi-column, max-width constrained layout.
 */
export type LayoutMode = 'single' | 'side-by-side' | 'multi-column';

export interface ResponsiveConfig {
  // Screen dimensions (reactive to rotation)
  width: number;
  height: number;

  // Device class
  screenType: ScreenType;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Orientation
  isLandscape: boolean;

  // Layout helpers
  layoutMode: LayoutMode;

  /**
   * Number of columns appropriate for the current layout mode.
   */
  columns: number;

  /**
   * Horizontal content padding that accounts for both the device size
   * AND landscape safe-area cutouts. Now provides separate values for 
   * asymmetrical safe area support.
   */
  contentPaddingLeft: number;
  contentPaddingRight: number;

  /**
   * For cases where symmetric padding is preferred.
   */
  contentPaddingHorizontal: number;

  /**
   * Multiplier for scaling spacing tokens (Spacing.*) on larger screens.
   */
  spacingMultiplier: number;

  /**
   * Maximum width the main content column should occupy.
   */
  contentMaxWidth: number;
}

const BREAKPOINTS = {
  phone: 600,
  tablet: 840,
  desktop: 1200,
};

const BASE_PADDING = {
  phone: 16,
  tablet: 24,
  desktop: 32,
};

export function useResponsive(): ResponsiveConfig {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLandscape = width > height;


  const shortestAxis = Math.min(width, height);

  let screenType: ScreenType = 'phone';
  if (shortestAxis >= BREAKPOINTS.tablet) {
    screenType = 'desktop';
  } else if (shortestAxis >= BREAKPOINTS.phone) {
    screenType = 'tablet';
  }

  const isPhone = screenType === 'phone';
  const isTablet = screenType === 'tablet';
  const isDesktop = screenType === 'desktop';

  let layoutMode: LayoutMode = 'single';
  if (isDesktop) {
    layoutMode = 'multi-column';
  } else if (isTablet || (isPhone && isLandscape)) {
    layoutMode = 'side-by-side';
  }

  const columns =
    layoutMode === 'multi-column' ? 3 :
    layoutMode === 'side-by-side' ? 2 :
    1;

  const spacingMultiplier = isPhone ? 1 : isTablet ? 1.5 : 2;

  const basePaddingH = isDesktop
    ? BASE_PADDING.desktop
    : isTablet
    ? BASE_PADDING.tablet
    : BASE_PADDING.phone;

  // Provide precise padding for each side
  const contentPaddingLeft = basePaddingH + insets.left;
  const contentPaddingRight = basePaddingH + insets.right;

  // Symmetric version for legacy/centered components
  const contentPaddingHorizontal = basePaddingH + Math.max(insets.left, insets.right);

  const contentMaxWidth =
    layoutMode === 'multi-column' ? 1200 :
    layoutMode === 'side-by-side' ? 840 :
    width;

  return {
    width,
    height,
    screenType,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape,

    layoutMode,
    columns,
    spacingMultiplier,
    contentPaddingLeft,
    contentPaddingRight,
    contentPaddingHorizontal,
    contentMaxWidth,
  };
}
