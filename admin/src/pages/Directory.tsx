import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/DataTable';
import { adminService } from '../services/adminService';
import type { AdminUser } from '../types/admin';

const Directory = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const debounceRef = useRef<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(
        { search, role: roleFilter, status: statusFilter },
        page
      );
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(fetchUsers, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search, roleFilter, statusFilter, page]);

  const columns = [
    {
      key: 'avatar',
      header: 'Avatar',
      render: (u: AdminUser) => (
        <img
          src={u.avatarUrl}
          alt={u.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    { key: 'name', header: 'Name' },
    { key: 'username', header: 'Username' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'reportCount', header: 'Reports' },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: AdminUser) => (
        <button
          onClick={() => navigate(`/directory/${u.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Directory</h1>
        <button
          onClick={() => navigate('/directory/providers')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Provider Queue
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="shadowbanned">Shadowbanned</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onRefresh={fetchUsers}
        onSearch={(query) => setSearch(query)}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default Directory;
