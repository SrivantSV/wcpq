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

function TrendIndicator({ trend, change }: { trend: string; change: string }) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const color = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-blue-600' : 'text-amber-600';
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${color}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {change}
    </span>
  );
}

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat Cards — horizontal layout: icon left, stats right */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide truncate">{card.label}</p>
                <p className="text-lg font-bold text-neutral-900 leading-tight">{card.value}</p>
                <TrendIndicator trend={card.trend} change={card.change} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content — 2/3 + 1/3 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Job Orders — takes 3 of 5 cols */}
        <div className="lg:col-span-3 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h2 className="text-[13px] font-semibold text-neutral-900">Recent Job Orders</h2>
            <button className="flex items-center gap-1 text-xs text-[#1B4F9C] font-semibold hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-50">
            {RECENT_JOBS.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50/60 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-neutral-900 truncate">{job.title}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    <span className="font-mono">{job.id}</span>
                    <span className="mx-1">·</span>{job.client}<span className="mx-1">·</span>{job.date}
                  </p>
                </div>
                <span className="text-[13px] font-bold text-neutral-800 tabular-nums shrink-0">{job.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals — takes 2 of 5 cols */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h2 className="text-[13px] font-semibold text-neutral-900">Pending Approvals</h2>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
              {PENDING_APPROVALS.length}
            </span>
          </div>
          <div className="divide-y divide-neutral-50 flex-1">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.id} className="flex items-start gap-2.5 px-4 py-3 hover:bg-neutral-50/60 transition-colors cursor-pointer">
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    item.urgency === 'high'
                      ? 'bg-red-500'
                      : item.urgency === 'medium'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900 leading-snug">{item.title}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    <span className="font-mono">{item.id}</span>
                    <span className="mx-1">·</span>By {item.submittedBy}<span className="mx-1">·</span>{item.daysAgo}d ago
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-neutral-100">
            <button className="w-full rounded-lg bg-[#1B4F9C] py-2 text-[13px] font-semibold text-white hover:bg-[#174287] transition-colors">
              Review All Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
