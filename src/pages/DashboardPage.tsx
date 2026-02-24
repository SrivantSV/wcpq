import { TrendingUp, FileText, CheckSquare, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

const STAT_CARDS = [
  { label: 'Active Job Orders', value: '24', change: '+3 this week', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { label: 'Pending Approvals', value: '7', change: '2 urgent', icon: CheckSquare, color: 'bg-amber-50 text-amber-600' },
  { label: 'Revenue This Month', value: '₹18.4L', change: '+12% vs last month', icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { label: 'Avg. Turnaround', value: '4.2 days', change: '-0.5 days improved', icon: Clock, color: 'bg-purple-50 text-purple-600' },
];

const RECENT_JOBS = [
  { id: 'JO-2024-0081', client: 'Infosys Ltd', title: 'Civil Works Block B', value: '₹4,20,000', status: 'pending' as const, date: '22 Feb 2025' },
  { id: 'JO-2024-0080', client: 'TCS Bangalore', title: 'Electrical Fittings', value: '₹1,85,000', status: 'approved' as const, date: '21 Feb 2025' },
  { id: 'JO-2024-0079', client: 'Wipro Campus', title: 'Plumbing Overhaul', value: '₹3,10,000', status: 'in_progress' as const, date: '20 Feb 2025' },
  { id: 'JO-2024-0078', client: 'HCL Tech Park', title: 'HVAC Maintenance', value: '₹2,60,000', status: 'completed' as const, date: '19 Feb 2025' },
  { id: 'JO-2024-0077', client: 'Cognizant SEZ', title: 'Painting & Finishing', value: '₹95,000', status: 'draft' as const, date: '18 Feb 2025' },
];

const PENDING_APPROVALS = [
  { id: 'JO-2024-0081', title: 'Civil Works Block B', submittedBy: 'Raj Kumar', urgency: 'high', daysAgo: 1 },
  { id: 'JO-2024-0076', title: 'Generator Installation', submittedBy: 'Meena Shah', urgency: 'medium', daysAgo: 3 },
  { id: 'JO-2024-0074', title: 'Security System Upgrade', submittedBy: 'Arjun Nair', urgency: 'low', daysAgo: 5 },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">{card.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Job Orders */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Job Orders</h2>
            <button className="text-xs text-[#1B4F9C] font-medium hover:underline">View all</button>
          </div>
          <div className="divide-y divide-neutral-100">
            {RECENT_JOBS.map((job) => (
              <div key={job.id} className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">{job.id}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 truncate mt-0.5">{job.title}</p>
                  <p className="text-xs text-neutral-500">{job.client} · {job.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-neutral-900">{job.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Pending Approvals</h2>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              {PENDING_APPROVALS.length}
            </span>
          </div>
          <div className="divide-y divide-neutral-100">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.id} className="px-6 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle
                    className={`h-3.5 w-3.5 ${
                      item.urgency === 'high' ? 'text-red-500' : item.urgency === 'medium' ? 'text-amber-500' : 'text-green-500'
                    }`}
                  />
                  <span className="text-xs text-neutral-400 font-mono">{item.id}</span>
                </div>
                <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  By {item.submittedBy} · {item.daysAgo}d ago
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-neutral-100">
            <button className="w-full rounded-lg border border-[#1B4F9C] py-2 text-sm font-medium text-[#1B4F9C] hover:bg-blue-50 transition-colors">
              Review All Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
