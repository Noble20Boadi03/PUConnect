import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { adminService } from '../services/adminService';
import type { Report } from '../types/admin';

const Moderation = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getReports(statusFilter, page);
      setReports(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns = [
    { key: 'targetType', header: 'Target Type' },
    {
      key: 'target',
      header: 'Target',
      render: (report: Report) => {
        if (!report.target) return 'Deleted';
        if (report.targetType === 'user') {
          return (report.target as any).name || (report.target as any).username;
        } else {
          return (report.target as any).title;
        }
      },
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'reporter',
      header: 'Reporter',
      render: (report: Report) => report.reporter.name || report.reporter.username,
    },
    { key: 'status', header: 'Status' },
    {
      key: 'createdAt',
      header: 'Created',
      render: (report: Report) => new Date(report.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (report: Report) => (
        <button
          onClick={() => navigate(`/moderation/${report.id}`)}
          className="link-action"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Review and action user reports</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/moderation/triage')} className="btn-secondary">
            Rapid Triage
          </button>
          <button onClick={() => navigate('/moderation/disputes')} className="btn-primary">
            Disputes
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Status Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="select-field"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
          <option value="actioned">Actioned</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        onRefresh={fetchReports}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default Moderation;
