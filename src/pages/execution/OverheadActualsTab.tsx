import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useExecutionStore } from '@/stores/executionStore';
import type { ExecutionRecord, Estimate } from '@/types';

const inputCls = 'w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] transition-colors';

interface Props { execution: ExecutionRecord; estimate: Estimate; actor: string; }
interface ActualFormState { overheadId: string; amount: string; date: string; referenceNotes: string; }

function calcOverheadEstimated(basis: string, rateValue: number, matsTotal: number, labTotal: number) {
  switch (basis) {
    case 'percent_labor': return (labTotal * rateValue) / 100;
    case 'percent_materials': return (matsTotal * rateValue) / 100;
    case 'fixed_amount': return rateValue;
    case 'per_machine_hour': return rateValue;
    default: return 0;
  }
}

export function OverheadActualsTab({ execution, estimate, actor }: Props) {
  const { recordOverhead, raiseRevisionRequest } = useExecutionStore();
  const [form, setForm] = useState<ActualFormState>({ overheadId: '', amount: '', date: new Date().toISOString().split('T')[0], referenceNotes: '' });
  const [blockerItem, setBlockerItem] = useState<{ description: string; remaining: number } | null>(null);
  const [revReason, setRevReason] = useState('');
  const [revSent, setRevSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function actualForOverhead(overheadId: string) {
    return execution.overheadActuals.filter((o) => o.overheadId === overheadId).reduce((s, o) => s + o.actualAmount, 0);
  }
  function setF<K extends keyof ActualFormState>(key: K, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function handleRecord() {
    if (!form.overheadId) return;
    const estOvh = estimate.overhead.find((o) => o.id === form.overheadId);
    if (!estOvh) return;
    const estAmt = calcOverheadEstimated(estOvh.basis, estOvh.rateValue, estimate.materialsTotal, estimate.laborTotal);
    const alreadyRecorded = actualForOverhead(form.overheadId);
    const remaining = estAmt - alreadyRecorded;
    const amt = parseFloat(form.amount) || 0;
    if (amt <= 0) return;
    if (amt > remaining) { setBlockerItem({ description: estOvh.description, remaining }); return; }
    recordOverhead(execution.id, {
      overheadId: form.overheadId, description: estOvh.description,
      estimatedAmount: estAmt, actualAmount: amt,
      date: form.date, referenceNotes: form.referenceNotes || undefined,
    });
    setForm((f) => ({ ...f, amount: '', referenceNotes: '' }));
    setShowForm(false);
  }

  function handleRevisionRequest() {
    if (!revReason.trim()) return;
    raiseRevisionRequest(execution.id, revReason, actor);
    setRevSent(true); setBlockerItem(null); setRevReason('');
  }

  const selEst = estimate.overhead.find((o) => o.id === form.overheadId);
  const selEstAmt = selEst ? calcOverheadEstimated(selEst.basis, selEst.rateValue, estimate.materialsTotal, estimate.laborTotal) : 0;
  const selActual = form.overheadId ? actualForOverhead(form.overheadId) : 0;
  const selRemaining = selEstAmt - selActual;

  return (
    <div className="p-4 space-y-4">
      {revSent && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Revision request sent to estimator.</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-neutral-50">
            <tr>{['Overhead Item', 'Basis', 'Estimated Amt', 'Actual to Date', 'Remaining', 'Actuals Recorded'].map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {estimate.overhead.map((ovh) => {
              const estAmt = calcOverheadEstimated(ovh.basis, ovh.rateValue, estimate.materialsTotal, estimate.laborTotal);
              const actual = actualForOverhead(ovh.id);
              const remaining = estAmt - actual;
              const isExhausted = remaining <= 0;
              const actualsForOvh = execution.overheadActuals.filter((o) => o.overheadId === ovh.id);
              return (
                <tr key={ovh.id} className={cn('group', isExhausted && 'bg-red-50/40')}>
                  <td className="px-3 py-3 text-sm font-medium text-neutral-900">{ovh.description}</td>
                  <td className="px-3 py-3"><span className="text-xs rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 font-medium">{ovh.basis.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{formatCurrency(estAmt)}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(actual)}</td>
                  <td className={cn('px-3 py-3 text-sm font-bold tabular-nums', isExhausted ? 'text-red-600' : remaining < estAmt * 0.1 ? 'text-amber-600' : 'text-neutral-700')}>{formatCurrency(remaining)}</td>
                  <td className="px-3 py-3">
                    {actualsForOvh.length > 0 ? (
                      <div className="space-y-0.5">
                        {actualsForOvh.map((oa) => (
                          <div key={oa.id} className="text-xs text-neutral-500">
                            {formatCurrency(oa.actualAmount)} on {oa.date}
                            {oa.referenceNotes && <span className="ml-1 text-neutral-400">— {oa.referenceNotes}</span>}
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-xs text-neutral-300 italic">None yet</span>}
                  </td>
                </tr>
              );
            })}
            {estimate.overhead.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-400">No overhead items in estimate.</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">Record Overhead Actual</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Overhead Item <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.overheadId} onChange={(e) => setF('overheadId', e.target.value)}>
                <option value="">Select item…</option>
                {estimate.overhead.map((o) => {
                  const estAmt = calcOverheadEstimated(o.basis, o.rateValue, estimate.materialsTotal, estimate.laborTotal);
                  const rem = estAmt - actualForOverhead(o.id);
                  return <option key={o.id} value={o.id} disabled={rem <= 0}>{o.description} (Remaining: {formatCurrency(rem)})</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Amount <span className="text-red-500">*</span>
                {selEst && <span className="ml-1 font-normal text-neutral-400">max {formatCurrency(selRemaining)}</span>}
              </label>
              <input type="number" min={0} step={0.01} className={cn(inputCls, parseFloat(form.amount) > selRemaining && 'border-red-400')} value={form.amount} onChange={(e) => setF('amount', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setF('date', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Reference / Notes</label>
              <input className={inputCls} placeholder="Invoice # or reference notes" value={form.referenceNotes} onChange={(e) => setF('referenceNotes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRecord} disabled={!form.overheadId || !form.amount} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Record Actual</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-violet-400 hover:text-violet-600 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Record Overhead Actual
        </button>
      )}

      {blockerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Overhead Estimate Limit Reached</h3>
                <p className="text-sm text-neutral-600 mt-1"><span className="font-medium">{blockerItem.description}</span> — only <span className="font-bold text-red-600">{formatCurrency(blockerItem.remaining)}</span> remaining. Request a revision to record more.</p>
              </div>
            </div>
            {!revSent && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-600">Reason <span className="text-red-500">*</span></label>
                <textarea rows={3} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C]" placeholder="Why is additional overhead needed?" value={revReason} onChange={(e) => setRevReason(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleRevisionRequest} disabled={!revReason.trim()} className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">Request Revision</button>
                  <button onClick={() => setBlockerItem(null)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
                </div>
              </div>
            )}
            {revSent && <button onClick={() => setBlockerItem(null)} className="w-full rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Close</button>}
          </div>
        </div>
      )}
    </div>
  );
}
