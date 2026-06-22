import React, { useCallback, useMemo, useState } from 'react';
import { View, ActivityIndicator, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { adminService, AdminPostDetail } from '../../../services/adminService';
import { PostDetailView } from '../../../components/PostDetail/PostDetailView';
import { PostDetail } from '../../../types';

export default function AdminPostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await adminService.getPostDetail(id);
      setPost(data);
      setEditTitle(data.title);
      setEditDesc(data.description || '');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!id) return;
    try {
      await adminService.updatePostContent(id, { title: editTitle, description: editDesc });
      setIsEditing(false);
      load();
    } catch {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const handleStatus = async (status: string) => {
    if (!id) return;
    try {
      await adminService.updatePostStatus(id, status);
      Alert.alert('Updated', `Post marked as ${status.replace(/_/g, ' ')}`);
      load();
    } catch {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const mappedPost = useMemo<PostDetail | null>(() => {
    if (!post) return null;
    return {
      id: post.id,
      tag: post.tag as any,
      title: post.title,
      images: post.images || [],
      postedDate: new Date(post.createdAt).toLocaleDateString(),
      categoryTags: post.hashtags || [],
      price: post.price,
      fullDescription: post.description || '',
      hashtags: post.hashtags || [],
      author: {
        id: post.author.id,
        fullName: post.author.name,
        username: post.author.username,
        avatarUrl: post.author.avatarUrl,
      }
    };
  }, [post]);

  if (loading) return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator /></View>;
  if (!mappedPost) return <Text style={{padding: 20}}>Not found</Text>;

  const adminActions = (
    <View style={styles.actions}>
      {isEditing ? (
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#059669' }]} onPress={handleSave}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563EB' }]} onPress={() => setIsEditing(true)}>
          <Text style={styles.btnText}>Edit Content</Text>
        </TouchableOpacity>
      )}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: '#CA8A04' }]} onPress={() => handleStatus('locked_by_admin')}>
          <Text style={styles.btnText}>Lock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: '#DC2626' }]} onPress={() => handleStatus('removed_by_admin')}>
          <Text style={styles.btnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <PostDetailView
      post={mappedPost}
      onBack={() => router.back()}
      adminMode
      adminActions={adminActions}
      adminIsEditing={isEditing}
      adminEditedTitle={editTitle}
      adminEditedDescription={editDesc}
      onAdminEditTitle={setEditTitle}
      onAdminEditDescription={setEditDesc}
    />
  );
}

const styles = StyleSheet.create({
  actions: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700' }
});
