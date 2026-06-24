import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { AdminTier, AdminSection } from '../types/admin';
import { canAccessSection } from '../hooks/useAdminPermissions';
import {
  IconDashboard,
  IconShield,
  IconUsers,
  IconDocument,
  IconClipboard,
  IconLogout,
} from './ui/Icons';

interface NavItem {
  path: string;
  label: string;
  section: AdminSection;
  icon: React.ReactNode;
  group: 'main' | 'other';
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', section: 'dashboard', icon: <IconDashboard />, group: 'main' },
  { path: '/moderation', label: 'Moderation', section: 'moderation', icon: <IconShield />, group: 'main' },
  { path: '/directory', label: 'Directory', section: 'directory', icon: <IconUsers />, group: 'main' },
  { path: '/content', label: 'Content', section: 'content', icon: <IconDocument />, group: 'main' },
  { path: '/audit-log', label: 'Audit Log', section: 'dashboard', icon: <IconClipboard />, group: 'other' },
];

const pageDescriptions: Record<string, string> = {
  '/dashboard': 'Overview of platform health and activity',
  '/moderation': 'Review reports, disputes, and feedback',
  '/directory': 'Manage users and provider applications',
  '/content': 'Browse and moderate posts',
  '/audit-log': 'Track admin actions across the platform',
};

function getPageDescription(pathname: string): string {
  const base = pathname.split('/').slice(0, 2).join('/') || pathname;
  if (pageDescriptions[pathname]) return pageDescriptions[pathname];
  if (pageDescriptions[base]) return pageDescriptions[base];
  return 'PUConnect administration';
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const adminTier = user?.adminTier as AdminTier;
  const location = useLocation();

  const visibleNavItems = navItems.filter((item) => canAccessSection(adminTier, item.section));
  const mainItems = visibleNavItems.filter((i) => i.group === 'main');
  const otherItems = visibleNavItems.filter((i) => i.group === 'other');

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'A';

  const renderNavGroup = (label: string, items: NavItem[]) =>
    items.length > 0 && (
      <div className="mb-6">
        <p className="section-label px-3 mb-2">{label}</p>
        <div className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-surface-muted">
      <aside className="w-64 bg-white border-r border-surface-border flex flex-col shrink-0">
        <div className="p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PU</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight">PUConnect</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {renderNavGroup('Main Menu', mainItems)}
          {renderNavGroup('Others', otherItems)}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{adminTier?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-surface-border px-8 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome, {firstName}!</h2>
            <p className="text-sm text-gray-500 mt-0.5">{getPageDescription(location.pathname)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-medium capitalize">
              {adminTier?.replace('_', ' ')}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <IconLogout className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
