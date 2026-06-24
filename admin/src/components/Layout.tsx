import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { AdminTier, AdminSection } from '../types/admin';
import { canAccessSection } from '../hooks/useAdminPermissions';

interface NavItem {
  path: string;
  label: string;
  section: AdminSection;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', section: 'dashboard' },
  { path: '/moderation', label: 'Moderation', section: 'moderation' },
  { path: '/directory', label: 'Directory', section: 'directory' },
  { path: '/content', label: 'Content', section: 'content' },
  { path: '/audit-log', label: 'Audit Log', section: 'dashboard' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const adminTier = user?.adminTier as AdminTier;

  const visibleNavItems = navItems.filter(item => canAccessSection(adminTier, item.section));

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">PUConnect Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {visibleNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}