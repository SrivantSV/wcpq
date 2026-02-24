import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';

export function LaborUtilizationReport() {
  const { getLaborUtilization } = useReportsStore();
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return getLaborUtilization({ dateFrom: dateRange.from, dateTo: dateRange.to })
      .filter((r) => !search || r.worker.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase()));
  }, [getLaborUtilization, dateRange, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Labor Utilization</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Estimated vs actual hours per worker with efficiency rate.</p>
      </div>
      <ReportControls dateRange={dateRange} onDateChange={setDateRange} rowCount={rows.length} onExport={(t) => alert(`Export as ${t}`)}
        extraFilters={
          <input className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C]/20" placeholder="Search worker or role…" value={search} onChange={(e) => setSearch(e.target.value)} />
        }
      />
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Worker', 'Role', 'Est. Hours', 'Actual Hours', 'Variance (hrs)', 'Efficiency'].map((h, i) => (
                  <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide', i >= 2 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0
                ? <tr><td colSpan={6} className="py-10 text-center text-sm text-neutral-400">No data.</td></tr>
                : rows.map((r) => {
                  const effColor = r.efficiency >= 95 ? 'text-emerald-600' : r.efficiency >= 75 ? 'text-amber-600' : 'text-red-600';
                  const variance = r.estimatedHours - r.actualHours;
                  return (
                    <tr key={r.worker} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-neutral-800">{r.worker}</td>
                      <td className="px-4 py-3 text-sm text-neutral-500">{r.role || '—'}</td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{r.estimatedHours.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{r.actualHours.toFixed(1)}</td>
                      <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-semibold', variance >= 0 ? 'text-emerald-600' : 'text-red-600')}>{variance >= 0 ? '+' : ''}{variance.toFixed(1)}</td>
                      <td className={cn('px-4 py-3 text-right', effColor)}>
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                            <div className={cn('h-full rounded-full', r.efficiency >= 95 ? 'bg-emerald-500' : r.efficiency >= 75 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${Math.min(r.efficiency, 100)}%` }} />
                          </div>
                          <span className="text-sm font-bold tabular-nums">{r.efficiency.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
