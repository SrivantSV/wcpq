import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';

export function MaterialConsumptionReport() {
  const { getMaterialConsumption } = useReportsStore();
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    return getMaterialConsumption({ dateFrom: dateRange.from, dateTo: dateRange.to })
      .filter((r) => !search || r.materialName.toLowerCase().includes(search.toLowerCase()));
  }, [getMaterialConsumption, dateRange, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Material Consumption</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Estimated vs issued quantities across all jobs.</p>
      </div>
      <ReportControls dateRange={dateRange} onDateChange={setDateRange} rowCount={rows.length} onExport={(t) => alert(`Export as ${t}`)}
        extraFilters={
          <input className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C]/20" placeholder="Search material…" value={search} onChange={(e) => setSearch(e.target.value)} />
        }
      />
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Material', 'Unit', 'Est. Qty', 'Issued Qty', 'Variance', 'Variance %'].map((h, i) => (
                  <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide', i >= 2 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0
                ? <tr><td colSpan={6} className="py-10 text-center text-sm text-neutral-400">No data.</td></tr>
                : rows.map((r) => (
                  <tr key={r.materialName} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-800 max-w-[200px] truncate">{r.materialName}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{r.unit}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{r.estimated.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{r.issued.toFixed(2)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-semibold', r.variance > 0 ? 'text-red-600' : r.variance < 0 ? 'text-emerald-600' : 'text-neutral-500')}>{r.variance > 0 ? '+' : ''}{r.variance.toFixed(2)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-bold', Math.abs(r.variancePct) > 20 ? (r.variancePct > 0 ? 'text-red-600' : 'text-emerald-600') : 'text-neutral-600')}>{r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%</td>
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
