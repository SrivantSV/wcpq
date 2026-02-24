import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Download, CreditCard, Ban, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useJobOrderStore } from '@/stores/jobOrderStore';
import { useEstimationStore } from '@/stores/estimationStore';
import { useInvoiceStore, INVOICE_STATUS_CONFIG } from '@/stores/invoiceStore';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceLineItems } from './InvoiceLineItems';
import { InvoiceTaxSection } from './InvoiceTaxSection';
import { InvoiceNotesSection } from './InvoiceNotesSection';
import type { Invoice, InvoiceLineItem, PaymentRecord } from '@/types';

const DEFAULT_TERMS = 'Payment due within 30 days of invoice date. Late payment subject to 1.5% monthly interest charge.';
const DEFAULT_PAYMENT_INSTRUCTIONS = 'Please pay via NEFT/RTGS.\nBank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234';

function uid() { return Math.random().toString(36).slice(2, 10); }

const LOCKED_STATUSES = ['issued', 'paid', 'partially_paid', 'overdue', 'voided'];

export function InvoicePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useJobOrderStore();
  const { getByJobId: getEstimate } = useEstimationStore();
  const { getByJobId, createInvoice, updateInvoice, issueInvoice, recordPayment, voidInvoice } = useInvoiceStore();

  const job = jobs.find((j) => j.id === jobId);
  const estimate = getEstimate(jobId ?? '');

  const [paymentModal, setPaymentModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', paidOn: new Date().toISOString().split('T')[0], method: 'NEFT', referenceNo: '', notes: '' });
  const [voidModal, setVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [issueConfirm, setIssueConfirm] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  if (!job || !estimate) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-neutral-300" />
        <p className="text-sm font-semibold text-neutral-600">Job or estimate not found.</p>
        <button onClick={() => navigate('/finance')} className="text-sm text-[#1B4F9C] hover:underline">Back to Invoices</button>
      </div>
    );
  }

  // Auto-create invoice if none exists
  let invoice = getByJobId(jobId ?? '');
  if (!invoice) {
    const lineItems: InvoiceLineItem[] = [
      { id: uid(), description: `${job.title} — ${job.jobNumber}`, amount: estimate.grandTotal },
    ];
    invoice = createInvoice(job.id, job.jobNumber, estimate.id, job.clientName, estimate.grandTotal, lineItems, 'summary');
    // set default notes
    updateInvoice(invoice.id, {
      paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
      termsAndConditions: DEFAULT_TERMS,
    });
    invoice = getByJobId(jobId ?? '')!;
  }

  const isLocked = LOCKED_STATUSES.includes(invoice.status);
  const statusCfg = INVOICE_STATUS_CONFIG[invoice.status];

  function handleChange(patch: Partial<Invoice>) {
    updateInvoice(invoice!.id, patch);
  }

  function handleSave() {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  }

  function handleIssue() {
    issueInvoice(invoice!.id);
    setIssueConfirm(false);
  }

  function handlePayment() {
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) return;
    const payment: Omit<PaymentRecord, 'id'> = {
      amount: amt, paidOn: payForm.paidOn, method: payForm.method,
      referenceNo: payForm.referenceNo || undefined, notes: payForm.notes || undefined,
    };
    recordPayment(invoice!.id, payment);
    setPaymentModal(false);
    setPayForm({ amount: '', paidOn: new Date().toISOString().split('T')[0], method: 'NEFT', referenceNo: '', notes: '' });
  }

  function handleVoid() {
    if (!voidReason.trim()) return;
    voidInvoice(invoice!.id, voidReason);
    setVoidModal(false);
    setVoidReason('');
  }

  const inputCls = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1B4F9C]/20 focus:border-[#1B4F9C] transition-colors';

  return (
    <div className="min-h-full space-y-5">
      {/* Save toast */}
      <div className={cn('fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300', savedToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none')}>
        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Draft saved
      </div>

      {/* Header */}
      <div>
        <button onClick={() => navigate('/finance')} className="mb-3 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Invoices
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-neutral-900">{invoice.invoiceNumber}</h1>
              <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', statusCfg.className)}>
                {statusCfg.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-600">{job.title}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{job.clientName} · Job {job.jobNumber}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {invoice.status === 'draft' && (
              <>
                <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                  <Save className="h-3.5 w-3.5" /> Save Draft
                </button>
                <button onClick={() => setIssueConfirm(true)} className="flex items-center gap-1.5 rounded-lg bg-[#1B4F9C] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#174287] transition-colors">
                  <Send className="h-3.5 w-3.5" /> Issue Invoice
                </button>
              </>
            )}
            {(invoice.status === 'issued' || invoice.status === 'overdue' || invoice.status === 'partially_paid') && (
              <button onClick={() => setPaymentModal(true)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                <CreditCard className="h-3.5 w-3.5" /> Record Payment
              </button>
            )}
            {invoice.status !== 'voided' && invoice.status !== 'paid' && (
              <button onClick={() => navigate(`/finance`)} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
            )}
            {!isLocked && invoice.status === 'draft' && (
              <button onClick={() => setVoidModal(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <Ban className="h-3.5 w-3.5" /> Void
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voided banner */}
      {invoice.status === 'voided' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
          <Ban className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Invoice Voided</p>
            <p className="text-xs text-red-700 mt-0.5">{invoice.voidReason}</p>
            {invoice.creditNoteNumber && <p className="text-xs text-red-600 mt-1">Credit Note: {invoice.creditNoteNumber}</p>}
          </div>
        </div>
      )}

      {/* Payment summary bar (if partially paid) */}
      {(invoice.status === 'partially_paid' || invoice.status === 'paid') && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 flex flex-wrap gap-4 items-center">
          <div><p className="text-xs text-emerald-600 font-semibold">Paid</p><p className="text-base font-bold text-emerald-800 tabular-nums">{formatCurrency(invoice.amountPaid)}</p></div>
          <div><p className="text-xs text-neutral-500 font-semibold">Outstanding</p><p className="text-base font-bold text-neutral-800 tabular-nums">{formatCurrency(invoice.amountDue)}</p></div>
          <div className="flex-1 min-w-40">
            <div className="h-2 rounded-full bg-emerald-200 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min((invoice.amountPaid / invoice.invoiceTotal) * 100, 100)}%` }} />
            </div>
          </div>
          {invoice.payments.length > 0 && (
            <div className="text-xs text-emerald-700 space-y-0.5">
              {invoice.payments.map((p) => (
                <div key={p.id}>{formatCurrency(p.amount)} on {formatDate(p.paidOn)} via {p.method}{p.referenceNo ? ` (#${p.referenceNo})` : ''}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-components */}
      <InvoiceHeader invoice={invoice} isLocked={isLocked} onChange={handleChange} />
      <InvoiceLineItems invoice={invoice} isLocked={isLocked} onChange={handleChange} />
      <InvoiceTaxSection invoice={invoice} isLocked={isLocked} onChange={handleChange} />
      <InvoiceNotesSection invoice={invoice} isLocked={isLocked} onChange={handleChange} />

      {/* Issue confirm modal */}
      {issueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-neutral-200 p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Issue Invoice?</h3>
            <p className="text-sm text-neutral-500 mb-1">
              Issuing <span className="font-semibold">{invoice.invoiceNumber}</span> will lock all fields.
            </p>
            <p className="text-sm text-neutral-500 mb-4">Total: <span className="font-bold text-neutral-900">{formatCurrency(invoice.invoiceTotal)}</span> · Due: {formatDate(invoice.dueDate)}</p>
            <div className="flex gap-2">
              <button onClick={handleIssue} className="flex-1 rounded-lg bg-[#1B4F9C] py-2 text-sm font-semibold text-white hover:bg-[#174287]">Issue</button>
              <button onClick={() => setIssueConfirm(false)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Record payment modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-neutral-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-neutral-900">Record Payment</h3>
            <p className="text-xs text-neutral-500">Outstanding: <span className="font-bold text-neutral-800">{formatCurrency(invoice.amountDue)}</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Amount <span className="text-red-500">*</span></label>
                <input type="number" min={0} step={0.01} placeholder="0.00" className={inputCls} value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Date Paid</label>
                <input type="date" className={inputCls} value={payForm.paidOn} onChange={(e) => setPayForm((f) => ({ ...f, paidOn: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Method</label>
                <select className={inputCls} value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))}>
                  {['NEFT', 'RTGS', 'IMPS', 'Cheque', 'Cash', 'UPI', 'Card'].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Reference #</label>
                <input className={inputCls} placeholder="Transaction / UTR #" value={payForm.referenceNo} onChange={(e) => setPayForm((f) => ({ ...f, referenceNo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Notes</label>
                <input className={inputCls} placeholder="Optional" value={payForm.notes} onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePayment} disabled={!payForm.amount} className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Record</button>
              <button onClick={() => setPaymentModal(false)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Void modal */}
      {voidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-red-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Void Invoice</h3>
                <p className="text-sm text-neutral-500 mt-1">This will void {invoice.invoiceNumber} and auto-create a credit note. This cannot be undone.</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Reason <span className="text-red-500">*</span></label>
              <textarea rows={3} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400" placeholder="Why is this invoice being voided?" value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleVoid} disabled={!voidReason.trim()} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">Void Invoice</button>
              <button onClick={() => setVoidModal(false)} className="flex-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
