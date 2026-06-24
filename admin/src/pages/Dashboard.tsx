import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import type { DashboardData, AnalyticsData } from '../types/admin';
import { StatCard } from '../components/ui/StatCard';
import { BarChart } from '../components/charts/BarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { LineChart } from '../components/charts/LineChart';
import {
  IconUsersGroup,
  IconUsers,
  IconStar,
  IconAlert,
  IconDocument,
  IconRefresh,
  IconShield,
  IconClipboard,
} from '../components/ui/Icons';

function aggregateByWeek(data: { date: string; count: number }[]) {
  const weeks: { label: string; value: number }[] = [];
  const chunkSize = 7;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const total = chunk.reduce((sum, d) => sum + d.count, 0);
    const start = new Date(chunk[0].date);
    weeks.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      value: total,
    });
  }
  return weeks.slice(-5);
}

function formatChartDates(data: { date: string; count: number }[]) {
  return data.map((d) => ({
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: d.count,
  }));
}

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

  const signupWeeks = useMemo(
    () => (analyticsData ? aggregateByWeek(analyticsData.signupsLast30Days) : []),
    [analyticsData],
  );

  const reportTrend = useMemo(
    () => (analyticsData ? formatChartDates(analyticsData.reportsLast30Days) : []),
    [analyticsData],
  );

  const reportSegments = useMemo(() => {
    if (!analyticsData) return [];
    const { reportsByStatus } = analyticsData;
    return [
      { label: 'Pending', value: reportsByStatus.pending, color: '#f59e0b' },
      { label: 'Reviewed', value: reportsByStatus.reviewed, color: '#3b82f6' },
      { label: 'Dismissed', value: reportsByStatus.dismissed, color: '#94a3b8' },
      { label: 'Actioned', value: reportsByStatus.actioned, color: '#047857' },
    ].filter((s) => s.value > 0);
  }, [analyticsData]);

  const postSegments = useMemo(() => {
    if (!analyticsData) return [];
    return [
      { label: 'Service Posts', value: analyticsData.servicePostCount, color: '#065f46' },
      { label: 'Request Posts', value: analyticsData.requestPostCount, color: '#34d399' },
    ].filter((s) => s.value > 0);
  }, [analyticsData]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchData} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const quickActions = [
    {
      label: 'Pending Reports',
      value: dashboardData?.pendingReports ?? 0,
      route: '/moderation',
      icon: <IconShield className="w-5 h-5" />,
    },
    {
      label: 'Pending Providers',
      value: dashboardData?.pendingProviders ?? 0,
      route: '/directory/providers',
      icon: <IconUsers className="w-5 h-5" />,
    },
    {
      label: 'Pending Disputes',
      value: dashboardData?.pendingDisputes ?? 0,
      route: '/moderation/disputes',
      icon: <IconAlert className="w-5 h-5" />,
    },
    {
      label: 'Open Feedback',
      value: dashboardData?.openFeedback ?? 0,
      route: '/moderation/feedback',
      icon: <IconClipboard className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform metrics at a glance</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <IconRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Users"
          value={analyticsData?.totalUsers ?? '—'}
          icon={<IconUsersGroup className="w-5 h-5" />}
        />
        <StatCard
          label="Providers"
          value={analyticsData?.providerCount ?? '—'}
          icon={<IconUsers className="w-5 h-5" />}
        />
        <StatCard
          label="Active (7d)"
          value={analyticsData?.activeUsers7d ?? '—'}
          icon={<IconUsersGroup className="w-5 h-5" />}
          trend={
            analyticsData
              ? {
                  value: `${analyticsData.activeUsers30d} in 30d`,
                  positive: true,
                }
              : undefined
          }
        />
        <StatCard
          label="Total Posts"
          value={analyticsData?.totalPosts ?? '—'}
          icon={<IconDocument className="w-5 h-5" />}
        />
        <StatCard
          label="Avg Rating"
          value={analyticsData ? analyticsData.averageReviewRating.toFixed(1) : '—'}
          icon={<IconStar className="w-5 h-5" />}
        />
        <StatCard
          label="Pending Reports"
          value={analyticsData?.reportsByStatus.pending ?? '—'}
          icon={<IconAlert className="w-5 h-5" />}
          variant="highlight"
          onClick={() => navigate('/moderation')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">Weekly Signups</h2>
            <p className="text-sm text-gray-500">New user registrations over the last 30 days</p>
          </div>
          <BarChart data={signupWeeks} />
        </div>

        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">Report Status</h2>
            <p className="text-sm text-gray-500">Breakdown of moderation reports</p>
          </div>
          <DonutChart segments={reportSegments} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">Report Activity</h2>
            <p className="text-sm text-gray-500">Daily reports submitted over the last 30 days</p>
          </div>
          <LineChart data={reportTrend} />
        </div>

        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-900">Post Types</h2>
            <p className="text-sm text-gray-500">Service vs request posts</p>
          </div>
          <DonutChart segments={postSegments} size={140} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Action Queue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.route)}
              className="card p-5 text-left hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  {action.icon}
                </div>
                <span className="text-2xl font-bold text-brand-800 tabular-nums">{action.value}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest admin audit log entries</p>
          </div>
          <button
            onClick={() => navigate('/audit-log')}
            className="text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            View all
          </button>
        </div>
        {!dashboardData?.recentAuditLogs.length ? (
          <p className="px-6 py-8 text-gray-500 text-sm text-center">No recent activity</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {dashboardData.recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-brand-50/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-semibold shrink-0">
                  {log.admin.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.admin.name}</p>
                  <p className="text-sm text-gray-500 truncate">{log.action}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{formatDate(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
