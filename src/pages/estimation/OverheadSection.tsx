import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OVERHEAD_BASIS_LABELS } from '@/stores/estimationStore';
import type { OverheadLineItem, OverheadBasis } from '@/types';

function uid() { return Math.random().toString(36).slice(2, 10); }

interface RowFormState {
  description: string; basis: OverheadBasis; rateValue: string; notes: string;
}

function rowToForm(row: OverheadLineItem): RowFormState {
  return { description: row.description, basis: row.basis, rateValue: String(row.rateValue), notes: row.notes ?? '' };
}

interface Props {
  items: OverheadLineItem[];
  isLocked: boolean;
  materialsTotal: number;
  laborTotal: number;
  onChange: (items: OverheadLineItem[]) => void;
}

const inputCls = 'w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] transition-colors';

function calcOverheadTotal(basis: OverheadBasis, rateValue: number, materialsTotal: number, laborTotal: number) {
  switch (basis) {
    case 'percent_labor': return (laborTotal * rateValue) / 100;
    case 'percent_materials': return (materialsTotal * rateValue) / 100;
    case 'fixed_amount': return rateValue;
    case 'per_machine_hour': return rateValue;
    default: return 0;
  }
}

export function OverheadSection({ items, isLocked, materialsTotal, laborTotal, onChange }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<RowFormState>({ description: '', basis: 'fixed_amount', rateValue: '0', notes: '' });

  const subtotal = items.reduce((s, i) => s + calcOverheadTotal(i.basis, i.rateValue, materialsTotal, laborTotal), 0);

  function startEdit(item: OverheadLineItem) { setEditingId(item.id); setForm(rowToForm(item)); }
  function startNew() { setEditingId('new'); setForm({ description: '', basis: 'fixed_amount', rateValue: '0', notes: '' }); }
  function setF<K extends keyof RowFormState>(key: K, val: RowFormState[K]) { setForm((f) => ({ ...f, [key]: val })); }

  function saveRow() {
    const rv = parseFloat(form.rateValue) || 0;
    const calc = calcOverheadTotal(form.basis, rv, materialsTotal, laborTotal);
    const item: OverheadLineItem = {
      id: editingId === 'new' ? uid() : editingId!,
      description: form.description.trim(),
      basis: form.basis, rateValue: rv, calculatedTotal: calc,
      notes: form.notes.trim() || undefined,
    };
    if (editingId === 'new') onChange([...items, item]);
    else onChange(items.map((i) => (i.id === editingId ? item : i)));
    setEditingId(null);
  }

  const liveCalc = calcOverheadTotal(form.basis, parseFloat(form.rateValue) || 0, materialsTotal, laborTotal);
  const rateLabel = form.basis === 'percent_labor' || form.basis === 'percent_materials' ? '%' : '₹';

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">C</div>
          <span className="text-sm font-semibold text-neutral-900">Overhead</span>
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
            <table className="w-full min-w-[600px]">
              <thead className="bg-neutral-50/80">
                <tr>
                  {['#', 'Overhead Item', 'Basis', 'Rate / Value', 'Calculated Total', 'Notes', ''].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item, idx) => {
                  const calc = calcOverheadTotal(item.basis, item.rateValue, materialsTotal, laborTotal);
                  return editingId === item.id ? (
                    <OverheadEditRow key={item.id} idx={idx + 1} form={form} liveCalc={liveCalc} rateLabel={rateLabel} onChange={setF} onSave={saveRow} onCancel={() => setEditingId(null)} />
                  ) : (
                    <tr key={item.id} className="hover:bg-neutral-50/60 group">
                      <td className="px-3 py-3 text-xs text-neutral-400 w-8">{idx + 1}</td>
                      <td className="px-3 py-3 text-sm font-medium text-neutral-900">{item.description || '—'}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 font-medium">
                          {OVERHEAD_BASIS_LABELS[item.basis]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">
                        {item.basis === 'percent_labor' || item.basis === 'percent_materials' ? `${item.rateValue}%` : formatCurrency(item.rateValue)}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-neutral-900 tabular-nums">{formatCurrency(calc)}</td>
                      <td className="px-3 py-3 text-xs text-neutral-400 max-w-[120px] truncate">{item.notes || '—'}</td>
                      <td className="px-3 py-3">
                        {!isLocked && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(item)} className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => onChange(items.filter((i) => i.id !== item.id))} className="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {editingId === 'new' && (
                  <OverheadEditRow idx={items.length + 1} form={form} liveCalc={liveCalc} rateLabel={rateLabel} onChange={setF} onSave={saveRow} onCancel={() => setEditingId(null)} isNew />
                )}
                {items.length === 0 && editingId !== 'new' && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-400">No overhead items yet. {!isLocked && 'Click "+ Add Overhead" to get started.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLocked && editingId !== 'new' && (
            <div className="px-4 py-3 border-t border-neutral-100">
              <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-violet-400 hover:text-violet-600 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Overhead
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OverheadEditRow({ idx, form, liveCalc, rateLabel, onChange, onSave, onCancel, isNew }: {
  idx: number; form: RowFormState; liveCalc: number; rateLabel: string;
  onChange: <K extends keyof RowFormState>(k: K, v: RowFormState[K]) => void;
  onSave: () => void; onCancel: () => void; isNew?: boolean;
}) {
  return (
    <tr className="bg-violet-50/40 border-l-2 border-violet-500">
      <td className="px-3 py-2 text-xs text-neutral-400">{idx}</td>
      <td className="px-3 py-2"><input className={inputCls} placeholder="Overhead description" value={form.description} onChange={(e) => onChange('description', e.target.value)} autoFocus={!!isNew} /></td>
      <td className="px-3 py-2">
        <select className={inputCls} value={form.basis} onChange={(e) => onChange('basis', e.target.value as OverheadBasis)}>
          {Object.entries(OVERHEAD_BASIS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <input type="number" min={0} className={inputCls} value={form.rateValue} onChange={(e) => onChange('rateValue', e.target.value)} />
          <span className="text-xs text-neutral-500 shrink-0">{rateLabel}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-sm font-semibold text-neutral-800 tabular-nums whitespace-nowrap">{formatCurrency(liveCalc)}</td>
      <td className="px-3 py-2"><input className={inputCls} placeholder="Notes" value={form.notes} onChange={(e) => onChange('notes', e.target.value)} /></td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button onClick={onSave} className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white hover:bg-violet-700"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50"><X className="h-3.5 w-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}
