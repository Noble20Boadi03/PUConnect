import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminThemeColor } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader } from '../../../components/Admin';
import { adminService, Report } from '../../../services/adminService';
import { canBanUsers } from '../../../hooks/useAdminPermissions';
import { useAuthStore } from '../../../store';

export default function RapidTriageScreen() {
  const colorScheme = useColorScheme();
  const Colors = useAdminThemeColor();
  const isDark = colorScheme === 'dark';
  const user = useAuthStore((s) => s.user);
  const theme = {
    text: Colors.text,
    muted: isDark ? '#A1A1AA' : '#71717A',
    primary: Colors.primary,
    card: isDark ? '#18181B' : '#FFFFFF',
    bg: isDark ? '#09090B' : '#F4F4F5',
    border: isDark ? '#30363D' : '#E1E4E8',
  };

  const [queue, setQueue] = useState<Report[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getReports('pending');
      setQueue(res.data);
      setIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const current = queue[index];

  const act = async (action: 'dismiss' | 'remove_content' | 'suspend_user') => {
    if (!current) return;
    setActing(true);
    try {
      await adminService.triageReport(current.id, action);
      const next = queue.filter((r) => r.id !== current.id);
      setQueue(next);
      setIndex(0);
    } catch {
      Alert.alert('Error', 'Triage action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Rapid Triage" subtitle={`${queue.length} pending`} showBack colors={theme} />

      {!current ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle-outline" size={64} color={theme.primary} />
          <Text style={[styles.emptyText, { color: theme.text }]}>Queue clear!</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: theme.primary, fontWeight: '700' }}>Back to reports</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.type, { color: theme.primary }]}>{current.targetType.toUpperCase()} REPORT</Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {current.targetType === 'user'
                ? (current.target as any)?.name ?? 'Unknown user'
                : (current.target as any)?.title ?? 'Unknown post'}
            </Text>
            <Text style={{ color: theme.muted, marginTop: Spacing.sm }}>{current.reason.replace(/_/g, ' ')}</Text>
            {current.description ? <Text style={{ color: theme.text, marginTop: Spacing.md }}>{current.description}</Text> : null}
            <Text style={{ color: theme.muted, marginTop: Spacing.lg, fontSize: 12 }}>Reported by @{current.reporter.username}</Text>
          </View>

          <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#6B7280' }]} onPress={() => act('dismiss')} disabled={acting}>
            <Text style={styles.bigBtnText}>Dismiss Report</Text>
          </TouchableOpacity>
          {current.targetType === 'post' ? (
            <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#DC2626' }]} onPress={() => act('remove_content')} disabled={acting}>
              <Text style={styles.bigBtnText}>Remove Content</Text>
            </TouchableOpacity>
          ) : null}
          {current.targetType === 'user' && canBanUsers(user?.adminTier) ? (
            <TouchableOpacity style={[styles.bigBtn, { backgroundColor: '#EA580C' }]} onPress={() => act('suspend_user')} disabled={acting}>
              <Text style={styles.bigBtnText}>Suspend User</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: Spacing.md },
  card: { padding: Spacing.lg, borderRadius: 16, borderWidth: 1, marginBottom: Spacing.lg },
  type: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800', marginTop: Spacing.sm },
  bigBtn: { padding: 20, borderRadius: 14, alignItems: 'center' },
  bigBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText: { fontSize: 20, fontWeight: '700' },
});
