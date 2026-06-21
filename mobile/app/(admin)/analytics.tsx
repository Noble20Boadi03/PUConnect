import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks';
import { Spacing } from '../../constants';
import { adminService, AnalyticsData } from '../../services/adminService';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const Colors = useThemeColor();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? '#09090B' : '#F4F4F5';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setError(error.message || 'Failed to fetch analytics. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderStatCard = (title: string, value: number, color: string) => (
    <View style={[styles.statCard, { backgroundColor: cardBg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: Colors.icon }]}>{title}</Text>
    </View>
  );

  const SimpleBarChart = ({ data, title, color }: { data: { date: string; count: number }[], title: string, color: string }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    return (
      <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: Colors.text }]}>{title}</Text>
        <View style={styles.chartContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height: `${(item.count / maxCount) * 100}%`, backgroundColor: color }]} />
            </View>
          ))}
        </View>
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

  if (error && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Analytics</Text>
          <TouchableOpacity 
            style={[styles.switchButton, { backgroundColor: Colors.primary + '15' }]}
            onPress={() => router.replace('/(tabs)/market')}
          >
            <Ionicons name="apps-outline" size={16} color={Colors.primary} />
            <Text style={[styles.switchButtonText, { color: Colors.primary }]}>User Module</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={[styles.errorText, { color: Colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            onPress={fetchAnalytics}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Analytics</Text>
        <TouchableOpacity 
          style={[styles.switchButton, { backgroundColor: Colors.primary + '15' }]}
          onPress={() => router.replace('/(tabs)/market')}
        >
          <Ionicons name="apps-outline" size={16} color={Colors.primary} />
          <Text style={[styles.switchButtonText, { color: Colors.primary }]}>User Module</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Users Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Users</Text>
          <View style={styles.statsRow}>
            {renderStatCard('Total Users', analytics?.totalUsers || 0, Colors.primary)}
            {renderStatCard('Providers', analytics?.providerCount || 0, '#10B981')}
            {renderStatCard('Non-Providers', analytics?.nonProviderCount || 0, '#3B82F6')}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard('Active (7d)', analytics?.activeUsers7d || 0, '#F59E0B')}
            {renderStatCard('Active (30d)', analytics?.activeUsers30d || 0, '#8B5CF6')}
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Posts</Text>
          <View style={styles.statsRow}>
            {renderStatCard('Total Posts', analytics?.totalPosts || 0, Colors.primary)}
            {renderStatCard('Services', analytics?.servicePostCount || 0, '#10B981')}
            {renderStatCard('Requests', analytics?.requestPostCount || 0, '#F59E0B')}
          </View>
        </View>

        {/* Service Requests Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Service Requests</Text>
          <View style={styles.statsRow}>
            {renderStatCard('Pending', analytics?.serviceRequestsByStatus?.pending || 0, '#F59E0B')}
            {renderStatCard('Active', analytics?.serviceRequestsByStatus?.active || 0, '#3B82F6')}
            {renderStatCard('Pending Review', analytics?.serviceRequestsByStatus?.pending_review || 0, '#8B5CF6')}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard('Completed', analytics?.serviceRequestsByStatus?.completed || 0, '#10B981')}
            {renderStatCard('Cancelled', analytics?.serviceRequestsByStatus?.cancelled || 0, '#6B7280')}
            {renderStatCard('Declined', analytics?.serviceRequestsByStatus?.declined || 0, '#EF4444')}
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Reviews</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardBg, flex: 1 }]}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {analytics?.averageReviewRating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={[styles.statLabel, { color: Colors.icon }]}>Average Rating</Text>
            </View>
          </View>
        </View>

        {/* Reports Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Reports</Text>
          <View style={styles.statsRow}>
            {renderStatCard('Total Reports', analytics?.totalReports || 0, Colors.primary)}
            {renderStatCard('Pending', analytics?.reportsByStatus?.pending || 0, '#F59E0B')}
            {renderStatCard('Reviewed', analytics?.reportsByStatus?.reviewed || 0, '#3B82F6')}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard('Dismissed', analytics?.reportsByStatus?.dismissed || 0, '#6B7280')}
            {renderStatCard('Actioned', analytics?.reportsByStatus?.actioned || 0, '#10B981')}
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Trends</Text>
          {analytics && (
            <>
              <SimpleBarChart data={analytics.signupsLast30Days} title="Signups (Last 30 Days)" color={Colors.primary} />
              <SimpleBarChart data={analytics.reportsLast30Days} title="Reports (Last 30 Days)" color="#EF4444" />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
});
