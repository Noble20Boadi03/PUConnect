import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../constants';
import type { MarketIconName } from '../../types';

export interface ProfileInfoRowProps {
  icon: MarketIconName;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  /** Multi-line body (e.g. bio) instead of a single-line value. */
  multiline?: boolean;
}

export const ProfileInfoRow: React.FC<ProfileInfoRowProps> = ({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  textColor,
  mutedColor,
  multiline = false,
}) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconCircle, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.infoContent}>
      <Text style={[styles.infoLabel, { color: mutedColor }]}>{label}</Text>
      <Text
        style={[styles.infoValue, { color: textColor }, multiline && styles.infoValueMultiline]}
      >
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md - 2,
    paddingVertical: Spacing.sm + 2,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.size.xs,
    fontWeight: '500',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  infoValueMultiline: {
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 2,
  },
});

export default ProfileInfoRow;
