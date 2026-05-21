import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text, useColorScheme, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Typography, CARD_BORDER } from '../../constants';

const PROMO_IMAGE = require('../../assets/images/promo-banner.png');
const BANNER_HEIGHT = Math.min(200, Dimensions.get('window').width * 0.48);

export interface MarketPromoBannerProps {
  title: string;
  subtitle: string;
  primaryColor: string;
}

const MarketPromoBannerComponent: React.FC<MarketPromoBannerProps> = ({
  title,
  subtitle,
  primaryColor,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const gradientColors = useMemo(
    () =>
      isDark
        ? (['rgba(9, 9, 11, 0.15)', 'rgba(9, 9, 11, 0.88)'] as const)
        : (['rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.72)'] as const),
    [isDark]
  );

  return (
    <View style={styles.outer}>
      <View style={styles.banner}>
        <Image
          source={PROMO_IMAGE}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey="market-promo"
        />
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.35, y: 1 }}
        />
        <View style={styles.textBlock}>
          <View style={[styles.accentPill, { backgroundColor: primaryColor }]}>
            <Text style={[styles.pillText, { color: isDark ? '#09090B' : '#FFFFFF' }]}>
              PuConnect
            </Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: 18,
    marginBottom: Spacing.lg,
    ...CARD_BORDER,
  },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  textBlock: {
    padding: Spacing.md,
    paddingRight: Spacing.lg,
    maxWidth: '88%',
  },
  accentPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  pillText: {
    fontSize: Typography.size.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 20,
  },
});

export const MarketPromoBanner = memo(MarketPromoBannerComponent);

export default MarketPromoBanner;
