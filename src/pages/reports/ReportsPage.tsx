import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Users, Package, Clock, Settings, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORTS = [
  { id: 'jobs-summary', title: 'Jobs Summary', description: 'All jobs with status, estimated vs actual cost, and variance.', icon: FileText, accent: 'bg-blue-50 text-blue-600', path: '/reports/jobs-summary' },
  { id: 'variance', title: 'Variance Report', description: 'Jobs ranked by variance %. Highlights budget outliers.', icon: TrendingUp, accent: 'bg-red-50 text-red-600', path: '/reports/variance' },
  { id: 'client-profitability', title: 'Client Profitability', description: 'Per-client totals: estimated, invoiced, actual cost, margin.', icon: Users, accent: 'bg-violet-50 text-violet-600', path: '/reports/client-profitability' },
  { id: 'material-consumption', title: 'Material Consumption', description: 'Estimated vs issued quantities across all jobs.', icon: Package, accent: 'bg-amber-50 text-amber-600', path: '/reports/material-consumption' },
  { id: 'labor-utilization', title: 'Labor Utilization', description: 'Staff hours estimated vs actual and efficiency rate.', icon: Clock, accent: 'bg-teal-50 text-teal-600', path: '/reports/labor-utilization' },
  { id: 'overhead-analysis', title: 'Overhead Analysis', description: 'Estimated vs actual overhead grouped by category.', icon: Settings, accent: 'bg-indigo-50 text-indigo-600', path: '/reports/overhead-analysis' },
  { id: 'invoice-aging', title: 'Invoice Aging', description: 'Outstanding invoices in 0-30 / 31-60 / 61-90 / 90+ day buckets.', icon: BarChart2, accent: 'bg-orange-50 text-orange-600', path: '/reports/invoice-aging' },
];

export function ReportsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Reports & Analytics</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Aggregate reports across jobs, costs, clients, and invoices.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            onClick={() => navigate(r.path)}
            className="group rounded-xl border border-neutral-200 bg-white shadow-sm p-5 text-left hover:border-[#1B4F9C]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', r.accent)}>
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 group-hover:text-[#1B4F9C] transition-colors">{r.title}</p>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{r.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-[#1B4F9C] transition-colors shrink-0 mt-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
