import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 min-w-0">
          <div className="p-4 lg:p-6 w-full">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
