import { TrendingUp, TrendingDown, FileText, CheckSquare, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

const STAT_CARDS = [
  { label: 'Active Job Orders', value: '24', change: '+3 this week', trend: 'up' as const, icon: FileText, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { label: 'Pending Approvals', value: '7', change: '2 urgent', trend: 'neutral' as const, icon: CheckSquare, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { label: 'Revenue This Month', value: '₹18.4L', change: '+12% vs last month', trend: 'up' as const, icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: 'Avg. Turnaround', value: '4.2 days', change: '−0.5 days improved', trend: 'down' as const, icon: Clock, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
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

      {/* Stat Cards — vertical layout, icon top-right, value prominent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : null;
          const trendColor =
            card.trend === 'up' ? 'text-emerald-600' :
            card.trend === 'down' ? 'text-blue-600' : 'text-amber-500';
          return (
            <div key={card.label} className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 flex flex-col gap-3">
              {/* Top row: label + icon */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500">{card.label}</p>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              {/* Value */}
              <p className="text-2xl font-bold text-neutral-900 leading-none">{card.value}</p>
              {/* Trend */}
              <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
                <span>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content — 3/5 + 2/5 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Job Orders */}
        <div className="lg:col-span-3 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Job Orders</h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-[#1B4F9C] hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {RECENT_JOBS.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-900">{job.title}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {job.id} · {job.client} · {job.date}
                  </p>
                </div>
                <span className="text-sm font-bold text-neutral-800 tabular-nums">{job.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Pending Approvals</h2>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
              {PENDING_APPROVALS.length}
            </span>
          </div>
          <div className="flex-1 divide-y divide-neutral-100">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    item.urgency === 'high' ? 'bg-red-500' :
                    item.urgency === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.id}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">By {item.submittedBy} · {item.daysAgo}d ago</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3.5 border-t border-neutral-100">
            <button className="w-full rounded-lg bg-[#1B4F9C] py-2 text-sm font-semibold text-white hover:bg-[#174287] transition-colors">
              Review All Approvals
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
