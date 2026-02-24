import { useState } from 'react';
import { History, Send, Save, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { ESTIMATION_STATUS_CONFIG } from '@/stores/estimationStore';
import type { Estimate, EstimationStatus } from '@/types';

interface Props {
  estimate: Estimate;
  isLocked: boolean;
  onMarginChange: (pct: number) => void;
  onSave: () => void;
  onSubmit: () => void;
  onRevisionHistory: () => void;
}

const canSubmitStatuses: EstimationStatus[] = ['draft', 'returned_for_revision'];

function SummaryRow({ label, value, bold, highlight, muted }: { label: string; value: string; bold?: boolean; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-1.5', highlight && 'border-t border-neutral-200 mt-1 pt-2.5')}>
      <span className={cn('text-sm', muted ? 'text-neutral-400' : 'text-neutral-600')}>{label}</span>
      <span className={cn('text-sm tabular-nums', bold ? 'font-bold text-neutral-900 text-base' : 'text-neutral-800', highlight && 'text-[#1B4F9C] font-bold text-lg')}>{value}</span>
    </div>
  );
}

export function EstimationSummaryPanel({ estimate, isLocked, onMarginChange, onSave, onSubmit, onRevisionHistory }: Props) {
  const [marginInput, setMarginInput] = useState(String(estimate.profitMarginPct));
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const canSubmit =
    canSubmitStatuses.includes(estimate.status) &&
    estimate.materials.length >= 1 &&
    estimate.labor.length >= 1 &&
    estimate.overhead.length >= 1;

  const statusCfg = ESTIMATION_STATUS_CONFIG[estimate.status];

  function handleMarginBlur() {
    const val = parseFloat(marginInput);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onMarginChange(val);
    } else {
      setMarginInput(String(estimate.profitMarginPct));
    }
  }

  const panelContent = (
    <div className="flex flex-col gap-0">
      {/* Status */}
      <div className="mb-3">
        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', statusCfg.className)}>
          {statusCfg.label}
        </span>
        <p className="text-[11px] text-neutral-400 mt-1">Rev. {estimate.revisionNumber} · Last saved {new Date(estimate.lastModifiedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      {/* Totals */}
      <div className="border-t border-neutral-100 pt-3">
        <SummaryRow label="Direct Materials" value={formatCurrency(estimate.materialsTotal)} />
        <SummaryRow label="Direct Labor" value={formatCurrency(estimate.laborTotal)} />
        <SummaryRow label="Overhead" value={formatCurrency(estimate.overheadTotal)} />
        <SummaryRow label="Sub-Total" value={formatCurrency(estimate.subTotal)} bold />
      </div>

      {/* Margin */}
      <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-600">Profit Margin %</label>
          {!isLocked ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={marginInput}
                onChange={(e) => setMarginInput(e.target.value)}
                onBlur={handleMarginBlur}
                className="w-16 rounded border border-neutral-200 bg-white px-2 py-1 text-right text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C]"
              />
              <span className="text-sm text-neutral-500">%</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-neutral-900">{estimate.profitMarginPct}%</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Profit Amount</span>
          <span className="text-sm font-medium text-neutral-800 tabular-nums">{formatCurrency(estimate.profitAmount)}</span>
        </div>
      </div>

      {/* Grand Total */}
      <div className="mt-3 rounded-xl border-2 border-[#1B4F9C]/20 bg-[#1B4F9C]/5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-700">Grand Total</span>
          <span className="text-xl font-bold text-[#1B4F9C] tabular-nums">{formatCurrency(estimate.grandTotal)}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-neutral-400">Effective Margin</span>
          <span className="text-xs font-semibold text-neutral-600">{estimate.effectiveMarginPct.toFixed(2)}%</span>
        </div>
      </div>

      {/* Actions */}
      {!isLocked && (
        <div className="mt-4 space-y-2">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            title={!canSubmit ? 'Add at least 1 item in each section before submitting' : ''}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors',
              canSubmit
                ? 'bg-[#1B4F9C] text-white hover:bg-[#174287]'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
            {estimate.status === 'returned_for_revision' ? 'Re-submit for Approval' : 'Submit for Approval'}
          </button>
          <button
            onClick={onSave}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Estimate
          </button>
        </div>
      )}

      {estimate.status === 'awaiting_client' || estimate.status === 'client_approved' ? (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {}}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Export Estimate PDF
          </button>
        </div>
      ) : null}

      {/* Revision history */}
      <button
        onClick={onRevisionHistory}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        <History className="h-3.5 w-3.5" />
        Revision History ({estimate.revisionHistory.length})
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: sticky panel */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-4 rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Estimate Summary</h2>
          {panelContent}
        </div>
      </aside>

      {/* Mobile: bottom sheet toggle */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30">
        <div className={cn('bg-white border-t border-neutral-200 shadow-2xl transition-all duration-300', mobileExpanded ? 'max-h-[80vh] overflow-y-auto' : 'max-h-14')}>
          <button
            onClick={() => setMobileExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3.5 border-b border-neutral-100"
          >
            <span className="text-sm font-semibold text-neutral-900">
              Estimate Summary · <span className="text-[#1B4F9C]">{formatCurrency(estimate.grandTotal)}</span>
            </span>
            {mobileExpanded ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronUp className="h-4 w-4 text-neutral-400" />}
          </button>
          {mobileExpanded && <div className="p-4">{panelContent}</div>}
        </div>
      </div>
    </>
  );
}
