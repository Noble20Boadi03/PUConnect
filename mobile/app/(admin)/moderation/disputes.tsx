import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader } from '../../../components/Admin';
import { adminService, DisputeSummary } from '../../../services/adminService';

export default function DisputesListScreen() {
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

  const [disputes, setDisputes] = useState<DisputeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getDisputes();
      setDisputes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Service Disputes" subtitle="Pending review requests" showBack colors={theme} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : (
        <FlatList
          data={disputes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/moderation/dispute/${item.id}` as any)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Text style={[styles.title, { color: theme.text }]}>{item.post?.title ?? 'Service Request'}</Text>
              <Text style={{ color: theme.muted, fontSize: 13 }}>
                {item.requester.name} ↔ {item.provider.name}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>No open disputes</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm },
  title: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
});
