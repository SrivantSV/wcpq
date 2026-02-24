import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { calcTax } from '@/stores/invoiceStore';
import type { Invoice, InvoiceTaxConfig, TaxType } from '@/types';

const inputCls = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors disabled:bg-neutral-50 disabled:text-neutral-500';
const labelCls = 'block text-xs font-semibold text-neutral-600 mb-1.5';

interface Props {
  invoice: Invoice;
  isLocked: boolean;
  onChange: (patch: Partial<Invoice>) => void;
}

const TAX_TYPES: { value: TaxType; label: string }[] = [
  { value: 'gst', label: 'GST (CGST + SGST)' },
  { value: 'igst', label: 'IGST (Inter-state)' },
  { value: 'service_tax', label: 'Service Tax (14.5%)' },
  { value: 'vat', label: 'VAT' },
  { value: 'custom', label: 'Custom %' },
  { value: 'none', label: 'None / Tax Exempt' },
];

export function InvoiceTaxSection({ invoice, isLocked, onChange }: Props) {
  const tax = invoice.taxConfig;

  function updateTax(patch: Partial<InvoiceTaxConfig>) {
    const updated = { ...tax, ...patch };
    const computed = calcTax(invoice.subTotal, updated);
    onChange({
      taxConfig: updated,
      cgstAmount: computed.cgst,
      sgstAmount: computed.sgst,
      igstAmount: computed.igst,
      additionalLevyAmount: computed.levy,
      taxTotal: computed.total,
      invoiceTotal: invoice.subTotal + computed.total,
      amountDue: invoice.subTotal + computed.total - invoice.amountPaid,
    });
  }

  const showCgstSgst = tax.type === 'gst';
  const showIgst = tax.type === 'igst';
  const showCustomPct = tax.type === 'vat' || tax.type === 'custom';

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-neutral-800">Tax</h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tax type */}
          <div className="sm:col-span-2">
            <label className={labelCls}>Tax Type</label>
            <select
              disabled={isLocked}
              value={tax.type}
              onChange={(e) => updateTax({ type: e.target.value as TaxType })}
              className={inputCls}
            >
              {TAX_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* CGST + SGST */}
          {showCgstSgst && (
            <>
              <div>
                <label className={labelCls}>CGST %</label>
                <input
                  type="number" min={0} max={50} step={0.5}
                  disabled={isLocked}
                  value={tax.cgstPct ?? 9}
                  onChange={(e) => updateTax({ cgstPct: parseFloat(e.target.value) || 0 })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>SGST %</label>
                <input
                  type="number" min={0} max={50} step={0.5}
                  disabled={isLocked}
                  value={tax.sgstPct ?? 9}
                  onChange={(e) => updateTax({ sgstPct: parseFloat(e.target.value) || 0 })}
                  className={inputCls}
                />
              </div>
            </>
          )}

          {/* IGST */}
          {showIgst && (
            <div>
              <label className={labelCls}>IGST %</label>
              <input
                type="number" min={0} max={50} step={0.5}
                disabled={isLocked}
                value={tax.igstPct ?? 18}
                onChange={(e) => updateTax({ igstPct: parseFloat(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
          )}

          {/* Custom % */}
          {showCustomPct && (
            <div>
              <label className={labelCls}>Rate %</label>
              <input
                type="number" min={0} max={100} step={0.5}
                disabled={isLocked}
                value={tax.customPct ?? 0}
                onChange={(e) => updateTax({ customPct: parseFloat(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* Additional levy */}
        {!isLocked && tax.type !== 'none' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Additional Levy Label (optional)</label>
              <input
                placeholder="e.g. Swachh Bharat Cess"
                disabled={isLocked}
                value={tax.additionalLevyLabel ?? ''}
                onChange={(e) => updateTax({ additionalLevyLabel: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Additional Levy %</label>
              <input
                type="number" min={0} max={50} step={0.5}
                disabled={isLocked}
                value={tax.additionalLevyPct ?? 0}
                onChange={(e) => updateTax({ additionalLevyPct: parseFloat(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Tax breakdown */}
        <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 space-y-1.5">
          {showCgstSgst && (
            <>
              <TaxRow label={`CGST @ ${tax.cgstPct ?? 9}%`} value={invoice.cgstAmount} />
              <TaxRow label={`SGST @ ${tax.sgstPct ?? 9}%`} value={invoice.sgstAmount} />
            </>
          )}
          {showIgst && <TaxRow label={`IGST @ ${tax.igstPct ?? 18}%`} value={invoice.igstAmount} />}
          {tax.type === 'service_tax' && <TaxRow label="Service Tax @ 14.5%" value={invoice.cgstAmount} />}
          {showCustomPct && <TaxRow label={`Tax @ ${tax.customPct ?? 0}%`} value={invoice.cgstAmount} />}
          {invoice.additionalLevyAmount > 0 && (
            <TaxRow label={tax.additionalLevyLabel ?? 'Additional Levy'} value={invoice.additionalLevyAmount} />
          )}
          <div className="border-t border-neutral-200 pt-1.5 flex justify-between">
            <span className="text-sm font-semibold text-neutral-700">Tax Total</span>
            <span className="text-sm font-bold text-neutral-900 tabular-nums">{formatCurrency(invoice.taxTotal)}</span>
          </div>
        </div>

        {/* Invoice total */}
        <div className={cn('flex items-center justify-between rounded-xl border px-5 py-4', 'border-[#1B4F9C]/20 bg-[#1B4F9C]/5')}>
          <span className="text-base font-bold text-neutral-900">Invoice Total (incl. Tax)</span>
          <span className="text-xl font-bold tabular-nums text-[#1B4F9C]">{formatCurrency(invoice.invoiceTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function TaxRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-700 tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}
