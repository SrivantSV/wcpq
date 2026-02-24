import { TrendingUp, TrendingDown, FileText, CheckSquare, DollarSign, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

const STAT_CARDS = [
  { label: 'Active Job Orders', value: '24', change: '+3 this week', trend: 'up', icon: FileText, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Pending Approvals', value: '7', change: '2 urgent', trend: 'neutral', icon: CheckSquare, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: 'Revenue This Month', value: '₹18.4L', change: '+12% vs last month', trend: 'up', icon: DollarSign, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'Avg. Turnaround', value: '4.2 days', change: '−0.5 days improved', trend: 'down', icon: Clock, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
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
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : null;
          const trendColor = card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-blue-600' : 'text-amber-600';
          return (
            <div key={card.label} className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                {TrendIcon && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 leading-tight">{card.value}</p>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">{card.label}</p>
              </div>
              <p className={`text-xs font-medium ${trendColor}`}>{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Job Orders */}
        <div className="xl:col-span-2 rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Job Orders</h2>
            <button className="flex items-center gap-1 text-xs text-[#1B4F9C] font-medium hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {RECENT_JOBS.map((job) => (
              <div
                key={job.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-neutral-900">{job.title}</p>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-neutral-500">
                    <span className="font-mono">{job.id}</span> · {job.client} · {job.date}
                  </p>
                </div>
                <div className="shrink-0 text-right pt-0.5">
                  <p className="text-sm font-bold text-neutral-900">{job.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Pending Approvals</h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {PENDING_APPROVALS.length}
            </span>
          </div>
          <div className="divide-y divide-neutral-100 flex-1">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.id} className="px-5 py-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      item.urgency === 'high'
                        ? 'text-red-500'
                        : item.urgency === 'medium'
                        ? 'text-amber-500'
                        : 'text-green-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 leading-tight">{item.title}</p>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">{item.id}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      By {item.submittedBy} · {item.daysAgo}d ago
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3.5 border-t border-neutral-100">
            <button className="w-full rounded-lg bg-[#1B4F9C] py-2 text-sm font-medium text-white hover:bg-[#174287] transition-colors">
              Review All Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
