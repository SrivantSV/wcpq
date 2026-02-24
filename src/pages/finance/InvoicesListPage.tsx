import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useInvoiceStore, INVOICE_STATUS_CONFIG } from '@/stores/invoiceStore';
import type { InvoiceStatus } from '@/types';

const STATUS_FILTERS: { key: InvoiceStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'issued', label: 'Issued' },
  { key: 'partially_paid', label: 'Partially Paid' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'voided', label: 'Voided' },
];

export function InvoicesListPage() {
  const navigate = useNavigate();
  const { invoices, checkOverdue } = useInvoiceStore();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  // Run overdue check on mount
  useEffect(() => { checkOverdue(); }, [checkOverdue]);

  const filtered = useMemo(() => {
    let list = [...invoices];
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.jobNumber.toLowerCase().includes(q) ||
        i.billTo.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, statusFilter, search]);

  const today = new Date().toISOString().split('T')[0];

  // KPI summary
  const totalIssued = invoices.filter((i) => i.status === 'issued' || i.status === 'overdue' || i.status === 'partially_paid').reduce((s, i) => s + i.amountDue, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.invoiceTotal, 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  return (
    <div className="min-h-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Finance / Invoices</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => navigate('/job-orders')}
          className="flex items-center gap-1.5 rounded-lg bg-[#1B4F9C] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#174287] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New Invoice
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500 mb-0.5">Outstanding</p>
          <p className="text-base font-bold text-neutral-900 tabular-nums">{formatCurrency(totalIssued)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold text-neutral-500 mb-0.5">Collected (Paid)</p>
          <p className="text-base font-bold text-emerald-700 tabular-nums">{formatCurrency(totalPaid)}</p>
        </div>
        <div className={cn('rounded-xl border px-4 py-3 shadow-sm', overdueCount > 0 ? 'border-red-200 bg-red-50' : 'border-neutral-200 bg-white')}>
          <p className={cn('text-xs font-semibold mb-0.5', overdueCount > 0 ? 'text-red-600' : 'text-neutral-500')}>Overdue</p>
          <p className={cn('text-base font-bold tabular-nums', overdueCount > 0 ? 'text-red-700' : 'text-neutral-900')}>{overdueCount} invoice{overdueCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm flex-1 min-w-48 max-w-72">
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices…"
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === f.key
                  ? 'border-[#1B4F9C] bg-[#1B4F9C] text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-70">{invoices.filter((i) => i.status === f.key).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-8 w-8 text-neutral-200" />
            <p className="text-sm font-semibold text-neutral-400">No invoices found</p>
            <p className="text-xs text-neutral-400">Create an invoice from a completed job order</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Invoice #', 'Job #', 'Client', 'Issue Date', 'Due Date', 'Total', 'Tax', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className={cn(
                        'px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap',
                        i === 0 ? 'text-left' : i >= 5 && i <= 6 ? 'text-right' : 'text-left'
                      )}
                    >
                      {h && (
                        <span className="flex items-center gap-1">
                          {h}
                          {(i === 3 || i === 4) && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((inv) => {
                  const cfg = INVOICE_STATUS_CONFIG[inv.status];
                  const isOverdue = inv.status === 'issued' && inv.dueDate < today;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/finance/invoice/${inv.jobOrderId}`)}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-[#1B4F9C]">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600">{inv.jobNumber}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-neutral-800">{inv.billTo}</p>
                        {inv.referencePoNumber && <p className="text-xs text-neutral-400">PO: {inv.referencePoNumber}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 whitespace-nowrap">{formatDate(inv.invoiceDate)}</td>
                      <td className={cn('px-4 py-3.5 text-sm whitespace-nowrap font-medium', isOverdue ? 'text-red-600' : 'text-neutral-600')}>
                        {formatDate(inv.dueDate)}
                        {isOverdue && <span className="ml-1.5 text-xs text-red-500">(Overdue)</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-right text-neutral-900 tabular-nums">{formatCurrency(inv.invoiceTotal)}</td>
                      <td className="px-4 py-3.5 text-sm text-right text-neutral-500 tabular-nums">{formatCurrency(inv.taxTotal)}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.className)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/finance/invoice/${inv.jobOrderId}`); }}
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
