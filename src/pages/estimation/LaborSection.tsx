import { useState } from 'react';
import { Plus, Pencil, Trash2, Copy, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { LABOR_ROLES } from '@/stores/estimationStore';
import type { LaborLineItem, LaborSource } from '@/types';

function uid() { return Math.random().toString(36).slice(2, 10); }

interface RowFormState {
  taskDescription: string; laborSource: LaborSource; supplierTag: string;
  workerRole: string; estimatedHours: string; hourlyRate: string; notes: string;
}

function rowToForm(row: LaborLineItem): RowFormState {
  return {
    taskDescription: row.taskDescription, laborSource: row.laborSource,
    supplierTag: row.supplierTag ?? '', workerRole: row.workerRole ?? '',
    estimatedHours: String(row.estimatedHours), hourlyRate: String(row.hourlyRate), notes: row.notes ?? '',
  };
}

interface Props {
  items: LaborLineItem[];
  isLocked: boolean;
  onChange: (items: LaborLineItem[]) => void;
}

const inputCls = 'w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] transition-colors';

export function LaborSection({ items, isLocked, onChange }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<RowFormState>({ taskDescription: '', laborSource: 'own_staff', supplierTag: '', workerRole: '', estimatedHours: '0', hourlyRate: '0', notes: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.totalCost, 0);

  function startEdit(item: LaborLineItem) { setEditingId(item.id); setForm(rowToForm(item)); }
  function startNew() { setEditingId('new'); setForm({ taskDescription: '', laborSource: 'own_staff', supplierTag: '', workerRole: '', estimatedHours: '0', hourlyRate: '0', notes: '' }); }
  function setF<K extends keyof RowFormState>(key: K, val: RowFormState[K]) { setForm((f) => ({ ...f, [key]: val })); }

  function saveRow() {
    const hrs = parseFloat(form.estimatedHours) || 0;
    const rate = parseFloat(form.hourlyRate) || 0;
    const item: LaborLineItem = {
      id: editingId === 'new' ? uid() : editingId!,
      taskDescription: form.taskDescription.trim(),
      laborSource: form.laborSource,
      supplierTag: form.supplierTag.trim() || undefined,
      workerRole: form.workerRole.trim() || undefined,
      estimatedHours: hrs, hourlyRate: rate, totalCost: hrs * rate,
      notes: form.notes.trim() || undefined,
    };
    if (editingId === 'new') onChange([...items, item]);
    else onChange(items.map((i) => (i.id === editingId ? item : i)));
    setEditingId(null);
  }

  function duplicate(item: LaborLineItem) {
    onChange([...items, { ...item, id: uid(), taskDescription: item.taskDescription + ' (Copy)' }]);
  }

  function confirmDelete(id: string) {
    const item = items.find((i) => i.id === id);
    if (item && item.estimatedHours > 0) setDeleteConfirmId(id);
    else onChange(items.filter((i) => i.id !== id));
  }

  const liveCost = (parseFloat(form.estimatedHours) || 0) * (parseFloat(form.hourlyRate) || 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">B</div>
          <span className="text-sm font-semibold text-neutral-900">Direct Labor</span>
          <span className="text-xs text-neutral-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(subtotal)}</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
        </div>
      </button>

      {expanded && (
        <>
          <div className="overflow-x-auto border-t border-neutral-100">
            <table className="w-full min-w-[700px]">
              <thead className="bg-neutral-50/80">
                <tr>
                  {['#', 'Task / Role', 'Source', 'Worker/Role', 'Hours', 'Rate/hr', 'Total', 'Notes', ''].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item, idx) =>
                  editingId === item.id ? (
                    <LaborEditRow key={item.id} idx={idx + 1} form={form} liveCost={liveCost} onChange={setF} onSave={saveRow} onCancel={() => setEditingId(null)} />
                  ) : (
                    <tr key={item.id} className="hover:bg-neutral-50/60 group">
                      <td className="px-3 py-3 text-xs text-neutral-400 w-8">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-neutral-900">{item.taskDescription || '—'}</p>
                        {item.supplierTag && <p className="text-xs text-neutral-400">{item.supplierTag}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', item.laborSource === 'subcontractor' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700')}>
                          {item.laborSource === 'subcontractor' ? 'Sub' : 'Own Staff'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-600">{item.workerRole || '—'}</td>
                      <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{item.estimatedHours}h</td>
                      <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{formatCurrency(item.hourlyRate)}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-neutral-900 tabular-nums">{formatCurrency(item.totalCost)}</td>
                      <td className="px-3 py-3 text-xs text-neutral-400 max-w-[120px] truncate">{item.notes || '—'}</td>
                      <td className="px-3 py-3">
                        {!isLocked && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(item)} className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => duplicate(item)} className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><Copy className="h-3 w-3" /></button>
                            <button onClick={() => confirmDelete(item.id)} className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                )}
                {editingId === 'new' && (
                  <LaborEditRow idx={items.length + 1} form={form} liveCost={liveCost} onChange={setF} onSave={saveRow} onCancel={() => setEditingId(null)} isNew />
                )}
                {items.length === 0 && editingId !== 'new' && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-400">No labor items yet. {!isLocked && 'Click "+ Add Labor" to get started.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLocked && editingId !== 'new' && (
            <div className="px-4 py-3 border-t border-neutral-100">
              <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-[#1B4F9C] hover:text-[#1B4F9C] transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Labor
              </button>
            </div>
          )}
        </>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border p-6">
            <h3 className="text-base font-semibold mb-2">Delete labor item?</h3>
            <p className="text-sm text-neutral-500 mb-4">This item has estimated hours greater than zero. Remove anyway?</p>
            <div className="flex gap-2">
              <button onClick={() => { onChange(items.filter((i) => i.id !== deleteConfirmId)); setDeleteConfirmId(null); }} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LaborEditRow({ idx, form, liveCost, onChange, onSave, onCancel, isNew }: {
  idx: number; form: RowFormState; liveCost: number;
  onChange: <K extends keyof RowFormState>(k: K, v: RowFormState[K]) => void;
  onSave: () => void; onCancel: () => void; isNew?: boolean;
}) {
  return (
    <tr className="bg-emerald-50/40 border-l-2 border-emerald-500">
      <td className="px-3 py-2 text-xs text-neutral-400">{idx}</td>
      <td className="px-3 py-2">
        <input className={inputCls} placeholder="Task description" value={form.taskDescription} onChange={(e) => onChange('taskDescription', e.target.value)} autoFocus={!!isNew} />
        {form.laborSource === 'subcontractor' && (
          <input className={cn(inputCls, 'mt-1')} placeholder="Supplier/sub-contractor name" value={form.supplierTag} onChange={(e) => onChange('supplierTag', e.target.value)} />
        )}
      </td>
      <td className="px-3 py-2">
        <select className={inputCls} value={form.laborSource} onChange={(e) => onChange('laborSource', e.target.value as LaborSource)}>
          <option value="own_staff">Own Staff</option>
          <option value="subcontractor">Sub</option>
        </select>
      </td>
      <td className="px-3 py-2">
        {form.laborSource === 'own_staff' ? (
          <select className={inputCls} value={form.workerRole} onChange={(e) => onChange('workerRole', e.target.value)}>
            <option value="">Select role</option>
            {LABOR_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <input className={inputCls} placeholder="Role/designation" value={form.workerRole} onChange={(e) => onChange('workerRole', e.target.value)} />
        )}
      </td>
      <td className="px-3 py-2"><input type="number" min={0} step={0.5} className={inputCls} value={form.estimatedHours} onChange={(e) => onChange('estimatedHours', e.target.value)} /></td>
      <td className="px-3 py-2"><input type="number" min={0} className={inputCls} value={form.hourlyRate} onChange={(e) => onChange('hourlyRate', e.target.value)} /></td>
      <td className="px-3 py-2 text-sm font-semibold text-neutral-800 tabular-nums whitespace-nowrap">{formatCurrency(liveCost)}</td>
      <td className="px-3 py-2"><input className={inputCls} placeholder="Notes" value={form.notes} onChange={(e) => onChange('notes', e.target.value)} /></td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button onClick={onSave} className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50"><X className="h-3.5 w-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}
