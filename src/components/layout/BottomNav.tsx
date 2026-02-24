import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  PlayCircle,
  Receipt,
  BarChart3,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/job-orders', label: 'Jobs', icon: FileText },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare, badge: 3 },
  { path: '/execution', label: 'Execute', icon: PlayCircle },
  { path: '/finance', label: 'Finance', icon: Receipt },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 flex">
      {NAV_ITEMS.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/');

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 relative',
              isActive ? 'text-[#1B4F9C]' : 'text-neutral-500'
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
