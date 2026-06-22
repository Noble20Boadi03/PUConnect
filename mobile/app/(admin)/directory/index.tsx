import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, useColorScheme, TextInput, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader, AdminFilterSheet, AdminStatusBadge, type FilterGroup } from '../../../components/Admin';
import { adminService, AdminUser } from '../../../services/adminService';

export default function UsersListScreen() {
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

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getUsers({ search: search || undefined, role: roleFilter, status: statusFilter });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const filterGroups: FilterGroup[] = [
    {
      id: 'role', label: 'Role', value: roleFilter, onChange: setRoleFilter,
      options: [
        { key: 'all', label: 'All' }, { key: 'user', label: 'User' },
        { key: 'provider', label: 'Provider' }, { key: 'admin', label: 'Admin' },
      ],
    },
    {
      id: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter,
      options: [
        { key: 'all', label: 'All' }, { key: 'active', label: 'Active' },
        { key: 'shadowbanned', label: 'Shadowbanned' }, { key: 'suspended', label: 'Suspended' }, { key: 'banned', label: 'Banned' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader
        title="Directory"
        subtitle="Users & providers"
        colors={theme}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/(admin)/directory/providers' as any)} style={styles.queueBtn}>
            <Ionicons name="person-add-outline" size={18} color={theme.primary} />
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>Queue</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={load}
          placeholder="Search users..."
          placeholderTextColor={theme.muted}
          style={[styles.search, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        />
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={[styles.filterBtn, { borderColor: theme.border }]}>
          <Ionicons name="options-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/directory/${item.id}` as any)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={{ color: theme.muted, fontSize: 13 }}>@{item.username} · {item.role}</Text>
                <View style={styles.badges}>
                  <AdminStatusBadge status={item.status} />
                  {item.reportCount > 0 ? <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '700' }}>{item.reportCount} reports</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <AdminFilterSheet visible={filterVisible} onClose={() => setFilterVisible(false)} groups={filterGroups} colors={theme} onApply={() => { setFilterVisible(false); load(); }} onReset={() => { setRoleFilter('all'); setStatusFilter('all'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  search: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  filterBtn: { borderWidth: 1, borderRadius: 10, padding: 10, justifyContent: 'center' },
  queueBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  card: { flexDirection: 'row', padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm, gap: Spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { fontWeight: '700', fontSize: 15 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' },
});
