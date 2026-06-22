import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, useColorScheme, TextInput, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader, AdminFilterSheet, AdminStatusBadge, AdminBulkBar, type FilterGroup } from '../../../components/Admin';
import { FeaturedPostCard } from '../../../components/FeaturedPostCard';
import { adminService, AdminPost } from '../../../services/adminService';
import { mapAdminPostToFeaturedPost } from '../../../lib/mapAdminPost';

export default function PostsListScreen() {
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
    subtle: isDark ? '#1E1E21' : '#F0F0F2',
  };

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getPosts({ search: search || undefined, tag: tagFilter, status: statusFilter });
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter, statusFilter]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkRemove = async () => {
    try {
      await adminService.bulkUpdatePostStatus([...selected], 'removed_by_admin');
      setSelected(new Set());
      setSelectMode(false);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const filterGroups: FilterGroup[] = [
    {
      id: 'tag', label: 'Type', value: tagFilter, onChange: setTagFilter,
      options: [{ key: 'all', label: 'All' }, { key: 'Service', label: 'Service' }, { key: 'Request', label: 'Request' }],
    },
    {
      id: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter,
      options: [
        { key: 'all', label: 'All' }, { key: 'active', label: 'Active' },
        { key: 'locked_by_admin', label: 'Locked' }, { key: 'removed_by_admin', label: 'Removed' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader
        title="Content"
        subtitle="Posts & marketplace listings"
        colors={theme}
        rightAction={
          <TouchableOpacity onPress={() => { setSelectMode(!selectMode); setSelected(new Set()); }} style={styles.selectBtn}>
            <Text style={{ color: theme.primary, fontWeight: '700' }}>{selectMode ? 'Done' : 'Select'}</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.toolbar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={load}
          placeholder="Search posts..."
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
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + (selectMode ? 120 : Spacing.xl) }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              {selectMode ? (
                <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.check}>
                  <Ionicons name={selected.has(item.id) ? 'checkbox' : 'square-outline'} size={22} color={theme.primary} />
                </TouchableOpacity>
              ) : null}
              <View style={{ flex: 1 }}>
                <FeaturedPostCard
                  item={mapAdminPostToFeaturedPost(item)}
                  cardBg={theme.card}
                  subtleBg={theme.subtle}
                  textColor={theme.text}
                  mutedColor={theme.muted}
                  primaryColor={theme.primary}
                  borderColor={theme.border}
                  layout="stack"
                  onPress={() => selectMode ? toggleSelect(item.id) : router.push(`/(admin)/content/${item.id}` as any)}
                />
                <View style={styles.meta}>
                  <AdminStatusBadge status={item.status} />
                  {item.reportCount > 0 ? <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '700' }}>{item.reportCount} reports</Text> : null}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {selectMode ? (
        <AdminBulkBar selectedCount={selected.size} onClear={() => setSelected(new Set())} onAction={bulkRemove} actionLabel="Remove Selected" colors={theme} />
      ) : null}

      <AdminFilterSheet visible={filterVisible} onClose={() => setFilterVisible(false)} groups={filterGroups} colors={theme} onApply={() => { setFilterVisible(false); load(); }} onReset={() => { setTagFilter('all'); setStatusFilter('all'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  search: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  filterBtn: { borderWidth: 1, borderRadius: 10, padding: 10 },
  selectBtn: { padding: 6 },
  cardWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: Spacing.md },
  check: { paddingTop: 12 },
  meta: { flexDirection: 'row', gap: 8, marginTop: 4, paddingHorizontal: 4 },
});
