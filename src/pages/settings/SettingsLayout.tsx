import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Receipt,
  UserCircle,
  Truck,
  Package,
} from 'lucide-react';

const SETTINGS_NAV = [
  { path: '/settings/company', label: 'Company Profile', icon: Building2 },
  { path: '/settings/users', label: 'Users & Roles', icon: Users },
  { path: '/settings/rate-cards', label: 'Rate Cards', icon: DollarSign },
  { path: '/settings/overhead-rates', label: 'Overhead Rates', icon: TrendingUp },
  { path: '/settings/tax', label: 'Tax Setup', icon: Receipt },
  { path: '/settings/clients', label: 'Client Master', icon: UserCircle },
  { path: '/settings/vendors', label: 'Vendor Master', icon: Truck },
  { path: '/settings/staff', label: 'Staff Master', icon: Users },
  { path: '/settings/materials', label: 'Material Price Book', icon: Package },
];

export function SettingsLayout() {
  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Settings sidebar */}
      <aside className="hidden md:flex flex-col w-52 shrink-0">
        <nav className="space-y-0.5">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[#1B4F9C] text-white font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Settings content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
