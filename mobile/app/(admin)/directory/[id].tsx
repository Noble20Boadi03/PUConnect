import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert,
  ActivityIndicator, TextInput, Image,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader, AdminStatusBadge } from '../../../components/Admin';
import { adminService, AdminUserDetail } from '../../../services/adminService';
import { canBanUsers } from '../../../hooks/useAdminPermissions';
import { useAuthStore } from '../../../store';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
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

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setDetail(await adminService.getUserDetail(id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const setStatus = async (status: string) => {
    if (!id) return;
    try {
      await adminService.updateUserStatus(id, status);
      Alert.alert('Updated', `User status set to ${status}.`);
      load();
    } catch {
      Alert.alert('Error', 'Could not update status.');
    }
  };

  const sendWarning = async () => {
    if (!id || !warning.trim()) return;
    try {
      await adminService.warnUser(id, warning.trim());
      setWarning('');
      Alert.alert('Sent', 'Official warning delivered to inbox.');
    } catch {
      Alert.alert('Error', 'Could not send warning.');
    }
  };

  const setTier = async (tier: string | null) => {
    if (!id) return;
    try {
      await adminService.updateAdminTier(id, tier);
      Alert.alert('Updated', 'Admin tier updated successfully.');
      load();
    } catch {
      Alert.alert('Error', 'Could not update admin tier.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;
  if (!detail) return <Text style={{ padding: 20 }}>User not found</Text>;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="User Profile" showBack colors={theme} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md, paddingBottom: tabBarHeight + 100 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Image source={{ uri: detail.avatarUrl }} style={styles.avatar} />
          <Text style={[styles.name, { color: theme.text }]}>{detail.name}</Text>
          <Text style={{ color: theme.muted }}>@{detail.username} · {detail.email}</Text>
          <View style={styles.badges}>
            <AdminStatusBadge status={detail.status} />
            <AdminStatusBadge status={detail.role} />
          </View>
          {detail.bio ? <Text style={{ color: theme.text, marginTop: Spacing.sm }}>{detail.bio}</Text> : null}
          {detail.skillTitle ? <Text style={{ color: theme.muted, marginTop: 4 }}>{detail.skillTitle}</Text> : null}
        </View>

        {detail.role !== 'admin' ? (
          <>
            <Text style={[styles.section, { color: theme.text }]}>Send Official Warning</Text>
            <TextInput
              value={warning}
              onChangeText={setWarning}
              placeholder="Warning message to user inbox..."
              placeholderTextColor={theme.muted}
              multiline
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            />
            <TouchableOpacity onPress={sendWarning} style={[styles.btn, { backgroundColor: theme.primary }]}>
              <Text style={styles.btnText}>Send Warning</Text>
            </TouchableOpacity>

            {canBanUsers(user?.adminTier) ? (
              <>
                <Text style={[styles.section, { color: theme.text }]}>Account Actions</Text>
                <View style={styles.row}>
                  <SmallBtn label="Active" onPress={() => setStatus('active')} />
                  <SmallBtn label="Shadowban" onPress={() => setStatus('shadowbanned')} />
                  <SmallBtn label="Suspend" onPress={() => setStatus('suspended')} />
                  <SmallBtn label="Ban" onPress={() => setStatus('banned')} danger />
                </View>
              </>
            ) : null}

            {user?.adminTier === 'super_admin' ? (
              <>
                <Text style={[styles.section, { color: theme.text }]}>Admin Role Assignment</Text>
                {user.id === detail.id ? (
                  <Text style={{ color: theme.muted, fontSize: 13, marginBottom: Spacing.sm }}>
                    You cannot change your own admin tier to prevent accidental lockouts.
                  </Text>
                ) : (
                  <View style={styles.row}>
                    <SmallBtn label="Super Admin" onPress={() => setTier('super_admin')} />
                    <SmallBtn label="Moderator" onPress={() => setTier('moderator')} />
                    <SmallBtn label="Support" onPress={() => setTier('support')} />
                    <SmallBtn label="Remove Admin" onPress={() => setTier(null)} danger />
                  </View>
                )}
                {detail.adminTier && (
                  <Text style={{ color: theme.primary, marginTop: 8, fontWeight: '600' }}>
                    Current Tier: {detail.adminTier}
                  </Text>
                )}
              </>
            ) : null}
          </>
        ) : null}

        {detail.reports?.length ? (
          <>
            <Text style={[styles.section, { color: theme.text }]}>Reports ({detail.reports.length})</Text>
            {detail.reports.map((r) => (
              <Text key={r.id} style={{ color: theme.muted, marginBottom: 4 }}>{r.reason} — {r.status}</Text>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SmallBtn({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.smallBtn, danger && { backgroundColor: '#FEE2E2' }]}>
      <Text style={{ fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: Spacing.md, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: Spacing.sm },
  name: { fontSize: 20, fontWeight: '800' },
  badges: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm },
  section: { fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  input: { borderWidth: 1, borderRadius: 10, padding: Spacing.sm, minHeight: 80, textAlignVertical: 'top' },
  btn: { marginTop: Spacing.sm, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#E5E7EB' },
});
