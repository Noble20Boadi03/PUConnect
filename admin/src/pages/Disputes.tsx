import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { adminService } from '../services/adminService';
import type { DisputeSummary } from '../types/admin';

const Disputes = () => {
  const [disputes, setDisputes] = useState<DisputeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const navigate = useNavigate();

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getDisputes({ status: statusFilter }, page);
      setDisputes(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'requester',
      header: 'Requester',
      render: (d: DisputeSummary) => d.requester.name || d.requester.username,
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (d: DisputeSummary) => d.provider.name || d.provider.username,
    },
    {
      key: 'post',
      header: 'Service',
      render: (d: DisputeSummary) => d.post?.title || 'N/A',
    },
    { key: 'status', header: 'Status' },
    {
      key: 'completionRequestedAt',
      header: 'Requested At',
      render: (d: DisputeSummary) =>
        d.completionRequestedAt ? new Date(d.completionRequestedAt).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d: DisputeSummary) => (
        <button
          onClick={() => navigate(`/moderation/dispute/${d.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View
        </button>
      ),
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'declined', label: 'Declined' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/moderation')}
          className="text-gray-600 hover:text-gray-800"
        >
          &larr; Back to Moderation
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={disputes}
        loading={loading}
        onRefresh={fetchDisputes}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default Disputes;
