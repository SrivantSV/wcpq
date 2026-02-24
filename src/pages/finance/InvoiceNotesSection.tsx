import type { Invoice } from '@/types';

const textareaCls = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors resize-none disabled:bg-neutral-50 disabled:text-neutral-500';
const labelCls = 'block text-xs font-semibold text-neutral-600 mb-1.5';

interface Props {
  invoice: Invoice;
  isLocked: boolean;
  onChange: (patch: Partial<Invoice>) => void;
}

export function InvoiceNotesSection({ invoice, isLocked, onChange }: Props) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-neutral-800">Notes & Terms</h2>
      </div>
      <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Payment Instructions</label>
          <textarea
            rows={3}
            disabled={isLocked}
            placeholder="Bank name, account number, IFSC, UPI ID…"
            value={invoice.paymentInstructions ?? ''}
            onChange={(e) => onChange({ paymentInstructions: e.target.value })}
            className={textareaCls}
          />
        </div>
        <div>
          <label className={labelCls}>Invoice Notes</label>
          <textarea
            rows={3}
            disabled={isLocked}
            placeholder="Any notes for the client…"
            value={invoice.invoiceNotes ?? ''}
            onChange={(e) => onChange({ invoiceNotes: e.target.value })}
            className={textareaCls}
          />
        </div>
        <div>
          <label className={labelCls}>Terms & Conditions</label>
          <textarea
            rows={3}
            disabled={isLocked}
            placeholder="Payment due within 30 days. Late payment…"
            value={invoice.termsAndConditions ?? ''}
            onChange={(e) => onChange({ termsAndConditions: e.target.value })}
            className={textareaCls}
          />
        </div>
      </div>
    </div>
  );
}
