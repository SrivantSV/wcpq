import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';

const inputCls = 'rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors';

export function ClientProfitabilityReport() {
  const { getClientProfitability } = useReportsStore();
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [clientSearch, setClientSearch] = useState('');

  const rows = useMemo(() => {
    return getClientProfitability({ dateFrom: dateRange.from, dateTo: dateRange.to })
      .filter((r) => !clientSearch || r.clientName.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [getClientProfitability, dateRange, clientSearch]);

  const totals = useMemo(() => rows.reduce((a, r) => ({ est: a.est + r.totalEstimated, act: a.act + r.totalActual, inv: a.inv + r.totalInvoiced, mgn: a.mgn + r.margin }), { est: 0, act: 0, inv: 0, mgn: 0 }), [rows]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Client Profitability</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Per-client totals: estimated, invoiced, actual cost and margin.</p>
      </div>
      <ReportControls dateRange={dateRange} onDateChange={setDateRange} rowCount={rows.length} onExport={(t) => alert(`Export as ${t}`)}
        extraFilters={<input className={inputCls} placeholder="Search client…" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[{ l: 'Total Estimated', v: formatCurrency(totals.est) }, { l: 'Total Invoiced', v: formatCurrency(totals.inv) }, { l: 'Total Actual Cost', v: formatCurrency(totals.act) }, { l: 'Total Margin', v: formatCurrency(totals.mgn), red: totals.mgn < 0 }].map((s) => (
          <div key={s.l} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-neutral-500">{s.l}</p>
            <p className={cn('text-base font-bold tabular-nums mt-0.5', s.red ? 'text-red-600' : 'text-neutral-900')}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Client', 'Jobs', 'Estimated', 'Invoiced', 'Actual Cost', 'Margin', 'Margin %'].map((h, i) => (
                  <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide', i >= 2 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0
                ? <tr><td colSpan={7} className="py-10 text-center text-sm text-neutral-400">No data.</td></tr>
                : rows.map((r) => (
                  <tr key={r.clientName} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-800">{r.clientName}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 text-center">{r.jobCount}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.totalEstimated)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold text-neutral-800">{formatCurrency(r.totalInvoiced)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.totalActual)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-bold', r.margin >= 0 ? 'text-emerald-600' : 'text-red-600')}>{r.margin >= 0 ? '+' : ''}{formatCurrency(r.margin)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-bold', r.marginPct >= 20 ? 'text-emerald-600' : r.marginPct >= 0 ? 'text-amber-600' : 'text-red-600')}>{r.marginPct.toFixed(1)}%</td>
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
