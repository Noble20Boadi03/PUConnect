import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';
import { canBanUsers } from '../hooks/useAdminPermissions';
import type { Report } from '../types/admin';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    action: 'dismiss' | 'remove_content' | 'suspend_user' | null;
  }>({ isOpen: false, action: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReportDetail(id!);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!report || !modal.action) return;
    try {
      setActionLoading(true);
      await adminService.triageReport(report.id, modal.action);
      navigate('/moderation');
    } catch (error) {
      console.error('Failed to triage report:', error);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false, action: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Report not found</div>
      </div>
    );
  }

  const canBan = canBanUsers(user?.adminTier);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/moderation')}
          className="text-gray-600 hover:text-gray-800"
        >
          &larr; Back to Reports
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Report ID</label>
            <p className="text-gray-900">{report.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900 capitalize">{report.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Target Type</label>
            <p className="text-gray-900 capitalize">{report.targetType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-gray-900">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Reason</label>
          <p className="text-gray-900">{report.reason}</p>
        </div>

        {report.description && (
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{report.description}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-500">Reporter</label>
          <p className="text-gray-900">
            {report.reporter.name} ({report.reporter.username})
          </p>
        </div>

        {report.target && (
          <div>
            <label className="text-sm font-medium text-gray-500">Target</label>
            <p className="text-gray-900">
              {report.targetType === 'user'
                ? `${(report.target as any).name} (${(report.target as any).username})`
                : (report.target as any).title}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setModal({ isOpen: true, action: 'dismiss' })}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Dismiss Report
        </button>
        {report.targetType === 'post' && (
          <button
            onClick={() => setModal({ isOpen: true, action: 'remove_content' })}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Remove Content
          </button>
        )}
        {report.targetType === 'user' && canBan && (
          <button
            onClick={() => setModal({ isOpen: true, action: 'suspend_user' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Suspend User
          </button>
        )}
      </div>

      <ConfirmActionModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, action: null })}
        onConfirm={handleAction}
        title={
          modal.action === 'dismiss'
            ? 'Dismiss Report'
            : modal.action === 'remove_content'
            ? 'Remove Content'
            : 'Suspend User'
        }
        message={
          modal.action === 'dismiss'
            ? 'Are you sure you want to dismiss this report?'
            : modal.action === 'remove_content'
            ? 'Are you sure you want to remove this content?'
            : 'Are you sure you want to suspend this user?'
        }
        confirmText="Confirm"
        isLoading={actionLoading}
        variant={modal.action === 'dismiss' ? 'default' : 'danger'}
      />
    </div>
  );
};

export default ReportDetail;
