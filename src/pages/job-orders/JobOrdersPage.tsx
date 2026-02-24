import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, ChevronUp, ChevronDown, ChevronsUpDown,
  Eye, Pencil, Copy, Trash2, MoreHorizontal, AlertTriangle, RefreshCw,
  Briefcase, BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { useJobOrderStore, ALL_STATUSES, PRIORITY_CONFIG, JOB_TYPE_LABELS } from '@/stores/jobOrderStore';
import { JobOrderDrawer } from './JobOrderDrawer';
import type { JobOrder, JobOrderStatus } from '@/types';

type SortKey = 'jobNumber' | 'clientName' | 'createdAt' | 'expectedCompletion';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS: { value: JobOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  ...ALL_STATUSES.map((s) => ({
    value: s,
    label: s === 'in_progress' ? 'In Progress' : s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1),
  })),
];

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 text-neutral-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-[#1B4F9C]" />
    : <ChevronDown className="h-3 w-3 text-[#1B4F9C]" />;
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
  if (!cfg) return null;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 rounded bg-neutral-100 animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

function MobileJobCard({
  job,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  job: JobOrder;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isOverdue =
    job.status !== 'completed' &&
    job.status !== 'cancelled' &&
    new Date(job.expectedCompletion) < new Date();

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-neutral-500">{job.jobNumber}</span>
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
          <p className="mt-1 text-sm font-semibold text-neutral-900 line-clamp-2">{job.title}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{job.clientName}</p>
        </div>
        <button
          onClick={onView}
          className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
        >
          View
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <div className="flex gap-4 text-xs text-neutral-500">
          <span>Start: {formatDate(job.startDate)}</span>
          <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
            Due: {formatDate(job.expectedCompletion)}
            {isOverdue && ' ⚠'}
          </span>
        </div>
        {job.estimatedTotal != null && (
          <span className="text-sm font-bold text-neutral-800">
            {formatCurrency(job.estimatedTotal)}
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={onEdit} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50">Edit</button>
        <button onClick={onDuplicate} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50">Duplicate</button>
        {job.status === 'draft' && (
          <button onClick={onDelete} className="rounded-md border border-red-100 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50">Delete</button>
        )}
      </div>
    </div>
  );
}

export function JobOrdersPage() {
  const { jobs, deleteJob, duplicateJob } = useJobOrderStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobOrderStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOrder | null>(null);
  const [viewingJob, setViewingJob] = useState<JobOrder | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    let result = jobs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.jobNumber.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          j.clientName.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter);
    }
    if (dateFrom) result = result.filter((j) => j.createdAt >= dateFrom);
    if (dateTo) result = result.filter((j) => j.createdAt <= dateTo + 'T23:59:59Z');
    result = [...result].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [jobs, search, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

  function openNew() {
    setEditingJob(null);
    setViewingJob(null);
    setDrawerOpen(true);
  }
  function openEdit(job: JobOrder) {
    setEditingJob(job);
    setViewingJob(null);
    setDrawerOpen(true);
    setOpenMenuId(null);
  }
  function openView(job: JobOrder) {
    setViewingJob(job);
    setEditingJob(null);
    setDrawerOpen(true);
    setOpenMenuId(null);
  }
  function handleDuplicate(id: string) {
    duplicateJob(id);
    setOpenMenuId(null);
  }
  function handleDelete(id: string) {
    deleteJob(id);
    setDeleteConfirmId(null);
    setOpenMenuId(null);
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap';
  const sortableTh = (key: SortKey, label: string) => (
    <th
      className={cn(thCls, 'cursor-pointer select-none hover:text-neutral-800 group')}
      onClick={() => toggleSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </th>
  );

  const drawerJob = viewingJob ?? editingJob;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-bold text-neutral-900">Job Orders</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-lg bg-[#1B4F9C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174287] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Job Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search job #, title, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobOrderStatus | 'all')}
          className="h-9 rounded-lg border border-neutral-200 bg-white px-3 pr-8 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="From date"
          className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors"
        />
        <span className="text-neutral-400 text-sm">–</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="To date"
          className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors"
        />
        {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}
            className="text-xs text-neutral-400 hover:text-neutral-600 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-neutral-100 bg-neutral-50/60">
            <tr>
              {sortableTh('jobNumber', 'Job #')}
              {sortableTh('clientName', 'Client')}
              <th className={thCls}>Description</th>
              {sortableTh('createdAt', 'Created')}
              {sortableTh('expectedCompletion', 'Due Date')}
              <th className={thCls}>Total</th>
              <th className={thCls}>Status</th>
              <th className={cn(thCls, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            }
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                      <Briefcase className="h-7 w-7 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-700">No job orders found</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {search || statusFilter !== 'all' || dateFrom || dateTo
                          ? 'Try adjusting your filters'
                          : 'Create your first job order to get started'}
                      </p>
                    </div>
                    {!search && statusFilter === 'all' && !dateFrom && !dateTo && (
                      <button
                        onClick={openNew}
                        className="mt-1 flex items-center gap-1.5 rounded-lg bg-[#1B4F9C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174287] transition-colors"
                      >
                        <Plus className="h-4 w-4" /> New Job Order
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {!loading && filtered.map((job) => {
              const isOverdue =
                job.status !== 'completed' &&
                job.status !== 'cancelled' &&
                new Date(job.expectedCompletion) < new Date();
              const truncTitle = job.title.length > 60 ? job.title.slice(0, 60) + '…' : job.title;

              return (
                <tr
                  key={job.id}
                  className="hover:bg-neutral-50/60 transition-colors cursor-pointer"
                  onClick={() => openView(job)}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono font-semibold text-[#1B4F9C]">{job.jobNumber}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{job.clientName}</p>
                      <p className="text-xs text-neutral-400">{job.clientContact}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <div className="relative">
                      <p
                        className="text-sm text-neutral-700 truncate"
                        onMouseEnter={() => job.title.length > 60 && setTooltipId(job.id)}
                        onMouseLeave={() => setTooltipId(null)}
                      >
                        {truncTitle}
                      </p>
                      {tooltipId === job.id && (
                        <div className="absolute left-0 top-full z-20 mt-1 max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-lg">
                          <p className="text-xs text-neutral-700">{job.title}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{JOB_TYPE_LABELS[job.jobType]}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-neutral-600">{formatDate(job.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('text-sm', isOverdue ? 'text-red-600 font-semibold' : 'text-neutral-600')}>
                      {formatDate(job.expectedCompletion)}
                      {isOverdue && <span className="ml-1 text-xs">⚠</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-neutral-800 tabular-nums">
                      {job.estimatedTotal != null ? formatCurrency(job.estimatedTotal) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/job-orders/${job.id}/estimation`)}
                        title="Estimate"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-blue-50 hover:text-[#1B4F9C] transition-colors"
                      >
                        <BarChart2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openView(job)}
                        title="View"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(job)}
                        title="Edit"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {openMenuId === job.id && (
                          <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-neutral-200 bg-white shadow-lg py-1">
                            <button
                              onClick={() => handleDuplicate(job.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                            >
                              <Copy className="h-3.5 w-3.5 text-neutral-400" /> Duplicate
                            </button>
                            {job.status === 'draft' && (
                              <button
                                onClick={() => { setDeleteConfirmId(job.id); setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table footer summary */}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-neutral-100 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Showing {filtered.length} of {jobs.length} job orders
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              Total estimated:{' '}
              <span className="text-neutral-800 font-semibold tabular-nums">
                {formatCurrency(
                  filtered.reduce((sum, j) => sum + (j.estimatedTotal ?? 0), 0)
                )}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white py-14 text-center">
            <Briefcase className="h-8 w-8 text-neutral-300" />
            <p className="text-sm text-neutral-500">No job orders found</p>
          </div>
        )}
        {filtered.map((job) => (
          <MobileJobCard
            key={job.id}
            job={job}
            onView={() => openView(job)}
            onEdit={() => openEdit(job)}
            onDuplicate={() => handleDuplicate(job.id)}
            onDelete={() => setDeleteConfirmId(job.id)}
          />
        ))}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Delete Job Order?</h3>
            </div>
            <p className="text-sm text-neutral-500 mb-5">
              This will permanently delete the job order. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside for menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}

      {/* Drawer */}
      <JobOrderDrawer
        open={drawerOpen}
        job={drawerJob}
        onClose={() => { setDrawerOpen(false); setEditingJob(null); setViewingJob(null); }}
      />
    </div>
  );
}
