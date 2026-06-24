import { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from '../components/DataTable';
import adminService from '../services/adminService';
import type { AuditLog } from '../types/admin';

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const debounceRef = useRef<number | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAuditLogs(
        {
          action: actionFilter || undefined,
          targetType: targetTypeFilter || undefined,
        },
        page,
        20
      );
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, targetTypeFilter]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(fetchLogs, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [fetchLogs]);

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log: AuditLog) => new Date(log.createdAt).toLocaleString(),
    },
    {
      key: 'admin',
      header: 'Admin',
      render: (log: AuditLog) => (
        <div>
          <div className="font-medium text-gray-900">{log.admin.name}</div>
          <div className="text-sm text-gray-500">@{log.admin.username}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
          {log.action}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      render: (log: AuditLog) => (
        <div>
          <div className="font-medium text-gray-900">{log.targetType}</div>
          <div className="text-sm text-gray-500">ID: {log.targetId}</div>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (log: AuditLog) => (
        <div className="text-sm text-gray-600">
          {log.fromValue && log.toValue ? (
            <div>
              Changed from <span className="text-red-600">{log.fromValue}</span> to{' '}
              <span className="text-green-600">{log.toValue}</span>
            </div>
          ) : log.reason ? (
            log.reason
          ) : (
            '-'
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600">Full audit trail of admin actions</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Actions</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Type
            </label>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Targets</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        onRefresh={fetchLogs}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
