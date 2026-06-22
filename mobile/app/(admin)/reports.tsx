import React, { useCallback, useState, useMemo } from 'react';
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
  FlatList
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks';
import { Spacing } from '../../constants';
import { GuardedPressable } from '../../components/GuardedPressable';
import { adminService, Report } from '../../services/adminService';

const STATUS_FILTERS: ('all' | 'pending' | 'reviewed' | 'dismissed' | 'actioned')[] = [
  'all',
  'pending',
  'reviewed',
  'dismissed',
  'actioned'
];

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const subtleBg = isDark ? '#1E1E21' : '#F0F0F2';
  const divider = isDark ? '#30363D' : '#E1E4E8';

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'reviewed' | 'dismissed' | 'actioned'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReports = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      const response = await adminService.getReports(undefined, page);
      if (page === 1) {
        setReports(response.data);
      } else {
        setReports(prev => [...prev, ...response.data]);
      }
      setHasMore(page < response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      fetchReports(1);
    }, [fetchReports])
  );

  const filteredReports = useMemo(() => {
    return reports.filter(r => selectedFilter === 'all' || r.status === selectedFilter);
  }, [reports, selectedFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchReports(1, true);
  }, [fetchReports]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchReports(currentPage + 1);
    }
  }, [hasMore, loadingMore, currentPage, fetchReports]);

  const handleReportPress = (report: Report) => {
    setSelectedReport(report);
  };

  const closeDetailModal = () => {
    setSelectedReport(null);
  };

  const handleUpdateReportStatus = async (status: string) => {
    if (!selectedReport) return;
    try {
      setActionLoading(true);
      await adminService.updateReportStatus(selectedReport.id, status);
      await fetchReports(1, true);
      closeDetailModal();
    } catch (error) {
      console.error('Failed to update report status:', error);
      Alert.alert('Error', 'Failed to update report status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeAction = async () => {
    if (!selectedReport) return;
    if (!selectedReport.target) {
      Alert.alert('Cannot take action', 'The target of this report no longer exists.');
      return;
    }
    try {
      setActionLoading(true);
      if (selectedReport.targetType === 'user') {
        await adminService.updateUserStatus(selectedReport.targetId, 'suspended');
      } else if (selectedReport.targetType === 'post') {
        await adminService.updatePostStatus(selectedReport.targetId, 'removed_by_admin');
      }
      await adminService.updateReportStatus(selectedReport.id, 'actioned');
      await fetchReports(1, true);
      closeDetailModal();
    } catch (error) {
      console.error('Failed to take action:', error);
      Alert.alert('Error', 'Failed to take action');
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

  const getTargetName = (report: Report) => {
    if (!report.target) return 'Content/user no longer exists';
    if (report.targetType === 'user') {
      return (report.target as any).username || (report.target as any).name;
    } else {
      return (report.target as any).title;
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <GuardedPressable
      style={[styles.reportCard, { backgroundColor: cardBg }]}
      onPress={() => handleReportPress(item)}
      activeOpacity={0.85}
    >
      <View style={styles.reportHeader}>
        <View style={[styles.targetIcon, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons
            name={item.targetType === 'user' ? 'person-outline' : 'newspaper-outline'}
            size={20}
            color={Colors.primary}
          />
        </View>
        <View style={styles.reportInfo}>
          <Text style={[styles.targetName, { color: Colors.text }]}>
            {getTargetName(item)}
          </Text>
          <Text style={[styles.reason, { color: Colors.text }]}>
            {item.reason.replace('_', ' ')}
          </Text>
          <Text style={[styles.reporter, { color: Colors.icon }]}>
            Reported by {item.reporter.name} • {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, isDark) }]}>
          <Text style={styles.statusBadgeText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </GuardedPressable>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
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
        <Text style={[styles.title, { color: Colors.text }]}>Reports</Text>
        <TouchableOpacity 
          style={[styles.switchButton, { backgroundColor: Colors.primary + '15' }]}
          onPress={() => router.replace('/(tabs)/market')}
        >
          <Ionicons name="apps-outline" size={16} color={Colors.primary} />
          <Text style={[styles.switchButtonText, { color: Colors.primary }]}>User Module</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === filter ? Colors.primary : subtleBg,
                borderColor: selectedFilter === filter ? Colors.primary : divider
              }
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: selectedFilter === filter ? '#FFFFFF' : Colors.text }
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        style={styles.reportsList}
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: Colors.icon }]}>
              No reports found
            </Text>
          </View>
        }
      />

      <Modal
        visible={!!selectedReport}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        {selectedReport && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: Colors.text }]}>Report Details</Text>
                <GuardedPressable onPress={closeDetailModal}>
                  <Ionicons name="close" size={24} color={Colors.icon} />
                </GuardedPressable>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                  <Text style={[styles.detailLabel, { color: Colors.icon }]}>Target</Text>
                  <View style={styles.targetDetail}>
                    <View style={[styles.targetIcon, { backgroundColor: Colors.primary + '20' }]}>
                      <Ionicons
                        name={selectedReport.targetType === 'user' ? 'person-outline' : 'newspaper-outline'}
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={[styles.detailValue, { color: Colors.text }]}>
                      {getTargetName(selectedReport)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                  <Text style={[styles.detailLabel, { color: Colors.icon }]}>Reason</Text>
                  <Text style={[styles.detailValue, { color: Colors.text }]}>
                    {selectedReport.reason.replace('_', ' ')}
                  </Text>
                </View>

                {selectedReport.description && (
                  <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                    <Text style={[styles.detailLabel, { color: Colors.icon }]}>Description</Text>
                    <Text style={[styles.detailValue, { color: Colors.text }]}>
                      {selectedReport.description}
                    </Text>
                  </View>
                )}

                <View style={[styles.detailSection, { borderBottomColor: divider }]}>
                  <Text style={[styles.detailLabel, { color: Colors.icon }]}>Reported By</Text>
                  <Text style={[styles.detailValue, { color: Colors.text }]}>
                    {selectedReport.reporter.name} (@{selectedReport.reporter.username})
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: Colors.icon }]}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status, isDark) }]}>
                    <Text style={styles.statusBadgeText}>
                      {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                {selectedReport.status === 'pending' && (
                  <>
                    {selectedReport.target && (
                      <GuardedPressable
                        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                        onPress={() => handleTakeAction()}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.actionButtonText}>Take Action</Text>
                        )}
                      </GuardedPressable>
                    )}
                    <GuardedPressable
                      style={[styles.actionButton, styles.secondaryButton, { borderColor: Colors.primary }]}
                      onPress={() => handleUpdateReportStatus('reviewed')}
                      disabled={actionLoading}
                    >
                      <Text style={[styles.secondaryButtonText, { color: Colors.primary }]}>Mark Reviewed</Text>
                    </GuardedPressable>
                    <GuardedPressable
                      style={[styles.actionButton, styles.secondaryButton, { borderColor: Colors.icon }]}
                      onPress={() => handleUpdateReportStatus('dismissed')}
                      disabled={actionLoading}
                    >
                      <Text style={[styles.secondaryButtonText, { color: Colors.icon }]}>Dismiss</Text>
                    </GuardedPressable>
                  </>
                )}
                {selectedReport.status !== 'pending' && (
                  <GuardedPressable
                    style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                    onPress={closeDetailModal}
                  >
                    <Text style={styles.actionButtonText}>Close</Text>
                  </GuardedPressable>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const getStatusColor = (status: string, isDark: boolean) => {
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
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
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
  filterScroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  reportCard: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  targetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    gap: 4,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reason: {
    fontSize: 14,
  },
  reporter: {
    fontSize: 12,
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
  detailSection: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
  },
  targetDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
