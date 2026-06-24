import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { ConfirmActionModal } from '../components/ConfirmActionModal';
import { adminService } from '../services/adminService';
import type { AdminPost } from '../types/admin';

const STATUS_MAP: Record<string, string> = {
  active: 'Active',
  hidden_by_owner: 'Hidden by Owner',
  locked_by_admin: 'Locked',
  removed_by_admin: 'Removed',
};

export default function Content() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getPosts(
        { search, tag: tagFilter, status: statusFilter },
        page
      );
      setPosts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter, statusFilter, page]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(fetchPosts, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, tagFilter, statusFilter, page]);

  const handleBulkApply = async () => {
    if (!bulkStatus) return;
    setLoadingBulk(true);
    try {
      await adminService.bulkUpdatePostStatus(selectedIds, bulkStatus);
      setSelectedIds([]);
      setShowConfirmBulk(false);
      setBulkStatus('');
      fetchPosts();
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setLoadingBulk(false);
    }
  };

  const isAllSelected = posts.length > 0 && selectedIds.length === posts.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < posts.length;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(posts.map((p) => p.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isSomeSelected;
          }}
          onChange={toggleSelectAll}
          className="rounded border-surface-border text-brand-700 focus:ring-brand-600"
        />
      ),
      render: (post: AdminPost) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(post.id)}
          onChange={() => toggleSelectOne(post.id)}
          className="rounded border-surface-border text-brand-700 focus:ring-brand-600"
        />
      ),
    },
    { key: 'title', header: 'Title' },
    {
      key: 'tag',
      header: 'Tag',
      render: (post: AdminPost) => (
        <span className={`badge ${post.tag === 'Service' ? 'badge-success' : 'badge-neutral'}`}>
          {post.tag}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (post: AdminPost) => (
        <span className={`badge ${
          post.status === 'active' ? 'badge-success' :
          post.status === 'locked_by_admin' ? 'badge-pending' :
          post.status === 'removed_by_admin' ? 'badge-danger' : 'badge-neutral'
        }`}>
          {STATUS_MAP[post.status] || post.status}
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (post: AdminPost) => post.authorName || post.authorUsername,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (post: AdminPost) => new Date(post.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      render: (post: AdminPost) => {
        const navigate = useNavigate();
        return (
          <button
            onClick={() => navigate(`/content/${post.id}`)}
            className="link-action"
          >
            View
          </button>
        );
      },
    },
  ];

  // Wait, we can't use useNavigate inside render function of column! So let's bring useNavigate up here!
  const navigate = useNavigate();
  const updatedColumns = columns.map(col => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (post: AdminPost) => (
          <button
            onClick={() => navigate(`/content/${post.id}`)}
            className="link-action"
          >
            View
          </button>
        ),
      };
    }
    return col;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Content</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and manage platform posts</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 card px-4 py-2">
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="select-field">
              <option value="">Select action...</option>
              <option value="active">Set Active</option>
              <option value="locked_by_admin">Lock</option>
              <option value="removed_by_admin">Remove</option>
            </select>
            <button
              onClick={() => bulkStatus && setShowConfirmBulk(true)}
              disabled={!bulkStatus}
              className="btn-primary disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input-field max-w-xs"
        />
        <select
          value={tagFilter}
          onChange={(e) => {
            setTagFilter(e.target.value);
            setPage(1);
          }}
          className="select-field"
        >
          <option value="all">All Tags</option>
          <option value="Service">Service</option>
          <option value="Request">Request</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="select-field"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="locked_by_admin">Locked</option>
          <option value="removed_by_admin">Removed</option>
        </select>
      </div>

      <DataTable
        columns={updatedColumns}
        data={posts}
        loading={loading}
        onRefresh={fetchPosts}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

      <ConfirmActionModal
        isOpen={showConfirmBulk}
        onClose={() => setShowConfirmBulk(false)}
        onConfirm={handleBulkApply}
        title="Bulk Update Posts"
        message={`Are you sure you want to update ${selectedIds.length} post${selectedIds.length > 1 ? 's' : ''} to status: ${STATUS_MAP[bulkStatus] || bulkStatus}?`}
        confirmText="Confirm"
        variant={bulkStatus === 'removed_by_admin' ? 'danger' : 'default'}
        isLoading={loadingBulk}
      />
    </div>
  );
}
