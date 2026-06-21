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
  TextInput,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';
import { Spacing } from '../../constants';
import { GuardedPressable } from '../../components/GuardedPressable';
import { adminService, AdminUser, AdminUserDetail } from '../../services/adminService';

const ROLE_FILTERS: ('all' | 'user' | 'provider' | 'admin')[] = [
  'all',
  'user',
  'provider',
  'admin'
];

const STATUS_FILTERS: ('all' | 'active' | 'suspended' | 'banned')[] = [
  'all',
  'active',
  'suspended',
  'banned'
];

export default function UsersScreen() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const divider = isDark ? '#30363D' : '#E1E4E8';
  const inputBg = isDark ? '#27272A' : '#F9F9FA';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'provider' | 'admin'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params: { search?: string; role?: string; status?: string } = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const data = await adminService.getUsers(params);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedRole, selectedStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRole, selectedStatus, fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleUserPress = async (user: AdminUser) => {
    try {
      setDetailLoading(true);
      const detail = await adminService.getUserDetail(user.id);
      setSelectedUser(detail);
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedUser(null);
  };

  const handleUpdateUserStatus = async (status: string) => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(selectedUser.id, status);
      await fetchUsers();
      const updatedDetail = await adminService.getUserDetail(selectedUser.id);
      setSelectedUser(updatedDetail);
    } catch (error) {
      console.error('Failed to update user status:', error);
      Alert.alert('Error', 'Failed to update user status');
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
      case 'suspended':
        return isDark ? '#F59E0B30' : '#F59E0B20';
      case 'banned':
        return isDark ? '#EF444430' : '#EF444420';
      default:
        return isDark ? '#6B728030' : '#6B728020';
    }
  };

  const getRoleColor = (role: string, isDark: boolean) => {
    switch (role) {
      case 'admin':
        return isDark ? '#8B5CF630' : '#8B5CF620';
      case 'provider':
        return isDark ? '#3B82F630' : '#3B82F620';
      default:
        return isDark ? '#6B728030' : '#6B728020';
    }
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
        <Text style={[styles.title, { color: Colors.text }]}>Users</Text>
        <TouchableOpacity 
          style={[styles.switchButton, { backgroundColor: Colors.primary + '15' }]}
          onPress={() => router.replace('/(tabs)/market')}
        >
          <Ionicons name="apps-outline" size={16} color={Colors.primary} />
          <Text style={[styles.switchButtonText, { color: Colors.primary }]}>User Module</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { paddingHorizontal: Spacing.lg }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBg }]}>
          <Ionicons name="search-outline" size={20} color={Colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder="Search users..."
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
        {ROLE_FILTERS.map((filter) => (
          <TouchableOpacity
            key={`role-${filter}`}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedRole === filter ? Colors.primary : subtleBg,
                borderColor: selectedRole === filter ? Colors.primary : divider
              }
            ]}
            onPress={() => setSelectedRole(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: selectedRole === filter ? '#FFFFFF' : Colors.text }
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
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
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.usersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {users.map((user) => (
          <GuardedPressable
            key={user.id}
            style={[styles.userCard, { backgroundColor: cardBg }]}
            onPress={() => handleUserPress(user)}
            activeOpacity={0.85}
          >
            <View style={styles.userHeader}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name="person-outline" size={24} color={Colors.primary} />
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: Colors.text }]}>
                  {user.name}
                </Text>
                <Text style={[styles.userUsername, { color: Colors.icon }]}>
                  @{user.username}
                </Text>
                <View style={styles.badgesContainer}>
                  <View style={[styles.badge, { backgroundColor: getRoleColor(user.role, isDark) }]}>
                    <Text style={styles.badgeText}>{user.role}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(user.status, isDark) }]}>
                    <Text style={styles.badgeText}>{user.status}</Text>
                  </View>
                  {user.reportCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: isDark ? '#EF444430' : '#EF444420' }]}>
                      <Text style={styles.badgeText}>{user.reportCount} reports</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </GuardedPressable>
        ))}

        {users.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: Colors.icon }]}>
              No users found
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedUser}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        {selectedUser && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: Colors.text }]}>User Details</Text>
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
                      <View style={styles.userDetailHeader}>
                        {selectedUser.avatarUrl ? (
                          <Image source={{ uri: selectedUser.avatarUrl }} style={styles.largeAvatar} />
                        ) : (
                          <View style={[styles.largeAvatar, { backgroundColor: Colors.primary + '20' }]}>
                            <Ionicons name="person-outline" size={40} color={Colors.primary} />
                          </View>
                        )}
                        <View>
                          <Text style={[styles.userDetailName, { color: Colors.text }]}>
                            {selectedUser.name}
                          </Text>
                          <Text style={[styles.userDetailUsername, { color: Colors.icon }]}>
                            @{selectedUser.username}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Email</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {selectedUser.email}
                      </Text>
                    </View>

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Role</Text>
                      <View style={[styles.badge, { backgroundColor: getRoleColor(selectedUser.role, isDark) }]}>
                        <Text style={styles.badgeText}>{selectedUser.role}</Text>
                      </View>
                    </View>

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Status</Text>
                      <View style={[styles.badge, { backgroundColor: getStatusColor(selectedUser.status, isDark) }]}>
                        <Text style={styles.badgeText}>{selectedUser.status}</Text>
                      </View>
                    </View>

                    {selectedUser.bio && (
                      <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                        <Text style={[styles.detailLabel, { color: Colors.icon }]}>Bio</Text>
                        <Text style={[styles.detailValue, { color: Colors.text }]}>
                          {selectedUser.bio}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Joined</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {formatDate(selectedUser.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={[styles.detailLabel, { color: Colors.icon }]}>Reports ({selectedUser.reports.length})</Text>
                      {selectedUser.reports.length > 0 ? (
                        selectedUser.reports.map((report) => (
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
                          No reports against this user
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>

              {!detailLoading && (
                <View style={styles.modalActions}>
                  {selectedUser.status === 'active' && (
                    <>
                      <GuardedPressable
                        style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleUpdateUserStatus('suspended')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.actionButtonText}>Suspend</Text>
                        )}
                      </GuardedPressable>
                      <GuardedPressable
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleUpdateUserStatus('banned')}
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionButtonText}>Ban</Text>
                      </GuardedPressable>
                    </>
                  )}
                  {selectedUser.status === 'suspended' && (
                    <>
                      <GuardedPressable
                        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                        onPress={() => handleUpdateUserStatus('active')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.actionButtonText}>Reactivate</Text>
                        )}
                      </GuardedPressable>
                      <GuardedPressable
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleUpdateUserStatus('banned')}
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionButtonText}>Ban</Text>
                      </GuardedPressable>
                    </>
                  )}
                  {selectedUser.status === 'banned' && (
                    <GuardedPressable
                      style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                      onPress={() => handleUpdateUserStatus('active')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  usersList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  userCard: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
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
  userDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  largeAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetailName: {
    fontSize: 20,
    fontWeight: '600',
  },
  userDetailUsername: {
    fontSize: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
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
