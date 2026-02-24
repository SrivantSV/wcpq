import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { Invoice, InvoiceLineItem, InvoiceLineMode } from '@/types';

function uid() { return Math.random().toString(36).slice(2, 10); }

const inputCls = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors disabled:bg-neutral-50 disabled:text-neutral-500';

interface Props {
  invoice: Invoice;
  isLocked: boolean;
  onChange: (patch: Partial<Invoice>) => void;
}

const MODE_LABELS: Record<InvoiceLineMode, string> = {
  summary: 'Summary',
  itemized: 'Itemized',
  custom: 'Custom',
};

export function InvoiceLineItems({ invoice, isLocked, onChange }: Props) {
  const [newDesc, setNewDesc] = useState('');
  const [newAmt, setNewAmt] = useState('');

  function updateLines(lines: InvoiceLineItem[]) {
    const subTotal = lines.reduce((s, l) => s + l.amount, 0);
    onChange({ lineItems: lines, subTotal });
  }

  function updateLine(id: string, patch: Partial<InvoiceLineItem>) {
    const lines = invoice.lineItems.map((l) => l.id === id ? { ...l, ...patch } : l);
    updateLines(lines);
  }

  function removeLine(id: string) {
    updateLines(invoice.lineItems.filter((l) => l.id !== id));
  }

  function addLine() {
    if (!newDesc.trim() || !newAmt) return;
    const line: InvoiceLineItem = { id: uid(), description: newDesc.trim(), amount: parseFloat(newAmt) || 0 };
    updateLines([...invoice.lineItems, line]);
    setNewDesc('');
    setNewAmt('');
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">Line Items</h2>
        {/* Mode switcher */}
        {!isLocked && (
          <div className="flex rounded-lg border border-neutral-200 bg-white overflow-hidden text-xs font-medium">
            {(Object.keys(MODE_LABELS) as InvoiceLineMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onChange({ lineMode: m })}
                className={cn(
                  'px-3 py-1.5 transition-colors',
                  invoice.lineMode === m
                    ? 'bg-[#1B4F9C] text-white'
                    : 'text-neutral-500 hover:bg-neutral-50'
                )}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="pb-2.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Description</th>
              <th className="pb-2.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide w-36">Amount</th>
              {!isLocked && <th className="pb-2.5 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {invoice.lineItems.map((line) => (
              <tr key={line.id}>
                <td className="py-2.5 pr-4">
                  {isLocked ? (
                    <p className="text-sm text-neutral-800">{line.description}</p>
                  ) : (
                    <input
                      className={inputCls}
                      value={line.description}
                      onChange={(e) => updateLine(line.id, { description: e.target.value })}
                    />
                  )}
                </td>
                <td className="py-2.5 text-right">
                  {isLocked ? (
                    <p className="text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(line.amount)}</p>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={cn(inputCls, 'text-right tabular-nums')}
                      value={line.amount}
                      onChange={(e) => updateLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                    />
                  )}
                </td>
                {!isLocked && (
                  <td className="py-2.5 pl-2 text-right">
                    <button
                      onClick={() => removeLine(line.id)}
                      className="rounded-md p-1 text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add line (custom mode or itemized) */}
        {!isLocked && invoice.lineMode !== 'summary' && (
          <div className="mt-3 flex gap-2 items-end">
            <div className="flex-1">
              <input
                className={inputCls}
                placeholder="Description…"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                className={cn(inputCls, 'text-right tabular-nums')}
                value={newAmt}
                onChange={(e) => setNewAmt(e.target.value)}
              />
            </div>
            <button
              onClick={addLine}
              disabled={!newDesc.trim() || !newAmt}
              className="flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200 disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        )}

        {/* Sub-total */}
        <div className="mt-4 flex justify-end border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-8 text-sm">
            <span className="font-semibold text-neutral-600">Sub-Total</span>
            <span className="font-bold text-neutral-900 tabular-nums w-28 text-right">{formatCurrency(invoice.subTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
