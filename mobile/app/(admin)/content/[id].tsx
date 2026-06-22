import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAdminThemeColor, useTabBarHeight } from '../../../hooks';
import { Spacing } from '../../../constants';
import { AdminScreenHeader, AdminStatusBadge } from '../../../components/Admin';
import { PostImageGallery } from '../../../components/PostDetail/PostImageGallery';
import { formatPostPrice } from '../../../lib';
import { parsePostPrice } from '../../../lib/mapDbPost';
import { adminService, AdminPostDetail } from '../../../services/adminService';

export default function PostDetailScreen() {
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

  const [post, setPost] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setPost(await adminService.getPostDetail(id));
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
      await adminService.updatePostStatus(id, status);
      Alert.alert('Updated', `Post status: ${status}`);
      load();
    } catch {
      Alert.alert('Error', 'Could not update post.');
    }
  };

  const removeImage = async (index: number) => {
    if (!post || !id) return;
    const next = post.images.filter((_, i) => i !== index);
    try {
      await adminService.updatePostImages(id, next);
      load();
    } catch {
      Alert.alert('Error', 'Could not update images.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;
  if (!post) return <Text style={{ padding: 20 }}>Post not found</Text>;

  const price = parsePostPrice(post.price);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AdminScreenHeader title="Post Detail" showBack colors={theme} />
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 120 }}>
        {post.images.length > 0 ? (
          <PostImageGallery images={post.images} recyclingKeyPrefix={`admin-${post.id}`} screenBg={theme.bg} topInset={0} />
        ) : null}

        <View style={{ padding: Spacing.md }}>
          <View style={styles.badges}>
            <AdminStatusBadge status={post.status} />
            <AdminStatusBadge status={post.tag.toLowerCase()} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{post.title}</Text>
          <Text style={{ color: theme.primary, fontWeight: '700', marginVertical: 4 }}>{formatPostPrice(price)}</Text>
          <Text style={{ color: theme.muted, fontSize: 13 }}>by @{post.author.username}</Text>
          <Text style={[styles.desc, { color: theme.text }]}>{post.description}</Text>

          {post.images.length > 0 ? (
            <>
              <Text style={[styles.section, { color: theme.text }]}>Edit Images</Text>
              <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 8 }}>Tap to remove inappropriate images</Text>
              <View style={styles.imageActions}>
                {post.images.map((uri, i) => (
                  <TouchableOpacity key={uri} onPress={() => removeImage(i)} style={[styles.imageChip, { borderColor: theme.border }]}>
                    <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>Remove #{i + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <Text style={[styles.section, { color: theme.text }]}>Moderation Actions</Text>
          <View style={styles.actions}>
            <ActionBtn label="Keep Active" color="#059669" onPress={() => setStatus('active')} />
            <ActionBtn label="Lock Post" color="#CA8A04" onPress={() => setStatus('locked_by_admin')} />
            <ActionBtn label="Remove Post" color="#DC2626" onPress={() => setStatus('removed_by_admin')} />
          </View>
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
  badges: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  title: { fontSize: 22, fontWeight: '800' },
  desc: { marginTop: Spacing.md, lineHeight: 22 },
  section: { fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  imageActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageChip: { borderWidth: 1, borderRadius: 8, padding: 8 },
  actions: { gap: Spacing.sm },
  actionBtn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700' },
});
