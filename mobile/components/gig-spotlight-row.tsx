import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedIcon } from './ui/themed-icon';
import { ListingCard } from './listing-card';
import { useTheme } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';
import { Listing } from '@/types';
import { router } from 'expo-router';

interface GigSpotlightRowProps {
  gigs: Listing[];
  cardWidth: number;
  horizontalPadding: { paddingLeft: number; paddingRight: number };
}

export function GigSpotlightRow({ gigs, cardWidth, horizontalPadding }: GigSpotlightRowProps) {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollAmount = cardWidth + Spacing.md;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    setShowLeftArrow(contentOffset.x > 10);
    setShowRightArrow(contentOffset.x < contentSize.width - layoutMeasurement.width - 10);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollTo({ x: scrollAmount * 2, animated: true });
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginHorizontal: -horizontalPadding.paddingLeft,
          paddingHorizontal: horizontalPadding.paddingLeft,
          borderColor: theme.outlineVariant,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.label}>
          <ThemedIcon name="lightning-bolt" size={18} colorName="tertiary" />
          <ThemedText variant="titleSmall" colorName="tertiary" style={styles.title}>
            Available gigs
          </ThemedText>
        </View>
      </View>

      {/* Carousel with arrows */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ gap: Spacing.md }}
        >
          {gigs.map((gig) => (
            <ListingCard
              key={`gig-${gig.id}`}
              listing={gig}
              width={cardWidth}
              onPress={() => router.push({ pathname: '/listing/[id]', params: { id: gig.id } })}
            />
          ))}
        </ScrollView>

        {/* Left Arrow */}
        {showLeftArrow && (
          <Pressable
            style={[styles.arrowBtn, styles.arrowLeft, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}
            onPress={scrollLeft}
          >
            <ThemedIcon name="chevron-left" size={20} />
          </Pressable>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <Pressable
            style={[styles.arrowBtn, styles.arrowRight, { backgroundColor: theme.surface, borderColor: theme.outlineVariant }]}
            onPress={scrollRight}
          >
            <ThemedIcon name="chevron-right" size={20} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '700',
  },
  carouselWrapper: {
    position: 'relative',
  },
  arrowBtn: {
    position: 'absolute',
    top: '40%',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  arrowLeft: {
    left: 4,
  },
  arrowRight: {
    right: 4,
  },
});
