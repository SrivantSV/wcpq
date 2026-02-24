import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useExecutionStore } from '@/stores/executionStore';
import type { ExecutionRecord, Estimate } from '@/types';

const inputCls = 'w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] transition-colors';

interface Props { execution: ExecutionRecord; estimate: Estimate; actor: string; }
interface LogFormState { laborId: string; loggedHours: string; dateWorked: string; worker: string; workDescription: string; referenceNo: string; }

export function LaborRecordingTab({ execution, estimate, actor }: Props) {
  const { logLabor, raiseRevisionRequest } = useExecutionStore();
  const [form, setForm] = useState<LogFormState>({ laborId: '', loggedHours: '', dateWorked: new Date().toISOString().split('T')[0], worker: actor, workDescription: '', referenceNo: '' });
  const [blockerItem, setBlockerItem] = useState<{ description: string; remaining: number } | null>(null);
  const [revReason, setRevReason] = useState('');
  const [revSent, setRevSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function loggedForLabor(laborId: string) {
    return execution.laborLogs.filter((l) => l.laborId === laborId).reduce((s, l) => s + l.loggedHours, 0);
  }
  function setF<K extends keyof LogFormState>(key: K, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function handleLog() {
    if (!form.laborId) return;
    const estLab = estimate.labor.find((l) => l.id === form.laborId);
    if (!estLab) return;
    const alreadyLogged = loggedForLabor(form.laborId);
    const remaining = estLab.estimatedHours - alreadyLogged;
    const hrs = parseFloat(form.loggedHours) || 0;
    if (hrs <= 0) return;
    if (hrs > remaining) { setBlockerItem({ description: estLab.taskDescription, remaining }); return; }
    logLabor(execution.id, {
      laborId: form.laborId, taskDescription: estLab.taskDescription,
      estimatedHours: estLab.estimatedHours, loggedHours: hrs,
      dateWorked: form.dateWorked, worker: form.worker,
      workDescription: form.workDescription || undefined, referenceNo: form.referenceNo || undefined,
    });
    setForm((f) => ({ ...f, loggedHours: '', workDescription: '', referenceNo: '' }));
    setShowForm(false);
  }

  function handleRevisionRequest() {
    if (!revReason.trim()) return;
    raiseRevisionRequest(execution.id, revReason, actor);
    setRevSent(true); setBlockerItem(null); setRevReason('');
  }

  const selEst = estimate.labor.find((l) => l.id === form.laborId);
  const selLogged = form.laborId ? loggedForLabor(form.laborId) : 0;
  const selRemaining = selEst ? selEst.estimatedHours - selLogged : 0;

  return (
    <div className="p-4 space-y-4">
      {revSent && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">Revision request sent to estimator.</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="bg-neutral-50">
            <tr>{['Task / Role', 'Source', 'Est. Hours', 'Logged to Date', 'Remaining', 'Rate/hr', 'Actual Cost', 'Log Entries'].map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {estimate.labor.map((lab) => {
              const logged = loggedForLabor(lab.id);
              const remaining = lab.estimatedHours - logged;
              const isExhausted = remaining <= 0;
              const logsForLab = execution.laborLogs.filter((l) => l.laborId === lab.id);
              return (
                <tr key={lab.id} className={cn('group', isExhausted && 'bg-red-50/40')}>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-neutral-900">{lab.taskDescription}</p>
                    {lab.supplierTag && <p className="text-xs text-neutral-400">{lab.supplierTag}</p>}
                  </td>
                  <td className="px-3 py-3"><span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', lab.laborSource === 'subcontractor' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700')}>{lab.laborSource === 'subcontractor' ? 'Sub' : 'Own Staff'}</span></td>
                  <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{lab.estimatedHours}h</td>
                  <td className="px-3 py-3 text-sm font-semibold text-neutral-800 tabular-nums">{logged}h</td>
                  <td className={cn('px-3 py-3 text-sm font-bold tabular-nums', isExhausted ? 'text-red-600' : remaining < lab.estimatedHours * 0.1 ? 'text-amber-600' : 'text-neutral-700')}>{remaining}h</td>
                  <td className="px-3 py-3 text-sm text-neutral-600 tabular-nums">{formatCurrency(lab.hourlyRate)}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(logged * lab.hourlyRate)}</td>
                  <td className="px-3 py-3">
                    {logsForLab.length > 0 ? (
                      <div className="space-y-0.5">
                        {logsForLab.map((ll) => (
                          <div key={ll.id} className="text-xs text-neutral-500">
                            {ll.loggedHours}h on {ll.dateWorked} — {ll.worker}
                            {ll.referenceNo && <span className="ml-1 text-neutral-400">#{ll.referenceNo}</span>}
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-xs text-neutral-300 italic">None yet</span>}
                  </td>
                </tr>
              );
            })}
            {estimate.labor.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-400">No labor items in estimate.</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">Log Labor Hours</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Labor Task <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.laborId} onChange={(e) => setF('laborId', e.target.value)}>
                <option value="">Select task…</option>
                {estimate.labor.map((l) => { const rem = l.estimatedHours - loggedForLabor(l.id); return <option key={l.id} value={l.id} disabled={rem <= 0}>{l.taskDescription} (Remaining: {rem}h)</option>; })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Hours <span className="text-red-500">*</span>
                {selEst && <span className="ml-1 font-normal text-neutral-400">max {selRemaining}h</span>}
              </label>
              <input type="number" min={0} max={selRemaining} step={0.5} className={cn(inputCls, parseFloat(form.loggedHours) > selRemaining && 'border-red-400')} value={form.loggedHours} onChange={(e) => setF('loggedHours', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Date Worked</label>
              <input type="date" className={inputCls} value={form.dateWorked} onChange={(e) => setF('dateWorked', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Worker / Vendor</label>
              <input className={inputCls} value={form.worker} onChange={(e) => setF('worker', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Reference #</label>
              <input className={inputCls} placeholder="Work order / ref" value={form.referenceNo} onChange={(e) => setF('referenceNo', e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Work Description</label>
              <input className={inputCls} placeholder="Brief description of work done" value={form.workDescription} onChange={(e) => setF('workDescription', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLog} disabled={!form.laborId || !form.loggedHours} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Log Hours</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Log Labor Hours
        </button>
      )}

      {blockerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Estimate Hours Limit Reached</h3>
                <p className="text-sm text-neutral-600 mt-1"><span className="font-medium">{blockerItem.description}</span> — only <span className="font-bold text-red-600">{blockerItem.remaining}h</span> remaining. Request a revision to log more.</p>
              </div>
            </div>
            {!revSent && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-600">Reason <span className="text-red-500">*</span></label>
                <textarea rows={3} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C]" placeholder="Why are additional hours needed?" value={revReason} onChange={(e) => setRevReason(e.target.value)} />
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
