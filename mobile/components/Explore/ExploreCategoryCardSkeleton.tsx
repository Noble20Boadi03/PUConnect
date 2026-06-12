import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Shimmer } from '../Shimmer';
import { Spacing } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PAD = Spacing.lg;
const CARD_WIDTH = screenWidth - HORIZONTAL_PAD * 2;
const CARD_HEIGHT = 180;

export const ExploreCategoryCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <Shimmer width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
  },
});

export default ExploreCategoryCardSkeleton;
