import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GuardedPressable } from '../GuardedPressable';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography, CARD_SHADOW } from '../../constants';
import type { PopularService } from '../../types';

export interface PopularServiceCardProps {
  item: PopularService;
  labelBg: string;
  labelColor: string;
  onPress?: () => void;
}

const PopularServiceCardComponent: React.FC<PopularServiceCardProps> = ({
  item,
  labelBg,
  labelColor,
  onPress,
}) => (
  <View style={styles.cardOuter}>
    <GuardedPressable
      style={styles.cardInner}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View style={[styles.iconArea, { backgroundColor: item.accentColor }]}>
        <Ionicons name={item.icon} size={32} color="#FFFFFF" />
      </View>
      <View style={[styles.labelArea, { backgroundColor: labelBg }]}>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </GuardedPressable>
  </View>
);

const CARD_WIDTH = 128;

const styles = StyleSheet.create({
  cardOuter: {
    width: CARD_WIDTH,
    borderRadius: 14,
    ...CARD_SHADOW,
  },
  cardInner: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
  },
  iconArea: {
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelArea: {
    minHeight: 52,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export const POPULAR_SERVICE_CARD_WIDTH = CARD_WIDTH;

export const PopularServiceCard = memo(PopularServiceCardComponent);

export default PopularServiceCard;
