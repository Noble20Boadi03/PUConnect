import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../constants';

interface AdminScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  colors: { text: string; muted: string; primary: string; card: string; border: string };
}

export function AdminScreenHeader({
  title,
  subtitle,
  showBack,
  rightAction,
  colors,
}: AdminScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.border }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
        </View>
        {rightAction ?? (
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/market' as any)}
            style={[styles.switchBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
            <Text style={[styles.switchText, { color: colors.primary }]}>User</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  iconBtn: { width: 36, alignItems: 'flex-start' },
  titleWrap: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  switchText: { fontSize: 12, fontWeight: '600' },
});
