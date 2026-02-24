import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function VarianceReport() {
  const navigate = useNavigate();
  const { getJobSummaryRows } = useReportsStore();
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [threshold, setThreshold] = useState(0);

  const rows = useMemo(() => {
    return getJobSummaryRows({ dateFrom: dateRange.from, dateTo: dateRange.to })
      .filter((r) => Math.abs(r.variancePct) >= threshold)
      .sort((a, b) => b.variancePct - a.variancePct);
  }, [getJobSummaryRows, dateRange, threshold]);

  const chartData = rows.slice(0, 10).map((r) => ({ name: r.jobNumber, variance: parseFloat(r.variancePct.toFixed(1)) }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Variance Report</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Jobs ranked by variance percentage. Highlights budget outliers.</p>
      </div>
      <ReportControls
        dateRange={dateRange} onDateChange={setDateRange} rowCount={rows.length}
        onExport={(t) => alert(`Export as ${t}`)}
        extraFilters={
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-neutral-500">Min Variance %</label>
            <input type="number" min={0} max={100} step={1} value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#1B4F9C]/30" />
          </div>
        }
      />

      {rows.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
          <p className="text-sm font-semibold text-neutral-800 mb-3">Top 10 by Variance %</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number | undefined) => `${v ?? 0}%`} />
              <Bar dataKey="variance" name="Variance %" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.variance > 0 ? '#ef4444' : '#10b981'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Job #', 'Title', 'Client', 'Estimated', 'Actual', 'Variance', 'Variance %', ''].map((h, i) => (
                  <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide', i >= 3 && i <= 6 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0
                ? <tr><td colSpan={8} className="py-10 text-center text-sm text-neutral-400">No jobs meet the threshold.</td></tr>
                : rows.map((r) => (
                  <tr key={r.jobId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-[#1B4F9C]">{r.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800 max-w-[160px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{r.clientName}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.estimated)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.actual)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-semibold', r.variance > 0 ? 'text-red-600' : 'text-emerald-600')}>{r.variance > 0 ? '+' : ''}{formatCurrency(r.variance)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-bold', r.variancePct > 10 ? 'text-red-600' : r.variancePct > 0 ? 'text-amber-600' : 'text-emerald-600')}>{r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => navigate(`/reports/job/${r.jobId}`)} className="rounded px-2 py-1 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-100">View</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
