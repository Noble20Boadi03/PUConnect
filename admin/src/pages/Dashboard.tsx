import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import type { DashboardData, AnalyticsData } from '../types/admin';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, analytics] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAnalytics(),
      ]);
      setDashboardData(dashboard);
      setAnalyticsData(analytics);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Users', value: analyticsData?.totalUsers },
          { label: 'Providers', value: analyticsData?.providerCount },
          { label: 'Active Users (7d)', value: analyticsData?.activeUsers7d },
          { label: 'Total Posts', value: analyticsData?.totalPosts },
          { label: 'Avg Review Rating', value: analyticsData?.averageReviewRating.toFixed(1) },
          { label: 'Pending Reports', value: analyticsData?.reportsByStatus.pending },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Pending Reports', value: dashboardData?.pendingReports, route: '/moderation' },
          { label: 'Pending Providers', value: dashboardData?.pendingProviders, route: '/directory/providers' },
          { label: 'Pending Disputes', value: dashboardData?.pendingDisputes, route: '/moderation/disputes' },
          { label: 'Open Feedback', value: dashboardData?.openFeedback, route: '/moderation/feedback' },
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => navigate(action.route)}
            className="bg-white border border-gray-200 rounded-lg p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <p className="text-3xl font-bold text-gray-900">{action.value ?? '—'}</p>
            <p className="text-sm text-gray-500 mt-2">{action.label}</p>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {dashboardData?.recentAuditLogs.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {dashboardData?.recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.admin.name}</p>
                  <p className="text-sm text-gray-600">{log.action}</p>
                </div>
                <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}