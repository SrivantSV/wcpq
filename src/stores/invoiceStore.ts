import { create } from 'zustand';
import type { Invoice, InvoiceStatus, InvoiceLineItem, InvoiceTaxConfig, PaymentRecord, PaymentTerms, InvoiceLineMode } from '@/types';

function uid() { return Math.random().toString(36).slice(2, 10); }

let invoiceCounter = 5;
function nextInvoiceNumber(): string {
  invoiceCounter++;
  return `INV-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, '0')}`;
}

function calcDueDate(issueDate: string, terms: PaymentTerms, customDays?: number): string {
  const days: Record<PaymentTerms, number> = { net_7: 7, net_15: 15, net_30: 30, net_45: 45, net_60: 60, custom: customDays ?? 30 };
  const d = new Date(issueDate);
  d.setDate(d.getDate() + (days[terms] ?? 30));
  return d.toISOString().split('T')[0];
}

export function calcTax(subTotal: number, taxConfig: InvoiceTaxConfig): { cgst: number; sgst: number; igst: number; levy: number; total: number } {
  let cgst = 0, sgst = 0, igst = 0, levy = 0;
  switch (taxConfig.type) {
    case 'gst':
      cgst = (subTotal * (taxConfig.cgstPct ?? 9)) / 100;
      sgst = (subTotal * (taxConfig.sgstPct ?? 9)) / 100;
      break;
    case 'igst':
      igst = (subTotal * (taxConfig.igstPct ?? 18)) / 100;
      break;
    case 'service_tax':
      cgst = (subTotal * 14.5) / 100;
      break;
    case 'vat':
      cgst = (subTotal * (taxConfig.customPct ?? 12)) / 100;
      break;
    case 'custom':
      cgst = (subTotal * (taxConfig.customPct ?? 0)) / 100;
      break;
    case 'none':
    default:
      break;
  }
  if (taxConfig.additionalLevyPct) {
    levy = (subTotal * taxConfig.additionalLevyPct) / 100;
  }
  return { cgst, sgst, igst, levy, total: cgst + sgst + igst + levy };
}

const DEFAULT_TAX: InvoiceTaxConfig = { type: 'gst', cgstPct: 9, sgstPct: 9 };

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2025-0004',
    jobOrderId: 'j4',
    jobNumber: 'JO-2025-0078',
    estimateId: 'est_j4',
    status: 'paid',
    invoiceDate: '2025-02-20',
    dueDate: '2025-03-22',
    paymentTerms: 'net_30',
    billTo: 'HCL Tech Park',
    billToAddress: 'Plot 22, HITEC City, Hyderabad - 500081',
    billToGstin: '36AAACH0000A1Z5',
    referencePoNumber: 'PO-HCL-2025-089',
    currency: 'INR',
    lineMode: 'itemized',
    lineItems: [
      { id: 'li1', description: 'Direct Materials', amount: 29000 },
      { id: 'li2', description: 'Direct Labor', amount: 28800 },
      { id: 'li3', description: 'Overhead', amount: 8700 },
      { id: 'li4', description: 'Profit & Margin (18%)', amount: 11952 },
    ],
    subTotal: 78452,
    taxConfig: DEFAULT_TAX,
    cgstAmount: 7060.68, sgstAmount: 7060.68, igstAmount: 0, additionalLevyAmount: 0,
    taxTotal: 14121.36, invoiceTotal: 92573.36,
    paymentInstructions: 'Please pay via NEFT/RTGS. Bank: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234',
    invoiceNotes: 'Thank you for your business.',
    termsAndConditions: 'Payment due within 30 days. Late payment subject to 1.5% monthly interest.',
    payments: [
      { id: 'pay1', amount: 92573.36, paidOn: '2025-03-10', method: 'NEFT', referenceNo: 'NEFT-20250310-001' },
    ],
    amountPaid: 92573.36, amountDue: 0,
    createdBy: 'Admin User',
    createdAt: '2025-02-20T10:00:00Z', updatedAt: '2025-03-10T15:00:00Z',
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2025-0003',
    jobOrderId: 'j2',
    jobNumber: 'JO-2025-0080',
    estimateId: 'est_j2',
    status: 'issued',
    invoiceDate: '2025-02-15',
    dueDate: '2025-03-17',
    paymentTerms: 'net_30',
    billTo: 'TCS Bangalore',
    billToAddress: 'Survey No. 64, Bagmane Tech Park, Bengaluru - 560093',
    billToGstin: '29AAACT0000A1Z5',
    currency: 'INR',
    lineMode: 'summary',
    lineItems: [{ id: 'li5', description: 'Wooden Crates & Pallets — Generator Set Export — JO-2025-0080', amount: 185000 }],
    subTotal: 185000,
    taxConfig: DEFAULT_TAX,
    cgstAmount: 16650, sgstAmount: 16650, igstAmount: 0, additionalLevyAmount: 0,
    taxTotal: 33300, invoiceTotal: 218300,
    payments: [],
    amountPaid: 0, amountDue: 218300,
    createdBy: 'Admin User',
    createdAt: '2025-02-15T09:00:00Z', updatedAt: '2025-02-15T09:00:00Z',
  },
];

interface InvoiceStore {
  invoices: Invoice[];
  getByJobId: (jobOrderId: string) => Invoice | undefined;
  createInvoice: (jobOrderId: string, jobNumber: string, estimateId: string, billTo: string, grandTotal: number, lineItems: InvoiceLineItem[], mode: InvoiceLineMode) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  issueInvoice: (id: string) => void;
  recordPayment: (id: string, payment: Omit<PaymentRecord, 'id'>) => void;
  voidInvoice: (id: string, reason: string) => void;
  checkOverdue: () => void;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: SEED_INVOICES,

  getByJobId: (jobOrderId) => get().invoices.find((i) => i.jobOrderId === jobOrderId),

  createInvoice: (jobOrderId, jobNumber, estimateId, billTo, grandTotal, lineItems, mode) => {
    const today = new Date().toISOString().split('T')[0];
    const terms: PaymentTerms = 'net_30';
    const subTotal = lineItems.reduce((s, l) => s + l.amount, 0);
    const tax = calcTax(subTotal, DEFAULT_TAX);
    const inv: Invoice = {
      id: uid(),
      invoiceNumber: nextInvoiceNumber(),
      jobOrderId, jobNumber, estimateId,
      status: 'draft',
      invoiceDate: today,
      dueDate: calcDueDate(today, terms),
      paymentTerms: terms,
      billTo,
      currency: 'INR',
      lineMode: mode,
      lineItems,
      subTotal,
      taxConfig: DEFAULT_TAX,
      cgstAmount: tax.cgst, sgstAmount: tax.sgst, igstAmount: tax.igst,
      additionalLevyAmount: tax.levy, taxTotal: tax.total,
      invoiceTotal: subTotal + tax.total,
      payments: [], amountPaid: 0, amountDue: subTotal + tax.total,
      createdBy: 'Admin User',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    set((s) => ({ invoices: [...s.invoices, inv] }));
    return inv;
  },

  updateInvoice: (id, patch) => {
    set((s) => ({
      invoices: s.invoices.map((inv) => {
        if (inv.id !== id) return inv;
        const updated = { ...inv, ...patch, updatedAt: new Date().toISOString() };
        const tax = calcTax(updated.subTotal, updated.taxConfig);
        return {
          ...updated,
          cgstAmount: tax.cgst, sgstAmount: tax.sgst, igstAmount: tax.igst,
          additionalLevyAmount: tax.levy, taxTotal: tax.total,
          invoiceTotal: updated.subTotal + tax.total,
          amountDue: updated.subTotal + tax.total - updated.amountPaid,
        };
      }),
    }));
  },

  issueInvoice: (id) => {
    set((s) => ({
      invoices: s.invoices.map((inv) =>
        inv.id === id ? { ...inv, status: 'issued' as InvoiceStatus, updatedAt: new Date().toISOString() } : inv
      ),
    }));
  },

  recordPayment: (id, payment) => {
    set((s) => ({
      invoices: s.invoices.map((inv) => {
        if (inv.id !== id) return inv;
        const payments = [...inv.payments, { ...payment, id: uid() }];
        const amountPaid = payments.reduce((s, p) => s + p.amount, 0);
        const amountDue = inv.invoiceTotal - amountPaid;
        const status: InvoiceStatus = amountDue <= 0 ? 'paid' : 'partially_paid';
        return { ...inv, payments, amountPaid, amountDue, status, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  voidInvoice: (id, reason) => {
    set((s) => ({
      invoices: s.invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status: 'voided' as InvoiceStatus, voidReason: reason, creditNoteNumber: `CN-${inv.invoiceNumber}`, updatedAt: new Date().toISOString() }
          : inv
      ),
    }));
  },

  checkOverdue: () => {
    const today = new Date().toISOString().split('T')[0];
    set((s) => ({
      invoices: s.invoices.map((inv) => {
        if (inv.status === 'issued' && inv.dueDate < today) {
          return { ...inv, status: 'overdue' as InvoiceStatus };
        }
        return inv;
      }),
    }));
  },
}));

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  issued: { label: 'Issued', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  partially_paid: { label: 'Partially Paid', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700 border-red-200' },
  voided: { label: 'Voided', className: 'bg-neutral-100 text-neutral-500 border-neutral-200 line-through' },
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  net_7: 'Net 7', net_15: 'Net 15', net_30: 'Net 30',
  net_45: 'Net 45', net_60: 'Net 60', custom: 'Custom',
};
