import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { adminService } from '../services/adminService';
import type { DisputeDetail as DisputeDetailType } from '../types/admin';

const DisputeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState<DisputeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    resolution: 'complete' | 'cancel' | 'resume' | null;
  }>({ isOpen: false, resolution: null });

  const fetchDispute = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminService.getDisputeDetail(id);
      setDispute(data);
    } catch (error) {
      console.error('Failed to fetch dispute:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  const handleResolve = async () => {
    if (!id || !modal.resolution) return;
    try {
      setActionLoading(true);
      await adminService.resolveDispute(id, modal.resolution);
      await fetchDispute(); // Refetch to show updated status
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false, resolution: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Dispute not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/moderation/disputes')}
          className="text-gray-600 hover:text-gray-800"
        >
          &larr; Back to Disputes
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Dispute Detail</h1>
      </div>

      {/* Dispute Summary */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900 capitalize">{dispute.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Requested At</label>
            <p className="text-gray-900">
              {dispute.completionRequestedAt
                ? new Date(dispute.completionRequestedAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Requester</label>
            <p className="text-gray-900">
              {dispute.requester.name} ({dispute.requester.username})
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Provider</label>
            <p className="text-gray-900">
              {dispute.provider.name} ({dispute.provider.username})
            </p>
          </div>
        </div>

        {dispute.post && (
          <div>
            <label className="text-sm font-medium text-gray-500">Service</label>
            <p className="text-gray-900">{dispute.post.title}</p>
          </div>
        )}

        {dispute.message && (
          <div>
            <label className="text-sm font-medium text-gray-500">Message</label>
            <p className="text-gray-900">{dispute.message}</p>
          </div>
        )}
      </div>

      {/* Chat History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat History</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {dispute.messages.map((msg) => (
            <div key={msg.id} className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {msg.sender.name} ({msg.sender.username})
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-gray-700 mt-1">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setModal({ isOpen: true, resolution: 'complete' })}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Mark Complete
        </button>
        <button
          onClick={() => setModal({ isOpen: true, resolution: 'cancel' })}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Cancel Request
        </button>
        <button
          onClick={() => setModal({ isOpen: true, resolution: 'resume' })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Resume Active
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, resolution: null })}
        onConfirm={handleResolve}
        title={
          modal.resolution === 'complete'
            ? 'Mark Complete'
            : modal.resolution === 'cancel'
            ? 'Cancel Request'
            : 'Resume Active'
        }
        message={
          modal.resolution === 'complete'
            ? 'Mark this service request as completed?'
            : modal.resolution === 'cancel'
            ? 'Cancel this service request?'
            : 'Resume this service request as active?'
        }
        confirmText="Confirm"
        isLoading={actionLoading}
        variant={modal.resolution === 'cancel' ? 'danger' : 'default'}
      />
    </div>
  );
};

export default DisputeDetail;
