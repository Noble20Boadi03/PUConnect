import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity, Alert,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader } from '../../../components/Admin';
import { adminService, PendingProvider } from '../../../services/adminService';

export default function ProviderQueueScreen() {
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

  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getPendingProviders();
      setProviders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const review = async (id: string, decision: 'approve' | 'reject') => {
    try {
      await adminService.reviewProvider(id, decision);
      Alert.alert('Done', `Provider ${decision}d.`);
      load();
    } catch {
      Alert.alert('Error', 'Review failed.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Provider Verification" subtitle="Review applications" showBack colors={theme} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary} />
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + Spacing.xl }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.row}>
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                  <Text style={{ color: theme.muted }}>@{item.username}</Text>
                  <Text style={{ color: theme.text, marginTop: 4 }}>{item.skillTitle ?? 'No title'}</Text>
                  <Text style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>{item.bio}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#059669' }]} onPress={() => review(item.id, 'approve')}>
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#DC2626' }]} onPress={() => review(item.id, 'reject')}>
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>No pending applications</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  name: { fontWeight: '700', fontSize: 16 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
