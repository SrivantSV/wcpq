import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';

const inputCls = 'rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors';

const STATUS_LABELS: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_CLS: Record<string, string> = { pending: 'bg-amber-50 text-amber-700 border-amber-200', in_progress: 'bg-blue-50 text-blue-700 border-blue-200', on_hold: 'bg-orange-50 text-orange-700 border-orange-200', completed: 'bg-emerald-50 text-emerald-700 border-emerald-200', cancelled: 'bg-neutral-100 text-neutral-500 border-neutral-200' };

export function JobsSummaryReport() {
  const navigate = useNavigate();
  const { getJobSummaryRows } = useReportsStore();

  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [sortKey, setSortKey] = useState<string>('jobNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rawRows = useMemo(() => getJobSummaryRows({ dateFrom: dateRange.from, dateTo: dateRange.to, status: statusFilter || undefined, jobType: jobTypeFilter || undefined }), [getJobSummaryRows, dateRange, statusFilter, jobTypeFilter]);

  const rows = useMemo(() => {
    let list = rawRows;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.jobNumber.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] ?? '';
      const bv = (b as unknown as Record<string, unknown>)[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rawRows, search, sortKey, sortDir]);

  function toggleSort(key: string) { if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } }

  const totals = useMemo(() => rows.reduce((acc, r) => ({ estimated: acc.estimated + r.estimated, actual: acc.actual + r.actual, invoiced: acc.invoiced + r.invoiced }), { estimated: 0, actual: 0, invoiced: 0 }), [rows]);

  const SortIcon = ({ k }: { k: string }) => sortKey === k ? (sortDir === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Jobs Summary Report</h1>
        <p className="text-sm text-neutral-500 mt-0.5">All jobs with status, estimated cost, actuals and variance.</p>
      </div>

      <ReportControls
        dateRange={dateRange}
        onDateChange={setDateRange}
        rowCount={rows.length}
        onExport={(t) => alert(`Export as ${t} — connect to PDF/Excel library`)}
        extraFilters={
          <>
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm">
              <Search className="h-3.5 w-3.5 text-neutral-400" />
              <input className="bg-transparent text-sm outline-none placeholder:text-neutral-400" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className={inputCls} value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)}>
              <option value="">All Job Types</option>
              {['installation', 'maintenance', 'repair', 'inspection', 'consultation', 'other'].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </>
        }
      />

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: 'Total Estimated', value: formatCurrency(totals.estimated) }, { label: 'Total Actual', value: formatCurrency(totals.actual) }, { label: 'Total Invoiced', value: formatCurrency(totals.invoiced) }].map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold text-neutral-500">{s.label}</p>
            <p className="text-base font-bold text-neutral-900 tabular-nums mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {[['jobNumber', 'Job #'], ['clientName', 'Client'], ['title', 'Title'], ['status', 'Status'], ['startDate', 'Start'], ['estimated', 'Estimated'], ['actual', 'Actual'], ['variancePct', 'Variance %'], ['invoiced', 'Invoiced']].map(([k, h]) => (
                  <th key={k} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort(k)}>
                    <span className="flex items-center gap-1">{h}<SortIcon k={k} /></span>
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-sm text-neutral-400">No jobs match the selected filters.</td></tr>
              ) : rows.map((r) => {
                const isOver = r.variancePct > 5;
                return (
                  <tr key={r.jobId} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-[#1B4F9C] whitespace-nowrap">{r.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">{r.clientName}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800 max-w-[180px] truncate">{r.title}</td>
                    <td className="px-4 py-3"><span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', STATUS_CLS[r.status] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200')}>{STATUS_LABELS[r.status] ?? r.status}</span></td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{r.startDate ? formatDate(r.startDate) : '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-800 tabular-nums text-right">{formatCurrency(r.estimated)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-800 tabular-nums text-right">{formatCurrency(r.actual)}</td>
                    <td className={cn('px-4 py-3 text-sm font-bold tabular-nums text-right', isOver ? 'text-red-600' : r.variancePct < -5 ? 'text-emerald-600' : 'text-neutral-600')}>
                      {r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-right text-neutral-700">{formatCurrency(r.invoiced)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => navigate(`/reports/job/${r.jobId}`)} className="rounded px-2 py-1 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-100">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
