import { useState } from 'react';
import { Plus, Pencil, Trash2, Copy, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { UNITS } from '@/stores/estimationStore';
import type { MaterialLineItem, MaterialSource } from '@/types';

function uid() { return Math.random().toString(36).slice(2, 10); }

const EMPTY_ROW: Omit<MaterialLineItem, 'id'> = {
  description: '', source: 'external_purchase', supplierTag: '', unit: 'Nos',
  estimatedQty: 0, unitCost: 0, totalCost: 0, notes: '',
};

interface RowFormState {
  description: string; source: MaterialSource; supplierTag: string; unit: string;
  estimatedQty: string; unitCost: string; notes: string;
}

function rowToForm(row: MaterialLineItem): RowFormState {
  return {
    description: row.description, source: row.source, supplierTag: row.supplierTag ?? '',
    unit: row.unit, estimatedQty: String(row.estimatedQty), unitCost: String(row.unitCost), notes: row.notes ?? '',
  };
}

interface Props {
  items: MaterialLineItem[];
  isLocked: boolean;
  onChange: (items: MaterialLineItem[]) => void;
}

const inputCls = 'w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#1B4F9C] focus:border-[#1B4F9C] transition-colors';

export function MaterialsSection({ items, isLocked, onChange }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<RowFormState>({ ...EMPTY_ROW, estimatedQty: '0', unitCost: '0' } as RowFormState);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.totalCost, 0);

  function startEdit(item: MaterialLineItem) {
    setEditingId(item.id);
    setForm(rowToForm(item));
  }

  function startNew() {
    setEditingId('new');
    setForm({ description: '', source: 'external_purchase', supplierTag: '', unit: 'Nos', estimatedQty: '0', unitCost: '0', notes: '' });
  }

  function setF<K extends keyof RowFormState>(key: K, val: RowFormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function saveRow() {
    const qty = parseFloat(form.estimatedQty) || 0;
    const cost = parseFloat(form.unitCost) || 0;
    const item: MaterialLineItem = {
      id: editingId === 'new' ? uid() : editingId!,
      description: form.description.trim(),
      source: form.source,
      supplierTag: form.supplierTag.trim() || undefined,
      unit: form.unit,
      estimatedQty: qty,
      unitCost: cost,
      totalCost: qty * cost,
      notes: form.notes.trim() || undefined,
    };
    if (editingId === 'new') {
      onChange([...items, item]);
    } else {
      onChange(items.map((i) => (i.id === editingId ? item : i)));
    }
    setEditingId(null);
  }

  function cancelEdit() { setEditingId(null); }

  function duplicate(item: MaterialLineItem) {
    onChange([...items, { ...item, id: uid(), description: item.description + ' (Copy)' }]);
  }

  function confirmDelete(id: string) {
    const item = items.find((i) => i.id === id);
    if (item && item.estimatedQty > 0) {
      setDeleteConfirmId(id);
    } else {
      onChange(items.filter((i) => i.id !== id));
    }
  }

  const liveCost = (parseFloat(form.estimatedQty) || 0) * (parseFloat(form.unitCost) || 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">A</div>
          <span className="text-sm font-semibold text-neutral-900">Direct Materials</span>
          <span className="text-xs text-neutral-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(subtotal)}</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
        </div>
      </button>

      {expanded && (
        <>
          {/* Table */}
          <div className="overflow-x-auto border-t border-neutral-100">
            <table className="w-full min-w-[700px]">
              <thead className="bg-neutral-50/80">
                <tr>
                  {['#', 'Description', 'Source', 'Unit', 'Qty', 'Unit Cost', 'Total', 'Notes', ''].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item, idx) =>
                  editingId === item.id ? (
                    <InlineEditRow
                      key={item.id}
                      idx={idx + 1}
                      form={form}
                      liveCost={liveCost}
                      onChange={setF}
                      onSave={saveRow}
                      onCancel={cancelEdit}
                    />
                  ) : (
                    <tr key={item.id} className="hover:bg-neutral-50/60 group">
                      <td className="px-3 py-3 text-xs text-neutral-400 w-8">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-neutral-900">{item.description || '—'}</p>
                        {item.supplierTag && <p className="text-xs text-neutral-400">{item.supplierTag}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', item.source === 'external_purchase' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700')}>
                          {item.source === 'external_purchase' ? 'External' : 'Stock'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-600">{item.unit}</td>
                      <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{item.estimatedQty}</td>
                      <td className="px-3 py-3 text-sm text-neutral-700 tabular-nums">{formatCurrency(item.unitCost)}</td>
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
                  <InlineEditRow
                    idx={items.length + 1}
                    form={form}
                    liveCost={liveCost}
                    onChange={setF}
                    onSave={saveRow}
                    onCancel={cancelEdit}
                    isNew
                  />
                )}
                {items.length === 0 && editingId !== 'new' && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-neutral-400">
                      No materials added yet. {!isLocked && 'Click "+ Add Material" to get started.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!isLocked && editingId !== 'new' && (
            <div className="px-4 py-3 border-t border-neutral-100">
              <button
                onClick={startNew}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-[#1B4F9C] hover:text-[#1B4F9C] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Material
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border p-6">
            <h3 className="text-base font-semibold mb-2">Delete material item?</h3>
            <p className="text-sm text-neutral-500 mb-4">This item has a quantity greater than zero. Remove anyway?</p>
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

function InlineEditRow({ idx, form, liveCost, onChange, onSave, onCancel, isNew }: {
  idx: number; form: RowFormState; liveCost: number;
  onChange: <K extends keyof RowFormState>(k: K, v: RowFormState[K]) => void;
  onSave: () => void; onCancel: () => void; isNew?: boolean;
}) {
  return (
    <tr className="bg-blue-50/40 border-l-2 border-[#1B4F9C]">
      <td className="px-3 py-2 text-xs text-neutral-400">{idx}</td>
      <td className="px-3 py-2">
        <input className={inputCls} placeholder="Material description" value={form.description} onChange={(e) => onChange('description', e.target.value)} autoFocus={!!isNew} />
        <input className={cn(inputCls, 'mt-1')} placeholder="Supplier tag" value={form.supplierTag} onChange={(e) => onChange('supplierTag', e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <select className={inputCls} value={form.source} onChange={(e) => onChange('source', e.target.value as MaterialSource)}>
          <option value="external_purchase">External</option>
          <option value="from_stock">From Stock</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <select className={inputCls} value={form.unit} onChange={(e) => onChange('unit', e.target.value)}>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input type="number" min={0} className={inputCls} value={form.estimatedQty} onChange={(e) => onChange('estimatedQty', e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <input type="number" min={0} className={inputCls} value={form.unitCost} onChange={(e) => onChange('unitCost', e.target.value)} />
      </td>
      <td className="px-3 py-2 text-sm font-semibold text-neutral-800 tabular-nums whitespace-nowrap">{formatCurrency(liveCost)}</td>
      <td className="px-3 py-2">
        <input className={inputCls} placeholder="Notes" value={form.notes} onChange={(e) => onChange('notes', e.target.value)} />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button onClick={onSave} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1B4F9C] text-white hover:bg-[#174287]"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50"><X className="h-3.5 w-3.5" /></button>
        </div>
      </td>
    </tr>
  );
}
