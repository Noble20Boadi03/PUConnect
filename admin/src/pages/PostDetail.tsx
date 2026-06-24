import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import type { AdminPostDetail } from '../types/admin';
import { ConfirmActionModal } from '../components/ConfirmActionModal';

const STATUS_MAP: Record<string, string> = {
  active: 'Active',
  hidden_by_owner: 'Hidden by Owner',
  locked_by_admin: 'Locked',
  removed_by_admin: 'Removed',
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminService.getPostDetail(id);
      setPost(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
    } catch (error) {
      console.error('Error fetching post detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleSaveContent = async () => {
    if (!post) return;
    setSaving(true);
    try {
      await adminService.updatePostContent(post.id, {
        title: editTitle,
        description: editDescription,
      });
      setIsEditing(false);
      fetchPost();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLockPost = async () => {
    if (!post) return;
    setLoadingAction(true);
    try {
      await adminService.updatePostStatus(post.id, 'locked_by_admin');
      setShowLockConfirm(false);
      fetchPost();
    } catch (error) {
      console.error('Error locking post:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemovePost = async () => {
    if (!post) return;
    setLoadingAction(true);
    try {
      await adminService.updatePostStatus(post.id, 'removed_by_admin');
      setShowRemoveConfirm(false);
      fetchPost();
    } catch (error) {
      console.error('Error removing post:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">Post not found.</p>
        <button onClick={() => navigate('/content')} className="link-action">
          Back to Content
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/content')} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Post Detail</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-500">@{post.author.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              post.tag === 'Service' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {post.tag}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              post.status === 'active' ? 'bg-green-100 text-green-800' :
              post.status === 'locked_by_admin' ? 'bg-yellow-100 text-yellow-800' :
              post.status === 'removed_by_admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {STATUS_MAP[post.status]}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input-field text-xl font-semibold"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={6}
              className="input-field"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveContent}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(post.title);
                  setEditDescription(post.description);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
          </div>
        )}

        {post.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {post.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Post image ${idx + 1}`} className="rounded-lg object-cover h-32 w-full" />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {post.hashtags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#{tag}</span>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              Edit Content
            </button>
          )}
          {post.status !== 'locked_by_admin' && (
            <button
              onClick={() => setShowLockConfirm(true)}
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200"
            >
              Lock Post
            </button>
          )}
          {post.status !== 'removed_by_admin' && (
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium hover:bg-red-200"
            >
              Remove Post
            </button>
          )}
        </div>
      </div>

      {post.reports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports ({post.reports.length})</h3>
          <div className="space-y-4">
            {post.reports.map((report) => (
              <div key={report.id} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={report.reporter.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-gray-900">{report.reporter.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'actioned' ? 'bg-green-100 text-green-800' :
                    report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
                <p className="mt-2 text-gray-700">{report.reason}</p>
                {report.description && (
                  <p className="text-gray-600 italic">{report.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        onConfirm={handleLockPost}
        title="Lock Post"
        message="Are you sure you want to lock this post?"
        confirmText="Lock Post"
        variant="default"
        isLoading={loadingAction}
      />

      <ConfirmActionModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemovePost}
        title="Remove Post"
        message="Are you sure you want to remove this post?"
        confirmText="Remove Post"
        variant="danger"
        isLoading={loadingAction}
      />
    </div>
  );
}
