import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing } from '../../constants';

interface AdminBulkBarProps {
  selectedCount: number;
  onClear: () => void;
  onAction: () => void;
  actionLabel: string;
  colors: { primary: string; card: string; text: string; border: string };
}

export function AdminBulkBar({ selectedCount, onClear, onAction, actionLabel, colors }: AdminBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <View style={[styles.bar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <Text style={[styles.count, { color: colors.text }]}>{selectedCount} selected</Text>
      <TouchableOpacity onPress={onClear}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onAction} style={[styles.action, { backgroundColor: colors.primary }]}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  count: { flex: 1, fontWeight: '600' },
  action: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  actionText: { color: '#fff', fontWeight: '700' },
});
