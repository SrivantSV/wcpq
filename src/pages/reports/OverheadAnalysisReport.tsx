import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';

export function OverheadAnalysisReport() {
  const { getOverheadAnalysis } = useReportsStore();
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return getOverheadAnalysis({ dateFrom: dateRange.from, dateTo: dateRange.to })
      .filter((r) => !search || r.category.toLowerCase().includes(search.toLowerCase()));
  }, [getOverheadAnalysis, dateRange, search]);

  const totals = useMemo(() => rows.reduce((a, r) => ({ est: a.est + r.estimated, act: a.act + r.actual }), { est: 0, act: 0 }), [rows]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Overhead Analysis</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Estimated vs actual overhead across all jobs, grouped by category.</p>
      </div>
      <ReportControls dateRange={dateRange} onDateChange={setDateRange} rowCount={rows.length} onExport={(t) => alert(`Export as ${t}`)}
        extraFilters={
          <input className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C]/20" placeholder="Search category…" value={search} onChange={(e) => setSearch(e.target.value)} />
        }
      />

      <div className="grid grid-cols-3 gap-3">
        {[{ l: 'Total Estimated', v: formatCurrency(totals.est) }, { l: 'Total Actual', v: formatCurrency(totals.act) }, { l: 'Net Variance', v: formatCurrency(totals.act - totals.est), red: totals.act > totals.est }].map((s) => (
          <div key={s.l} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-neutral-500">{s.l}</p>
            <p className={cn('text-base font-bold tabular-nums mt-0.5', s.red ? 'text-red-600' : 'text-neutral-900')}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Category', 'Estimated', 'Actual', 'Variance', 'Variance %'].map((h, i) => (
                  <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide', i >= 1 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0
                ? <tr><td colSpan={5} className="py-10 text-center text-sm text-neutral-400">No data.</td></tr>
                : rows.map((r) => (
                  <tr key={r.category} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-800">{r.category}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.estimated)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.actual)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-semibold', r.variance > 0 ? 'text-red-600' : 'text-emerald-600')}>{r.variance > 0 ? '+' : ''}{formatCurrency(r.variance)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-bold', Math.abs(r.variancePct) > 15 ? (r.variancePct > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-neutral-600')}>{r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%</td>
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
