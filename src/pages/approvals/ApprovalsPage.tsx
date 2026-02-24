import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, ChevronRight, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useEstimationStore, ESTIMATION_STATUS_CONFIG } from '@/stores/estimationStore';
import { useJobOrderStore } from '@/stores/jobOrderStore';
import type { Estimate } from '@/types';

const APPROVER = 'Approver User';
const APPROVER_ROLE = 'approver';

const AUDIT_COLORS: Record<string, string> = {
  submitted: 'bg-blue-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  revised: 'bg-amber-500',
};

const AUDIT_LABELS: Record<string, string> = {
  submitted: 'Submitted for approval',
  approved: 'Approved',
  rejected: 'Returned for revision',
  revised: 'Revised & re-submitted',
};

function SummaryRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-1.5', bold && 'border-t border-neutral-200 mt-1 pt-2.5')}>
      <span className="text-sm text-neutral-500">{label}</span>
      <span className={cn('text-sm tabular-nums', bold ? 'font-bold text-neutral-900 text-base' : 'font-medium text-neutral-800', accent && 'text-[#1B4F9C] font-bold text-lg')}>{value}</span>
    </div>
  );
}

export function ApprovalsPage() {
  const { estimates, approveEstimate, rejectEstimate } = useEstimationStore();
  const { jobs } = useJobOrderStore();
  const navigate = useNavigate();

  const pending = estimates
    .filter((e) => e.status === 'under_review')
    .sort((a, b) => a.lastModifiedAt.localeCompare(b.lastModifiedAt));

  const [selected, setSelected] = useState<Estimate | null>(pending[0] ?? null);
  const [approverNotes, setApproverNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

  const selectedJob = selected ? jobs.find((j) => j.id === selected.jobOrderId) : null;
  const statusCfg = selected ? ESTIMATION_STATUS_CONFIG[selected.status] : null;

  function handleApprove() {
    if (!selected) return;
    approveEstimate(selected.id, APPROVER, APPROVER_ROLE, approverNotes);
    setApproverNotes('');
    setConfirmAction(null);
    const remaining = estimates.filter((e) => e.status === 'under_review' && e.id !== selected.id);
    setSelected(remaining[0] ?? null);
  }

  function handleReject() {
    if (!selected) return;
    if (!approverNotes.trim()) {
      setNotesError('Reviewer notes are required when rejecting.');
      return;
    }
    rejectEstimate(selected.id, APPROVER, APPROVER_ROLE, approverNotes);
    setApproverNotes('');
    setConfirmAction(null);
    setNotesError('');
    const remaining = estimates.filter((e) => e.status === 'under_review' && e.id !== selected.id);
    setSelected(remaining[0] ?? null);
  }

  return (
    <div className="flex gap-0 h-full min-h-[600px]">
      {/* Left: pending list */}
      <div className="w-72 shrink-0 border-r border-neutral-200 bg-white rounded-l-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3.5 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Pending Approvals</h2>
          <p className="text-xs text-neutral-400 mt-0.5">{pending.length} awaiting review · Oldest first</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {pending.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
              <CheckCircle className="h-8 w-8 text-emerald-300" />
              <p className="text-sm font-medium text-neutral-600">All clear!</p>
              <p className="text-xs text-neutral-400">No estimates pending approval.</p>
            </div>
          )}
          {pending.map((est) => {
            const job = jobs.find((j) => j.id === est.jobOrderId);
            const isSelected = selected?.id === est.id;
            return (
              <button
                key={est.id}
                onClick={() => { setSelected(est); setApproverNotes(''); setNotesError(''); setConfirmAction(null); }}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
                  isSelected ? 'bg-[#1B4F9C]/5 border-l-2 border-[#1B4F9C]' : 'hover:bg-neutral-50 border-l-2 border-transparent'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-mono font-semibold text-[#1B4F9C]">{est.jobNumber}</span>
                    <ChevronRight className="h-3 w-3 text-neutral-300 shrink-0" />
                  </div>
                  <p className="text-xs font-medium text-neutral-800 mt-0.5 truncate">{job?.clientName ?? '—'}</p>
                  <p className="text-xs text-neutral-400 truncate">{job?.title ?? '—'}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-semibold text-neutral-700 tabular-nums">{formatCurrency(est.grandTotal)}</span>
                    <span className="text-[10px] text-neutral-400">{formatDate(est.lastModifiedAt)}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">By {est.lastModifiedBy} · Rev. {est.revisionNumber}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: review screen */}
      {selected && selectedJob ? (
        <div className="flex-1 min-w-0 bg-neutral-50 rounded-r-xl overflow-hidden flex flex-col">
          {/* Review header */}
          <div className="bg-white border-b border-neutral-200 px-6 py-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-neutral-900">{selected.jobNumber}</h2>
                  {statusCfg && (
                    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', statusCfg.className)}>
                      {statusCfg.label}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">Rev. {selected.revisionNumber}</span>
                </div>
                <p className="text-sm text-neutral-600 mt-0.5 line-clamp-1">{selectedJob.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedJob.clientName} · Submitted by {selected.lastModifiedBy}</p>
              </div>
              <button
                onClick={() => navigate(`/job-orders/${selected.jobOrderId}/estimation`)}
                className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                View Full Estimate
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-5 p-6 items-start">
              {/* Left: line item preview */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Materials preview */}
                <SectionPreview label="A — Direct Materials" color="blue" items={selected.materials.map(m => ({ label: m.description, sub: m.source === 'external_purchase' ? `External · ${m.supplierTag ?? ''}` : 'From Stock', right: `${m.estimatedQty} ${m.unit} × ${formatCurrency(m.unitCost)}`, total: formatCurrency(m.totalCost) }))} sectionTotal={formatCurrency(selected.materialsTotal)} />
                {/* Labor preview */}
                <SectionPreview label="B — Direct Labor" color="emerald" items={selected.labor.map(l => ({ label: l.taskDescription, sub: `${l.workerRole ?? ''} · ${l.laborSource === 'subcontractor' ? 'Sub' : 'Own Staff'}`, right: `${l.estimatedHours}h × ${formatCurrency(l.hourlyRate)}`, total: formatCurrency(l.totalCost) }))} sectionTotal={formatCurrency(selected.laborTotal)} />
                {/* Overhead preview */}
                <SectionPreview label="C — Overhead" color="violet" items={selected.overhead.map(o => ({ label: o.description, sub: o.basis.replace(/_/g, ' '), right: `${o.basis.startsWith('percent') ? o.rateValue + '%' : formatCurrency(o.rateValue)}`, total: formatCurrency(o.calculatedTotal) }))} sectionTotal={formatCurrency(selected.overheadTotal)} />

                {/* Audit trail */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Approval Audit Trail</h3>
                  {selected.approvalTrail.length === 0 && <p className="text-sm text-neutral-400 italic">No activity yet.</p>}
                  <div className="space-y-3">
                    {selected.approvalTrail.map((rec, i) => (
                      <div key={rec.id} className="flex gap-3">
                        <div className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', AUDIT_COLORS[rec.action] ?? 'bg-neutral-400')} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-800">{AUDIT_LABELS[rec.action] ?? rec.action}</p>
                          <p className="text-xs text-neutral-500">{rec.performedBy} ({rec.performedByRole}) · {new Date(rec.timestamp).toLocaleString('en-IN')}</p>
                          {rec.notes && <p className="mt-1 text-xs text-neutral-600 bg-amber-50 rounded px-2 py-1 border border-amber-100">{rec.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: summary + approve/reject */}
              <div className="w-72 shrink-0 space-y-4">
                {/* Summary */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Estimate Summary</h3>
                  <SummaryRow label="Direct Materials" value={formatCurrency(selected.materialsTotal)} />
                  <SummaryRow label="Direct Labor" value={formatCurrency(selected.laborTotal)} />
                  <SummaryRow label="Overhead" value={formatCurrency(selected.overheadTotal)} />
                  <SummaryRow label="Sub-Total" value={formatCurrency(selected.subTotal)} bold />
                  <div className="mt-3 rounded-lg bg-neutral-50 border border-neutral-100 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Profit Margin</span>
                      <span className="font-semibold text-neutral-700">{selected.profitMarginPct}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Profit Amount</span>
                      <span className="font-semibold text-neutral-700 tabular-nums">{formatCurrency(selected.profitAmount)}</span>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border-2 border-[#1B4F9C]/20 bg-[#1B4F9C]/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-700">Grand Total</span>
                      <span className="text-xl font-bold text-[#1B4F9C] tabular-nums">{formatCurrency(selected.grandTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-400">Effective Margin</span>
                      <span className="text-xs font-semibold text-neutral-600">{selected.effectiveMarginPct.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Approver notes + actions */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                    Reviewer Notes <span className="text-neutral-400 font-normal">(required on reject)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={approverNotes}
                    onChange={(e) => { setApproverNotes(e.target.value); setNotesError(''); }}
                    placeholder="Add notes for the maker..."
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors resize-none',
                      notesError ? 'border-red-400' : 'border-neutral-200'
                    )}
                  />
                  {notesError && <p className="text-xs text-red-500 mt-1">{notesError}</p>}

                  <div className="mt-3 space-y-2">
                    {confirmAction === 'approve' ? (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold text-emerald-800 mb-2">Confirm approval?</p>
                        <div className="flex gap-2">
                          <button onClick={handleApprove} className="flex-1 rounded-md bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Yes, Approve</button>
                          <button onClick={() => setConfirmAction(null)} className="flex-1 rounded-md border border-emerald-200 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Cancel</button>
                        </div>
                      </div>
                    ) : confirmAction === 'reject' ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-xs font-semibold text-red-800 mb-2">Confirm rejection?</p>
                        <div className="flex gap-2">
                          <button onClick={handleReject} className="flex-1 rounded-md bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Yes, Return</button>
                          <button onClick={() => setConfirmAction(null)} className="flex-1 rounded-md border border-red-200 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmAction('approve')}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve Estimate
                        </button>
                        <button
                          onClick={() => { if (!approverNotes.trim()) { setNotesError('Add reviewer notes before rejecting.'); return; } setConfirmAction('reject'); }}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Return for Revision
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Job info */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Job Info</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    {selectedJob.clientName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    Due {formatDate(selectedJob.expectedCompletion)}
                  </div>
                  {selectedJob.clientInstructions && (
                    <p className="text-xs text-neutral-500 bg-neutral-50 rounded-md p-2 border border-neutral-100">
                      {selectedJob.clientInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 rounded-r-xl">
          <AlertTriangle className="h-10 w-10 text-neutral-200 mb-3" />
          <p className="text-sm font-medium text-neutral-500">Select an estimate to review</p>
          <p className="text-xs text-neutral-400 mt-1">Pending approvals appear on the left</p>
        </div>
      )}
    </div>
  );
}

function SectionPreview({ label, color, items, sectionTotal }: {
  label: string;
  color: 'blue' | 'emerald' | 'violet';
  items: { label: string; sub: string; right: string; total: string }[];
  sectionTotal: string;
}) {
  const colorMap = {
    blue: { dot: 'bg-blue-100 text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    emerald: { dot: 'bg-emerald-100 text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    violet: { dot: 'bg-violet-100 text-violet-700', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  };
  const cfg = colorMap[color];
  const letter = label[0];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold', cfg.dot)}>{letter}</div>
          <span className="text-xs font-semibold text-neutral-700">{label}</span>
          <span className="text-xs text-neutral-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-xs font-semibold text-neutral-800 tabular-nums">{sectionTotal}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-3 text-xs text-neutral-400 italic">No items</p>
      ) : (
        <div className="divide-y divide-neutral-50">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-800 truncate">{item.label}</p>
                <p className="text-xs text-neutral-400 truncate">{item.sub} · {item.right}</p>
              </div>
              <span className="text-sm font-semibold text-neutral-900 tabular-nums shrink-0">{item.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
