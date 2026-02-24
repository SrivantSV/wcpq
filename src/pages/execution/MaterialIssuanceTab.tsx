import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useExecutionStore } from '@/stores/executionStore';
import type { ExecutionRecord, Estimate } from '@/types';

const inputCls = 'w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] transition-colors';

interface Props {
  execution: ExecutionRecord;
  estimate: Estimate;
  actor: string;
}

interface IssueFormState {
  materialId: string;
  issueQty: string;
  issueDate: string;
  issuedBy: string;
  vendorRef: string;
  referenceNo: string;
}

export function MaterialIssuanceTab({ execution, estimate, actor }: Props) {
  const { issueM, raiseRevisionRequest } = useExecutionStore();
  const [form, setForm] = useState<IssueFormState>({ materialId: '', issueQty: '', issueDate: new Date().toISOString().split('T')[0], issuedBy: actor, vendorRef: '', referenceNo: '' });
  const [blockerItem, setBlockerItem] = useState<{ description: string; remaining: number } | null>(null);
  const [revReason, setRevReason] = useState('');
  const [revSent, setRevSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function issuedForMaterial(materialId: string) {
    return execution.materialIssuances.filter((m) => m.materialId === materialId).reduce((s, m) => s + m.issuedQty, 0);
  }

  function setF<K extends keyof IssueFormState>(key: K, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function handleIssue() {
    if (!form.materialId) return;
    const estMat = estimate.materials.find((m) => m.id === form.materialId);
    if (!estMat) return;
    const alreadyIssued = issuedForMaterial(form.materialId);
    const remaining = estMat.estimatedQty - alreadyIssued;
    const qty = parseFloat(form.issueQty) || 0;
    if (qty <= 0) return;

    if (qty > remaining) {
      setBlockerItem({ description: estMat.description, remaining });
      return;
    }

    issueM(execution.id, {
      materialId: form.materialId,
      description: estMat.description,
      unit: estMat.unit,
      estimatedQty: estMat.estimatedQty,
      issuedQty: qty,
      issueDate: form.issueDate,
      issuedBy: form.issuedBy,
      vendorRef: form.vendorRef || undefined,
      referenceNo: form.referenceNo || undefined,
    });
    setForm((f) => ({ ...f, issueQty: '', referenceNo: '', vendorRef: '' }));
    setShowForm(false);
  }

  function handleRevisionRequest() {
    if (!revReason.trim()) return;
    raiseRevisionRequest(execution.id, revReason, actor);
    setRevSent(true);
    setBlockerItem(null);
    setRevReason('');
  }

  const selectedEstMat = estimate.materials.find((m) => m.id === form.materialId);
  const selectedIssued = form.materialId ? issuedForMaterial(form.materialId) : 0;
  const selectedRemaining = selectedEstMat ? selectedEstMat.estimatedQty - selectedIssued : 0;

  return (
    <div className="p-4 space-y-4">
      {revSent && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Revision request sent to estimator.
        </div>
      )}

      {/* Material rows */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-neutral-50">
            <tr>
              {['Material', 'Unit', 'Est. Qty', 'Issued to Date', 'Remaining', 'Cost/Unit', 'Actual Cost', 'Issuances'].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {estimate.materials.map((mat) => {
              const issued = issuedForMaterial(mat.id);
              const remaining = mat.estimatedQty - issued;
              const isExhausted = remaining <= 0;
              const issuancesForMat = execution.materialIssuances.filter((m) => m.materialId === mat.id);
              return (
                <tr key={mat.id} className={cn('group', isExhausted && 'bg-red-50/40')}>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-neutral-900">{mat.description}</p>
                    {mat.supplierTag && <p className="text-xs text-neutral-400">{mat.supplierTag}</p>}
                  </td>
                  <td className="px-3 py-3 text-sm text-neutral-600">{mat.unit}</td>
                  <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{mat.estimatedQty}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-neutral-800 tabular-nums">{issued}</td>
                  <td className={cn('px-3 py-3 text-sm font-bold tabular-nums', isExhausted ? 'text-red-600' : remaining < mat.estimatedQty * 0.1 ? 'text-amber-600' : 'text-neutral-700')}>
                    {remaining}
                  </td>
                  <td className="px-3 py-3 text-sm text-neutral-600 tabular-nums">{formatCurrency(mat.unitCost)}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(issued * mat.unitCost)}</td>
                  <td className="px-3 py-3">
                    {issuancesForMat.length > 0 ? (
                      <div className="space-y-0.5">
                        {issuancesForMat.map((iss) => (
                          <div key={iss.id} className="text-xs text-neutral-500">
                            {iss.issuedQty} {mat.unit} on {iss.issueDate} by {iss.issuedBy}
                            {iss.referenceNo && <span className="ml-1 text-neutral-400">#{iss.referenceNo}</span>}
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-xs text-neutral-300 italic">None yet</span>}
                  </td>
                </tr>
              );
            })}
            {estimate.materials.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-400">No materials in estimate.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Issue form */}
      {showForm ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">Record Material Issuance</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Material <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.materialId} onChange={(e) => setF('materialId', e.target.value)}>
                <option value="">Select material…</option>
                {estimate.materials.map((m) => {
                  const issued = issuedForMaterial(m.id);
                  const rem = m.estimatedQty - issued;
                  return <option key={m.id} value={m.id} disabled={rem <= 0}>{m.description} (Remaining: {rem} {m.unit})</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Issue Qty <span className="text-red-500">*</span>
                {selectedEstMat && <span className="ml-1 font-normal text-neutral-400">max {selectedRemaining} {selectedEstMat.unit}</span>}
              </label>
              <input type="number" min={0} max={selectedRemaining} step={0.1} className={cn(inputCls, parseFloat(form.issueQty) > selectedRemaining && 'border-red-400')} value={form.issueQty} onChange={(e) => setF('issueQty', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Issue Date</label>
              <input type="date" className={inputCls} value={form.issueDate} onChange={(e) => setF('issueDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Issued By</label>
              <input className={inputCls} value={form.issuedBy} onChange={(e) => setF('issuedBy', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Vendor / Supplier</label>
              <input className={inputCls} placeholder="Vendor name" value={form.vendorRef} onChange={(e) => setF('vendorRef', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Reference #</label>
              <input className={inputCls} placeholder="GRN / PO number" value={form.referenceNo} onChange={(e) => setF('referenceNo', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleIssue} disabled={!form.materialId || !form.issueQty} className="rounded-lg bg-[#1B4F9C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#174287] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Issue Material</button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-[#1B4F9C] hover:text-[#1B4F9C] transition-colors">
          <Plus className="h-3.5 w-3.5" /> Record Issuance
        </button>
      )}

      {/* Blocker modal */}
      {blockerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Estimate Limit Reached</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  <span className="font-medium">{blockerItem.description}</span> — only{' '}
                  <span className="font-bold text-red-600">{blockerItem.remaining}</span> units remain in the approved estimate.
                  No overrides are permitted. To issue more, request an estimate revision.
                </p>
              </div>
            </div>
            {!revSent && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-600">Reason for revision request <span className="text-red-500">*</span></label>
                <textarea rows={3} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C]" placeholder="Describe why additional quantity is needed…" value={revReason} onChange={(e) => setRevReason(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleRevisionRequest} disabled={!revReason.trim()} className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">Request Estimate Revision</button>
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
