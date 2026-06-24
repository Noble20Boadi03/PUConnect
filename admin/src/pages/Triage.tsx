import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';
import { canBanUsers } from '../hooks/useAdminPermissions';
import type { Report } from '../types/admin';

const Triage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    action: 'dismiss' | 'remove_content' | 'suspend_user' | null;
  }>({ isOpen: false, action: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getReports('pending', 1, 100);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch pending reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingReports();
  }, [fetchPendingReports]);

  const handleAction = async () => {
    const currentReport = reports[currentIndex];
    if (!currentReport || !modal.action) return;
    try {
      setActionLoading(true);
      await adminService.triageReport(currentReport.id, modal.action);
      setReports((prev) => prev.filter((_, i) => i !== currentIndex));
      setModal({ isOpen: false, action: null });
    } catch (error) {
      console.error('Failed to triage report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const currentReport = reports[currentIndex];
  const canBan = canBanUsers(user?.adminTier);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/moderation')}
            className="text-gray-600 hover:text-gray-800"
          >
            &larr; Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Rapid Triage</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No pending reports</h2>
          <p className="text-gray-500">Great job! All reports have been triaged.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/moderation')}
            className="text-gray-600 hover:text-gray-800"
          >
            &larr; Back to Reports
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Rapid Triage</h1>
        </div>
        <div className="text-gray-600">
          {currentIndex + 1} of {reports.length} remaining
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Target Type</label>
            <p className="text-gray-900 capitalize">{currentReport.targetType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-gray-900">{new Date(currentReport.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Reason</label>
          <p className="text-gray-900">{currentReport.reason}</p>
        </div>

        {currentReport.description && (
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{currentReport.description}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-500">Reporter</label>
          <p className="text-gray-900">
            {currentReport.reporter.name} ({currentReport.reporter.username})
          </p>
        </div>

        {currentReport.target && (
          <div>
            <label className="text-sm font-medium text-gray-500">Target</label>
            <p className="text-gray-900">
              {currentReport.targetType === 'user'
                ? `${(currentReport.target as any).name} (${(currentReport.target as any).username})`
                : (currentReport.target as any).title}
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
        {currentReport.targetType === 'post' && (
          <button
            onClick={() => setModal({ isOpen: true, action: 'remove_content' })}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Remove Content
          </button>
        )}
        {currentReport.targetType === 'user' && canBan && (
          <button
            onClick={() => setModal({ isOpen: true, action: 'suspend_user' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Suspend User
          </button>
        )}
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % reports.length)}
          className="btn-primary"
        >
          Skip
        </button>
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

export default Triage;
