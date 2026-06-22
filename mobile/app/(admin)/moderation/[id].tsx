import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader, AdminStatusBadge } from '../../../components/Admin';
import { adminService, Report } from '../../../services/adminService';
import { canBanUsers } from '../../../hooks/useAdminPermissions';
import { useAuthStore } from '../../../store';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const Colors = useAdminThemeColor();
  const isDark = colorScheme === 'dark';
  const tabBarHeight = useTabBarHeight();
  const user = useAuthStore((s) => s.user);
  const theme = {
    text: Colors.text,
    muted: isDark ? '#A1A1AA' : '#71717A',
    primary: Colors.primary,
    card: isDark ? '#18181B' : '#FFFFFF',
    bg: isDark ? '#09090B' : '#F4F4F5',
    border: isDark ? '#30363D' : '#E1E4E8',
  };

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await adminService.getReports('all', 1, 100);
      setReport(res.data.find((r) => r.id === id) ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const triage = async (action: 'dismiss' | 'remove_content' | 'suspend_user') => {
    if (!report) return;
    setActing(true);
    try {
      await adminService.triageReport(report.id, action);
      Alert.alert('Done', 'Report processed.');
      router.back();
    } catch {
      Alert.alert('Error', 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;
  if (!report) return <Text style={{ padding: 20 }}>Report not found</Text>;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Report Detail" showBack colors={theme} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + 100 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <AdminStatusBadge status={report.status} />
          <Text style={[styles.label, { color: theme.muted }]}>Target</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {report.targetType}: {report.targetType === 'user' ? (report.target as any)?.name : (report.target as any)?.title}
          </Text>
          <Text style={[styles.label, { color: theme.muted }]}>Reason</Text>
          <Text style={[styles.value, { color: theme.text }]}>{report.reason.replace(/_/g, ' ')}</Text>
          {report.description ? (
            <>
              <Text style={[styles.label, { color: theme.muted }]}>Description</Text>
              <Text style={{ color: theme.text }}>{report.description}</Text>
            </>
          ) : null}
          <Text style={[styles.label, { color: theme.muted }]}>Reporter</Text>
          <Text style={{ color: theme.text }}>@{report.reporter.username}</Text>
        </View>

        {report.status === 'pending' ? (
          <View style={styles.actions}>
            <ActionBtn label="Dismiss Report" color="#6B7280" onPress={() => triage('dismiss')} disabled={acting} />
            {report.targetType === 'post' ? (
              <ActionBtn label="Remove Content" color="#DC2626" onPress={() => triage('remove_content')} disabled={acting} />
            ) : null}
            {report.targetType === 'user' && canBanUsers(user?.adminTier) ? (
              <ActionBtn label="Suspend User" color="#EA580C" onPress={() => triage('suspend_user')} disabled={acting} />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ActionBtn({ label, color, onPress, disabled }: { label: string; color: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.actionBtn, { backgroundColor: color, opacity: disabled ? 0.6 : 1 }]}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: Spacing.md, borderRadius: 14, borderWidth: 1, gap: 4 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: Spacing.sm },
  value: { fontSize: 16, fontWeight: '600' },
  actions: { marginTop: Spacing.lg, gap: Spacing.sm },
  actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
