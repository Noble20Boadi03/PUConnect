import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAdminThemeColor, useTabBarHeight } from '../../../../hooks';
import { Spacing } from '../../../../constants';
import { AdminScreenHeader } from '../../../../components/Admin';
import { adminService, DisputeDetail } from '../../../../services/adminService';

export default function DisputeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setDispute(await adminService.getDisputeDetail(id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const resolve = async (resolution: 'complete' | 'cancel' | 'resume') => {
    if (!id) return;
    try {
      await adminService.resolveDispute(id, resolution);
      Alert.alert('Resolved', `Marked as ${resolution}.`);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not resolve dispute.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;
  if (!dispute) return <Text style={{ padding: 20 }}>Not found</Text>;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Dispute Mediation" showBack colors={theme} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + 120 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.text }]}>{dispute.post?.title ?? 'Service Request'}</Text>
          <Text style={{ color: theme.muted }}>{dispute.requester.name} requested · {dispute.provider.name} provided</Text>
          {dispute.message ? <Text style={{ color: theme.text, marginTop: Spacing.sm }}>{dispute.message}</Text> : null}
        </View>

        <Text style={[styles.section, { color: theme.text }]}>Chat History</Text>
        {dispute.messages.map((m) => (
          <View key={m.id} style={[styles.msg, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ color: theme.muted, fontSize: 11 }}>{m.sender.name}</Text>
            <Text style={{ color: theme.text }}>{m.content}</Text>
          </View>
        ))}

        <View style={styles.actions}>
          <ActionBtn label="Mark Complete" color="#059669" onPress={() => resolve('complete')} />
          <ActionBtn label="Cancel Request" color="#DC2626" onPress={() => resolve('cancel')} />
          <ActionBtn label="Resume Active" color="#2563EB" onPress={() => resolve('resume')} />
        </View>
      </ScrollView>
    </View>
  );
}

function ActionBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionBtn, { backgroundColor: color }]}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: Spacing.md, borderRadius: 12, borderWidth: 1, marginBottom: Spacing.md },
  heading: { fontSize: 18, fontWeight: '700' },
  section: { fontWeight: '700', marginBottom: Spacing.sm },
  msg: { padding: Spacing.sm, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  actions: { marginTop: Spacing.lg, gap: Spacing.sm },
  actionBtn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700' },
});
