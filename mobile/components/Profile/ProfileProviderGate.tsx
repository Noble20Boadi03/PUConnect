import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import { useThemeColor } from '../../hooks';

export interface ProfileProviderGateProps {
  cardBg: string;
  textColor: string;
  mutedColor: string;
  primaryColor: string;
  onBecomeProvider: () => void;
}

export const ProfileProviderGate: React.FC<ProfileProviderGateProps> = ({
  cardBg,
  textColor,
  mutedColor,
  primaryColor,
  onBecomeProvider,
}) => {
  const Colors = useThemeColor();
  
  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={[styles.iconCircle, { backgroundColor: primaryColor + '14' }]}>
        <Ionicons name="briefcase-outline" size={28} color={primaryColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>Become a provider to list services</Text>
      <Text style={[styles.body, { color: mutedColor }]}>
        Service posts are for campus providers. You can still create request posts anytime — switch
        to the Requests tab or complete your provider profile in Edit Info.
      </Text>
      <TouchableOpacity
        style={[styles.cta, { backgroundColor: primaryColor }]}
        onPress={() => {
          
          onBecomeProvider();
        }}
        activeOpacity={0.9}
      >
        <Text style={[styles.ctaText, { color: Colors.onPrimary }]}>Set up provider profile</Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.size.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: Typography.size.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 12,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

export default ProfileProviderGate;
