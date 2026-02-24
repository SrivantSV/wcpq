import { cn } from '@/lib/utils';
import type { Invoice, PaymentTerms } from '@/types';
import { PAYMENT_TERMS_LABELS } from '@/stores/invoiceStore';

const inputCls = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors disabled:bg-neutral-50 disabled:text-neutral-500';
const labelCls = 'block text-xs font-semibold text-neutral-600 mb-1.5';

interface Props {
  invoice: Invoice;
  isLocked: boolean;
  onChange: (patch: Partial<Invoice>) => void;
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];

export function InvoiceHeader({ invoice, isLocked, onChange }: Props) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-neutral-800">Invoice Details</h2>
      </div>
      <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Invoice number */}
        <div>
          <label className={labelCls}>Invoice #</label>
          <input disabled value={invoice.invoiceNumber} className={inputCls} />
        </div>

        {/* Invoice date */}
        <div>
          <label className={labelCls}>Invoice Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            disabled={isLocked}
            value={invoice.invoiceDate}
            onChange={(e) => onChange({ invoiceDate: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Due date */}
        <div>
          <label className={labelCls}>Due Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            disabled={isLocked}
            value={invoice.dueDate}
            onChange={(e) => onChange({ dueDate: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Payment terms */}
        <div>
          <label className={labelCls}>Payment Terms</label>
          <select
            disabled={isLocked}
            value={invoice.paymentTerms}
            onChange={(e) => onChange({ paymentTerms: e.target.value as PaymentTerms })}
            className={inputCls}
          >
            {(Object.keys(PAYMENT_TERMS_LABELS) as PaymentTerms[]).map((k) => (
              <option key={k} value={k}>{PAYMENT_TERMS_LABELS[k]}</option>
            ))}
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className={labelCls}>Currency</label>
          <select
            disabled={isLocked}
            value={invoice.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className={inputCls}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* PO reference */}
        <div>
          <label className={labelCls}>Client PO / Reference #</label>
          <input
            disabled={isLocked}
            placeholder="PO-XXXX-0000"
            value={invoice.referencePoNumber ?? ''}
            onChange={(e) => onChange({ referencePoNumber: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Bill To name */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={labelCls}>Bill To <span className="text-red-500">*</span></label>
          <input
            disabled={isLocked}
            value={invoice.billTo}
            onChange={(e) => onChange({ billTo: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* Bill To address */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Billing Address</label>
          <textarea
            rows={2}
            disabled={isLocked}
            placeholder="Street, City, State — PIN, Country"
            value={invoice.billToAddress ?? ''}
            onChange={(e) => onChange({ billToAddress: e.target.value })}
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        {/* GSTIN */}
        <div>
          <label className={labelCls}>Client GSTIN</label>
          <input
            disabled={isLocked}
            placeholder="22AAAAA0000A1Z5"
            value={invoice.billToGstin ?? ''}
            onChange={(e) => onChange({ billToGstin: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
