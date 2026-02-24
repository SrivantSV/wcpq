import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useReportsStore } from '@/stores/reportsStore';
import { ReportControls } from './ReportControls';
import type { DateRange } from './ReportControls';

const BUCKET_CLS: Record<string, string> = {
  '0-30': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '31-60': 'bg-amber-50 text-amber-700 border-amber-200',
  '61-90': 'bg-orange-50 text-orange-700 border-orange-200',
  '90+': 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_CLS: Record<string, string> = {
  issued: 'bg-blue-50 text-blue-700 border-blue-200',
  partially_paid: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
};

export function InvoiceAgingReport() {
  const { getInvoiceAging } = useReportsStore();
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0], to: now.toISOString().split('T')[0] });
  const [clientSearch, setClientSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const rows = useMemo(() => {
    return getInvoiceAging({ clientName: clientSearch || undefined, status: statusFilter || undefined });
  }, [getInvoiceAging, clientSearch, statusFilter]);

  const bucketTotals = useMemo(() => {
    const m: Record<string, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    rows.forEach((r) => { m[r.bucket] = (m[r.bucket] ?? 0) + r.amountDue; });
    return m;
  }, [rows]);

  const totalOutstanding = rows.reduce((s, r) => s + r.amountDue, 0);

  const inputCls = 'rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C]/20';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-neutral-900">Invoice Aging Report</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Outstanding invoices grouped by days overdue.</p>
      </div>
      <ReportControls dateRange={dateRange} onDateChange={setDateRange} rowCount={rows.length} onExport={(t) => alert(`Export as ${t}`)}
        extraFilters={
          <>
            <input className={inputCls} placeholder="Search client…" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
            <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="issued">Issued</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </>
        }
      />

      {/* Aging bucket summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500">Total Outstanding</p>
          <p className="text-base font-bold text-neutral-900 tabular-nums mt-0.5">{formatCurrency(totalOutstanding)}</p>
        </div>
        {(['0-30', '31-60', '61-90', '90+'] as const).map((b) => (
          <div key={b} className={cn('rounded-xl border px-4 py-3 shadow-sm', BUCKET_CLS[b])}>
            <p className="text-xs font-semibold opacity-70">{b} days</p>
            <p className="text-base font-bold tabular-nums mt-0.5">{formatCurrency(bucketTotals[b] ?? 0)}</p>
            <p className="text-xs opacity-60 mt-0.5">{rows.filter((r) => r.bucket === b).length} inv.</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Invoice #', 'Job #', 'Client', 'Invoice Date', 'Due Date', 'Total', 'Outstanding', 'Days Overdue', 'Bucket', 'Status'].map((h, i) => (
                  <th key={i} className={cn('px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap', i >= 5 && i <= 7 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.length === 0
                ? <tr><td colSpan={10} className="py-10 text-center text-sm text-neutral-400">No outstanding invoices.</td></tr>
                : rows.map((r) => (
                  <tr key={r.invoiceNumber} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-[#1B4F9C]">{r.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{r.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800">{r.client}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{formatDate(r.invoiceDate)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{formatDate(r.dueDate)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums text-neutral-700">{formatCurrency(r.invoiceTotal)}</td>
                    <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-neutral-900">{formatCurrency(r.amountDue)}</td>
                    <td className={cn('px-4 py-3 text-sm text-right tabular-nums font-bold', r.daysOverdue > 60 ? 'text-red-600' : r.daysOverdue > 30 ? 'text-amber-600' : 'text-neutral-600')}>{r.daysOverdue}</td>
                    <td className="px-4 py-3"><span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', BUCKET_CLS[r.bucket])}>{r.bucket}d</span></td>
                    <td className="px-4 py-3"><span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', STATUS_CLS[r.status] ?? 'bg-neutral-100 text-neutral-500 border-neutral-200')}>{r.status.replace('_', ' ')}</span></td>
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
