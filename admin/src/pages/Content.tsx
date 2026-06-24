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
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      ),
      render: (post: AdminPost) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(post.id)}
          onChange={() => toggleSelectOne(post.id)}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
      ),
    },
    { key: 'title', header: 'Title' },
    {
      key: 'tag',
      header: 'Tag',
      render: (post: AdminPost) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          post.tag === 'Service' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {post.tag}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (post: AdminPost) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          post.status === 'active' ? 'bg-green-100 text-green-800' :
          post.status === 'locked_by_admin' ? 'bg-yellow-100 text-yellow-800' :
          post.status === 'removed_by_admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
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
            className="text-purple-600 hover:text-purple-800 font-medium"
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
            className="text-purple-600 hover:text-purple-800 font-medium"
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
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select action...</option>
              <option value="active">Set Active</option>
              <option value="locked_by_admin">Lock</option>
              <option value="removed_by_admin">Remove</option>
            </select>
            <button
              onClick={() => bulkStatus && setShowConfirmBulk(true)}
              disabled={!bulkStatus}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
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
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={tagFilter}
          onChange={(e) => {
            setTagFilter(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
