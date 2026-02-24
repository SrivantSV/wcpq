import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useJobOrderStore } from '@/stores/jobOrderStore';
import { useEstimationStore, ESTIMATION_STATUS_CONFIG } from '@/stores/estimationStore';
import { useExecutionStore, EXECUTION_STATUS_CONFIG } from '@/stores/executionStore';
import { MaterialIssuanceTab } from './MaterialIssuanceTab';
import { LaborRecordingTab } from './LaborRecordingTab';
import { OverheadActualsTab } from './OverheadActualsTab';
import { VarianceSummaryPanel } from './VarianceSummaryPanel';

type Tab = 'materials' | 'labor' | 'overhead' | 'variance';

const TABS: { key: Tab; label: string }[] = [
  { key: 'materials', label: 'Materials' },
  { key: 'labor', label: 'Labor' },
  { key: 'overhead', label: 'Overhead' },
  { key: 'variance', label: 'Variance Summary' },
];

const ACTOR = 'Admin User';

export function ExecutionPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useJobOrderStore();
  const { getByJobId: getEstimate } = useEstimationStore();
  const { getByJobId: getExecution, createRecord, setStatus } = useExecutionStore();

  const job = jobs.find((j) => j.id === jobId);
  const estimate = getEstimate(jobId ?? '');
  let execution = getExecution(jobId ?? '');

  const [tab, setTab] = useState<Tab>('materials');
  const [completeConfirm, setCompleteConfirm] = useState(false);

  if (!job || !estimate) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-neutral-300" />
        <p className="text-sm font-semibold text-neutral-600">Job or estimate not found</p>
        <button onClick={() => navigate('/job-orders')} className="text-sm text-[#1B4F9C] hover:underline">Back to Job Orders</button>
      </div>
    );
  }

  // Auto-create execution record
  if (!execution) {
    execution = createRecord(job.id, job.jobNumber, estimate.id);
  }

  // Derive actual costs
  const matActualCost = execution.materialIssuances.reduce((s, m) => {
    const est = estimate.materials.find((e) => e.id === m.materialId);
    return s + m.issuedQty * (est?.unitCost ?? 0);
  }, 0);
  const labActualCost = execution.laborLogs.reduce((s, l) => {
    const est = estimate.labor.find((e) => e.id === l.laborId);
    return s + l.loggedHours * (est?.hourlyRate ?? 0);
  }, 0);
  const ovhActualCost = execution.overheadActuals.reduce((s, o) => s + o.actualAmount, 0);
  const totalActual = matActualCost + labActualCost + ovhActualCost;

  const estimatedTotal = estimate.subTotal;
  const remaining = estimatedTotal - totalActual;
  const variance = totalActual - estimatedTotal;
  const progressPct = estimatedTotal > 0 ? Math.min((totalActual / estimatedTotal) * 100, 100) : 0;

  const variantStatus = variance > 0 ? 'over' : progressPct >= 90 ? 'warn' : 'ok';
  const variantColors = { ok: 'text-emerald-600', warn: 'text-amber-500', over: 'text-red-600' };
  const progressBarColor = variance > 0 ? 'bg-red-500' : progressPct >= 90 ? 'bg-amber-400' : 'bg-emerald-500';

  const exStatusCfg = EXECUTION_STATUS_CONFIG[execution.status];
  const estStatusCfg = ESTIMATION_STATUS_CONFIG[estimate.status];

  const pendingRevReqs = execution.revisionRequests.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-full space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/job-orders')} className="mb-3 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Job Orders
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-neutral-900">{job.jobNumber}</h1>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', exStatusCfg.className)}>
                {exStatusCfg.label}
              </span>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', estStatusCfg.className)}>
                Est: {estStatusCfg.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-600 line-clamp-1">{job.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{job.clientName} · Due {formatDate(job.expectedCompletion)}</p>
          </div>
          {execution.status !== 'completed' && (
            <button
              onClick={() => setCompleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Pending revision request banner */}
      {pendingRevReqs.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{pendingRevReqs.length} Revision Request{pendingRevReqs.length > 1 ? 's' : ''} Pending</p>
            <p className="text-xs text-amber-700 mt-0.5 line-clamp-2">{pendingRevReqs[0].reason}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Estimated Total" value={formatCurrency(estimatedTotal)} sub="From approved estimate" color="neutral" />
        <KpiCard label="Actual to Date" value={formatCurrency(totalActual)} sub={`${progressPct.toFixed(1)}% consumed`} color="blue" />
        <KpiCard label="Remaining Budget" value={formatCurrency(Math.max(remaining, 0))} sub={remaining < 0 ? 'Over budget!' : 'Available'} color={remaining < 0 ? 'red' : 'emerald'} />
        <KpiCard
          label="Variance"
          value={formatCurrency(Math.abs(variance))}
          sub={variance === 0 ? 'On budget' : variance > 0 ? 'Over estimate' : 'Under estimate'}
          color={variantStatus === 'ok' ? 'emerald' : variantStatus === 'warn' ? 'amber' : 'red'}
          icon={variance > 0 ? <TrendingUp className="h-4 w-4" /> : variance < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-600">Budget Consumed</span>
          <span className={cn('text-xs font-bold', variantColors[variantStatus])}>{progressPct.toFixed(1)}% of Estimated</span>
        </div>
        <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', progressBarColor)}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-neutral-400">₹0</span>
          <span className="text-xs text-neutral-400">{formatCurrency(estimatedTotal)}</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'shrink-0 px-5 py-3 text-sm font-medium transition-colors border-b-2',
                tab === t.key
                  ? 'border-[#1B4F9C] text-[#1B4F9C] bg-blue-50/40'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-1">
          {tab === 'materials' && (
            <MaterialIssuanceTab
              execution={execution}
              estimate={estimate}
              actor={ACTOR}
            />
          )}
          {tab === 'labor' && (
            <LaborRecordingTab
              execution={execution}
              estimate={estimate}
              actor={ACTOR}
            />
          )}
          {tab === 'overhead' && (
            <OverheadActualsTab
              execution={execution}
              estimate={estimate}
              actor={ACTOR}
            />
          )}
          {tab === 'variance' && (
            <VarianceSummaryPanel
              estimate={estimate}
              matActual={matActualCost}
              labActual={labActualCost}
              ovhActual={ovhActualCost}
            />
          )}
        </div>
      </div>

      {/* Complete confirmation modal */}
      {completeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-neutral-200 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Mark Execution as Complete?</h3>
            <p className="text-sm text-neutral-500 mb-4">
              This will finalize the execution record. You can then create an invoice from the Finance module.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setStatus(execution!.id, 'completed'); setCompleteConfirm(false); }}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Yes, Complete
              </button>
              <button
                onClick={() => setCompleteConfirm(false)}
                className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string;
  color: 'neutral' | 'blue' | 'emerald' | 'amber' | 'red';
  icon?: React.ReactNode;
}) {
  const colorMap = {
    neutral: 'bg-neutral-50 border-neutral-200',
    blue: 'bg-blue-50 border-blue-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  };
  const textMap = {
    neutral: 'text-neutral-700',
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  return (
    <div className={cn('rounded-xl border p-4', colorMap[color])}>
      <p className="text-xs font-semibold text-neutral-500 mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon && <span className={textMap[color]}>{icon}</span>}
        <p className={cn('text-lg font-bold tabular-nums', textMap[color])}>{value}</p>
      </div>
      <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
    </div>
  );
}
