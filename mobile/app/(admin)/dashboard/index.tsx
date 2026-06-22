import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader } from '../../../components/Admin';
import { adminService, AnalyticsData, DashboardData } from '../../../services/adminService';

function QuickAction({
  label,
  count,
  icon,
  onPress,
  colors,
}: {
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: { card: string; text: string; muted: string; primary: string; border: string };
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}22` }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.actionCount, { color: colors.text }]}>{count}</Text>
      <Text style={[styles.actionLabel, { color: colors.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen() {
  const colorScheme = useColorScheme();
  const Colors = useAdminThemeColor();
  const isDark = colorScheme === 'dark';
  const tabBarHeight = useTabBarHeight();

  const theme = {
    text: Colors.text,
    muted: isDark ? '#A1A1AA' : '#71717A',
    primary: Colors.primary,
    card: isDark ? '#18181B' : '#FFFFFF',
    bg: isDark ? '#09090B' : '#F4F4F5',
    border: isDark ? '#30363D' : '#E1E4E8',
  };

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dash, stats] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAnalytics(),
      ]);
      setDashboard(dash);
      setAnalytics(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Command Center" subtitle="PUConnect admin overview" colors={theme} />
      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <QuickAction label="Pending Reports" count={dashboard?.pendingReports ?? 0} icon="flag-outline" colors={theme} onPress={() => router.push('/(admin)/moderation/triage' as any)} />
          <QuickAction label="Provider Queue" count={dashboard?.pendingProviders ?? 0} icon="person-add-outline" colors={theme} onPress={() => router.push('/(admin)/directory/providers' as any)} />
          <QuickAction label="Disputes" count={dashboard?.pendingDisputes ?? 0} icon="git-compare-outline" colors={theme} onPress={() => router.push('/(admin)/moderation/disputes' as any)} />
          <QuickAction label="Open Feedback" count={dashboard?.openFeedback ?? 0} icon="chatbox-ellipses-outline" colors={theme} onPress={() => router.push('/(admin)/dashboard/feedback' as any)} />
        </View>

        {analytics ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>Platform Stats</Text>
            <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <StatRow label="Total Users" value={String(analytics.totalUsers)} theme={theme} />
              <StatRow label="Providers" value={String(analytics.providerCount)} theme={theme} />
              <StatRow label="Active (7d)" value={String(analytics.activeUsers7d)} theme={theme} />
              <StatRow label="Posts" value={String(analytics.totalPosts)} theme={theme} />
              <StatRow label="Avg Rating" value={analytics.averageReviewRating.toFixed(1)} theme={theme} />
              <StatRow label="Pending Reports" value={String(analytics.reportsByStatus.pending)} theme={theme} />
            </View>
          </>
        ) : null}

        {dashboard?.recentAuditLogs?.length ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>Recent Activity</Text>
            {dashboard.recentAuditLogs.map((log) => (
              <View key={log.id} style={[styles.logRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.logAction, { color: theme.text }]}>{log.action.replace(/_/g, ' ')}</Text>
                <Text style={{ color: theme.muted, fontSize: 12 }}>{log.admin.name} · {new Date(log.createdAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatRow({ label, value, theme }: { label: string; value: string; theme: { text: string; muted: string; border: string } }) {
  return (
    <View style={[styles.statRow, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.muted }}>{label}</Text>
      <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionCount: { fontSize: 24, fontWeight: '800' },
  actionLabel: { fontSize: 12, marginTop: 2 },
  statsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1 },
  logRow: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm },
  logAction: { fontWeight: '600', textTransform: 'capitalize', marginBottom: 4 },
});
