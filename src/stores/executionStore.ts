import { create } from 'zustand';
import type {
  ExecutionRecord, ExecutionStatus, MaterialIssuance,
  LaborLog, OverheadActual, RevisionRequest,
} from '@/types';

function uid() { return Math.random().toString(36).slice(2, 10); }

const SEED: ExecutionRecord[] = [
  {
    id: 'ex1',
    jobOrderId: 'j4',
    jobNumber: 'JO-2025-0078',
    estimateId: 'est_j4',
    status: 'in_progress',
    materialIssuances: [
      { id: 'mi1', materialId: 'mat1', description: 'VCI Poly Bags (Heavy Duty)', unit: 'Nos', estimatedQty: 500, issuedQty: 380, issueDate: '2025-01-25', issuedBy: 'Ravi Kumar', vendorRef: 'PackTech India', referenceNo: 'REF-001' },
      { id: 'mi2', materialId: 'mat2', description: 'Silica Gel Desiccant Packs (500g)', unit: 'Nos', estimatedQty: 200, issuedQty: 160, issueDate: '2025-01-26', issuedBy: 'Ravi Kumar', referenceNo: 'REF-002' },
    ],
    laborLogs: [
      { id: 'll1', laborId: 'lab1', taskDescription: 'VCI Bag Packing & Sealing', estimatedHours: 80, loggedHours: 52, dateWorked: '2025-01-25', worker: 'Ravi Kumar', workDescription: 'Packed and heat-sealed VCI bags for precision parts', referenceNo: 'WO-001' },
      { id: 'll2', laborId: 'lab2', taskDescription: 'Humidity Indicator Card Insertion & Labelling', estimatedHours: 40, loggedHours: 28, dateWorked: '2025-01-26', worker: 'Suresh B', workDescription: 'Inserted desiccants and humidity cards; applied batch labels', referenceNo: 'WO-002' },
    ],
    overheadActuals: [
      { id: 'oa1', overheadId: 'ovh1', description: 'Packaging Line Setup & Tooling', estimatedAmount: 8000, actualAmount: 6200, date: '2025-01-27', referenceNotes: 'Sealing machine calibration and line setup for VCI run' },
    ],
    revisionRequests: [],
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-01-27T18:00:00Z',
  },
];

interface ExecutionDerivedTotals {
  materialsActual: number;
  laborActual: number;
  overheadActual: number;
  totalActual: number;
}

export function deriveActualTotals(rec: ExecutionRecord): ExecutionDerivedTotals {
  const materialsActual = rec.materialIssuances.reduce((s, m) => s + m.issuedQty, 0);
  const laborActual = rec.laborLogs.reduce((s, l) => s + l.loggedHours, 0);
  const overheadActual = rec.overheadActuals.reduce((s, o) => s + o.actualAmount, 0);
  return { materialsActual, laborActual, overheadActual, totalActual: overheadActual };
}

export function deriveActualCosts(rec: ExecutionRecord, estMats: { id: string; unitCost: number }[], estLabor: { id: string; hourlyRate: number }[]) {
  const matCost = rec.materialIssuances.reduce((s, m) => {
    const est = estMats.find((e) => e.id === m.materialId);
    return s + m.issuedQty * (est?.unitCost ?? 0);
  }, 0);
  const labCost = rec.laborLogs.reduce((s, l) => {
    const est = estLabor.find((e) => e.id === l.laborId);
    return s + l.loggedHours * (est?.hourlyRate ?? 0);
  }, 0);
  const ovhCost = rec.overheadActuals.reduce((s, o) => s + o.actualAmount, 0);
  return { matCost, labCost, ovhCost, total: matCost + labCost + ovhCost };
}

interface ExecutionStore {
  records: ExecutionRecord[];
  getByJobId: (jobOrderId: string) => ExecutionRecord | undefined;
  createRecord: (jobOrderId: string, jobNumber: string, estimateId: string) => ExecutionRecord;
  issueM: (id: string, issuance: Omit<MaterialIssuance, 'id'>) => void;
  logLabor: (id: string, log: Omit<LaborLog, 'id'>) => void;
  recordOverhead: (id: string, actual: Omit<OverheadActual, 'id'>) => void;
  setStatus: (id: string, status: ExecutionStatus) => void;
  raiseRevisionRequest: (id: string, reason: string, requestedBy: string) => void;
  actionRevisionRequest: (id: string, reqId: string) => void;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  records: SEED,

  getByJobId: (jobOrderId) => get().records.find((r) => r.jobOrderId === jobOrderId),

  createRecord: (jobOrderId, jobNumber, estimateId) => {
    const rec: ExecutionRecord = {
      id: uid(), jobOrderId, jobNumber, estimateId,
      status: 'not_started',
      materialIssuances: [], laborLogs: [], overheadActuals: [],
      revisionRequests: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    set((s) => ({ records: [...s.records, rec] }));
    return rec;
  },

  issueM: (id, issuance) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id
          ? { ...r, materialIssuances: [...r.materialIssuances, { ...issuance, id: uid() }], updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  },

  logLabor: (id, log) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id
          ? { ...r, laborLogs: [...r.laborLogs, { ...log, id: uid() }], updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  },

  recordOverhead: (id, actual) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id
          ? { ...r, overheadActuals: [...r.overheadActuals, { ...actual, id: uid() }], updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  },

  setStatus: (id, status) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id
          ? { ...r, status, completedAt: status === 'completed' ? new Date().toISOString() : r.completedAt, updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  },

  raiseRevisionRequest: (id, reason, requestedBy) => {
    const req: RevisionRequest = { id: uid(), reason, requestedBy, requestedAt: new Date().toISOString(), status: 'pending' };
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id ? { ...r, revisionRequests: [...r.revisionRequests, req], updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  actionRevisionRequest: (id, reqId) => {
    set((s) => ({
      records: s.records.map((r) =>
        r.id === id
          ? { ...r, revisionRequests: r.revisionRequests.map((req) => req.id === reqId ? { ...req, status: 'actioned' as const } : req) }
          : r
      ),
    }));
  },
}));

export const EXECUTION_STATUS_CONFIG: Record<ExecutionStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};
