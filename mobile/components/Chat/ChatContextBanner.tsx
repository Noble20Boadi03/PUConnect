import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { ChatPostContext } from '../../types';

export interface ChatContextBannerProps {
  context: ChatPostContext;
  cardBg: string;
  subtleBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  onPress: () => void;
}

export const ChatContextBanner: React.FC<ChatContextBannerProps> = ({
  context,
  cardBg,
  subtleBg,
  textColor,
  mutedColor,
  primaryColor,
  onPress,
}) => {
  const isService = context.tag === 'Service';
  const badgeBg = isService ? primaryColor + '22' : '#F59E0B22';
  const badgeColor = isService ? primaryColor : '#F59E0B';

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: cardBg, borderBottomColor: subtleBg }]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Discussing ${context.title}. Open post details.`}
    >
      <View style={[styles.iconWrap, { backgroundColor: subtleBg }]}>
        <Ionicons name="document-text-outline" size={18} color={primaryColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: mutedColor }]} numberOfLines={1}>
          Discussing:{' '}
          <Text style={[styles.title, { color: textColor }]}>{context.title}</Text>
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{context.tag}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={mutedColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  title: {
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default ChatContextBanner;
