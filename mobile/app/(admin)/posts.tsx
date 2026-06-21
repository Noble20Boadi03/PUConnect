import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';
import { Spacing } from '../../constants';
import { GuardedPressable } from '../../components/GuardedPressable';
import { adminService, AdminPost, AdminPostDetail } from '../../services/adminService';

const TAG_FILTERS: ('all' | 'Service' | 'Request')[] = [
  'all',
  'Service',
  'Request'
];

const STATUS_FILTERS: ('all' | 'active' | 'hidden_by_owner' | 'removed_by_admin')[] = [
  'all',
  'active',
  'hidden_by_owner',
  'removed_by_admin'
];

export default function PostsScreen() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const divider = isDark ? '#30363D' : '#E1E4E8';
  const inputBg = isDark ? '#27272A' : '#F9F9FA';

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<AdminPostDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<'all' | 'Service' | 'Request'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'hidden_by_owner' | 'removed_by_admin'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const params: { search?: string; tag?: string; status?: string } = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedTag !== 'all') params.tag = selectedTag;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const data = await adminService.getPosts(params);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedTag, selectedStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTag, selectedStatus, fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const handlePostPress = async (post: AdminPost) => {
    try {
      setDetailLoading(true);
      const detail = await adminService.getPostDetail(post.id);
      setSelectedPost(detail);
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
      Alert.alert('Error', 'Failed to load post details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedPost(null);
  };

  const handleUpdatePostStatus = async (status: string) => {
    if (!selectedPost) return;
    try {
      setActionLoading(true);
      await adminService.updatePostStatus(selectedPost.id, status);
      await fetchPosts();
      const updatedDetail = await adminService.getPostDetail(selectedPost.id);
      setSelectedPost(updatedDetail);
    } catch (error) {
      console.error('Failed to update post status:', error);
      Alert.alert('Error', 'Failed to update post status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string, isDark: boolean) => {
    switch (status) {
      case 'active':
        return isDark ? '#10B98130' : '#10B98120';
      case 'hidden_by_owner':
        return isDark ? '#6B728030' : '#6B728020';
      case 'removed_by_admin':
        return isDark ? '#EF444430' : '#EF444420';
      default:
        return isDark ? '#6B728030' : '#6B728020';
    }
  };

  const getTagColor = (tag: string, isDark: boolean) => {
    switch (tag) {
      case 'Service':
        return isDark ? '#3B82F630' : '#3B82F620';
      case 'Request':
        return isDark ? '#F59E0B30' : '#F59E0B20';
      default:
        return isDark ? '#6B728030' : '#6B728020';
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    if (price.amount !== undefined) return `$${price.amount.toFixed(2)}`;
    return JSON.stringify(price);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Posts</Text>
      </View>

      <View style={[styles.searchContainer, { paddingHorizontal: Spacing.lg }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBg }]}>
          <Ionicons name="search-outline" size={20} color={Colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder="Search posts..."
            placeholderTextColor={Colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {TAG_FILTERS.map((filter) => (
          <TouchableOpacity
            key={`tag-${filter}`}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedTag === filter ? Colors.primary : subtleBg,
                borderColor: selectedTag === filter ? Colors.primary : divider
              }
            ]}
            onPress={() => setSelectedTag(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: selectedTag === filter ? '#FFFFFF' : Colors.text }
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={`status-${filter}`}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedStatus === filter ? Colors.primary : subtleBg,
                borderColor: selectedStatus === filter ? Colors.primary : divider
              }
            ]}
            onPress={() => setSelectedStatus(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: selectedStatus === filter ? '#FFFFFF' : Colors.text }
              ]}
            >
              {filter.replace('_', ' ').charAt(0).toUpperCase() + filter.replace('_', ' ').slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((post) => (
          <GuardedPressable
            key={post.id}
            style={[styles.postCard, { backgroundColor: cardBg }]}
            onPress={() => handlePostPress(post)}
            activeOpacity={0.85}
          >
            <View style={styles.postHeader}>
              <View style={styles.postInfo}>
                <Text style={[styles.postTitle, { color: Colors.text }]} numberOfLines={2}>
                  {post.title}
                </Text>
                <View style={styles.badgesContainer}>
                  <View style={[styles.badge, { backgroundColor: getTagColor(post.tag, isDark) }]}>
                    <Text style={styles.badgeText}>{post.tag}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(post.status, isDark) }]}>
                    <Text style={styles.badgeText}>
                      {post.status.replace('_', ' ')}
                    </Text>
                  </View>
                  {post.reportCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: isDark ? '#EF444430' : '#EF444420' }]}>
                      <Text style={styles.badgeText}>{post.reportCount} reports</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.postMeta, { color: Colors.icon }]}>
                  By @{post.authorUsername} • {formatPrice(post.price)} • {formatDate(post.createdAt)}
                </Text>
              </View>
            </View>
          </GuardedPressable>
        ))}

        {posts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: Colors.icon }]}>
              No posts found
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        {selectedPost && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: Colors.text }]}>Post Details</Text>
                <GuardedPressable onPress={closeDetailModal}>
                  <Ionicons name="close" size={24} color={Colors.icon} />
                </GuardedPressable>
              </View>

              <ScrollView style={styles.modalBody}>
                {detailLoading ? (
                  <View style={styles.detailLoading}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                  </View>
                ) : (
                  <>
                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.postDetailTitle, { color: Colors.text }]}>
                        {selectedPost.title}
                      </Text>
                      <View style={styles.badgesContainer}>
                        <View style={[styles.badge, { backgroundColor: getTagColor(selectedPost.tag, isDark) }]}>
                          <Text style={styles.badgeText}>{selectedPost.tag}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getStatusColor(selectedPost.status, isDark) }]}>
                          <Text style={styles.badgeText}>
                            {selectedPost.status.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Description</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {selectedPost.description}
                      </Text>
                    </View>

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Author</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {selectedPost.author.name} (@{selectedPost.author.username})
                      </Text>
                    </View>

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Price</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {formatPrice(selectedPost.price)}
                      </Text>
                    </View>

                    {selectedPost.hashtags.length > 0 && (
                      <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                        <Text style={[styles.detailLabel, { color: Colors.icon }]}>Hashtags</Text>
                        <View style={styles.hashtagsContainer}>
                          {selectedPost.hashtags.map((tag, index) => (
                            <View key={index} style={[styles.hashtagBadge, { backgroundColor: subtleBg }]}>
                              <Text style={styles.hashtagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Created</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {formatDate(selectedPost.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Reports ({selectedPost.reports.length})</Text>
                      {selectedPost.reports.length > 0 ? (
                        selectedPost.reports.map((report) => (
                          <View key={report.id} style={[styles.reportItem, { borderTopColor: divider }]}>
                            <View style={styles.reportItemHeader}>
                              <Text style={[styles.reportReason, { color: Colors.text }]}>
                                {report.reason.replace('_', ' ')}
                              </Text>
                              <View style={[styles.statusBadge, { backgroundColor: getReportStatusColor(report.status, isDark) }]}>
                                <Text style={styles.statusBadgeText}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Text>
                              </View>
                            </View>
                            <Text style={[styles.reportMeta, { color: Colors.icon }]}>
                              Reported by {report.reporter.name} • {formatDate(report.createdAt)}
                            </Text>
                            {report.description && (
                              <Text style={[styles.reportDescription, { color: Colors.text }]}>
                                {report.description}
                              </Text>
                            )}
                          </View>
                        ))
                      ) : (
                        <Text style={[styles.detailValue, { color: Colors.icon }]}>
                          No reports against this post
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>

              {!detailLoading && (
                <View style={styles.modalActions}>
                  {selectedPost.status === 'active' && (
                    <GuardedPressable
                      style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                      onPress={() => handleUpdatePostStatus('removed_by_admin')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.actionButtonText}>Remove Post</Text>
                      )}
                    </GuardedPressable>
                  )}
                  {selectedPost.status === 'removed_by_admin' && (
                    <GuardedPressable
                      style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                      onPress={() => handleUpdatePostStatus('active')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.actionButtonText}>Reactivate</Text>
                      )}
                    </GuardedPressable>
                  )}
                  <GuardedPressable
                    style={[styles.actionButton, styles.secondaryButton, { borderColor: Colors.icon }]}
                    onPress={closeDetailModal}
                  >
                    <Text style={[styles.secondaryButtonText, { color: Colors.icon }]}>Close</Text>
                  </GuardedPressable>
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const getReportStatusColor = (status: string, isDark: boolean) => {
  switch (status) {
    case 'pending':
      return isDark ? '#F59E0B30' : '#F59E0B20';
    case 'reviewed':
      return isDark ? '#3B82F630' : '#3B82F620';
    case 'dismissed':
      return isDark ? '#6B728030' : '#6B728020';
    case 'actioned':
      return isDark ? '#10B98130' : '#10B98120';
    default:
      return isDark ? '#6B728030' : '#6B728020';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  postCard: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  postInfo: {
    flex: 1,
    gap: 4,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  postMeta: {
    fontSize: 14,
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxHeight: '60%',
  },
  detailLoading: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  detailSection: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  postDetailTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  hashtagBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportItem: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reportReason: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  reportMeta: {
    fontSize: 12,
  },
  reportDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
