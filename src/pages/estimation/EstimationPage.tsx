import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, History, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useJobOrderStore } from '@/stores/jobOrderStore';
import { useEstimationStore, ESTIMATION_STATUS_CONFIG } from '@/stores/estimationStore';
import { MaterialsSection } from './MaterialsSection';
import { LaborSection } from './LaborSection';
import { OverheadSection } from './OverheadSection';
import { EstimationSummaryPanel } from './EstimationSummaryPanel';
import type { MaterialLineItem, LaborLineItem, OverheadLineItem } from '@/types';

const LOCKED_STATUSES = ['under_review', 'awaiting_client', 'client_approved', 'internally_approved'];
const ACTOR = 'Admin User';
const ACTOR_ROLE = 'maker';

export function EstimationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useJobOrderStore();
  const { getByJobId, createEstimate, updateMaterials, updateLabor, updateOverhead, updateMargin, saveEstimate, submitForApproval, resubmitRevision } = useEstimationStore();

  const job = jobs.find((j) => j.id === jobId);
  const estimate = getByJobId(jobId ?? '');

  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [changeNote, setChangeNote] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-create estimate if none exists for this job
  useEffect(() => {
    if (jobId && job && !estimate) {
      createEstimate(jobId, job.jobNumber, ACTOR);
    }
  }, [jobId, job, estimate, createEstimate]);

  // Autosave every 60s
  useEffect(() => {
    if (!estimate) return;
    autosaveTimer.current = setInterval(() => {
      saveEstimate(estimate.id, ACTOR);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }, 60000);
    return () => { if (autosaveTimer.current) clearInterval(autosaveTimer.current); };
  }, [estimate?.id, saveEstimate]);

  if (!job) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-neutral-300" />
        <p className="text-sm font-semibold text-neutral-600">Job order not found</p>
        <button onClick={() => navigate('/job-orders')} className="text-sm text-[#1B4F9C] hover:underline">Back to Job Orders</button>
      </div>
    );
  }

  if (!estimate) return null;

  const isLocked = LOCKED_STATUSES.includes(estimate.status);
  const isReturnedForRevision = estimate.status === 'returned_for_revision';
  const statusCfg = ESTIMATION_STATUS_CONFIG[estimate.status];

  function handleSave() {
    saveEstimate(estimate!.id, ACTOR);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  function handleSubmit() {
    if (isReturnedForRevision) {
      setSubmitConfirmOpen(true);
    } else {
      submitForApproval(estimate!.id, ACTOR, ACTOR_ROLE);
    }
  }

  function handleResubmit() {
    resubmitRevision(estimate!.id, ACTOR, ACTOR_ROLE, changeNote);
    setSubmitConfirmOpen(false);
    setChangeNote('');
  }

  return (
    <div className="min-h-full">
      {/* Autosave toast */}
      <div className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 shadow-md text-sm font-medium text-emerald-700 transition-all duration-300',
        savedToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      )}>
        <Clock className="h-3.5 w-3.5" /> Draft saved
      </div>

      {/* Header */}
      <div className="mb-5">
        <button onClick={() => navigate('/job-orders')} className="mb-3 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Job Orders
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-neutral-900">{job.jobNumber}</h1>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', statusCfg.className)}>
                {statusCfg.label}
              </span>
              <span className="text-xs text-neutral-400">Rev. {estimate.revisionNumber}</span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-600 line-clamp-1">{job.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {job.clientName} · Last modified {formatDate(estimate.lastModifiedAt)} by {estimate.lastModifiedBy}
            </p>
          </div>
          <button
            onClick={() => setRevisionDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            Revision History
          </button>
        </div>
      </div>

      {/* Returned-for-revision banner */}
      {isReturnedForRevision && estimate.returnedNotes && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Returned for Revision</p>
            <p className="text-sm text-amber-700 mt-0.5">{estimate.returnedNotes}</p>
          </div>
        </div>
      )}

      {/* Under review banner */}
      {estimate.status === 'under_review' && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">This estimate is under review. Editing is disabled until a decision is made.</p>
        </div>
      )}

      {/* Main layout: sections + summary */}
      <div className="flex gap-5 items-start">
        {/* Left: 3 sections */}
        <div className="flex-1 min-w-0 space-y-4">
          <MaterialsSection
            items={estimate.materials}
            isLocked={isLocked}
            onChange={(items: MaterialLineItem[]) => updateMaterials(estimate.id, items)}
          />
          <LaborSection
            items={estimate.labor}
            isLocked={isLocked}
            onChange={(items: LaborLineItem[]) => updateLabor(estimate.id, items)}
          />
          <OverheadSection
            items={estimate.overhead}
            isLocked={isLocked}
            materialsTotal={estimate.materialsTotal}
            laborTotal={estimate.laborTotal}
            onChange={(items: OverheadLineItem[]) => updateOverhead(estimate.id, items)}
          />
        </div>

        {/* Right: summary panel */}
        <EstimationSummaryPanel
          estimate={estimate}
          isLocked={isLocked}
          onMarginChange={(pct) => updateMargin(estimate.id, pct)}
          onSave={handleSave}
          onSubmit={handleSubmit}
          onRevisionHistory={() => setRevisionDrawerOpen(true)}
        />
      </div>

      {/* Submit confirm modal (revision resubmit) */}
      {submitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-neutral-200 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-1">Re-submit for Approval</h3>
            <p className="text-sm text-neutral-500 mb-4">This will create Revision {estimate.revisionNumber + 1}. Describe what changed:</p>
            <textarea
              rows={3}
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="Brief summary of changes made..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleResubmit}
                className="flex-1 rounded-lg bg-[#1B4F9C] py-2 text-sm font-semibold text-white hover:bg-[#174287] transition-colors"
              >
                Re-submit
              </button>
              <button
                onClick={() => setSubmitConfirmOpen(false)}
                className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision History Drawer */}
      <RevisionHistoryDrawer
        open={revisionDrawerOpen}
        revisions={estimate.revisionHistory}
        approvalTrail={estimate.approvalTrail}
        onClose={() => setRevisionDrawerOpen(false)}
      />
    </div>
  );
}

interface RevisionHistoryDrawerProps {
  open: boolean;
  revisions: import('@/types').RevisionHistory[];
  approvalTrail: import('@/types').ApprovalRecord[];
  onClose: () => void;
}

function RevisionHistoryDrawer({ open, revisions, approvalTrail, onClose }: RevisionHistoryDrawerProps) {
  const actionColors: Record<string, string> = {
    submitted: 'bg-blue-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    revised: 'bg-amber-500',
  };
  const actionLabels: Record<string, string> = {
    submitted: 'Submitted for approval',
    approved: 'Approved',
    rejected: 'Returned for revision',
    revised: 'Revised & re-submitted',
  };

  return (
    <>
      <div className={cn('fixed inset-0 bg-black/25 z-40 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={onClose} />
      <aside className={cn(
        'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:w-[480px] transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 shrink-0">
          <h2 className="text-base font-semibold text-neutral-900">Revision History</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Approval audit trail */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Approval Audit Trail</h3>
            {approvalTrail.length === 0 && <p className="text-sm text-neutral-400 italic">No activity yet.</p>}
            <div className="relative space-y-0">
              {approvalTrail.map((record, i) => (
                <div key={record.id} className="flex gap-3 pb-4 relative">
                  {i < approvalTrail.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-neutral-200" />
                  )}
                  <div className={cn('mt-1 h-3.5 w-3.5 shrink-0 rounded-full', actionColors[record.action] ?? 'bg-neutral-400')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-800">{actionLabels[record.action] ?? record.action}</p>
                    <p className="text-xs text-neutral-500">{record.performedBy} ({record.performedByRole})</p>
                    <p className="text-xs text-neutral-400">{new Date(record.timestamp).toLocaleString('en-IN')}</p>
                    {record.notes && (
                      <p className="mt-1 text-xs text-neutral-600 bg-neutral-50 rounded-md px-2 py-1.5 border border-neutral-100">{record.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revision snapshots */}
          {revisions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Revision Snapshots</h3>
              <div className="space-y-3">
                {[...revisions].reverse().map((rev) => (
                  <div key={rev.revisionNumber} className="rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-neutral-800">Revision {rev.revisionNumber}</span>
                      <span className="text-xs text-neutral-400">{formatDate(rev.createdAt)}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">By {rev.createdBy}</p>
                    {rev.changeNote && <p className="text-xs text-neutral-600 italic mb-3">"{rev.changeNote}"</p>}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-md bg-neutral-50 p-2">
                        <p className="text-neutral-400">Materials</p>
                        <p className="font-semibold text-neutral-700">{rev.materials.length} items</p>
                      </div>
                      <div className="rounded-md bg-neutral-50 p-2">
                        <p className="text-neutral-400">Labor</p>
                        <p className="font-semibold text-neutral-700">{rev.labor.length} items</p>
                      </div>
                      <div className="rounded-md bg-neutral-50 p-2">
                        <p className="text-neutral-400">Grand Total</p>
                        <p className="font-semibold text-neutral-700">{formatCurrency(rev.grandTotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
