import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';
import { canBanUsers } from '../hooks/useAdminPermissions';
import type { AdminUserDetail } from '../types/admin';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    action: 'warn' | 'status' | 'tier';
    status?: string;
    tier?: string | null;
  }>({ isOpen: false, action: 'warn' });

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminService.getUserDetail(id);
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleWarn = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await adminService.warnUser(id, warningMessage);
      setWarningMessage('');
      await fetchUser();
    } catch (error) {
      console.error('Failed to warn user:', error);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false, action: 'warn' });
    }
  };

  const handleStatusChange = async () => {
    if (!id || !modal.status) return;
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(id, modal.status);
      await fetchUser();
    } catch (error) {
      console.error('Failed to update user status:', error);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false, action: 'status' });
    }
  };

  const handleTierChange = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await adminService.updateAdminTier(id, modal.tier ?? null);
      await fetchUser();
    } catch (error) {
      console.error('Failed to update admin tier:', error);
    } finally {
      setActionLoading(false);
      setModal({ isOpen: false, action: 'tier' });
    }
  };

  const canModifyStatus = canBanUsers(currentUser?.adminTier);
  const isSuperAdmin = currentUser?.adminTier === 'super_admin';
  const isOwnAccount = currentUser?.id === id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/directory')}
          className="text-gray-600 hover:text-gray-800"
        >
          &larr; Back to Directory
        </button>
        <h1 className="text-2xl font-bold text-gray-900">User Detail</h1>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900 capitalize">{user.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900 capitalize">{user.status}</p>
          </div>
          {user.adminTier && (
            <div>
              <label className="text-sm font-medium text-gray-500">Admin Tier</label>
              <p className="text-gray-900 capitalize">{user.adminTier}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {user.bio && (
          <div>
            <label className="text-sm font-medium text-gray-500">Bio</label>
            <p className="text-gray-900">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Send Warning */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Official Warning</h3>
        <div className="flex gap-3">
          <textarea
            placeholder="Enter warning message..."
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <button
            onClick={() => setModal({ isOpen: true, action: 'warn' })}
            disabled={!warningMessage.trim()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
          >
            Send Warning
          </button>
        </div>
      </div>

      {/* Account Actions */}
      {canModifyStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="flex flex-wrap gap-3">
            {['active', 'shadowbanned', 'suspended', 'banned'].map((status) => (
              <button
                key={status}
                onClick={() => setModal({ isOpen: true, action: 'status', status })}
                className={`px-4 py-2 rounded-lg transition ${
                  status === 'active'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : status === 'shadowbanned'
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : status === 'suspended' || status === 'banned'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : ''
                }`}
              >
                Set {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Admin Role Assignment */}
      {isSuperAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Role Assignment</h3>
          <div className="flex items-center gap-3">
            <select
              value={user.adminTier || ''}
              onChange={(e) =>
                setModal({
                  isOpen: true,
                  action: 'tier',
                  tier: e.target.value || null,
                })
              }
              disabled={isOwnAccount}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">No Admin Tier</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
            </select>
            {isOwnAccount && (
              <p className="text-gray-500 text-sm">You can't change your own admin tier</p>
            )}
          </div>
        </div>
      )}

      {/* Reports Against User */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Against User</h3>
        {user.reports.length === 0 ? (
          <p className="text-gray-500">No reports</p>
        ) : (
          <div className="space-y-3">
            {user.reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {report.reason}
                  </p>
                  <span className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {report.description && (
                  <p className="text-gray-600 mt-1">{report.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, action: 'warn' })}
        onConfirm={
          modal.action === 'warn'
            ? handleWarn
            : modal.action === 'status'
            ? handleStatusChange
            : handleTierChange
        }
        title={
          modal.action === 'warn'
            ? 'Send Warning'
            : modal.action === 'status'
            ? 'Update Status'
            : 'Update Admin Tier'
        }
        message={
          modal.action === 'warn'
            ? 'Are you sure you want to send this warning?'
            : modal.action === 'status'
            ? `Are you sure you want to set status to ${modal.status}?`
            : `Are you sure you want to set admin tier to ${modal.tier || 'none'}?`
        }
        confirmText="Confirm"
        isLoading={actionLoading}
        variant={
          modal.action === 'status' &&
          (modal.status === 'suspended' || modal.status === 'banned')
            ? 'danger'
            : 'default'
        }
      />
    </div>
  );
};

export default UserDetail;
