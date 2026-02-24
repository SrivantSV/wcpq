import { Menu, Bell, Search } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/job-orders': 'Job Orders',
  '/approvals': 'Approvals',
  '/execution': 'Execution',
  '/finance': 'Finance & Invoices',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/settings/company': 'Company Profile',
  '/settings/users': 'Users & Roles',
  '/settings/rate-cards': 'Rate Cards',
  '/settings/overhead-rates': 'Overhead Rates',
  '/settings/tax': 'Tax Configuration',
  '/settings/clients': 'Client Master',
  '/settings/vendors': 'Vendor Master',
  '/settings/staff': 'Staff Master',
  '/settings/materials': 'Material Price Book',
};

export function TopBar() {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const title =
    PAGE_TITLES[location.pathname] ||
    Object.entries(PAGE_TITLES).find(([key]) => location.pathname.startsWith(key + '/'))?.[1] ||
    'CQMR';

  return (
    <header className="flex h-14 items-center gap-4 border-b border-neutral-200 bg-white px-4 lg:px-6 shrink-0">
      <button
        onClick={toggleSidebar}
        className="lg:hidden rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 text-base font-semibold text-neutral-900">{title}</h1>

      <div className="hidden md:flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-56 rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <button className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4F9C] text-xs font-bold text-white">
          {user?.name.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-medium text-neutral-900 leading-tight">{user?.name}</p>
          <p className="text-[10px] text-neutral-500 capitalize">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
