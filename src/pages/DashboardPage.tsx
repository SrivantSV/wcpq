import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  Briefcase, ReceiptText, TrendingUp as TUp, DollarSign, Clock,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';

const DONUT_COLORS = ['#1B4F9C','#3b82f6','#6366f1','#8b5cf6','#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', in_progress: '#3b82f6', on_hold: '#f97316',
  completed: '#10b981', cancelled: '#6b7280',
};

function KpiCard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string; value: string; sub: string;
  trend?: 'up' | 'down' | 'neutral'; icon: React.ElementType; accent: string;
}) {
  const TIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const tColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-neutral-400';
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm px-5 py-4 flex items-start gap-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-neutral-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-neutral-900 tabular-nums truncate">{value}</p>
        <div className={cn('flex items-center gap-1 text-xs font-medium mt-0.5', tColor)}>
          <TIcon className="h-3 w-3" />
          <span>{sub}</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { getKpis, getCostTrend, getPipeline, getTopOverBudget, getRevenueByClient, getCostSplit } = useReportsStore();

  const kpis = useMemo(() => getKpis(), []);
  const costTrend = useMemo(() => getCostTrend(), []);
  const pipeline = useMemo(() => getPipeline(), []);
  const overBudget = useMemo(() => getTopOverBudget(), []);
  const revenue = useMemo(() => getRevenueByClient(), []);
  const costSplit = useMemo(() => getCostSplit(), []);

  const estDelta = kpis.totalEstimatedValueLastMonth > 0
    ? ((kpis.totalEstimatedValue - kpis.totalEstimatedValueLastMonth) / kpis.totalEstimatedValueLastMonth * 100).toFixed(1)
    : '0';
  const invDelta = kpis.invoicedLastMonth > 0
    ? ((kpis.invoicedThisMonth - kpis.invoicedLastMonth) / kpis.invoicedLastMonth * 100).toFixed(1)
    : '0';
  const actualVariancePct = kpis.totalEstimatedCostForActuals > 0
    ? ((kpis.totalActualCost - kpis.totalEstimatedCostForActuals) / kpis.totalEstimatedCostForActuals * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Active Jobs" value={String(kpis.activeJobs)} sub={`${kpis.overBudgetJobs} over budget`} trend={kpis.overBudgetJobs > 0 ? 'down' : 'up'} icon={Briefcase} accent="bg-blue-50 text-blue-600" />
        <KpiCard label="Total Est. Value" value={formatCurrency(kpis.totalEstimatedValue)} sub={`${Number(estDelta) >= 0 ? '+' : ''}${estDelta}% vs last month`} trend={Number(estDelta) >= 0 ? 'up' : 'down'} icon={TUp} accent="bg-violet-50 text-violet-600" />
        <KpiCard label="Total Actual Cost" value={formatCurrency(kpis.totalActualCost)} sub={`${Number(actualVariancePct) >= 0 ? '+' : ''}${actualVariancePct}% vs estimate`} trend={Number(actualVariancePct) > 5 ? 'down' : 'neutral'} icon={DollarSign} accent="bg-amber-50 text-amber-600" />
        <KpiCard label="Invoiced This Month" value={formatCurrency(kpis.invoicedThisMonth)} sub={`${Number(invDelta) >= 0 ? '+' : ''}${invDelta}% vs last month`} trend={Number(invDelta) >= 0 ? 'up' : 'down'} icon={ReceiptText} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Outstanding" value={formatCurrency(kpis.outstandingReceivables)} sub={`${kpis.overdueCount} overdue`} trend={kpis.overdueCount > 0 ? 'down' : 'neutral'} icon={AlertTriangle} accent={kpis.overdueCount > 0 ? 'bg-red-50 text-red-500' : 'bg-neutral-100 text-neutral-500'} />
        <KpiCard label="Completed MTD" value={String(kpis.completedMTD)} sub={`Target: ${kpis.completedMTDTarget}`} trend={kpis.completedMTD >= kpis.completedMTDTarget ? 'up' : 'neutral'} icon={CheckCircle2} accent="bg-teal-50 text-teal-600" />
      </div>

      {/* Charts row 1: Cost Trend + Pipeline */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-800 mb-4">Cost Trend — Estimated vs Actual (6 months)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={costTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="estimated" stroke="#6366f1" strokeWidth={2} dot={false} name="Estimated" />
              <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} dot={false} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-800 mb-4">Job Status Pipeline</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipeline} layout="vertical" margin={{ top: 0, right: 8, left: 32, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={76} />
              <Tooltip />
              <Bar dataKey="count" name="Jobs" radius={[0, 4, 4, 0]}>
                {pipeline.map((p) => <Cell key={p.status} fill={STATUS_COLORS[p.status] ?? '#6b7280'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2: Over Budget + Revenue + Cost Split */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top 5 Over-Budget */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-800 mb-4">Top 5 Over-Budget Jobs</p>
          {overBudget.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-200 mb-2" />
              <p className="text-xs text-neutral-400 font-medium">All jobs within budget</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {overBudget.map((j) => (
                <div key={j.jobId} className="cursor-pointer group" onClick={() => navigate(`/reports/job/${j.jobId}`)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700 group-hover:text-[#1B4F9C] truncate max-w-[60%]">{j.title}</span>
                    <span className="text-xs font-bold text-red-600 tabular-nums">+{j.variancePct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${Math.min(j.variancePct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Client donut */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-800 mb-2">Revenue by Client</p>
          {revenue.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-xs text-neutral-400">No invoice data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={revenue} dataKey="value" nameKey="client" cx="50%" cy="50%" innerRadius={48} outerRadius={70}>
                    {revenue.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {revenue.slice(0, 4).map((r, i) => (
                  <div key={r.client} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} /><span className="text-neutral-600 truncate max-w-[120px]">{r.client}</span></div>
                    <span className="font-semibold text-neutral-800 tabular-nums">{formatCurrency(r.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Material vs Labor stacked bar */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-800 mb-4">Material vs Labor Split</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costSplit} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="materials" name="Materials" stackId="a" fill="#6366f1" />
              <Bar dataKey="labor" name="Labor" stackId="a" fill="#3b82f6" />
              <Bar dataKey="overhead" name="Overhead" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
