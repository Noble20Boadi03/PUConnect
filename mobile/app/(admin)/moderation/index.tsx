import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader, AdminFilterSheet, AdminStatusBadge, type FilterGroup } from '../../../components/Admin';
import { adminService, Report } from '../../../services/adminService';

export default function ReportsListScreen() {
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

  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getReports(statusFilter);
      setReports(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const filterGroups: FilterGroup[] = [{
    id: 'status',
    label: 'Status',
    value: statusFilter,
    onChange: setStatusFilter,
    options: [
      { key: 'all', label: 'All' },
      { key: 'pending', label: 'Pending' },
      { key: 'reviewed', label: 'Reviewed' },
      { key: 'dismissed', label: 'Dismissed' },
      { key: 'actioned', label: 'Actioned' },
    ],
  }];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader
        title="Moderation"
        subtitle="Reports & disputes"
        colors={theme}
        rightAction={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => router.push('/(admin)/moderation/triage' as any)} style={styles.headerBtn}>
              <Ionicons name="flash-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(admin)/moderation/disputes' as any)} style={styles.headerBtn}>
              <Ionicons name="git-compare-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.headerBtn}>
              <Ionicons name="options-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/moderation/${item.id}` as any)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.cardTop}>
                <Ionicons name={item.targetType === 'user' ? 'person-outline' : 'document-text-outline'} size={18} color={theme.primary} />
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.targetType === 'user'
                    ? (item.target as any)?.name ?? 'User'
                    : (item.target as any)?.title ?? 'Post'}
                </Text>
                <AdminStatusBadge status={item.status} />
              </View>
              <Text style={{ color: theme.muted, fontSize: 13 }}>{item.reason.replace(/_/g, ' ')} · by @{item.reporter.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>No reports found</Text>}
        />
      )}

      <AdminFilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        groups={filterGroups}
        colors={theme}
        onApply={() => { setFilterVisible(false); setLoading(true); load(); }}
        onReset={() => setStatusFilter('pending')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBtn: { padding: 6 },
  card: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardTitle: { flex: 1, fontWeight: '700', fontSize: 15 },
});
