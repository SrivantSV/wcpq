import { create } from 'zustand';
import type {
  Estimate, EstimationStatus, MaterialLineItem, LaborLineItem,
  OverheadLineItem, ApprovalRecord, RevisionHistory, ClientApprovalRecord,
} from '@/types';

function calcTotals(est: Estimate): Pick<
  Estimate, 'materialsTotal' | 'laborTotal' | 'overheadTotal' | 'subTotal' | 'profitAmount' | 'grandTotal' | 'effectiveMarginPct'
> {
  const materialsTotal = est.materials.reduce((s, m) => s + m.totalCost, 0);
  const laborTotal = est.labor.reduce((s, l) => s + l.totalCost, 0);

  const overhead = est.overhead.map((o) => {
    let calc = 0;
    switch (o.basis) {
      case 'percent_labor': calc = (laborTotal * o.rateValue) / 100; break;
      case 'percent_materials': calc = (materialsTotal * o.rateValue) / 100; break;
      case 'fixed_amount': calc = o.rateValue; break;
      case 'per_machine_hour': calc = o.rateValue; break;
    }
    return { ...o, calculatedTotal: calc };
  });
  const overheadTotal = overhead.reduce((s, o) => s + o.calculatedTotal, 0);

  const subTotal = materialsTotal + laborTotal + overheadTotal;
  const profitAmount = (subTotal * est.profitMarginPct) / 100;
  const grandTotal = subTotal + profitAmount;
  const effectiveMarginPct = grandTotal > 0 ? (profitAmount / grandTotal) * 100 : 0;

  return { materialsTotal, laborTotal, overheadTotal: overhead.reduce((s, o) => s + o.calculatedTotal, 0), subTotal, profitAmount, grandTotal, effectiveMarginPct };
}

const SEED_ESTIMATES: Estimate[] = [
  {
    id: 'est1',
    jobOrderId: 'j1',
    jobNumber: 'JO-2025-0081',
    status: 'under_review',
    revisionNumber: 1,
    assignedEstimator: 'Admin User',
    materials: [
      { id: 'm1', description: 'Cement (OPC 53 Grade)', source: 'external_purchase', supplierTag: 'UltraTech', unit: 'Bags', estimatedQty: 500, unitCost: 380, totalCost: 190000, notes: '' },
      { id: 'm2', description: 'TMT Steel Bars (Fe500)', source: 'external_purchase', supplierTag: 'JSW Steel', unit: 'MT', estimatedQty: 2, unitCost: 58000, totalCost: 116000, notes: 'Confirm grade before order' },
    ],
    labor: [
      { id: 'l1', taskDescription: 'Structural Masonry', laborSource: 'own_staff', workerRole: 'Mason', estimatedHours: 120, hourlyRate: 250, totalCost: 30000, notes: '' },
      { id: 'l2', taskDescription: 'Excavation & Earthwork', laborSource: 'subcontractor', supplierTag: 'SunEarth Works', estimatedHours: 80, hourlyRate: 350, totalCost: 28000, notes: '' },
    ],
    overhead: [
      { id: 'o1', description: 'Site Supervision', basis: 'percent_labor', rateValue: 15, calculatedTotal: 8700, notes: '' },
      { id: 'o2', description: 'Equipment Hire', basis: 'fixed_amount', rateValue: 12000, calculatedTotal: 12000, notes: 'JCB + Mixer' },
    ],
    profitMarginPct: 18,
    materialsTotal: 306000, laborTotal: 58000, overheadTotal: 20700,
    subTotal: 384700, profitAmount: 69246, grandTotal: 453946, effectiveMarginPct: 15.25,
    approvalTrail: [
      { id: 'a1', action: 'submitted', performedBy: 'Admin User', performedByRole: 'maker', timestamp: '2025-02-22T10:00:00Z', notes: '' },
    ],
    revisionHistory: [],
    returnedNotes: '',
    lastModifiedAt: '2025-02-22T10:00:00Z',
    lastModifiedBy: 'Admin User',
    createdAt: '2025-02-22T09:00:00Z',
  },
  {
    id: 'est2',
    jobOrderId: 'j3',
    jobNumber: 'JO-2025-0079',
    status: 'returned_for_revision',
    revisionNumber: 1,
    assignedEstimator: 'Admin User',
    materials: [
      { id: 'm3', description: 'CPVC Pipes 25mm', source: 'external_purchase', supplierTag: 'Finolex', unit: 'Meters', estimatedQty: 200, unitCost: 145, totalCost: 29000, notes: '' },
    ],
    labor: [
      { id: 'l3', taskDescription: 'Pipe Fitting & Installation', laborSource: 'own_staff', workerRole: 'Plumber', estimatedHours: 96, hourlyRate: 300, totalCost: 28800, notes: '' },
    ],
    overhead: [
      { id: 'o3', description: 'Tools & Consumables', basis: 'percent_materials', rateValue: 5, calculatedTotal: 1450, notes: '' },
    ],
    profitMarginPct: 20,
    materialsTotal: 29000, laborTotal: 28800, overheadTotal: 1450,
    subTotal: 59250, profitAmount: 11850, grandTotal: 71100, effectiveMarginPct: 16.67,
    approvalTrail: [
      { id: 'a2', action: 'submitted', performedBy: 'Admin User', performedByRole: 'maker', timestamp: '2025-02-20T09:00:00Z' },
      { id: 'a3', action: 'rejected', performedBy: 'Approver', performedByRole: 'approver', timestamp: '2025-02-21T14:00:00Z', notes: 'Labor rate seems high. Please verify subcontractor quote and resubmit.' },
    ],
    revisionHistory: [],
    returnedNotes: 'Labor rate seems high. Please verify subcontractor quote and resubmit.',
    lastModifiedAt: '2025-02-21T14:00:00Z',
    lastModifiedBy: 'Approver',
    createdAt: '2025-02-20T08:00:00Z',
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

interface EstimationStore {
  estimates: Estimate[];

  getByJobId: (jobOrderId: string) => Estimate | undefined;

  createEstimate: (jobOrderId: string, jobNumber: string, estimator: string) => Estimate;

  updateMaterials: (id: string, materials: MaterialLineItem[]) => void;
  updateLabor: (id: string, labor: LaborLineItem[]) => void;
  updateOverhead: (id: string, overhead: OverheadLineItem[]) => void;
  updateMargin: (id: string, marginPct: number) => void;

  saveEstimate: (id: string, actor: string) => void;
  submitForApproval: (id: string, actor: string, actorRole: string) => void;
  approveEstimate: (id: string, actor: string, actorRole: string, notes: string) => void;
  rejectEstimate: (id: string, actor: string, actorRole: string, notes: string) => void;
  resubmitRevision: (id: string, actor: string, actorRole: string, changeNote: string) => void;
  recordClientApproval: (id: string, data: ClientApprovalRecord) => void;
}

export const useEstimationStore = create<EstimationStore>((set, get) => ({
  estimates: SEED_ESTIMATES,

  getByJobId: (jobOrderId) => get().estimates.find((e) => e.jobOrderId === jobOrderId),

  createEstimate: (jobOrderId, jobNumber, estimator) => {
    const est: Estimate = {
      id: uid(),
      jobOrderId,
      jobNumber,
      status: 'draft',
      revisionNumber: 1,
      assignedEstimator: estimator,
      materials: [],
      labor: [],
      overhead: [],
      profitMarginPct: 15,
      materialsTotal: 0, laborTotal: 0, overheadTotal: 0,
      subTotal: 0, profitAmount: 0, grandTotal: 0, effectiveMarginPct: 0,
      approvalTrail: [],
      revisionHistory: [],
      returnedNotes: '',
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: estimator,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ estimates: [...s.estimates, est] }));
    return est;
  },

  updateMaterials: (id, materials) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, materials };
        return { ...updated, ...calcTotals(updated), lastModifiedAt: new Date().toISOString() };
      }),
    }));
  },

  updateLabor: (id, labor) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, labor };
        return { ...updated, ...calcTotals(updated), lastModifiedAt: new Date().toISOString() };
      }),
    }));
  },

  updateOverhead: (id, overhead) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, overhead };
        return { ...updated, ...calcTotals(updated), lastModifiedAt: new Date().toISOString() };
      }),
    }));
  },

  updateMargin: (id, profitMarginPct) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, profitMarginPct };
        return { ...updated, ...calcTotals(updated), lastModifiedAt: new Date().toISOString() };
      }),
    }));
  },

  saveEstimate: (id, actor) => {
    set((s) => ({
      estimates: s.estimates.map((e) =>
        e.id === id ? { ...e, lastModifiedAt: new Date().toISOString(), lastModifiedBy: actor } : e
      ),
    }));
  },

  submitForApproval: (id, actor, actorRole) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const record: ApprovalRecord = {
          id: uid(), action: 'submitted', performedBy: actor,
          performedByRole: actorRole, timestamp: new Date().toISOString(),
        };
        return {
          ...e, status: 'under_review' as EstimationStatus,
          approvalTrail: [...e.approvalTrail, record],
          lastModifiedAt: new Date().toISOString(), lastModifiedBy: actor,
        };
      }),
    }));
  },

  approveEstimate: (id, actor, actorRole, notes) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const record: ApprovalRecord = {
          id: uid(), action: 'approved', performedBy: actor,
          performedByRole: actorRole, timestamp: new Date().toISOString(), notes,
        };
        return {
          ...e, status: 'awaiting_client' as EstimationStatus,
          approvalTrail: [...e.approvalTrail, record],
          returnedNotes: '',
          lastModifiedAt: new Date().toISOString(), lastModifiedBy: actor,
        };
      }),
    }));
  },

  rejectEstimate: (id, actor, actorRole, notes) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const record: ApprovalRecord = {
          id: uid(), action: 'rejected', performedBy: actor,
          performedByRole: actorRole, timestamp: new Date().toISOString(), notes,
        };
        return {
          ...e, status: 'returned_for_revision' as EstimationStatus,
          approvalTrail: [...e.approvalTrail, record],
          returnedNotes: notes,
          lastModifiedAt: new Date().toISOString(), lastModifiedBy: actor,
        };
      }),
    }));
  },

  resubmitRevision: (id, actor, actorRole, changeNote) => {
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== id) return e;
        const snap: RevisionHistory = {
          revisionNumber: e.revisionNumber,
          createdAt: new Date().toISOString(),
          createdBy: actor,
          materials: e.materials,
          labor: e.labor,
          overhead: e.overhead,
          profitMarginPct: e.profitMarginPct,
          grandTotal: e.grandTotal,
          changeNote,
        };
        const record: ApprovalRecord = {
          id: uid(), action: 'revised', performedBy: actor,
          performedByRole: actorRole, timestamp: new Date().toISOString(), notes: changeNote,
        };
        return {
          ...e, status: 'under_review' as EstimationStatus,
          revisionNumber: e.revisionNumber + 1,
          revisionHistory: [...e.revisionHistory, snap],
          approvalTrail: [...e.approvalTrail, record],
          returnedNotes: '',
          lastModifiedAt: new Date().toISOString(), lastModifiedBy: actor,
        };
      }),
    }));
  },

  recordClientApproval: (id, data) => {
    set((s) => ({
      estimates: s.estimates.map((e) =>
        e.id === id
          ? { ...e, status: 'client_approved' as EstimationStatus, clientApproval: data, lastModifiedAt: new Date().toISOString() }
          : e
      ),
    }));
  },
}));

export const ESTIMATION_STATUS_CONFIG: Record<EstimationStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  under_review: { label: 'Under Review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  internally_approved: { label: 'Internally Approved', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  returned_for_revision: { label: 'Returned for Revision', className: 'bg-red-50 text-red-700 border-red-200' },
  awaiting_client: { label: 'Awaiting Client', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  client_approved: { label: 'Client Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const UNITS = ['Bags', 'MT', 'KG', 'Nos', 'Meters', 'Sqm', 'Cum', 'Ltr', 'RMT', 'Sets', 'Pairs', 'Hours'];
export const LABOR_ROLES = ['Mason', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Welder', 'Helper', 'Supervisor', 'Engineer'];
export const OVERHEAD_BASIS_LABELS: Record<string, string> = {
  percent_labor: '% of Labor', percent_materials: '% of Materials',
  fixed_amount: 'Fixed Amount', per_machine_hour: 'Per Machine Hour',
};
