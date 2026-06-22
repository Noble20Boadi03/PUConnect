import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  reviewed: { bg: '#DBEAFE', text: '#1E40AF' },
  dismissed: { bg: '#F3F4F6', text: '#4B5563' },
  actioned: { bg: '#FEE2E2', text: '#991B1B' },
  active: { bg: '#DCFCE7', text: '#166534' },
  suspended: { bg: '#FFEDD5', text: '#9A3412' },
  banned: { bg: '#FEE2E2', text: '#991B1B' },
  shadowbanned: { bg: '#F3E8FF', text: '#6B21A8' },
  hidden_by_owner: { bg: '#F3F4F6', text: '#4B5563' },
  locked_by_admin: { bg: '#FEF9C3', text: '#854D0E' },
  removed_by_admin: { bg: '#FEE2E2', text: '#991B1B' },
  approved: { bg: '#DCFCE7', text: '#166534' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

interface AdminStatusBadgeProps {
  status: string;
  isDark?: boolean;
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const palette = STATUS_COLORS[status] ?? { bg: '#E5E7EB', text: '#374151' };
  const label = status.replace(/_/g, ' ');

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});
